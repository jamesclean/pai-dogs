"use client";
import Link from "next/link";
import { useActionState, useState } from "react";
import { submitNewDog, type AddState } from "./actions";
import { LocationField } from "@/components/LocationField";
import { PhotoInput } from "@/components/PhotoInput";
import { BottomBar } from "@/components/PublicShell";
import { Sheet } from "@/components/Sheet";
import { Close, Megaphone } from "@/components/Icons";
import type { Dict } from "@/lib/i18n";

export function AddDogForm({ s }: { s: Dict }) {
  const [state, action, pending] = useActionState<AddState, FormData>(submitNewDog, { ok: false });
  // The photo they took, shown again on the "Report sent" sheet.
  const [preview, setPreview] = useState<string | null>(null);

  return (
    <form
      action={action}
      className="mt-5"
      onChange={(e) => {
        const input = e.target as unknown as HTMLInputElement;
        const file = input.type === "file" ? input.files?.[0] : undefined;
        if (file) setPreview(URL.createObjectURL(file));
      }}
    >
      <PhotoInput variant="large" label={s.addPhoto} changeLabel={s.changePhoto} />
      {state.error === "photo" && <p className="mt-2 text-footnote text-bad">{s.photoNeeded}</p>}

      <div className="card-rows mt-4">
        <LocationField labels={s} />
      </div>

      <label className="mt-6 block">
        <span className="field-label">{s.looksLike}</span>
        <textarea name="note" rows={3} placeholder={s.looksLikePlaceholder} className="field py-3.5" />
      </label>

      <label className="mt-5 block">
        <span className="field-label">{s.yourContact}</span>
        <input name="contact" autoComplete="tel" placeholder={s.contactPlaceholder} className="field h-[50px]" />
        <span className="field-help">{s.contactHelp}</span>
      </label>

      <input name="website" tabIndex={-1} autoComplete="off" className="hidden" aria-hidden />
      {state.error === "upload" && <p className="mt-4 text-footnote text-bad">{s.uploadFailed}</p>}
      {state.error === "rate" && <p className="mt-4 text-footnote text-bad">{s.tooMany}</p>}

      <BottomBar>
        <button className="btn-primary flex-1" disabled={pending}>
          {pending ? s.sending : s.addDogButton}
        </button>
      </BottomBar>

      {state.ok && (
        <Sheet>
          <div className="flex items-start justify-between">
            {preview ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={preview} alt="" className="h-14 w-14 rounded-[18px] object-cover" />
            ) : (
              <span className="tile h-14 w-14 rounded-[18px] bg-brand-soft text-brand">
                <Megaphone className="h-7 w-7" />
              </span>
            )}
            <Link href="/" aria-label={s.backHome} className="circle-btn">
              <Close className="h-5 w-5" />
            </Link>
          </div>
          <h2 className="mt-5 text-title">{s.dogAdded}</h2>
          <Link href="/" className="btn-primary mt-6 w-full">
            {s.backHome}
          </Link>
        </Sheet>
      )}
    </form>
  );
}
