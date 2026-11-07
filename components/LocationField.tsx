"use client";
import { useEffect, useState } from "react";
import { Pin } from "./Icons";

type Labels = { yourLocation: string; shareYourLocation: string; locating: string; added: string; locationFailed: string };

// A row inside a .card-rows. Posts lat/lng/accuracy as hidden inputs.
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
    <button type="button" onClick={locate} disabled={state === "locating"} className="row w-full text-left">
      <input type="hidden" name="lat" value={pos?.latitude ?? ""} />
      <input type="hidden" name="lng" value={pos?.longitude ?? ""} />
      <input type="hidden" name="accuracy" value={pos?.accuracy ?? ""} />
      <Pin className="h-[22px] w-[22px] shrink-0" />
      <span className="min-w-0 flex-1">
        <span className="block text-callout">
          {state === "ok" ? labels.yourLocation : state === "locating" ? labels.locating : labels.shareYourLocation}
        </span>
        {state === "failed" && <span className="block text-footnote text-label-2">{labels.locationFailed}</span>}
      </span>
      {state === "ok" && <span className="pill bg-ok-soft text-ok">{labels.added}</span>}
      {state === "locating" && (
        <span className="h-4 w-4 animate-spin rounded-full border-2 border-label-3 border-t-transparent" />
      )}
    </button>
  );
}
