"use client";
import { useActionState } from "react";
import type { ReportState } from "@/app/report/actions";
import { BottomBar } from "@/components/PublicShell";
import { ContactField } from "@/components/ContactField";
import { DogPhoto } from "@/components/DogPhoto";
import { FormError, SentSheet } from "@/components/ReportForm";
import type { Dict } from "@/lib/i18n";

export function AdoptForm({
  action: submit,
  s,
  back,
  photoId,
}: {
  action: (prev: ReportState, form: FormData) => Promise<ReportState>;
  s: Dict;
  back: { href: string; label: string };
  photoId: number | null;
}) {
  const [state, action, pending] = useActionState<ReportState, FormData>(submit, { ok: false });
  return (
    <form action={action}>
      <ContactField s={s} required />
      <label className="mt-5 block">
        <span className="field-label">{s.addNote}</span>
        <textarea name="note" rows={3} className="field py-3.5" />
      </label>
      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      <FormError error={state.error} s={s} />
      <BottomBar>
        <button className="btn-primary flex-1" disabled={pending}>
          {pending ? s.sending : s.sendQuestion}
        </button>
      </BottomBar>
      {state.ok && (
        <SentSheet back={back} title={s.questionSent}>
          <DogPhoto photoId={photoId} alt="" className="h-14 w-14 rounded-[18px]" />
        </SentSheet>
      )}
    </form>
  );
}
