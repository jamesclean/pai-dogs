import Link from "next/link";
import { config } from "@/lib/config";
import { LangToggle } from "./LangToggle";
import type { Lang } from "@/lib/i18n";

export const BAR_HEIGHT = 52;

// Glass navigation bar; content scrolls underneath it.
export function PublicShell({
  lang,
  children,
  bottomBar,
}: {
  lang: Lang;
  children: React.ReactNode;
  bottomBar?: React.ReactNode;
}) {
  return (
    <>
      <header className="glass sticky top-0 z-30 pt-[env(safe-area-inset-top)]">
        <div className="mx-auto flex h-[52px] max-w-xl items-center justify-between px-4">
          <Link href="/" className="flex items-center gap-1.5 text-[17px] font-semibold">
            <Paw className="h-[22px] w-[22px] text-brand" />
            {config.programName}
          </Link>
          <LangToggle lang={lang} />
        </div>
      </header>
      <main className={`mx-auto w-full max-w-xl flex-1 px-4 ${bottomBar ? "pb-36" : "pb-12"}`}>{children}</main>
      {bottomBar && (
        <div className="fixed inset-x-0 bottom-0 z-30 px-4 pb-[max(env(safe-area-inset-bottom),16px)]">
          <div className="glass mx-auto flex max-w-xl gap-2 rounded-[32px] p-2">{bottomBar}</div>
        </div>
      )}
    </>
  );
}

export function Paw({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden>
      <ellipse cx="6" cy="9.5" rx="2.1" ry="2.6" />
      <ellipse cx="10" cy="5.8" rx="2.1" ry="2.6" />
      <ellipse cx="14" cy="5.8" rx="2.1" ry="2.6" />
      <ellipse cx="18" cy="9.5" rx="2.1" ry="2.6" />
      <path d="M12 11.2c-3 0-6 3.4-6 6.2 0 1.7 1.3 2.6 2.9 2.6 1.3 0 2-.6 3.1-.6s1.8.6 3.1.6c1.6 0 2.9-.9 2.9-2.6 0-2.8-3-6.2-6-6.2z" />
    </svg>
  );
}
