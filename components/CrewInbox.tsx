import Link from "next/link";
import { getTableColumns, desc, eq, sql } from "drizzle-orm";
import { db, dogs, sightings, newDogReports, adoptionQuestions } from "@/db";
import { DogPhoto } from "@/components/DogPhoto";
import { DoneButton } from "@/components/DoneButton";
import { MapButton } from "@/components/MapButton";
import { Map, type Pin } from "@/components/Map";
import { Heart, Megaphone, Pin as PinIcon } from "@/components/Icons";
import { markAdoptionDone, markReviewed } from "@/app/admin/actions";
import { fmtDateTime } from "@/lib/dates";
import { CONDITION } from "@/lib/conditions";
import { isNearPai } from "@/lib/pai";

function ConditionLabel({
  condition,
  solid,
}: {
  condition: string;
  solid: boolean;
}) {
  const c = CONDITION[condition];
  if (!c) return <span className="text-footnote text-label-2">Looks fine</span>;
  return (
    <span className={`pill ${solid ? "bg-warn text-on-inverse" : c[1]}`}>
      {c[0]}
    </span>
  );
}

// What's waiting for the crew, at the top of Home when signed in: reports that need
// help, reports to check, and where each dog was last seen. Only render it for crew:
// the rows carry reporters' contact details.
export async function CrewInbox() {
  const reports = await db
    .select({ s: sightings, name: dogs.name, dogPhoto: dogs.photoId })
    .from(sightings)
    .innerJoin(dogs, eq(dogs.id, sightings.dogId))
    .where(eq(sightings.reviewed, false))
    .orderBy(desc(sightings.createdAt))
    .limit(30);

  const newDogs = await db
    .select({ ...getTableColumns(newDogReports), guessName: dogs.name })
    .from(newDogReports)
    .leftJoin(dogs, eq(dogs.id, newDogReports.guessDogId))
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
    ...questions.map((r) => ({
      kind: "adoption" as const,
      at: r.q.createdAt,
      r,
    })),
    ...newDogs.map((r) => ({ kind: "new" as const, at: r.createdAt, r })),
    ...reports.map((r) => ({
      kind: "sighting" as const,
      at: r.s.createdAt,
      r,
    })),
  ].sort((a, b) => b.at.getTime() - a.at.getTime());

  // Latest known position per dog, scans included.
  const latest = await db.execute<{
    dog_id: number;
    name: string;
    lat: number;
    lng: number;
    status: string;
  }>(sql`
    select distinct on (s.dog_id) s.dog_id, d.name, s.lat, s.lng, d.status
    from ${sightings} s join ${dogs} d on d.id = s.dog_id
    where s.lat is not null and d.status <> 'deceased'
    order by s.dog_id, s.created_at desc`);
  const pins: Pin[] = [
    ...latest.rows
      .filter((r) => isNearPai(r.lat, r.lng))
      .map((r) => ({
        lat: r.lat,
        lng: r.lng,
        label: r.name,
        href: `/admin/dogs/${r.dog_id}`,
        kind: (r.status === "missing" ? "alert" : "latest") as Pin["kind"],
      })),
    ...newDogs
      .filter(
        (r) => r.lat !== null && r.lng !== null && isNearPai(r.lat, r.lng),
      )
      .map((r) => ({
        lat: r.lat!,
        lng: r.lng!,
        label: "New report",
        href: `/admin/dogs/new?report=${r.id}`,
        kind: "newdog" as const,
      })),
  ];

  type InboxItem = (typeof inbox)[number];
  // Anything but "Looks fine" gets its own section at the top.
  const isUrgent = (item: InboxItem) =>
    item.kind === "sighting"
      ? item.r.s.condition !== "ok"
      : item.kind === "new" && item.r.condition !== "ok";
  const needsHelp = inbox.filter(isUrgent);
  const toCheck = inbox.filter((item) => !isUrgent(item));

  const inboxRow = (item: InboxItem, urgent: boolean) =>
    item.kind === "adoption" ? (
      <div key={`a${item.r.q.id}`} className="flex items-start gap-3 py-3">
        {item.r.dogPhoto ? (
          <DogPhoto
            photoId={item.r.dogPhoto}
            alt=""
            className="h-11 w-11 shrink-0 rounded-[12px]"
          />
        ) : (
          <span className="tile h-11 w-11 rounded-[12px] bg-fill text-label-2">
            <Heart className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/dogs/${item.r.q.dogId}`}
              className="text-callout"
            >
              {item.r.name}
            </Link>
            <span className="pill bg-fill text-label-2">Adoption question</span>
          </p>
          {item.r.q.note && (
            <p className="mt-0.5 text-footnote">{item.r.q.note}</p>
          )}
          <p className="mt-0.5 text-footnote text-label-3">
            {fmtDateTime(item.r.q.createdAt)} • {item.r.q.contact}
          </p>
        </div>
        <DoneButton action={markAdoptionDone.bind(null, item.r.q.id)} />
      </div>
    ) : item.kind === "new" ? (
      <div key={`n${item.r.id}`} className="flex items-start gap-3 py-3">
        {item.r.photoId ? (
          <DogPhoto
            photoId={item.r.photoId}
            alt=""
            className="h-11 w-11 shrink-0 rounded-[12px]"
          />
        ) : (
          <span
            className={`tile h-11 w-11 rounded-[12px] text-brand ${urgent ? "bg-surface-raised" : "bg-brand-soft"}`}
          >
            <Megaphone className="h-[22px] w-[22px]" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            <span className="text-callout">New report</span>
            <ConditionLabel condition={item.r.condition} solid={urgent} />
          </p>
          {item.r.guessName && (
            <p className="mt-0.5 text-footnote">Might be {item.r.guessName}</p>
          )}
          {item.r.note && <p className="mt-0.5 text-footnote">{item.r.note}</p>}
          <p className="mt-0.5 flex flex-wrap gap-x-1 text-footnote text-label-3">
            <span>
              {[fmtDateTime(item.r.createdAt), item.r.contact]
                .filter(Boolean)
                .join(" • ")}
            </span>
          </p>
          <div className="mt-2 flex gap-2">
            <Link
              href={`/admin/dogs/new?report=${item.r.id}`}
              className="btn-primary btn-sm"
            >
              Add dog
            </Link>
            <Link
              href={`/admin/reports/${item.r.id}/match`}
              className="btn-outline btn-sm"
            >
              Match to a dog
            </Link>
          </div>
        </div>
        <MapButton lat={item.r.lat} lng={item.r.lng} raised={urgent} />
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
          <span
            className={`tile h-11 w-11 rounded-[12px] text-label-2 ${urgent ? "bg-surface-raised" : "bg-fill"}`}
          >
            <PinIcon className="h-5 w-5" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          <p className="flex flex-wrap items-center gap-2">
            <Link
              href={`/admin/dogs/${item.r.s.dogId}`}
              className="text-callout"
            >
              {item.r.name}
            </Link>
            <ConditionLabel condition={item.r.s.condition} solid={urgent} />
          </p>
          {item.r.s.note && (
            <p className="mt-0.5 text-footnote">{item.r.s.note}</p>
          )}
          <p className="mt-0.5 flex flex-wrap gap-x-1 text-footnote text-label-3">
            <span>
              {[fmtDateTime(item.r.s.createdAt), item.r.s.contact]
                .filter(Boolean)
                .join(" • ")}
            </span>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <MapButton lat={item.r.s.lat} lng={item.r.s.lng} raised={urgent} />
          <DoneButton
            action={markReviewed.bind(null, item.r.s.id)}
            raised={urgent}
          />
        </div>
      </div>
    );

  return (
    <>
      {needsHelp.length > 0 && (
        <section className="rounded-[24px] bg-warn-soft px-4 pt-3.5 pb-1">
          <div className="flex items-baseline justify-between">
            <h2 className="text-section text-warn">Needs help</h2>
            <span className="text-footnote text-warn">{needsHelp.length}</span>
          </div>
          <div className="mt-1 divide-y divide-warn/15">
            {needsHelp.map((item) => inboxRow(item, true))}
          </div>
        </section>
      )}

      {toCheck.length > 0 && (
        <section>
          <div className="flex items-baseline justify-between">
            <h2 className="text-section">Reports to check</h2>
            <span className="text-footnote text-label-2">{toCheck.length}</span>
          </div>
          <div className="mt-1 divide-y divide-sep">
            {toCheck.map((item) => inboxRow(item, false))}
          </div>
        </section>
      )}

      {pins.length > 0 && (
        <section>
          <h2 className="text-section">Last seen</h2>
          <Map pins={pins} className="mt-2 h-56" />
        </section>
      )}
    </>
  );
}
