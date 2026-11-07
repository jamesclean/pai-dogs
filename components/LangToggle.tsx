"use client";
import { useRouter } from "next/navigation";

export function LangToggle({ lang }: { lang: "en" | "th" }) {
  const router = useRouter();
  const next = lang === "en" ? "th" : "en";
  return (
    <button
      type="button"
      className="rounded-full border border-white/40 px-3 py-1 text-sm font-medium"
      onClick={() => {
        document.cookie = `lang=${next};path=/;max-age=31536000;samesite=lax`;
        router.refresh();
      }}
    >
      {next === "th" ? "ภาษาไทย" : "English"}
    </button>
  );
}
