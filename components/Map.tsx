"use client";
import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

export type Pin = {
  lat: number;
  lng: number;
  label: string;
  href?: string;
  // latest: last place a dog was seen · alert: injured/sick/lost/missing
  // scan: someone opened the tag page there · home · newdog: dog without a collar
  kind?: "home" | "ok" | "alert" | "latest" | "scan" | "newdog";
};

const PAI = { lat: 19.3588, lng: 98.4405 };
const MEGAPHONE =
  '<svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 6v8H6c-.93 0-1.4 0-1.78-.1a3 3 0 0 1-2.12-2.12C2 11.4 2 10.93 2 10s0-1.4.1-1.78a3 3 0 0 1 2.12-2.12C4.6 6 5.07 6 6 6h3Z"/><path d="M9 14l.97 4.82a1.66 1.66 0 0 1-1.63 2.18c-.78 0-1.46-.55-1.62-1.31L5.5 14"/><path d="M9 6h1c1.3 0 2.56-.42 3.6-1.2l2.15-1.61a.95.95 0 0 1 1.46.46c.34 1.14.79 3.08.79 6.35s-.45 5.21-.79 6.35a.95.95 0 0 1-1.46.46L13.6 15.2A6 6 0 0 0 10 14H9V6Z"/></svg>';

function css(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

export function Map({ pins, className = "h-56" }: { pins: Pin[]; className?: string }) {
  const el = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let map: import("leaflet").Map | undefined;
    let cancelled = false;
    (async () => {
      const L = await import("leaflet");
      if (cancelled || !el.current) return;
      const color = { brand: css("--brand"), bad: css("--bad"), label: css("--label"), ok: css("--ok"), ring: css("--surface-raised") };
      map = L.map(el.current, { scrollWheelZoom: false, attributionControl: false, zoomControl: false }).setView([PAI.lat, PAI.lng], 14);
      L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", { maxZoom: 19, className: "map-tiles" }).addTo(map);
      L.control.attribution({ prefix: false }).addAttribution("© OpenStreetMap").addTo(map);
      const pts: [number, number][] = [];
      for (const p of pins) {
        const label = p.label.replace(/[<>&]/g, "");
        const popup = p.href ? `<a href="${p.href}">${label}</a>` : label;
        if (p.kind === "newdog") {
          const icon = L.divIcon({
            className: "",
            html: `<span class="newdog-pin">${MEGAPHONE}<span>${label}</span></span>`,
            iconSize: undefined,
            iconAnchor: [14, 14],
          });
          L.marker([p.lat, p.lng], { icon }).addTo(map).bindPopup(popup);
        } else {
          const fill =
            p.kind === "alert" ? color.bad : p.kind === "home" ? color.ok : color.brand;
          L.circleMarker([p.lat, p.lng], {
            radius: p.kind === "latest" || p.kind === "home" || p.kind === "alert" ? 7 : 5,
            color: color.ring,
            weight: 3,
            fillColor: fill,
            fillOpacity: p.kind === "scan" || p.kind === "ok" ? 0.55 : 1,
          })
            .addTo(map)
            .bindPopup(popup);
        }
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

  return <div ref={el} className={`isolate z-0 w-full overflow-hidden rounded-[20px] bg-map ${className}`} />;
}
