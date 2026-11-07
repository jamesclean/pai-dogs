"use client";
import { useActionState } from "react";
import Link from "next/link";
import { submitReport, type ReportState } from "./actions";
import { PhotoInput } from "@/components/PhotoInput";
import { LocationField } from "@/components/LocationField";
import type { Dict } from "@/lib/i18n";

const CONDITIONS = ["ok", "injured", "sick", "lost", "other"] as const;

export function ReportForm({ code, s, initial }: { code: string; s: Dict; initial: string }) {
  const [state, action, pending] = useActionState<ReportState, FormData>(submitReport.bind(null, code), {
    ok: false,
  });

  if (state.ok)
    return (
      <div className="card text-center">
        <p className="text-4xl">🧡</p>
        <p className="mt-2 text-lg font-semibold">{s.thanks}</p>
        <Link href={`/d/${code}`} className="btn-ghost mt-4 w-full">
          {s.back}
        </Link>
      </div>
    );

  return (
    <form action={action} className="space-y-5">
      <fieldset>
        <legend className="label">{s.condition}</legend>
        <div className="grid grid-cols-2 gap-2">
          {CONDITIONS.map((c) => (
            <label
              key={c}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-stone-300 bg-white px-3 py-3 has-checked:border-brand has-checked:bg-brand-soft"
            >
              <input type="radio" name="condition" value={c} defaultChecked={c === initial} className="accent-brand" />
              {s[`c_${c}`]}
            </label>
          ))}
        </div>
      </fieldset>

      <div>
        <span className="label">{s.location}</span>
        <LocationField labels={s} />
      </div>

      <PhotoInput label={s.photo} />

      <div>
        <label className="label" htmlFor="note">
          {s.note}
        </label>
        <textarea id="note" name="note" rows={3} className="input" />
      </div>

      <div>
        <label className="label" htmlFor="contact">
          {s.yourContact}
        </label>
        <input id="contact" name="contact" className="input" autoComplete="tel" />
      </div>

      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />

      {state.error && <p className="text-red-600">{state.error}</p>}
      <button className="btn-brand w-full py-4 text-lg" disabled={pending}>
        {pending ? s.sending : s.send}
      </button>
    </form>
  );
}
