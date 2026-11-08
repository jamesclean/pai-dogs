"use client";
import { useRouter } from "next/navigation";
import { Globe } from "./Icons";

// Written in the language it switches to, so the person who needs it can read it.
export function LangToggle({ lang }: { lang: "en" | "th" }) {
  const router = useRouter();
  const next = lang === "en" ? "th" : "en";
  return (
    <button
      type="button"
      lang={next}
      className="inline-flex items-center gap-1.5 py-1 text-label-2"
      onClick={() => {
        document.cookie = `lang=${next};path=/;max-age=31536000;samesite=lax`;
        router.refresh();
      }}
    >
      <Globe className="h-4 w-4" />
      {next === "th" ? "เปลี่ยนเป็นภาษาไทย" : "Switch to English"}
    </button>
  );
}
