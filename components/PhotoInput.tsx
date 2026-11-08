"use client";
import { useRef, useState } from "react";
import { Camera, Chevron } from "./Icons";

// Resizes in the browser before upload: phone photos are 3–8 MB, rural 4G in
// Pai is slow, and we store photos in Postgres. 1280px JPEG ≈ 150 KB.
async function resize(file: File, max = 1280): Promise<File> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, max / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext("2d")!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob>((res, rej) =>
    canvas.toBlob((b) => (b ? res(b) : rej(new Error("resize failed"))), "image/jpeg", 0.82),
  );
  return new File([blob], "photo.jpg", { type: "image/jpeg" });
}

// "row" sits inside a .card-rows; "large" is the big picker on Add a new dog.
export function PhotoInput({
  name = "photo",
  label,
  changeLabel,
  variant = "row",
}: {
  name?: string;
  label: string;
  changeLabel?: string;
  variant?: "row" | "large";
}) {
  const hidden = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const picker = (
    <>
      <input
        type="file"
        accept="image/*"
        className="sr-only"
        onChange={async (e) => {
          const f = e.target.files?.[0];
          if (!f || !hidden.current) return;
          setBusy(true);
          try {
            const small = await resize(f);
            const dt = new DataTransfer();
            dt.items.add(small);
            hidden.current.files = dt.files;
            setPreview(URL.createObjectURL(small));
          } finally {
            setBusy(false);
          }
        }}
      />
      <input ref={hidden} type="file" name={name} className="hidden" />
    </>
  );

  if (variant === "large")
    return (
      <label className="relative flex h-[200px] cursor-pointer flex-col items-center justify-center gap-2.5 overflow-hidden rounded-[24px] bg-surface">
        {preview ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={preview} alt="" className="absolute inset-0 h-full w-full object-cover" />
            <span className="chip absolute bottom-3 left-3">{changeLabel ?? label}</span>
          </>
        ) : (
          <>
            <span className="tile h-[52px] w-[52px] rounded-full bg-surface-raised shadow-control">
              <Camera className="h-6 w-6" />
            </span>
            <span className="text-callout">{busy ? "…" : label}</span>
          </>
        )}
        {picker}
      </label>
    );

  return (
    <label className="row cursor-pointer">
      <Camera className="h-[22px] w-[22px] shrink-0" />
      <span className="flex-1 text-callout">{busy ? "…" : preview && changeLabel ? changeLabel : label}</span>
      {preview ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="-my-1 h-10 w-10 rounded-[10px] object-cover" />
      ) : (
        <Chevron className="h-4 w-4 text-label-3" />
      )}
      {picker}
    </label>
  );
}
