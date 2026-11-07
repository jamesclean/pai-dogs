import type { Dog } from "@/db/schema";
import { PhotoInput } from "./PhotoInput";
import { LocationField } from "./LocationField";

const gps = {
  useLocation: "Set home location to where I'm standing",
  locating: "Getting GPS…",
  located: "Home location set",
  locationFailed: "GPS failed — describe the area instead",
};

export function DogForm({
  dog,
  action,
  tag,
  submit,
}: {
  dog?: Dog;
  action: (f: FormData) => Promise<void>;
  tag?: string;
  submit: string;
}) {
  return (
    <form action={action} className="space-y-5">
      {tag && <input type="hidden" name="tag" value={tag} />}

      <Section title="The dog">
        <PhotoInput label={dog?.photoId ? "Replace photo" : "Photo"} />
        <Field label="Name" name="name" defaultValue={dog?.name} required />
        <div className="grid grid-cols-2 gap-3">
          <Select label="Sex" name="sex" value={dog?.sex} options={["unknown", "male", "female"]} />
          <Select label="Temperament" name="temperament" value={dog?.temperament} options={["friendly", "shy", "careful"]} />
        </div>
        <Field label="Looks like (colour, markings, size)" name="description" defaultValue={dog?.description} />
        {dog && <Select label="Status" name="status" value={dog.status} options={["community", "missing", "adopted", "deceased"]} />}
      </Section>

      <Section title="Where it lives">
        <Field label="Area (public)" name="area" defaultValue={dog?.area} placeholder="e.g. Walking Street, by the night market" />
        {dog?.homeLat != null && (
          <>
            <input type="hidden" name="lat" defaultValue={dog.homeLat} />
            <input type="hidden" name="lng" defaultValue={dog.homeLng ?? ""} />
            <p className="text-sm text-stone-500">
              Home GPS: {dog.homeLat.toFixed(5)}, {dog.homeLng?.toFixed(5)}
            </p>
          </>
        )}
        {dog?.homeLat == null && <LocationField labels={gps} auto={false} />}
      </Section>

      <Section title="Health">
        <label className="flex items-center gap-2">
          <input type="checkbox" name="sterilized" defaultChecked={dog?.sterilized} className="h-5 w-5 accent-brand" />
          Sterilized
        </label>
        <div className="grid grid-cols-2 gap-3">
          <Field label="Sterilized on" name="sterilizedOn" type="date" defaultValue={dog?.sterilizedOn ?? ""} />
          <Field label="Rabies vaccine on" name="rabiesVaccinatedOn" type="date" defaultValue={dog?.rabiesVaccinatedOn ?? ""} />
        </div>
        <Field label="Other vaccines / treatments" name="otherVaccines" defaultValue={dog?.otherVaccines} placeholder="DHPP 2026-03, deworm 2026-10" />
      </Section>

      <Section title="Caretaker">
        <Field label="Name (public)" name="caretakerName" defaultValue={dog?.caretakerName} placeholder="Khun Noi, noodle shop" />
        <div className="grid grid-cols-2 gap-3">
          <Field label="LINE ID (public)" name="caretakerLine" defaultValue={dog?.caretakerLine} />
          <Field label="Phone (volunteers only)" name="caretakerPhone" type="tel" defaultValue={dog?.caretakerPhone} />
        </div>
      </Section>

      <Section title="Notes">
        <Area label="Public notes (shown on the tag page)" name="publicNotes" defaultValue={dog?.publicNotes} />
        <Area label="Private notes (volunteers only)" name="privateNotes" defaultValue={dog?.privateNotes} />
      </Section>

      <button className="btn-brand sticky bottom-3 w-full py-4 text-lg shadow-lg">{submit}</button>
    </form>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <fieldset className="card space-y-3">
      <legend className="px-1 text-sm font-semibold uppercase tracking-wide text-stone-500">{title}</legend>
      {children}
    </fieldset>
  );
}

function Field({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <input className="input" {...props} />
    </label>
  );
}

function Area({ label, ...props }: { label: string } & React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <textarea rows={3} className="input" {...props} />
    </label>
  );
}

function Select({ label, name, value, options }: { label: string; name: string; value?: string; options: string[] }) {
  return (
    <label className="block">
      <span className="label">{label}</span>
      <select name={name} defaultValue={value} className="input capitalize">
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
    </label>
  );
}
