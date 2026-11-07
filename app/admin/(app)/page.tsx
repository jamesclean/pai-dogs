import Link from "next/link";
import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, dogs, sightings, tags } from "@/db";
import { DogPhoto } from "@/components/DogPhoto";
import { Map, type Pin } from "@/components/Map";
import { Chevron, Plus, Search } from "@/components/Icons";
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
    <>
      <div className="flex items-end justify-between pt-8 pb-4">
        <h1 className="large-title">Dogs</h1>
        <Link
          href="/admin/dogs/new"
          aria-label="Add dog"
          className="flex h-9 w-9 items-center justify-center rounded-full bg-brand-soft text-brand active:scale-95"
        >
          <Plus className="h-5 w-5" />
        </Link>
      </div>

      <form>
        <label className="field flex items-center gap-2 py-0">
          <Search className="h-[18px] w-[18px] shrink-0 text-label-2" />
          <input name="q" defaultValue={query} placeholder="Name, area, caretaker or tag" className="cell-input h-11" />
        </label>
      </form>

      {inbox.length > 0 && (
        <section className="mt-8">
          <h2 className="section-header">Reports to check · {inbox.length}</h2>
          <div className="inset-group">
            {inbox.map(({ s, name }) => {
              const urgent = s.condition !== "ok";
              return (
                <div key={s.id} className="cell items-start py-3">
                  {s.photoId ? (
                    <DogPhoto photoId={s.photoId} alt="" className="h-14 w-14 shrink-0 rounded-[12px]" />
                  ) : (
                    <span className={`mt-1.5 h-2.5 w-2.5 shrink-0 rounded-full ${urgent ? "bg-bad" : "bg-label-3"}`} />
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-baseline gap-2">
                      <Link href={`/admin/dogs/${s.dogId}`} className="font-semibold">
                        {name}
                      </Link>
                      <span className={`text-[13px] font-semibold uppercase ${urgent ? "text-bad" : "text-label-2"}`}>
                        {s.condition}
                      </span>
                    </div>
                    {s.note && <p className="mt-0.5 text-[15px] leading-snug">{s.note}</p>}
                    <p className="mt-1 flex flex-wrap gap-x-3 text-[15px] text-label-2">
                      <span>{fmtDateTime(s.createdAt)}</span>
                      {s.contact && <span>{s.contact}</span>}
                      {s.lat !== null && (
                        <a className="text-link" href={`https://maps.google.com/?q=${s.lat},${s.lng}`}>
                          Map
                        </a>
                      )}
                    </p>
                  </div>
                  <form action={markReviewed.bind(null, s.id)} className="self-center">
                    <button className="h-8 rounded-full bg-fill px-3.5 text-[15px] font-semibold text-brand active:scale-95">
                      Done
                    </button>
                  </form>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {pins.length > 0 && (
        <section className="mt-8">
          <h2 className="section-header">Last seen</h2>
          <Map pins={pins} />
        </section>
      )}

      <section className="mt-8">
        <h2 className="section-header">{list.length} dogs</h2>
        <div className="inset-group">
          {list.map(({ dog, tagCode, lastSeen }) => {
            const flags = [
              !dog.sterilized && "not sterilized",
              !rabiesCurrent(dog.rabiesVaccinatedOn) && "rabies due",
            ].filter(Boolean);
            return (
              <Link key={dog.id} href={`/admin/dogs/${dog.id}`} className="cell cell-avatar py-2.5 active:bg-fill">
                <DogPhoto photoId={dog.photoId} alt={dog.name} className="h-12 w-12 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2 font-semibold">
                    {dog.name}
                    {dog.status === "missing" && (
                      <span className="rounded-full bg-bad px-2 py-px text-[11px] font-bold uppercase text-white">Missing</span>
                    )}
                    {(dog.status === "adopted" || dog.status === "deceased") && (
                      <span className="text-[13px] font-normal text-label-2 capitalize">{dog.status}</span>
                    )}
                  </p>
                  <p className="truncate text-[15px] text-label-2">
                    {flags.length ? <span className="text-warn">{flags.join(" · ")}</span> : dog.area || "—"}
                  </p>
                </div>
                <div className="text-right text-[13px] text-label-2">
                  <p className="font-mono tracking-wider">{tagCode ?? "—"}</p>
                  {lastSeen && <p>{fmtDateTime(new Date(lastSeen))}</p>}
                </div>
                <Chevron className="h-4 w-4 shrink-0 text-label-3" />
              </Link>
            );
          })}
          {list.length === 0 && <p className="cell text-label-2">No dogs yet</p>}
        </div>
      </section>
    </>
  );
}
