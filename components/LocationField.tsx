"use client";
import { useEffect, useState } from "react";
import { Pin } from "./Icons";

type Labels = { useLocation: string; locating: string; located: string; locationFailed: string };

// Renders as a list cell; place inside an .inset-group.
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

  const tile = state === "ok" ? "bg-ok" : state === "failed" ? "bg-warn" : "bg-link";

  return (
    <button
      type="button"
      onClick={locate}
      disabled={state === "locating"}
      className="cell cell-icon w-full text-left active:bg-fill"
    >
      <input type="hidden" name="lat" value={pos?.latitude ?? ""} />
      <input type="hidden" name="lng" value={pos?.longitude ?? ""} />
      <input type="hidden" name="accuracy" value={pos?.accuracy ?? ""} />
      <span className={`icon-tile ${tile}`}>
        <Pin className="h-[18px] w-[18px]" />
      </span>
      <span className="flex-1">
        {state === "ok" ? labels.located : state === "locating" ? labels.locating : labels.useLocation}
        {state === "failed" && <span className="block text-[13px] text-label-2">{labels.locationFailed}</span>}
      </span>
      {state === "ok" && <span className="text-[15px] text-label-2">±{Math.round(pos!.accuracy)} m</span>}
      {state === "locating" && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-label-3 border-t-transparent" />
      )}
    </button>
  );
}
