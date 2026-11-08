import Link from "next/link";
import { config } from "@/lib/config";
import { LangToggle } from "./LangToggle";
import { ChevronLeft, Paw } from "./Icons";
import type { Lang } from "@/lib/i18n";

export { Paw };

export function Logo() {
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <span className="tile h-[30px] w-[30px] rounded-full bg-brand text-white">
        <Paw className="h-[17px] w-[17px]" />
      </span>
      <span className="text-headline">{config.programName}</span>
    </Link>
  );
}

export function BackButton({ href, label }: { href: string; label: string }) {
  return (
    <Link href={href} aria-label={label} className="circle-btn">
      <ChevronLeft className="h-5 w-5" />
    </Link>
  );
}

// White page, logo or back button on the left, language on the right.
// `bottomBar` floats over the content with a fade, like the Figma screens.
export function PublicShell({
  lang,
  children,
  bottomBar,
  back,
}: {
  lang: Lang;
  children: React.ReactNode;
  bottomBar?: React.ReactNode;
  back?: { href: string; label: string };
}) {
  return (
    <>
      <header className="mx-auto flex w-full max-w-xl items-center justify-between px-4 pt-[max(env(safe-area-inset-top),12px)] pb-4">
        {back ? <BackButton {...back} /> : <Logo />}
        <LangToggle lang={lang} />
      </header>
      <main className={`mx-auto w-full max-w-xl flex-1 px-4 ${bottomBar ? "pb-36" : "pb-8"}`}>
        {children}
        <footer className="mt-12 text-center">
          <Link href="/privacy" className="text-footnote text-label-3">
            {lang === "th" ? "ความเป็นส่วนตัว" : "Privacy"}
          </Link>
        </footer>
      </main>
      {bottomBar && <BottomBar>{bottomBar}</BottomBar>}
    </>
  );
}

export function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 bg-linear-to-t from-bg from-60% to-transparent px-4 pt-8 pb-[max(env(safe-area-inset-bottom),16px)]">
      <div className="pointer-events-auto mx-auto flex max-w-xl gap-2.5">{children}</div>
    </div>
  );
}
