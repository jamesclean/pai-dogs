"use client";
import { useRef, useState } from "react";
import { Camera } from "./Icons";

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

// Renders as a list cell; place inside an .inset-group.
export function PhotoInput({ name = "photo", label }: { name?: string; label: string }) {
  const hidden = useRef<HTMLInputElement>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  return (
    <label className="cell cell-icon cursor-pointer active:bg-fill">
      <span className="icon-tile bg-label-2">
        <Camera className="h-[18px] w-[18px]" />
      </span>
      <span className="flex-1">{label}</span>
      {busy && <span className="text-label-2">…</span>}
      {preview && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={preview} alt="" className="-my-1 h-11 w-11 rounded-[10px] object-cover" />
      )}
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
    </label>
  );
}
