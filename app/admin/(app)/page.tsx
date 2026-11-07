import Link from "next/link";
import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, dogs, sightings, tags } from "@/db";
import { DogPhoto } from "@/components/DogPhoto";
import { Map, type Pin } from "@/components/Map";
import { markReviewed } from "../actions";
import { fmtDateTime, rabiesCurrent } from "@/lib/dates";

export default async function AdminHome({ searchParams }: PageProps<"/admin">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";

  const list = await db
    .select({
      dog: dogs,
      tagCode: sql<string | null>`(select code from ${tags} where ${tags.dogId} = ${dogs.id} and not ${tags.retired} order by ${tags.assignedAt} desc limit 1)`,
      lastSeen: sql<string | null>`(select max(${sightings.createdAt}) from ${sightings} where ${sightings.dogId} = ${dogs.id})`,
    })
    .from(dogs)
    .where(
      query
        ? or(
            ilike(dogs.name, `%${query}%`),
            ilike(dogs.area, `%${query}%`),
            ilike(dogs.caretakerName, `%${query}%`),
            sql`exists (select 1 from ${tags} where ${tags.dogId} = ${dogs.id} and ${tags.code} = ${query.toUpperCase()})`,
          )
        : undefined,
    )
    .orderBy(dogs.name);

  const inbox = await db
    .select({ s: sightings, name: dogs.name })
    .from(sightings)
    .innerJoin(dogs, eq(dogs.id, sightings.dogId))
    .where(eq(sightings.reviewed, false))
    .orderBy(desc(sightings.createdAt))
    .limit(30);

  // Latest known position per dog.
  const latest = await db.execute<{ dog_id: number; name: string; lat: number; lng: number; status: string }>(sql`
    select distinct on (s.dog_id) s.dog_id, d.name, s.lat, s.lng, d.status
    from ${sightings} s join ${dogs} d on d.id = s.dog_id
    where s.lat is not null
    order by s.dog_id, s.created_at desc`);
  const pins: Pin[] = latest.map((r) => ({
    lat: r.lat,
    lng: r.lng,
    label: r.name,
    href: `/admin/dogs/${r.dog_id}`,
    kind: r.status === "missing" ? "alert" : "latest",
  }));

  return (
    <div className="space-y-6">
      {inbox.length > 0 && (
        <section>
          <h2 className="mb-2 font-semibold">Reports to check ({inbox.length})</h2>
          <ul className="space-y-2">
            {inbox.map(({ s, name }) => (
              <li key={s.id} className={`card flex gap-3 ${s.condition !== "ok" ? "border-red-300 bg-red-50" : ""}`}>
                {s.photoId && <DogPhoto photoId={s.photoId} alt="" className="h-16 w-16 shrink-0 rounded-lg" />}
                <div className="min-w-0 flex-1">
                  <p>
                    <Link href={`/admin/dogs/${s.dogId}`} className="font-semibold underline">
                      {name}
                    </Link>{" "}
                    <span className="rounded bg-stone-200 px-1.5 text-xs uppercase">{s.condition}</span>{" "}
                    <span className="text-sm text-stone-500">{fmtDateTime(s.createdAt)}</span>
                  </p>
                  {s.note && <p className="text-stone-700">{s.note}</p>}
                  <p className="text-sm text-stone-600">
                    {s.contact && <>Contact: {s.contact} · </>}
                    {s.lat !== null && (
                      <a className="underline" href={`https://maps.google.com/?q=${s.lat},${s.lng}`}>
                        map
                      </a>
                    )}
                  </p>
                </div>
                <form action={markReviewed.bind(null, s.id)}>
                  <button className="btn-ghost px-3 py-2 text-sm">Done</button>
                </form>
              </li>
            ))}
          </ul>
        </section>
      )}

      {pins.length > 0 && <Map pins={pins} />}

      <section>
        <div className="mb-3 flex items-center gap-2">
          <form className="flex-1">
            <input name="q" defaultValue={query} placeholder="Search name, area, caretaker, tag code" className="input" />
          </form>
          <Link href="/admin/dogs/new" className="btn-brand">
            + Dog
          </Link>
        </div>
        <p className="mb-2 text-sm text-stone-500">{list.length} dogs</p>
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          {list.map(({ dog, tagCode, lastSeen }) => (
            <li key={dog.id}>
              <Link href={`/admin/dogs/${dog.id}`} className="flex items-center gap-3 p-3 hover:bg-stone-50">
                <DogPhoto photoId={dog.photoId} alt={dog.name} className="h-12 w-12 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold">
                    {dog.name}{" "}
                    {dog.status !== "community" && (
                      <span className={`text-xs uppercase ${dog.status === "missing" ? "text-red-600" : "text-stone-500"}`}>
                        {dog.status}
                      </span>
                    )}
                  </p>
                  <p className="truncate text-sm text-stone-500">{dog.area || "—"}</p>
                </div>
                <div className="text-right text-xs text-stone-500">
                  <p className="font-mono">{tagCode ?? "no tag"}</p>
                  <p>
                    {dog.sterilized ? "✂︎" : <span className="text-amber-600">not sterilized</span>}{" "}
                    {rabiesCurrent(dog.rabiesVaccinatedOn) ? "💉" : <span className="text-amber-600">rabies due</span>}
                  </p>
                  {lastSeen && <p>seen {fmtDateTime(new Date(lastSeen))}</p>}
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
