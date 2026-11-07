"use client";
import { useEffect, useState } from "react";

type Labels = { useLocation: string; locating: string; located: string; locationFailed: string };

export function LocationField({ labels, auto = true }: { labels: Labels; auto?: boolean }) {
  const [state, setState] = useState<"idle" | "locating" | "ok" | "failed">("idle");
  const [pos, setPos] = useState<GeolocationCoordinates | null>(null);

  function locate() {
    if (!navigator.geolocation) return setState("failed");
    setState("locating");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos(p.coords);
        setState("ok");
      },
      () => setState("failed"),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kick off GPS once on mount
    if (auto) locate();
  }, [auto]);

  return (
    <div>
      <input type="hidden" name="lat" value={pos?.latitude ?? ""} />
      <input type="hidden" name="lng" value={pos?.longitude ?? ""} />
      <input type="hidden" name="accuracy" value={pos?.accuracy ?? ""} />
      {state === "ok" ? (
        <p className="rounded-lg bg-emerald-50 px-3 py-2.5 text-sm text-emerald-800">
          📍 {labels.located} (±{Math.round(pos!.accuracy)} m)
        </p>
      ) : state === "locating" ? (
        <p className="rounded-lg bg-stone-100 px-3 py-2.5 text-sm text-stone-600">{labels.locating}</p>
      ) : (
        <>
          <button type="button" onClick={locate} className="btn-ghost w-full">
            📍 {labels.useLocation}
          </button>
          {state === "failed" && <p className="mt-1 text-sm text-amber-700">{labels.locationFailed}</p>}
        </>
      )}
    </div>
  );
}
