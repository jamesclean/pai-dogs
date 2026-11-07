import type { Dog } from "@/db/schema";
import { PhotoInput } from "./PhotoInput";
import { LocationField } from "./LocationField";
import { Switch } from "./Switch";
import { UpDown } from "./Icons";

const gps = {
  useLocation: "Set home to my location",
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
    <form action={action}>
      {tag && <input type="hidden" name="tag" value={tag} />}

      <Section title="Dog">
        <PhotoInput label={dog?.photoId ? "Replace photo" : "Add photo"} />
        <Text label="Name" name="name" defaultValue={dog?.name} required />
        <Select label="Sex" name="sex" value={dog?.sex} options={["unknown", "male", "female"]} />
        <Select label="Temperament" name="temperament" value={dog?.temperament} options={["friendly", "shy", "careful"]} />
        {dog && <Select label="Status" name="status" value={dog.status} options={["community", "missing", "adopted", "deceased"]} />}
        <Text label="Looks like" name="description" defaultValue={dog?.description} placeholder="Tan, white chest" />
      </Section>

      <Section title="Home" footer="Area is shown publicly. GPS is for volunteers' map only.">
        <Text label="Area" name="area" defaultValue={dog?.area} placeholder="Walking Street" />
        {dog?.homeLat != null ? (
          <div className="cell">
            <input type="hidden" name="lat" defaultValue={dog.homeLat} />
            <input type="hidden" name="lng" defaultValue={dog.homeLng ?? ""} />
            <span className="flex-1">GPS</span>
            <span className="font-mono text-[15px] text-label-2">
              {dog.homeLat.toFixed(4)}, {dog.homeLng?.toFixed(4)}
            </span>
          </div>
        ) : (
          <LocationField labels={gps} auto={false} />
        )}
      </Section>

      <Section title="Health">
        <div className="cell">
          <span className="flex-1">Sterilized</span>
          <Switch name="sterilized" defaultChecked={dog?.sterilized} />
        </div>
        <Text label="Sterilized on" name="sterilizedOn" type="date" defaultValue={dog?.sterilizedOn ?? ""} />
        <Text label="Rabies shot" name="rabiesVaccinatedOn" type="date" defaultValue={dog?.rabiesVaccinatedOn ?? ""} />
        <Text label="Other" name="otherVaccines" defaultValue={dog?.otherVaccines} placeholder="DHPP, deworm…" />
      </Section>

      <Section title="Caretaker" footer="Phone is only visible to volunteers.">
        <Text label="Name" name="caretakerName" defaultValue={dog?.caretakerName} placeholder="Khun Noi" />
        <Text label="LINE ID" name="caretakerLine" defaultValue={dog?.caretakerLine} placeholder="Optional" />
        <Text label="Phone" name="caretakerPhone" type="tel" defaultValue={dog?.caretakerPhone} placeholder="Optional" />
      </Section>

      <Section title="Public notes">
        <textarea name="publicNotes" defaultValue={dog?.publicNotes} rows={3} placeholder="Shown on the tag page" className="cell-input block w-full px-4 py-3" />
      </Section>
      <Section title="Private notes">
        <textarea name="privateNotes" defaultValue={dog?.privateNotes} rows={3} placeholder="Volunteers only" className="cell-input block w-full px-4 py-3" />
      </Section>

      <div className="sticky bottom-0 z-20 -mx-4 mt-8 px-4 pb-[max(env(safe-area-inset-bottom),16px)]">
        <div className="glass mx-auto max-w-3xl rounded-[32px] p-2">
          <button className="btn-brand w-full">{submit}</button>
        </div>
      </div>
    </form>
  );
}

function Section({ title, footer, children }: { title: string; footer?: string; children: React.ReactNode }) {
  return (
    <section className="mt-8">
      <h2 className="section-header">{title}</h2>
      <div className="inset-group">{children}</div>
      {footer && <p className="section-footer">{footer}</p>}
    </section>
  );
}

function Text({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="cell">
      <span className="w-32 shrink-0">{label}</span>
      <input className="cell-input text-right [&::-webkit-date-and-time-value]:text-right" {...props} />
    </label>
  );
}

function Select({ label, name, value, options }: { label: string; name: string; value?: string; options: string[] }) {
  return (
    <label className="cell">
      <span className="flex-1">{label}</span>
      <select name={name} defaultValue={value} className="cursor-pointer appearance-none bg-transparent text-right text-[17px] text-label-2 capitalize outline-none">
        {options.map((o) => (
          <option key={o} value={o}>
            {o}
          </option>
        ))}
      </select>
      <UpDown className="-ml-1 h-4 w-4 text-label-3" />
    </label>
  );
}
