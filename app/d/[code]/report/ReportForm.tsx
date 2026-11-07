"use client";
import { useActionState } from "react";
import Link from "next/link";
import { submitReport, type ReportState } from "./actions";
import { PhotoInput } from "@/components/PhotoInput";
import { LocationField } from "@/components/LocationField";
import { Check, Heart } from "@/components/Icons";
import type { Dict } from "@/lib/i18n";

const CONDITIONS = ["ok", "injured", "sick", "lost", "other"] as const;

export function ReportForm({ code, s, initial }: { code: string; s: Dict; initial: string }) {
  const [state, action, pending] = useActionState<ReportState, FormData>(submitReport.bind(null, code), {
    ok: false,
  });

  if (state.ok)
    return (
      <div className="flex flex-col items-center pt-16 text-center">
        <span className="flex h-20 w-20 items-center justify-center rounded-full bg-brand-soft text-brand">
          <Heart className="h-10 w-10" />
        </span>
        <p className="mt-6 text-[22px] font-semibold tracking-tight">{s.thanks}</p>
        <Link href={`/d/${code}`} className="btn-gray mt-8 w-full">
          {s.back}
        </Link>
      </div>
    );

  return (
    <form action={action}>
      <h2 className="section-header">{s.condition}</h2>
      <div className="inset-group">
        {CONDITIONS.map((c) => (
          <label key={c} className="cell cursor-pointer active:bg-fill">
            <input type="radio" name="condition" value={c} defaultChecked={c === initial} className="peer sr-only" />
            <span className="flex-1">{s[`c_${c}`]}</span>
            <Check className="invisible h-5 w-5 text-brand peer-checked:visible" />
          </label>
        ))}
      </div>

      <div className="inset-group mt-8">
        <LocationField labels={s} />
        <PhotoInput label={s.photo} />
      </div>

      <h2 className="section-header mt-8">{s.note}</h2>
      <div className="inset-group">
        <textarea name="note" rows={3} className="cell-input block w-full px-4 py-3" />
      </div>

      <h2 className="section-header mt-8">{s.yourContact}</h2>
      <div className="inset-group">
        <div className="cell">
          <input name="contact" className="cell-input" autoComplete="tel" placeholder="LINE / 08x-xxx-xxxx" />
        </div>
      </div>

      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state.error && <p className="section-footer text-bad">{state.error}</p>}

      <div className="sticky bottom-0 z-20 -mx-4 mt-8 px-4 pb-[max(env(safe-area-inset-bottom),16px)]">
        <div className="glass mx-auto max-w-xl rounded-[32px] p-2">
          <button className="btn-brand w-full" disabled={pending}>
            {pending ? s.sending : s.send}
          </button>
        </div>
      </div>
    </form>
  );
}
