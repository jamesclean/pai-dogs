"use client";
import { useEffect, useState } from "react";
import { DogPhoto } from "./DogPhoto";
import { Chevron, Close, Paw, Search } from "./Icons";
import { Sheet } from "./Sheet";
import { groupOf, type DogGroup } from "@/lib/dog-groups";
import type { Dict } from "@/lib/i18n";

export type PickerDog = {
  id: number;
  name: string;
  area: string;
  photoId: number | null;
  status: string;
  homeStatus: string | null;
};

const GROUPS: DogGroup[] = ["community", "home"];

// "I think it's..." on the report form: an optional guess for the crew to confirm. Sits inside a .card-rows.
export function DogPicker({ dogs, s }: { dogs: PickerDog[]; s: Dict }) {
  const [open, setOpen] = useState(false);
  const [picked, setPicked] = useState<PickerDog | null>(null);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const query = text.trim().toLowerCase();
  const matches = dogs.filter((d) => !query || `${d.name} ${d.area}`.toLowerCase().includes(query));
  const labels = { community: s.communityDog, home: s.hasFamily };
  const show = () => {
    setText("");
    setOpen(true);
  };

  return (
    <>
      {picked ? (
        <div className="row">
          <input type="hidden" name="guessDogId" value={picked.id} />
          <button type="button" onClick={show} className="flex min-w-0 flex-1 items-center gap-3.5 text-left">
            <DogPhoto photoId={picked.photoId} alt="" className="-my-1 h-10 w-10 shrink-0 rounded-[10px]" />
            <span className="min-w-0 flex-1">
              <span className="block text-footnote text-label-2">{s.thinkIts}</span>
              <span className="block truncate text-callout">{picked.name}</span>
            </span>
          </button>
          <button type="button" className="btn-outline btn-sm" onClick={() => setPicked(null)}>
            {s.clearDog}
          </button>
        </div>
      ) : (
        <button type="button" onClick={show} className="row w-full text-left">
          <Paw className="h-[22px] w-[22px] shrink-0" />
          <span className="flex-1 text-callout">{s.thinkIts}</span>
          <Chevron className="h-4 w-4 text-label-3" />
        </button>
      )}

      {open && (
        <Sheet>
          <div className="flex items-center justify-between">
            <h2 className="text-title">{s.thinkIts}</h2>
            <button type="button" aria-label={s.close} onClick={() => setOpen(false)} className="circle-btn">
              <Close className="h-5 w-5" />
            </button>
          </div>

          <label className="search mt-4">
            <Search className="h-[18px] w-[18px] shrink-0" />
            <input
              value={text}
              onChange={(e) => setText(e.target.value)}
              onKeyDown={(e) => {
                // This sits inside the report form, and Enter would send it.
                if (e.key === "Enter") e.preventDefault();
              }}
              enterKeyHint="search"
              autoComplete="off"
              placeholder={s.searchDogs}
              className="bare-input"
            />
          </label>

          <div className="mt-4 h-[50dvh] overflow-y-auto overscroll-contain">
            {GROUPS.map((g) => {
              const list = matches.filter((d) => groupOf(d) === g);
              if (list.length === 0) return null;
              return (
                <section key={g} className="mb-5 last:mb-0">
                  <h3 className="text-section">{labels[g as keyof typeof labels]}</h3>
                  <div className="card-rows mt-2">
                    {list.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        className="row w-full text-left"
                        onClick={() => {
                          setPicked(d);
                          setOpen(false);
                        }}
                      >
                        <DogPhoto photoId={d.photoId} alt="" className="h-12 w-12 shrink-0 rounded-[12px]" />
                        <span className="min-w-0 flex-1">
                          <span className="block truncate text-callout">{d.name}</span>
                          {d.area && <span className="block truncate text-footnote text-label-2">{d.area}</span>}
                        </span>
                      </button>
                    ))}
                  </div>
                </section>
              );
            })}
            {matches.length === 0 && <p className="mt-10 text-center text-subhead text-label-2">{s.noDogsFound}</p>}
          </div>
        </Sheet>
      )}
    </>
  );
}
