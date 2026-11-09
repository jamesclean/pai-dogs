"use client";

import { useEffect, useRef, useState } from "react";
import { onCardHover } from "@/lib/card-hover";

// Each sound ray as a share of the artwork: the slice of the sound layer that
// holds it (the layer also contains the horn), and the point it pulses from.
const rays = [
  { left: 77.5, top: 3.99, bottom: 74.98, origin: "79.76% 14.5%" },
  { left: 80.28, top: 25.02, bottom: 61.35, origin: "83.33% 33.57%" },
  { left: 82.14, top: 42.11, bottom: 40.8, origin: "82.14% 50.66%" },
];

// The rays pulse while the card around this art is hovered. After the pointer
// leaves, the current pulse plays out so they settle instead of snapping back.
export function MegaphoneArt() {
  const ref = useRef<HTMLSpanElement>(null);
  const hovering = useRef(false);
  const [pulsing, setPulsing] = useState(false);

  useEffect(() => {
    if (!ref.current) return;
    return onCardHover(
      ref.current,
      () => {
        hovering.current = true;
        setPulsing(true);
      },
      () => {
        hovering.current = false;
      },
    );
  }, []);

  return (
    <span
      ref={ref}
      className={`relative block aspect-[360/326] h-[84px] self-start ${pulsing ? "rays-pulsing" : ""}`}
      onAnimationIteration={() => {
        if (!hovering.current) setPulsing(false);
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/home/megaphone-still.webp" alt="" width={360} height={326} className="h-full w-full" />
      {rays.map(({ left, top, bottom, origin }) => (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          key={top}
          src="/home/megaphone-sound.webp"
          alt=""
          width={360}
          height={326}
          className="ray absolute inset-0 h-full w-full"
          style={{ clipPath: `inset(${top}% 0 ${bottom}% ${left}%)`, transformOrigin: origin }}
        />
      ))}
    </span>
  );
}
