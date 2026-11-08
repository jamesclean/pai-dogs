"use client";
import Link from "next/link";
import { useActionState } from "react";
import { submitReport, type ReportState } from "./actions";
import { LocationField } from "@/components/LocationField";
import { PhotoInput } from "@/components/PhotoInput";
import { BottomBar } from "@/components/PublicShell";
import { Sheet } from "@/components/Sheet";
import { DogPhoto } from "@/components/DogPhoto";
import { Check, Close } from "@/components/Icons";
import type { Dict } from "@/lib/i18n";

const CONDITIONS = ["ok", "injured", "sick", "lost", "other"] as const;

export function ReportForm({
  code,
  s,
  initial,
  backLabel,
  photoId,
}: {
  code: string;
  photoId: number | null;
  s: Dict;
  initial: string;
  backLabel: string;
}) {
  const [state, action, pending] = useActionState<ReportState, FormData>(submitReport.bind(null, code), {
    ok: false,
  });

  return (
    <form action={action} className="mt-4">
      <div className="card-rows">
        {CONDITIONS.map((c) => (
          <label key={c} className="row cursor-pointer">
            <input type="radio" name="condition" value={c} defaultChecked={c === initial} className="peer sr-only" />
            <span className="flex-1 text-body">{s[`c_${c}`]}</span>
            <span className="tile h-6 w-6 rounded-full border-[1.5px] border-label-3 text-on-inverse peer-checked:border-inverse peer-checked:bg-inverse peer-focus-visible:ring-2 peer-focus-visible:ring-brand [&>svg]:invisible peer-checked:[&>svg]:visible">
              <Check className="h-3.5 w-3.5" />
            </span>
          </label>
        ))}
      </div>

      <div className="card-rows mt-6">
        <LocationField labels={s} />
        <PhotoInput label={s.addPhoto} changeLabel={s.changePhoto} />
      </div>

      <label className="mt-6 block">
        <span className="field-label">{s.anythingElse}</span>
        <textarea name="note" rows={3} placeholder={s.notePlaceholder} className="field py-3.5" />
      </label>

      <label className="mt-5 block">
        <span className="field-label">{s.yourContact}</span>
        <input name="contact" autoComplete="tel" placeholder={s.contactPlaceholder} className="field h-[50px]" />
        <span className="field-help">{s.contactHelp}</span>
      </label>

      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state.error && <p className="mt-4 text-footnote text-bad">{state.error === "rate" ? s.tooMany : state.error}</p>}

      <BottomBar>
        <button className="btn-primary flex-1" disabled={pending}>
          {pending ? s.sending : s.sendReport}
        </button>
      </BottomBar>

      {state.ok && (
        <Sheet>
          <div className="flex items-start justify-between">
            <DogPhoto photoId={photoId} alt="" className="h-14 w-14 rounded-[18px]" />
            <Link href={`/d/${code}`} aria-label={backLabel} className="circle-btn">
              <Close className="h-5 w-5" />
            </Link>
          </div>
          <h2 className="mt-5 text-title">{s.reportSent}</h2>
          <Link href={`/d/${code}`} className="btn-primary mt-6 w-full">
            {backLabel}
          </Link>
        </Sheet>
      )}
    </form>
  );
}
