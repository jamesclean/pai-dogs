"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import type { ReportState } from "@/app/report/actions";
import { ContactField } from "./ContactField";
import { LocationField } from "./LocationField";
import { PhotoInput } from "./PhotoInput";
import { BottomBar } from "./PublicShell";
import { Sheet } from "./Sheet";
import { DogPhoto } from "./DogPhoto";
import { Check, Close, Megaphone, Phone } from "./Icons";
import { fmtPhone, type Vet } from "@/lib/config";
import type { Dict } from "@/lib/i18n";

const CONDITIONS = ["ok", "injured", "sick", "lost", "other"] as const;

// The one report form, for a known dog (photoId is set) or an unknown one.
export function ReportForm({
  action: submit,
  s,
  initial,
  back,
  photoId,
  vet,
}: {
  action: (prev: ReportState, form: FormData) => Promise<ReportState>;
  s: Dict;
  initial?: string;
  back: { href: string; label: string };
  photoId?: number | null;
  vet: Vet;
}) {
  const [state, action, pending] = useActionState<ReportState, FormData>(submit, { ok: false });
  const [condition, setCondition] = useState(CONDITIONS.find((c) => c === initial));
  // The photo they took, shown again on the "Report sent" sheet of an unknown dog.
  const [preview, setPreview] = useState<string | null>(null);
  const urgent = condition === "injured" || condition === "sick";

  return (
    <form
      action={action}
      onChange={(e) => {
        const input = e.target as unknown as HTMLInputElement;
        if (input.name === "condition") setCondition(input.value as typeof condition);
        const file = input.type === "file" ? input.files?.[0] : undefined;
        if (file) setPreview(URL.createObjectURL(file));
      }}
    >
      <div className="card-rows">
        {CONDITIONS.map((c) => (
          <label key={c} className="row cursor-pointer">
            <input type="radio" name="condition" value={c} required defaultChecked={c === initial} className="peer sr-only" />
            <span className="flex-1 text-body">{s[`c_${c}`]}</span>
            <span className="tile h-6 w-6 rounded-full border-[1.5px] border-label-3 text-on-inverse peer-checked:border-inverse peer-checked:bg-inverse peer-focus-visible:ring-2 peer-focus-visible:ring-brand [&>svg]:invisible peer-checked:[&>svg]:visible">
              <Check className="h-3.5 w-3.5" />
            </span>
          </label>
        ))}
      </div>

      {urgent && <VetCard vet={vet} s={s} className="mt-3" />}

      <div className="card-rows mt-6">
        <LocationField labels={s} named />
        <PhotoInput label={s.addPhoto} changeLabel={s.changePhoto} />
      </div>

      <label className="mt-6 block">
        <span className="field-label">{s.addNote}</span>
        <textarea name="note" rows={3} className="field py-3.5" />
      </label>

      <div className="mt-5">
        <ContactField s={s} />
      </div>

      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <FormError error={state.error} s={s} />

      <BottomBar>
        <button className="btn-primary flex-1" disabled={pending}>
          {pending ? s.sending : s.sendReport}
        </button>
      </BottomBar>

      {state.ok && (
        <SentSheet back={back} title={s.reportSent}>
          {photoId !== undefined ? (
            <DogPhoto photoId={photoId} alt="" className="h-14 w-14 rounded-[18px]" />
          ) : preview ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={preview} alt="" className="h-14 w-14 rounded-[18px] object-cover" />
          ) : (
            <span className="tile h-14 w-14 rounded-[18px] bg-brand-soft text-brand">
              <Megaphone className="h-7 w-7" />
            </span>
          )}
          {urgent && <VetCard vet={vet} s={s} className="mt-4" />}
        </SentSheet>
      )}
    </form>
  );
}

export function FormError({ error, s }: { error?: ReportState["error"]; s: Dict }) {
  if (!error) return null;
  const text = error === "rate" ? s.tooMany : error === "upload" ? s.uploadFailed : s.sendFailed;
  return <p className="mt-4 text-footnote text-bad">{text}</p>;
}

// Bottom sheet after a form is sent. The first child sits top left; the rest go under the title.
export function SentSheet({
  back,
  title,
  children,
}: {
  back: { href: string; label: string };
  title: string;
  children: React.ReactNode;
}) {
  const [image, ...rest] = Array.isArray(children) ? children : [children];
  return (
    <Sheet>
      <div className="flex items-start justify-between">
        {image}
        <Link href={back.href} aria-label={back.label} className="circle-btn">
          <Close className="h-5 w-5" />
        </Link>
      </div>
      <h2 className="mt-5 text-title">{title}</h2>
      {rest}
      <Link href={back.href} className="btn-primary mt-6 w-full">
        {back.label}
      </Link>
    </Sheet>
  );
}

function VetCard({ vet, s, className }: { vet: Vet; s: Dict; className: string }) {
  return (
    <div className={`card-rows ${className}`}>
      <div className="row">
        <span className="tile h-10 w-10 shrink-0 rounded-[12px] bg-fill">
          <Phone className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-callout">{vet.name}</p>
          <p className="text-footnote text-label-2">
            {s.vet} • {fmtPhone(vet.phone)}
          </p>
        </div>
        <a href={`tel:${vet.phone}`} className="btn-outline btn-sm">
          {s.callVet}
        </a>
      </div>
    </div>
  );
}
