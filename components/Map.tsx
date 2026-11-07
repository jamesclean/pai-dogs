"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type Pin = {
  lat: number;
  lng: number;
  label: string;
  href?: string;
  kind?: "home" | "ok" | "alert" | "latest";
};

const COLORS = { home: "#1c1917", ok: "#ff4f00", alert: "#dc2626", latest: "#ff4f00" };
const PAI = { lat: 19.3588, lng: 98.4405 };

export function Map({ pins, className = "h-80" }: { pins: Pin[]; className?: string }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !el.current) return;
      map = L.map(el.current, { scrollWheelZoom: false }).setView([PAI.lat, PAI.lng], 14);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        attribution: "© OpenStreetMap",
      }).addTo(map);
      const pts: [number, number][] = [];
      for (const p of pins) {
        const m = L.circleMarker([p.lat, p.lng], {
          radius: p.kind === "latest" || p.kind === "home" ? 9 : 6,
          color: "#fff",
          weight: 2,
          fillColor: COLORS[p.kind ?? "ok"],
          fillOpacity: p.kind === "ok" ? 0.6 : 1,
        }).addTo(map);
        const label = p.label.replace(/[<>&]/g, "");
        m.bindPopup(p.href ? `<a href="${p.href}">${label}</a>` : label);
        pts.push([p.lat, p.lng]);
      }
      if (pts.length === 1) map.setView(pts[0], 16);
      else if (pts.length > 1) map.fitBounds(pts, { padding: [30, 30], maxZoom: 17 });
    })();
    return () => {
      cancelled = true;
      map?.remove();
    };
  }, [pins]);

  return <div ref={el} className={`z-0 w-full overflow-hidden rounded-2xl border border-stone-200 ${className}`} />;
}
