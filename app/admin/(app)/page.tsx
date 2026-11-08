import Link from "next/link";
import { desc, eq, ilike, or, sql } from "drizzle-orm";
import { db, dogs, sightings, tags, newDogReports, adoptionQuestions } from "@/db";
import { DogPhoto } from "@/components/DogPhoto";
import { AdminHeader, SignOutButton } from "@/components/AdminHeader";
import { Map, type Pin } from "@/components/Map";
import { Chevron, Heart, Megaphone, Pin as PinIcon, Plus, Search } from "@/components/Icons";
import { markAdoptionDone, markReviewed } from "../actions";
import { fmtDateTime, rabiesCurrent } from "@/lib/dates";
import { CONDITION } from "@/lib/conditions";

function ConditionLabel({ condition }: { condition: string }) {
  const c = CONDITION[condition];
  return c ? <span className={`pill ${c[1]}`}>{c[0]}</span> : <span className="text-footnote text-label-2">Looks fine</span>;
}

function MapLink({ lat, lng }: { lat: number | null; lng: number | null }) {
  if (lat === null) return null;
  return (
    <a className="text-link" href={`https://maps.google.com/?q=${lat},${lng}`}>
      • Map
    </a>
  );
}

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

  const reports = await db
    .select({ s: sightings, name: dogs.name, dogPhoto: dogs.photoId })
    .from(sightings)
    .innerJoin(dogs, eq(dogs.id, sightings.dogId))
    .where(eq(sightings.reviewed, false))
    .orderBy(desc(sightings.createdAt))
    .limit(30);

  const newDogs = await db
    .select()
    .from(newDogReports)
    .where(eq(newDogReports.reviewed, false))
    .orderBy(desc(newDogReports.createdAt))
    .limit(30);

  const questions = await db
    .select({ q: adoptionQuestions, name: dogs.name, dogPhoto: dogs.photoId })
    .from(adoptionQuestions)
    .innerJoin(dogs, eq(dogs.id, adoptionQuestions.dogId))
    .where(eq(adoptionQuestions.reviewed, false))
    .orderBy(desc(adoptionQuestions.createdAt))
    .limit(30);

  const inbox = [
    ...questions.map((r) => ({ kind: "adoption" as const, at: r.q.createdAt, r })),
    ...newDogs.map((r) => ({ kind: "new" as const, at: r.createdAt, r })),
    ...reports.map((r) => ({ kind: "sighting" as const, at: r.s.createdAt, r })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  // Latest known position per dog, scans included.
  const latest = await db.execute<{ dog_id: number; name: string; lat: number; lng: number; status: string }>(sql`
    select distinct on (s.dog_id) s.dog_id, d.name, s.lat, s.lng, d.status
    from ${sightings} s join ${dogs} d on d.id = s.dog_id
    where s.lat is not null
    order by s.dog_id, s.created_at desc`);
  const pins: Pin[] = [
    ...latest.map((r) => ({
      lat: r.lat,
      lng: r.lng,
      label: r.name,
      href: `/admin/dogs/${r.dog_id}`,
      kind: (r.status === "missing" ? "alert" : "latest") as Pin["kind"],
    })),
    ...newDogs
      .filter((r) => r.lat !== null && r.lng !== null)
      .map((r) => ({ lat: r.lat!, lng: r.lng!, label: "New report", href: `/admin/dogs/new?report=${r.id}`, kind: "newdog" as const })),
  ];

  return (
    <>
      <AdminHeader
        title="Dogs"
        right={
          <div className="flex gap-2">
            <SignOutButton />
            <Link href="/admin/dogs/new" aria-label="Add dog" className="circle-btn">
              <Plus className="h-5 w-5" />
            </Link>
          </div>
        }
      />

      <form>
        <label className="search">
          <Search className="h-[18px] w-[18px] shrink-0" />
          <input name="q" defaultValue={query} placeholder="Name, area, caretaker or tag" className="bare-input" />
        </label>
      </form>

      {inbox.length > 0 && (
        <section className="mt-7">
          <div className="flex items-baseline justify-between">
            <h2 className="text-section">Reports to check</h2>
            <span className="text-footnote text-label-2">{inbox.length}</span>
          </div>
          <div className="mt-1 divide-y divide-sep">
            {inbox.map((item) =>
              item.kind === "adoption" ? (
                <div key={`a${item.r.q.id}`} className="flex items-start gap-3 py-3">
                  {item.r.dogPhoto ? (
                    <DogPhoto photoId={item.r.dogPhoto} alt="" className="h-11 w-11 shrink-0 rounded-[12px]" />
                  ) : (
                    <span className="tile h-11 w-11 rounded-[12px] bg-fill text-label-2">
                      <Heart className="h-5 w-5" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/dogs/${item.r.q.dogId}`} className="text-callout">
                        {item.r.name}
                      </Link>
                      <span className="pill bg-fill text-label-2">Adoption question</span>
                    </p>
                    {item.r.q.note && <p className="mt-0.5 text-footnote">{item.r.q.note}</p>}
                    <p className="mt-0.5 text-footnote text-label-3">
                      {fmtDateTime(item.r.q.createdAt)} • {item.r.q.contact}
                    </p>
                  </div>
                  <form action={markAdoptionDone.bind(null, item.r.q.id)}>
                    <button className="btn-outline btn-sm">Mark done</button>
                  </form>
                </div>
              ) : item.kind === "new" ? (
                <div key={`n${item.r.id}`} className="flex items-start gap-3 py-3">
                  {item.r.photoId ? (
                    <DogPhoto photoId={item.r.photoId} alt="" className="h-11 w-11 shrink-0 rounded-[12px]" />
                  ) : (
                    <span className="tile h-11 w-11 rounded-[12px] bg-brand-soft text-brand">
                      <Megaphone className="h-[22px] w-[22px]" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2">
                      <span className="text-callout">New report</span>
                      <ConditionLabel condition={item.r.condition} />
                    </p>
                    {item.r.note && <p className="mt-0.5 text-footnote">{item.r.note}</p>}
                    <p className="mt-0.5 flex flex-wrap gap-x-1 text-footnote text-label-3">
                      <span>{[fmtDateTime(item.r.createdAt), item.r.contact].filter(Boolean).join(" • ")}</span>
                      <MapLink lat={item.r.lat} lng={item.r.lng} />
                    </p>
                    <div className="mt-2 flex gap-2">
                      <Link href={`/admin/dogs/new?report=${item.r.id}`} className="btn-primary btn-sm">
                        Add dog
                      </Link>
                      <Link href={`/admin/reports/${item.r.id}/match`} className="btn-outline btn-sm">
                        Match to a dog
                      </Link>
                    </div>
                  </div>
                </div>
              ) : (
                <div key={`s${item.r.s.id}`} className="flex items-start gap-3 py-3">
                  {item.r.s.photoId || item.r.dogPhoto ? (
                    <DogPhoto
                      photoId={item.r.s.photoId ?? item.r.dogPhoto}
                      alt=""
                      className="h-11 w-11 shrink-0 rounded-[12px]"
                    />
                  ) : (
                    <span className="tile h-11 w-11 rounded-[12px] bg-fill text-label-2">
                      <PinIcon className="h-5 w-5" />
                    </span>
                  )}
                  <div className="min-w-0 flex-1">
                    <p className="flex flex-wrap items-center gap-2">
                      <Link href={`/admin/dogs/${item.r.s.dogId}`} className="text-callout">
                        {item.r.name}
                      </Link>
                      <ConditionLabel condition={item.r.s.condition} />
                    </p>
                    {item.r.s.note && <p className="mt-0.5 text-footnote">{item.r.s.note}</p>}
                    <p className="mt-0.5 flex flex-wrap gap-x-1 text-footnote text-label-3">
                      <span>{[fmtDateTime(item.r.s.createdAt), item.r.s.contact].filter(Boolean).join(" • ")}</span>
                      <MapLink lat={item.r.s.lat} lng={item.r.s.lng} />
                    </p>
                  </div>
                  <form action={markReviewed.bind(null, item.r.s.id)}>
                    <button className="btn-outline btn-sm">Mark done</button>
                  </form>
                </div>
              ),
            )}
          </div>
        </section>
      )}

      {pins.length > 0 && (
        <section className="mt-7">
          <h2 className="text-section">Last seen</h2>
          <Map pins={pins} className="mt-2 h-56" />
        </section>
      )}

      <section className="mt-7">
        <h2 className="text-section">{list.length} dogs</h2>
        <div className="mt-1">
          {list.map(({ dog, tagCode, lastSeen }) => {
            const flags = [
              !dog.sterilized && "Not sterilized",
              !rabiesCurrent(dog.rabiesVaccinatedOn) && "Rabies due",
            ].filter(Boolean);
            return (
              <Link key={dog.id} href={`/admin/dogs/${dog.id}`} className="flex items-center gap-3 py-2.5">
                <DogPhoto photoId={dog.photoId} alt="" className="h-11 w-11 shrink-0 rounded-full" />
                <div className="min-w-0 flex-1">
                  <p className="flex items-center gap-2">
                    <span className="truncate text-callout">{dog.name}</span>
                    {dog.status === "missing" && <span className="pill bg-bad-soft text-bad">Missing</span>}
                    {dog.status === "deceased" && <span className="pill bg-fill text-label-2">In memory</span>}
                  </p>
                  <p className={`truncate text-footnote ${flags.length ? "text-warn" : "text-label-2"}`}>
                    {flags.length ? flags.join(" • ") : dog.area || "No location yet"}
                  </p>
                </div>
                <div className="text-right">
                  {tagCode ? (
                    <p className="font-mono text-[13px] leading-[18px] font-medium tracking-[1.5px] text-label-2">{tagCode}</p>
                  ) : (
                    <p className="text-footnote text-label-3">No tag</p>
                  )}
                  {lastSeen && <p className="text-footnote text-label-3">{fmtDateTime(new Date(lastSeen))}</p>}
                </div>
                <Chevron className="h-4 w-4 shrink-0 text-label-3" />
              </Link>
            );
          })}
          {list.length === 0 && <p className="py-3 text-subhead text-label-2">No dogs yet</p>}
        </div>
      </section>
    </>
  );
}
