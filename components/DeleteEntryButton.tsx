"use client";
import { useEffect, useState } from "react";

// Deleting is permanent, so the first tap only arms the button.
export function DeleteEntryButton({ action }: { action: () => Promise<void> }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(timer);
  }, [armed]);

  return (
    <form action={action} className="inline">
      <button
        className={`text-footnote text-bad ${armed ? "font-medium" : ""}`}
        onClick={(e) => {
          if (armed) return;
          e.preventDefault();
          setArmed(true);
        }}
      >
        {armed ? "Delete entry" : "Delete"}
      </button>
    </form>
  );
}
