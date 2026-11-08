"use client";
import { useScrolled } from "./HeaderGlass";

// Bar title for a page with its own large title: fades in as soon as the page scrolls.
export function RevealTitle({ children }: { children: React.ReactNode }) {
  const show = useScrolled(8);
  return (
    <p aria-hidden className={`truncate text-center text-section transition-opacity ${show ? "opacity-100" : "opacity-0"}`}>
      {children}
    </p>
  );
}
