import Link from "next/link";
import { notFound } from "next/navigation";
import { DogForm } from "@/components/DogForm";
import { DogPhoto } from "@/components/DogPhoto";
import { Map, type Pin } from "@/components/Map";
import { LocationField } from "@/components/LocationField";
import { PhotoInput } from "@/components/PhotoInput";
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
    <div className="space-y-6">
      {saved && <p className="rounded-lg bg-emerald-50 px-3 py-2 text-emerald-800">Saved ✓</p>}

      <div className="flex items-center gap-4">
        <DogPhoto photoId={dog.photoId} alt={dog.name} className="h-20 w-20 shrink-0 rounded-2xl" />
        <div className="flex-1">
          <h1 className="text-2xl font-bold">{dog.name}</h1>
          <p className="text-stone-600">{dog.area}</p>
        </div>
        {activeTag && (
          <Link href={`/d/${activeTag.code}`} className="btn-ghost text-sm">
            Public page ↗
          </Link>
        )}
      </div>

      <section className="card">
        <h2 className="mb-2 font-semibold">Tags</h2>
        {tagList.length === 0 && (
          <p className="text-stone-600">
            No tag yet. Scan a blank tag while logged in, or enter its code on the{" "}
            <Link href="/admin/tags" className="underline">
              Tags
            </Link>{" "}
            page.
          </p>
        )}
        <ul className="space-y-1">
          {tagList.map((t) => (
            <li key={t.code} className="flex items-center gap-3">
              <span className={`font-mono text-lg ${t.retired ? "text-stone-400 line-through" : ""}`}>{t.code}</span>
              <span className="text-sm text-stone-500">{t.assignedAt && fmtDateTime(t.assignedAt)}</span>
              {!t.retired && (
                <form action={retireTag.bind(null, t.code)} className="ml-auto">
                  <button className="text-sm text-stone-500 underline">Lost / retire</button>
                </form>
              )}
            </li>
          ))}
        </ul>
      </section>

      <section className="card space-y-3">
        <h2 className="font-semibold">Log a sighting</h2>
        <form action={volunteerSighting.bind(null, dog.id)} className="space-y-3">
          <LocationField labels={gps} auto={false} />
          <div className="grid grid-cols-[1fr_auto] gap-2">
            <input name="note" placeholder="Note (fed, wound healing, …)" className="input" />
            <select name="condition" className="input">
              <option value="ok">ok</option>
              <option value="injured">injured</option>
              <option value="sick">sick</option>
              <option value="lost">lost</option>
              <option value="other">other</option>
            </select>
          </div>
          <PhotoInput label="Photo (optional)" />
          <button className="btn-brand w-full">Save sighting</button>
        </form>
      </section>

      {pins.length > 0 && <Map pins={pins} />}

      {seen.length > 0 && (
        <section className="card">
          <h2 className="mb-2 font-semibold">History</h2>
          <ul className="divide-y divide-stone-100">
            {seen.map((s) => (
              <li key={s.id} className="flex gap-3 py-2">
                {s.photoId && <DogPhoto photoId={s.photoId} alt="" className="h-14 w-14 shrink-0 rounded-lg" />}
                <div className="text-sm">
                  <p>
                    <span className="font-medium">{fmtDateTime(s.createdAt)}</span> ·{" "}
                    <span className={s.condition === "ok" ? "" : "font-semibold text-red-600"}>{s.condition}</span> ·{" "}
                    <span className="text-stone-500">{s.source}</span>
                    {s.lat !== null && (
                      <>
                        {" · "}
                        <a className="underline" href={`https://maps.google.com/?q=${s.lat},${s.lng}`}>
                          map
                        </a>
                      </>
                    )}
                  </p>
                  {s.note && <p className="text-stone-700">{s.note}</p>}
                  {s.contact && <p className="text-stone-500">Contact: {s.contact}</p>}
                </div>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section>
        <h2 className="mb-2 text-lg font-semibold">Edit details</h2>
        <DogForm dog={dog} action={updateDog.bind(null, dog.id)} submit="Save changes" />
      </section>

      <details className="text-sm text-stone-500">
        <summary>Delete this dog</summary>
        <p className="my-2">
          Removes the dog and its history. Use status “deceased” or “adopted” instead if you want to keep the record.
        </p>
        <form action={deleteDog.bind(null, dog.id)}>
          <button className="btn border border-red-300 text-red-700">Delete permanently</button>
        </form>
      </details>
    </div>
  );
}
