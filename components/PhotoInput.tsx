"use client";
import { useRef, useState } from "react";

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

export function PhotoInput({ name = "photo", label }: { name?: string; label: string }) {
  const hidden = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div>
      <span className="label">{label}</span>
      <label className="flex cursor-pointer items-center gap-3 rounded-lg border border-dashed border-stone-300 bg-white p-3">
        {preview ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={preview} alt="" className="h-16 w-16 rounded-md object-cover" />
        ) : (
          <span className="flex h-16 w-16 items-center justify-center rounded-md bg-stone-100 text-2xl">📷</span>
        )}
        <span className="text-sm text-stone-600">{busy ? "…" : preview ? "✓" : "+"}</span>
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
      </label>
      <input ref={hidden} type="file" name={name} className="hidden" />
    </div>
  );
}
