"use client";
import { useEffect, useState } from "react";
import { Check, Pin } from "./Icons";
import { logScan } from "@/app/d/[code]/scan-action";

type Labels = { title: string; body: string; share: string; notNow: string; done: string };

// Asks once per tag page: "Add Mali to the map". If they agree, the scan
// becomes a light-weight sighting on the volunteers' map.
export function ScanCard({ code, labels }: { code: string; labels: Labels }) {
  const key = `scan:${code}`;
  const [state, setState] = useState<"hidden" | "ask" | "locating" | "done">("hidden");

  useEffect(() => {
    const last = Number(localStorage.getItem(key) ?? 0);
    // Ask again after 12 hours, so a regular passer-by isn't nagged.
    // eslint-disable-next-line react-hooks/set-state-in-effect -- reads localStorage once on mount
    if (navigator.geolocation && Date.now() - last > 12 * 3600_000) setState("ask");
  }, [key]);

  if (state === "hidden") return null;

  if (state === "done")
    return (
      <div className="mt-3 flex items-center gap-2.5 rounded-[20px] bg-ok-soft px-4 py-3 text-callout text-ok">
        <Check className="h-5 w-5" />
        {labels.done}
      </div>
    );

  function share() {
    setState("locating");
    navigator.geolocation.getCurrentPosition(
      async (p) => {
        localStorage.setItem(key, String(Date.now()));
        await logScan(code, p.coords.latitude, p.coords.longitude, p.coords.accuracy);
        setState("done");
      },
      () => {
        localStorage.setItem(key, String(Date.now()));
        setState("hidden");
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }

  return (
    <div className="card mt-3 p-4">
      <div className="flex items-center gap-3">
        <span className="tile h-10 w-10 rounded-[12px] bg-brand-soft text-brand">
          <Pin className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-callout">{labels.title}</p>
          <p className="text-footnote text-label-2">{labels.body}</p>
        </div>
      </div>
      <div className="mt-3.5 flex gap-2">
        <button type="button" onClick={share} disabled={state === "locating"} className="btn-primary btn-sm flex-1">
          {labels.share}
        </button>
        <button
          type="button"
          onClick={() => {
            localStorage.setItem(key, String(Date.now()));
            setState("hidden");
          }}
          className="btn-secondary btn-sm flex-1"
        >
          {labels.notNow}
        </button>
      </div>
    </div>
  );
}
