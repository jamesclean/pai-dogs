import { MapIcon } from "./Icons";
import { HoverLabel } from "./HoverLabel";

// Opens the spot in Google Maps, in a new window.
export function MapButton({ lat, lng, raised = false }: { lat: number | null; lng: number | null; raised?: boolean }) {
  if (lat === null || lng === null) return null;
  return (
    <a
      href={`https://maps.google.com/?q=${lat},${lng}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open map"
      className={`circle-btn group relative z-10 hover:z-40 focus-visible:z-40 ${raised ? "bg-surface-raised!" : ""}`}
    >
      <MapIcon className="h-5 w-5" />
      <HoverLabel className="top-full right-0 mt-2">Open map</HoverLabel>
    </a>
  );
}
