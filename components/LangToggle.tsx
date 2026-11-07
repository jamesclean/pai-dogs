"use client";
import { useRouter } from "next/navigation";

const LANGS = [
  ["en", "EN"],
  ["th", "ไทย"],
] as const;

export function LangToggle({ lang }: { lang: "en" | "th" }) {
  const router = useRouter();
  return (
    <div role="group" aria-label="Language" className="flex rounded-full bg-fill p-[3px]">
      {LANGS.map(([code, label]) => (
        <button
          key={code}
          type="button"
          aria-pressed={lang === code}
          className={`h-8 rounded-full px-3 text-[13px] leading-[18px] font-medium transition ${
            lang === code ? "bg-surface-raised text-label shadow-control" : "text-label-2"
          }`}
          onClick={() => {
            if (lang === code) return;
            document.cookie = `lang=${code};path=/;max-age=31536000;samesite=lax`;
            router.refresh();
          }}
        >
          {label}
        </button>
      ))}
    </div>
  );
}
