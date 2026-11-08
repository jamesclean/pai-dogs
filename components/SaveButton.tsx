"use client";
import { useFormStatus } from "react-dom";

export function SaveButton({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <button className="btn-primary flex-1" disabled={pending}>
      {pending ? "Saving…" : label}
    </button>
  );
}
