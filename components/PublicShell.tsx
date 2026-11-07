import Link from "next/link";
import { config } from "@/lib/config";
import { LangToggle } from "./LangToggle";
import type { Lang } from "@/lib/i18n";

export function PublicShell({ lang, children }: { lang: Lang; children: React.ReactNode }) {
  return (
    <>
      <header className="bg-brand text-white">
        <div className="mx-auto flex max-w-xl items-center justify-between px-4 py-3">
          <Link href="/" className="flex items-center gap-2 text-lg font-bold">
            <Paw className="h-6 w-6" /> {config.programName}
          </Link>
          <LangToggle lang={lang} />
        </div>
      </header>
      <main className="mx-auto w-full max-w-xl flex-1 px-4 py-5">{children}</main>
    </>
  );
}

export function Paw({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <ellipse cx="6" cy="9" rx="2.2" ry="2.8" />
      <ellipse cx="10" cy="5.5" rx="2.2" ry="2.8" />
      <ellipse cx="14" cy="5.5" rx="2.2" ry="2.8" />
      <ellipse cx="18" cy="9" rx="2.2" ry="2.8" />
      <path d="M12 11c-3 0-6 3.5-6 6.3 0 1.8 1.4 2.7 3 2.7 1.3 0 2-.6 3-.6s1.7.6 3 .6c1.6 0 3-.9 3-2.7C18 14.5 15 11 12 11z" />
    </svg>
  );
}
