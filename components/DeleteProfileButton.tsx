"use client";
import { useEffect, useState } from "react";

// Deleting is permanent, so the first tap only arms the button.
export function DeleteProfileButton({ action, name }: { action: () => Promise<void>; name: string }) {
  const [armed, setArmed] = useState(false);

  useEffect(() => {
    if (!armed) return;
    const timer = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(timer);
  }, [armed]);

  return (
    <form action={action}>
      <button
        className={`btn-danger w-full ${armed ? "bg-bad! text-white!" : ""}`}
        onClick={(e) => {
          if (armed) return;
          e.preventDefault();
          setArmed(true);
        }}
      >
        {armed ? `Delete ${name}'s profile for good` : `Delete ${name}'s profile`}
      </button>
    </form>
  );
}
