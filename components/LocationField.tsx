"use client";
import { useEffect, useState } from "react";
import { placeName } from "@/app/report/actions";
import { Pin } from "./Icons";

type Labels = {
  yourLocation: string;
  shareYourLocation: string;
  locating: string;
  added: string;
  locationFailed: string;
  clearLocation?: string;
  typePlace?: string;
};

// A row inside a .card-rows. Posts lat/lng/accuracy as hidden inputs. `named`
// shows the place name and lets someone reporting after the fact clear the
// position and type where it was instead.
export function LocationField({ labels, auto = true, named = false }: { labels: Labels; auto?: boolean; named?: boolean }) {
  const [state, setState] = useState<"idle" | "locating" | "ok" | "failed" | "cleared">("idle");
  const [pos, setPos] = useState<GeolocationCoordinates | null>(null);
  const [place, setPlace] = useState<string | null>(null);

  function locate() {
    if (!navigator.geolocation) return setState("failed");
    setState("locating");
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setPos(p.coords);
        setState("ok");
        if (named) {
          const lang = document.documentElement.lang === "th" ? "th" : "en";
          placeName(p.coords.latitude, p.coords.longitude, lang).then(setPlace, () => {});
        }
      },
      () => setState("failed"),
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 60000 },
    );
  }

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- kick off GPS once on mount
    if (auto) locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps -- runs once; locate is recreated each render
  }, [auto]);

  const hidden = (
    <>
      <input type="hidden" name="lat" value={pos?.latitude ?? ""} />
      <input type="hidden" name="lng" value={pos?.longitude ?? ""} />
      <input type="hidden" name="accuracy" value={pos?.accuracy ?? ""} />
    </>
  );

  if (named && state === "ok")
    return (
      <div className="row">
        {hidden}
        <Pin className="h-[22px] w-[22px] shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block text-callout">{labels.yourLocation}</span>
          {place && <span className="block truncate text-footnote text-label-2">{place}</span>}
        </span>
        <button
          type="button"
          className="btn-outline btn-sm"
          onClick={() => {
            setPos(null);
            setPlace(null);
            setState("cleared");
          }}
        >
          {labels.clearLocation}
        </button>
      </div>
    );

  return (
    <>
      <button type="button" onClick={locate} disabled={state === "locating"} className="row w-full text-left">
        {hidden}
        <Pin className="h-[22px] w-[22px] shrink-0" />
        <span className="min-w-0 flex-1">
          <span className="block text-callout">
            {state === "ok" ? labels.yourLocation : state === "locating" ? labels.locating : labels.shareYourLocation}
          </span>
          {state === "failed" && !named && <span className="block text-footnote text-label-2">{labels.locationFailed}</span>}
        </span>
        {state === "ok" && <span className="pill bg-ok-soft text-ok">{labels.added}</span>}
        {state === "locating" && (
          <span className="h-4 w-4 animate-spin rounded-full border-2 border-label-3 border-t-transparent" />
        )}
      </button>
      {named && (state === "cleared" || state === "failed") && (
        <label className="row">
          <input name="place" maxLength={200} placeholder={labels.typePlace} className="bare-input pl-9" />
        </label>
      )}
    </>
  );
}
