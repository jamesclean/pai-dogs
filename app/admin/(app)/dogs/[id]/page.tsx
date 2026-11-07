import Link from "next/link";
import { notFound } from "next/navigation";
import { DogForm } from "@/components/DogForm";
import { DogPhoto } from "@/components/DogPhoto";
import { Map, type Pin } from "@/components/Map";
import { LocationField } from "@/components/LocationField";
import { PhotoInput } from "@/components/PhotoInput";
import { Check, Tag, UpDown } from "@/components/Icons";
import { getDog, dogSightings, dogTags } from "@/lib/data";
import { updateDog, deleteDog, volunteerSighting, retireTag } from "../../../actions";
import { fmtDateTime } from "@/lib/dates";

const gps = {
  useLocation: "Add my location",
  locating: "Getting GPS…",
  located: "Location added",
  locationFailed: "GPS failed",
};

export default async function DogAdmin({ params, searchParams }: PageProps<"/admin/dogs/[id]">) {
  const id = Number((await params).id);
  const { saved } = await searchParams;
  const dog = Number.isInteger(id) ? await getDog(id) : null;
  if (!dog) notFound();
  const [tagList, seen] = await Promise.all([dogTags(id), dogSightings(id)]);
  const activeTag = tagList.find((t) => !t.retired);

  const pins: Pin[] = seen
    .filter((s) => s.lat !== null)
    .map((s, i) => ({
      lat: s.lat!,
      lng: s.lng!,
      label: `${fmtDateTime(s.createdAt)} · ${s.condition}${s.note ? ` · ${s.note}` : ""}`,
      kind: i === 0 ? "latest" : s.condition === "ok" ? "ok" : "alert",
    }));
  if (dog.homeLat != null && dog.homeLng != null)
    pins.push({ lat: dog.homeLat, lng: dog.homeLng, label: "Home", kind: "home" });

  return (
    <div className="pt-8">
      {saved && (
        <p className="toast glass fixed top-[calc(env(safe-area-inset-top)+64px)] left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full px-4 py-2 text-[15px] font-semibold">
          <Check className="h-4 w-4 text-ok" /> Saved
        </p>
      )}

      <div className="flex flex-col items-center text-center">
        <DogPhoto photoId={dog.photoId} alt={dog.name} className="h-28 w-28 rounded-full" />
        <h1 className="large-title mt-4">{dog.name}</h1>
        {dog.area && <p className="mt-1 text-[17px] text-label-2">{dog.area}</p>}
        {activeTag && (
          <Link href={`/d/${activeTag.code}`} className="btn-tinted mt-4 h-9 px-4 text-[15px]">
            View public page
          </Link>
        )}
      </div>

      <section className="mt-8">
        <h2 className="section-header">Tags</h2>
        <div className="inset-group">
          {tagList.map((t) => (
            <div key={t.code} className="cell cell-icon">
              <span className={`icon-tile ${t.retired ? "bg-label-3" : "bg-brand"}`}>
                <Tag className="h-[18px] w-[18px]" />
              </span>
              <span className={`font-mono tracking-[0.15em] ${t.retired ? "text-label-3 line-through" : ""}`}>{t.code}</span>
              <span className="flex-1 text-[15px] text-label-2">{t.assignedAt && fmtDateTime(t.assignedAt)}</span>
              {!t.retired && (
                <form action={retireTag.bind(null, t.code)}>
                  <button className="text-[15px] text-bad">Lost</button>
                </form>
              )}
            </div>
          ))}
          {tagList.length === 0 && <p className="cell text-label-2">No tag yet</p>}
        </div>
        {tagList.length === 0 && (
          <p className="section-footer">Scan a blank tag while signed in, or open it from the Tags tab.</p>
        )}
      </section>

      <form action={volunteerSighting.bind(null, dog.id)} className="mt-8">
        <h2 className="section-header">Log a sighting</h2>
        <div className="inset-group">
          <LocationField labels={gps} auto={false} />
          <PhotoInput label="Add photo" />
          <label className="cell">
            <span className="flex-1">Condition</span>
            <select name="condition" className="cursor-pointer appearance-none bg-transparent text-right text-[17px] text-label-2 outline-none">
              <option value="ok">OK</option>
              <option value="injured">Injured</option>
              <option value="sick">Sick</option>
              <option value="lost">Lost</option>
              <option value="other">Other</option>
            </select>
            <UpDown className="-ml-1 h-4 w-4 text-label-3" />
          </label>
          <div className="cell">
            <input name="note" placeholder="Note — fed, wound healing…" className="cell-input" />
          </div>
        </div>
        <button className="btn-tinted mt-3 w-full">Save sighting</button>
      </form>

      {pins.length > 0 && (
        <section className="mt-8">
          <h2 className="section-header">Where it&apos;s been</h2>
          <Map pins={pins} />
        </section>
      )}

      {seen.length > 0 && (
        <section className="mt-8">
          <h2 className="section-header">History</h2>
          <div className="inset-group">
            {seen.map((s) => (
              <div key={s.id} className="cell items-start py-3">
                {s.photoId && <DogPhoto photoId={s.photoId} alt="" className="h-12 w-12 shrink-0 rounded-[10px]" />}
                <div className="min-w-0 flex-1 text-[15px]">
                  <p className="flex flex-wrap items-baseline gap-x-2">
                    <span className="font-semibold">{fmtDateTime(s.createdAt)}</span>
                    <span className={s.condition === "ok" ? "text-label-2" : "font-semibold text-bad"}>{s.condition}</span>
                    <span className="text-label-3">{s.source}</span>
                    {s.lat !== null && (
                      <a className="ml-auto text-link" href={`https://maps.google.com/?q=${s.lat},${s.lng}`}>
                        Map
                      </a>
                    )}
                  </p>
                  {s.note && <p className="mt-0.5">{s.note}</p>}
                  {s.contact && <p className="text-label-2">{s.contact}</p>}
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      <h2 className="mt-12 px-1 text-[22px] font-bold tracking-tight">Details</h2>
      <DogForm dog={dog} action={updateDog.bind(null, dog.id)} submit="Save changes" />

      <details className="mt-6">
        <summary className="cursor-pointer px-4 text-[15px] text-label-2">Delete this dog…</summary>
        <p className="section-footer">
          Removes the dog and its history. Set status to “deceased” or “adopted” instead to keep the record.
        </p>
        <form action={deleteDog.bind(null, dog.id)} className="mt-2">
          <button className="btn-gray w-full text-bad">Delete permanently</button>
        </form>
      </details>
    </div>
  );
}
