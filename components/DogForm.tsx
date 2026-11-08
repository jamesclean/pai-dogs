import type { Dog } from "@/db";
import { PhotoInput } from "./PhotoInput";
import { LocationField } from "./LocationField";
import { Switch } from "./Switch";
import { BottomBar } from "./PublicShell";
import { UpDown } from "./Icons";

const gps = {
  yourLocation: "Home location set",
  shareYourLocation: "Set home location",
  locating: "Getting GPS…",
  added: "Added",
  locationFailed: "GPS failed. Describe the area instead.",
};

export type DogPrefill = Partial<Pick<Dog, "description" | "homeLat" | "homeLng" | "area">>;

export function DogForm({
  dog,
  prefill,
  action,
  tag,
  report,
  submit,
}: {
  dog?: Dog;
  prefill?: DogPrefill;
  action: (f: FormData) => Promise<void>;
  tag?: string;
  report?: number;
  submit: string;
}) {
  const homeLat = dog?.homeLat ?? prefill?.homeLat ?? null;
  const homeLng = dog?.homeLng ?? prefill?.homeLng ?? null;
  return (
    <form action={action}>
      {tag && <input type="hidden" name="tag" value={tag} />}
      {report && <input type="hidden" name="report" value={report} />}

      {!dog && (
        <label className="mt-6 block">
          <span className="field-label">Name</span>
          <input name="name" required placeholder="e.g. Khao" className="field h-[50px]" />
        </label>
      )}

      <Section title="Dog">
        <PhotoInput label={dog?.photoId ? "Replace photo" : "Add a photo"} changeLabel="Change photo" />
        {dog && <Text label="Name" name="name" defaultValue={dog.name} required />}
        <Select label="Sex" name="sex" value={dog?.sex} options={[["unknown", "Unknown"], ["male", "Male"], ["female", "Female"]]} />
        <Select
          label="Temperament"
          name="temperament"
          value={dog?.temperament}
          options={[["friendly", "Friendly"], ["shy", "Shy"], ["careful", "Careful"]]}
        />
        {dog && (
          <Select
            label="Status"
            name="status"
            value={dog.status}
            options={[["community", "Community"], ["missing", "Missing"], ["deceased", "In memory"]]}
          />
        )}
        <Select
          label="Home status"
          name="homeStatus"
          value={dog?.homeStatus ?? ""}
          options={[["", "Not set"], ["has_home", "Has a home"], ["ask_adoption", "Ask about adoption"]]}
        />
        <Text label="Looks like" name="description" defaultValue={dog?.description ?? prefill?.description} placeholder="Tan, white chest" />
      </Section>

      <Section title="Location" footer="Usually found at shows on the public page. GPS stays private.">
        <Text label="Usually found at" name="area" defaultValue={dog?.area ?? prefill?.area} placeholder="7-Eleven, Walking Street" />
        {homeLat != null ? (
          <div className="row">
            <input type="hidden" name="lat" defaultValue={homeLat} />
            <input type="hidden" name="lng" defaultValue={homeLng ?? ""} />
            <span className="flex-1 text-callout">GPS</span>
            <span className="text-subhead text-label-2">
              {homeLat.toFixed(4)}, {homeLng?.toFixed(4)}
            </span>
          </div>
        ) : (
          <LocationField labels={gps} auto={false} />
        )}
      </Section>

      <Section title="Health">
        <div className="row">
          <span className="flex-1 text-callout">Sterilized</span>
          <Switch name="sterilized" defaultChecked={dog?.sterilized} />
        </div>
        <Text label="Sterilized on" name="sterilizedOn" type="date" defaultValue={dog?.sterilizedOn ?? ""} />
        <Text label="Rabies vaccine" name="rabiesVaccinatedOn" type="date" defaultValue={dog?.rabiesVaccinatedOn ?? ""} />
        <Text label="Other" name="otherVaccines" defaultValue={dog?.otherVaccines} placeholder="DHPP, dewormed" />
      </Section>

      <Section title="Caretaker" footer="Only volunteers see the phone number.">
        <Text label="Name" name="caretakerName" defaultValue={dog?.caretakerName} placeholder="Khun Noi" />
        <Text label="LINE ID" name="caretakerLine" defaultValue={dog?.caretakerLine} placeholder="noi.pai" />
        <Text label="Phone" name="caretakerPhone" type="tel" defaultValue={dog?.caretakerPhone} placeholder="08x-xxx-xxxx" />
      </Section>

      <section className="mt-7">
        <h2 className="text-section">Notes</h2>
        <label className="mt-2 block">
          <span className="field-label">Public note</span>
          <textarea name="publicNotes" defaultValue={dog?.publicNotes} rows={3} placeholder="Shown on the dog page" className="field py-3.5" />
        </label>
        <label className="mt-4 block">
          <span className="field-label">Private note</span>
          <textarea name="privateNotes" defaultValue={dog?.privateNotes} rows={3} placeholder="Anything the team should know" className="field py-3.5" />
        </label>
      </section>

      <BottomBar>
        <button className="btn-primary flex-1">{submit}</button>
      </BottomBar>
    </form>
  );
}

function Section({ title, footer, children }: { title: string; footer?: string; children: React.ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="text-section">{title}</h2>
      <div className="card-rows mt-2">{children}</div>
      {footer && <p className="mt-2 text-footnote text-label-3">{footer}</p>}
    </section>
  );
}

function Text({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="row">
      <span className="w-32 shrink-0 text-callout">{label}</span>
      <input
        className="bare-input text-right text-subhead text-label-2 [&::-webkit-date-and-time-value]:text-right"
        {...props}
      />
    </label>
  );
}

function Select({ label, name, value, options }: { label: string; name: string; value?: string; options: [string, string][] }) {
  return (
    <label className="row">
      <span className="flex-1 text-callout">{label}</span>
      <select name={name} defaultValue={value} className="cursor-pointer appearance-none bg-transparent text-right text-subhead text-label-2 outline-none">
        {options.map(([v, l]) => (
          <option key={v} value={v}>
            {l}
          </option>
        ))}
      </select>
      <UpDown className="-ml-1 h-4 w-4 text-label-3" />
    </label>
  );
}
