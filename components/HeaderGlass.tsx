"use client";
import { useEffect, useState } from "react";

export function useScrolled(offset = 0) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const update = () => setScrolled(window.scrollY > offset);
    update();
    window.addEventListener("scroll", update, { passive: true });
    return () => window.removeEventListener("scroll", update);
  }, [offset]);

  return scrolled;
}

// Progressive glass behind the floating bar: the blur is strongest at the top
// and eases out. Hidden at the top of the page so it doesn't touch the content below.
export function HeaderGlass() {
  const on = useScrolled();
  return (
    <div className="progressive-glass" data-on={on}>
      <div />
      <div />
      <div />
      <div />
      <div />
    </div>
  );
}
