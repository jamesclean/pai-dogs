import Link from "next/link";
import { notFound } from "next/navigation";
import { getDog, dogTags, dogSightings, dogAdoptionQuestions } from "@/lib/data";
import { DogPhoto } from "@/components/DogPhoto";
import { DogForm } from "@/components/DogForm";
import { Map, type Pin } from "@/components/Map";
import { LocationField } from "@/components/LocationField";
import { PhotoInput } from "@/components/PhotoInput";
import { AdminNavRow } from "@/components/AdminHeader";
import { Check, Heart, Tag, UpDown } from "@/components/Icons";
import { updateDog, deleteDog, retireTag, volunteerSighting, markReviewed, markAdoptionDone } from "../../../actions";
import { fmtDate, fmtDateTime, rabiesCurrent } from "@/lib/dates";

const gps = {
  yourLocation: "Location added",
  shareYourLocation: "Add location",
  locating: "Getting GPS…",
  added: "Added",
  locationFailed: "GPS failed",
};

const CONDITION: Record<string, string> = {
  ok: "Looks fine",
  injured: "Injured",
  sick: "Looks sick",
  lost: "Seems lost",
  other: "Other",
};
const SOURCE: Record<string, string> = { public: "Public report", volunteer: "Volunteer", scan: "Tag scan" };
const STATUS: Record<string, string> = { community: "Community dog", missing: "Missing", deceased: "In memory" };
const HOME: Record<string, string> = { has_home: "Has a home", ask_adoption: "Ask about adoption" };

