"use client";
import { useEffect, useState } from "react";
import { Delete } from "./Icons";
import { HoverLabel } from "./HoverLabel";

// Deleting is permanent, so the first tap only arms the button: it turns solid red.
export function DeleteEntryButton({ action }: { action: () => Promise<void> }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(timer);
  }, [armed]);

  const label = armed ? "Delete entry" : "Delete";

  return (
    <form action={action}>
      <button
        aria-label={label}
        className={`circle-btn group relative hover:z-40 focus-visible:z-40 ${armed ? "bg-bad! text-white!" : "bg-bad-soft! text-bad!"}`}
        onClick={(e) => {
          if (armed) return;
          e.preventDefault();
          setArmed(true);
        }}
      >
        <Delete className="h-5 w-5" />
        <HoverLabel className="top-full right-0 mt-2">{label}</HoverLabel>
      </button>
    </form>
  );
}
