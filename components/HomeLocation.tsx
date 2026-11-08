"use client";
import { useState } from "react";
import { LocationField } from "./LocationField";

const gps = {
  yourLocation: "Home location set",
  shareYourLocation: "Set home location here",
  locating: "Getting GPS…",
  added: "Added",
  locationFailed: "GPS failed. Describe the area instead.",
};

// Removing takes effect when the form is saved.
export function HomeLocation({ lat, lng }: { lat: number | null; lng: number | null }) {
  const [removed, setRemoved] = useState(false);

  if (lat === null || removed) return <LocationField labels={gps} auto={false} />;

  return (
    <div className="row">
      <input type="hidden" name="lat" defaultValue={lat} />
      <input type="hidden" name="lng" defaultValue={lng ?? ""} />
      <div className="min-w-0 flex-1">
        <p className="text-callout">Home location</p>
        <p className="text-footnote text-label-2">
          {lat.toFixed(4)}, {lng?.toFixed(4)}
        </p>
      </div>
      <button type="button" className="btn-outline btn-sm" onClick={() => setRemoved(true)}>
        Remove location
      </button>
    </div>
  );
}
