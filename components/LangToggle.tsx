"use client";
import { useRouter } from "next/navigation";

export function LangToggle({ lang }: { lang: "en" | "th" }) {
  const router = useRouter();
  const next = lang === "en" ? "th" : "en";
  return (
    <button
      type="button"
      aria-label={next === "th" ? "เปลี่ยนเป็นภาษาไทย" : "Switch to English"}
      className="h-8 rounded-full bg-fill px-3 text-[15px] font-medium text-label transition active:scale-95"
      onClick={() => {
        document.cookie = `lang=${next};path=/;max-age=31536000;samesite=lax`;
        router.refresh();
      }}
    >
      {next === "th" ? "ไทย" : "EN"}
    </button>
  );
}
