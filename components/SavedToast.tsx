"use client";
import { useEffect } from "react";
import { Check } from "./Icons";

// Each save redirects with a new ?saved= value, so `key` on this remounts it and
// the animation plays every time. The value is cleared after, so a reload stays quiet.
export function SavedToast() {
  useEffect(() => {
    const timer = setTimeout(() => {
      const url = new URL(window.location.href);
      url.searchParams.delete("saved");
      window.history.replaceState(null, "", url);
    }, 2600);
    return () => clearTimeout(timer);
  }, []);

  return (
    <p
      role="status"
      className="toast fixed top-[calc(env(safe-area-inset-top)+16px)] left-1/2 z-40 flex -translate-x-1/2 items-center gap-1.5 rounded-full bg-inverse px-4 py-2 text-callout text-on-inverse shadow-float"
    >
      <Check className="h-4 w-4" /> Saved
    </p>
  );
}
