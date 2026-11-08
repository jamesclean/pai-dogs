"use client";
import { useEffect, useState } from "react";

// Fade behind the floating bar. Hidden at the top of the page so it doesn't wash over the content below.
export function HeaderFade() {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > 0);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, []);

  return (
    <div
      className={`pointer-events-none absolute inset-x-0 top-0 -z-10 h-[calc(100%+16px)] bg-linear-to-b from-bg from-60% to-transparent transition-opacity ${
        scrolled ? "opacity-100" : "opacity-0"
      }`}
    />
  );
}