export default async function DogAdmin({ params, searchParams }: PageProps<"/admin/dogs/[id]">) {
  const id = Number((await params).id);
  const { saved } = await searchParams;
  const dog = Number.isInteger(id) ? await getDog(id) : null;
  if (!dog) notFound();
  const [tagList, seen, questions] = await Promise.all([dogTags(id), dogSightings(id), dogAdoptionQuestions(id)]);
  const latestAlert = seen.find((s) => s.source !== "scan" && s.condition !== "ok" && !s.reviewed);

  const pins: Pin[] = seen
    .filter((s) => s.lat !== null)
    .map((s, i) => ({
      lat: s.lat!,
      lng: s.lng!,
      label: `${fmtDateTime(s.createdAt)} • ${CONDITION[s.condition]}${s.note ? ` • ${s.note}` : ""}`,
      kind: i === 0 ? "latest" : s.source === "scan" ? "scan" : s.condition === "ok" ? "ok" : "alert",
    }));
  if (dog.homeLat != null && dog.homeLng != null)
    pins.push({ lat: dog.homeLat, lng: dog.homeLng, label: "Home", kind: "home" });

  const rabiesOk = rabiesCurrent(dog.rabiesVaccinatedOn);

  return (
    <>
      {saved && (
        <p className="toast fixed top-[calc(env(safe-area-inset-top)+16px)] left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-inverse px-4 py-2 text-callout text-on-inverse shadow-float">
          <Check className="h-4 w-4" /> Saved
        </p>
      )}

      <AdminNavRow
        back={{ href: "/admin", label: "Dogs" }}
        right={
          <Link href={`/dogs/${dog.id}`} className="btn-outline btn-sm">
            View public page
          </Link>
        }
      />

      <div className="flex flex-col items-center pt-2 text-center">
        <DogPhoto photoId={dog.photoId} alt={dog.name} className="h-[104px] w-[104px] rounded-full" />
        <h1 className="mt-4 text-display">{dog.name}</h1>
        <p className="mt-1 text-subhead text-label-2">{[dog.area, STATUS[dog.status], dog.homeStatus && HOME[dog.homeStatus]].filter(Boolean).join(" • ")}</p>
        <div className="mt-3.5 flex flex-wrap justify-center gap-1.5">
          <span className={`pill ${dog.sterilized ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"}`}>
            {dog.sterilized ? "Sterilized" : "Not sterilized"}
          </span>
          <span className={`pill ${rabiesOk ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"}`}>
            {rabiesOk ? `Rabies vaccine ${fmtDate(dog.rabiesVaccinatedOn)}` : "Rabies due"}
          </span>
          {latestAlert && <span className="pill bg-bad-soft text-bad">{CONDITION[latestAlert.condition]}</span>}
        </div>
      </div>

      <section className="mt-7">
        <h2 className="text-section">Tags</h2>
        <div className="card-rows mt-2">
          {tagList.map((t) => (
            <div key={t.code} className="row">
              <Tag className={`h-[22px] w-[22px] shrink-0 ${t.retired ? "text-label-3" : ""}`} />
              <div className="min-w-0 flex-1">
                <p className={`text-code ${t.retired ? "text-label-3 line-through" : ""}`}>{t.code}</p>
                {t.assignedAt && <p className="text-footnote text-label-2">Linked {fmtDate(t.assignedAt)}</p>}
              </div>
              {!t.retired && (
                <form action={retireTag.bind(null, t.code)}>
                  <button className="btn-danger btn-sm">Mark lost</button>
                </form>
              )}
            </div>
          ))}
          {tagList.length === 0 && <p className="row text-subhead text-label-2">No tag yet</p>}
        </div>
        {tagList.length === 0 && (
          <p className="mt-2 text-footnote text-label-3">Scan a blank tag, or open one from Tags.</p>
        )}
      </section>

      <form action={volunteerSighting.bind(null, dog.id)} className="mt-7">
        <h2 className="text-section">New sighting</h2>
        <div className="card-rows mt-2">
          <LocationField labels={gps} auto={false} />
          <PhotoInput label="Add a photo" changeLabel="Change photo" />
          <label className="row">
            <Heart className="h-[22px] w-[22px] shrink-0" />
            <span className="flex-1 text-callout">Condition</span>
            <select name="condition" className="cursor-pointer appearance-none bg-transparent text-right text-subhead text-label-2 outline-none">
              {Object.entries(CONDITION).map(([v, l]) => (
                <option key={v} value={v}>
                  {l}
                </option>
              ))}
            </select>
            <UpDown className="-ml-1 h-4 w-4 text-label-3" />
          </label>
        </div>
        <input name="note" placeholder="Note: fed, wound healing…" className="field mt-3 h-[50px]" />
        <button className="btn-secondary mt-3 w-full">Save sighting</button>
      </form>

      {pins.length > 0 && (
        <section className="mt-7">
          <h2 className="text-section">Map</h2>
          <Map pins={pins} className="mt-2 h-48" />
        </section>
      )}

      {questions.length > 0 && (
        <section className="mt-7">
          <h2 className="text-section">Adoption questions</h2>
          <div className="mt-1 divide-y divide-sep">
            {questions.map((q) => (
              <div key={q.id} className="flex items-start gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className={`text-callout ${q.reviewed ? "text-label-2" : ""}`}>{q.contact}</p>
                  <p className="text-footnote text-label-2">{[fmtDateTime(q.createdAt), q.note].filter(Boolean).join(" • ")}</p>
                </div>
                {!q.reviewed && (
                  <form action={markAdoptionDone.bind(null, q.id)}>
                    <button className="btn-outline btn-sm">Mark done</button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      {seen.length > 0 && (
        <section className="mt-7">
          <h2 className="text-section">History</h2>
          <div className="mt-1">
            {seen.map((s) => (
              <div key={s.id} className="flex items-start gap-3 py-2.5">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${s.condition === "ok" ? "bg-label-3" : "bg-bad"}`} />
                {s.photoId && <DogPhoto photoId={s.photoId} alt="" className="h-11 w-11 shrink-0 rounded-[10px]" />}
                <div className="min-w-0 flex-1">
                  <p className="flex flex-wrap items-baseline gap-x-2">
                    <span className="text-callout">{fmtDateTime(s.createdAt)}</span>
                    <span className={`text-footnote ${s.condition === "ok" ? "text-label-2" : "text-bad"}`}>
                      {CONDITION[s.condition]}
                    </span>
                    {s.lat !== null && (
                      <a className="ml-auto text-footnote text-link" href={`https://maps.google.com/?q=${s.lat},${s.lng}`}>
                        Map
                      </a>
                    )}
                  </p>
                  <p className="text-footnote text-label-2">
                    {[SOURCE[s.source], s.note, s.contact].filter(Boolean).join(" • ")}
                  </p>
                </div>
                {!s.reviewed && (
                  <form action={markReviewed.bind(null, s.id)}>
                    <button className="btn-outline btn-sm">Mark done</button>
                  </form>
                )}
              </div>
            ))}
          </div>
        </section>
      )}

      <h2 className="mt-10 text-title">Details</h2>
      <DogForm dog={dog} action={updateDog.bind(null, dog.id)} submit="Save changes" />

      <details className="mt-8">
        <summary className="cursor-pointer text-center text-subhead text-bad">Delete dog…</summary>
        <form action={deleteDog.bind(null, dog.id)} className="mt-3">
          <button className="btn-danger w-full">Delete {dog.name}</button>
          <p className="mt-2 text-center text-footnote text-label-3">
            Deletes {dog.name} and every sighting. To keep the record, set the status to In memory.
          </p>
        </form>
      </details>
    </>
  );
}
