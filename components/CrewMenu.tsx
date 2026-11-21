"use client";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { signOut } from "@/app/admin/actions";
import { Admin, MeetDogs, Plus, Tag } from "./Icons";
import { HoverLabel } from "./HoverLabel";

// Top right of Home when the crew is signed in: a Crew chip and the crew menu.
export function CrewMenu() {
  const [open, setOpen] = useState(false);
  const button = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setOpen(false);
      button.current?.focus();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const item = "row min-h-[48px] w-full gap-3 py-2.5 text-left text-callout";
  return (
    <div className="relative z-40 flex items-center gap-2">
      {open && (
        <div aria-hidden className="fixed inset-0 -z-10 bg-[var(--scrim)]" onClick={() => setOpen(false)} />
      )}
      <span className="chip">Crew</span>
      <button
        ref={button}
        type="button"
        aria-label="Crew menu"
        aria-expanded={open}
        aria-controls="crew-menu"
        onClick={() => setOpen((o) => !o)}
        className="stable-layer circle-btn group relative"
      >
        <Admin className="h-5 w-5" />
        {!open && <HoverLabel className="top-full right-0 mt-2">Crew menu</HoverLabel>}
      </button>
      {open && (
        <div
          id="crew-menu"
          className="menu-in absolute top-full right-0 mt-2 w-60 rounded-[20px] border border-sep bg-surface-raised px-4 py-1 shadow-float [&>*+*]:border-t [&>*+*]:border-sep"
        >
          <Link href="/admin/dogs/new" className={item} onClick={() => setOpen(false)}>
            <Plus className="h-5 w-5 shrink-0" />
            Add a dog
          </Link>
          <Link href="/admin/tags" className={item} onClick={() => setOpen(false)}>
            <Tag className="h-5 w-5 shrink-0" />
            Tag batches
          </Link>
          <form action={signOut}>
            <button className={item}>
              <MeetDogs className="h-5 w-5 shrink-0" />
              Sign out
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
