import Link from "next/link";
import { config } from "@/lib/config";
import { LangToggle } from "./LangToggle";
import { HeaderGlass } from "./HeaderGlass";
import { RevealTitle } from "./RevealTitle";
import { ChevronLeft, Login, Paw } from "./Icons";
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

// White page. With `back`, a bar with the back button and page title floats on
// top as you scroll; otherwise the logo sits at the top. `revealTitle` is for a page
// with its own large title: the bar shows the title once the page scrolls.
// `bottomBar` floats over the content with a fade, like the Figma screens.
export function PublicShell({
  lang,
  children,
  bottomBar,
  back,
  title,
  revealTitle = false,
  adminLabel,
}: {
  lang: Lang;
  children: React.ReactNode;
  bottomBar?: React.ReactNode;
  back?: { href: string; label: string };
  title?: string;
  revealTitle?: boolean;
  adminLabel?: string;
}) {
  return (
    <>
      {back ? (
        <header className="sticky top-0 z-30">
          <HeaderGlass />
          <div className="mx-auto grid w-full max-w-xl grid-cols-[40px_minmax(0,1fr)_40px] items-center gap-2 px-4 pt-[max(env(safe-area-inset-top),12px)] pb-4">
            <BackButton {...back} />
            {title &&
              (revealTitle ? (
                <RevealTitle>{title}</RevealTitle>
              ) : (
                <h1 className="truncate text-center text-section">{title}</h1>
              ))}
          </div>
        </header>
      ) : (
        <header className="mx-auto w-full max-w-xl px-4 pt-[max(env(safe-area-inset-top),12px)] pb-4">
          <Logo />
        </header>
      )}
      <main className={`mx-auto w-full max-w-xl flex-1 px-4 ${bottomBar ? "pb-36" : "pb-8"}`}>
        {children}
        <footer className="mt-12 flex flex-col items-center gap-1.5 text-footnote text-label-3">
          <LangToggle lang={lang} />
          {adminLabel && (
            <Link href="/admin" className="inline-flex items-center gap-1.5 py-1 text-label-2">
              <Login className="h-4 w-4" />
              {adminLabel}
            </Link>
          )}
          <Link href="/privacy">{lang === "th" ? "ความเป็นส่วนตัว" : "Privacy"}</Link>
        </footer>
      </main>
      {bottomBar && <BottomBar>{bottomBar}</BottomBar>}
    </>
  );
}

export function BottomBar({ children }: { children: React.ReactNode }) {
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-30 bg-linear-to-t from-bg from-60% to-transparent pt-8 pb-[max(env(safe-area-inset-bottom),16px)]">
      <div className="pointer-events-auto mx-auto flex max-w-xl gap-2.5 px-4">{children}</div>
    </div>
  );
}
