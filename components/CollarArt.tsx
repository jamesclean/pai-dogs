"use client";

import { useEffect, useRef } from "react";
import { onCardHover } from "@/lib/card-hover";

const IMAGE = "/home/collar.webp";
const REST = { rotate: "none", translate: "none", scale: "none", opacity: "1" };

// The tag swings from the collar while the card around this art is hovered.
// After the pointer leaves, it eases back to rest instead of snapping.
export function CollarArt() {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const art = ref.current;
    if (!art) return;
    let hovering = false;
    let settling = false;

    return onCardHover(
      art,
      () => {
        hovering = true;
        if (!settling) art.classList.add("swinging");
      },
      () => {
        hovering = false;
        if (!art.classList.contains("swinging")) return;
        const parts = [...art.querySelectorAll<HTMLElement>(".swings")];
        const from = parts.map((part) => {
          const { rotate, translate, scale, opacity } = getComputedStyle(part);
          return { rotate, translate, scale, opacity };
        });
        art.classList.remove("swinging");
        settling = true;
        const returns = parts.map((part, i) => part.animate([from[i], REST], { duration: 340, easing: "ease-out" }));
        returns[0].onfinish = () => {
          settling = false;
          if (hovering) art.classList.add("swinging");
        };
      },
    );
  }, []);

  return (
    <span ref={ref} className="relative block aspect-[349/360] h-[84px] self-start">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IMAGE}
        alt=""
        width={349}
        height={360}
        className="absolute inset-0 h-full w-full"
        style={{ clipPath: "inset(0 0 48.06% 0)" }}
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/home/collar-shadow.webp" alt="" width={424} height={96} className="collar-shadow swings absolute" />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={IMAGE}
        alt=""
        width={349}
        height={360}
        className="collar-tag swings absolute inset-0 h-full w-full"
        style={{ clipPath: "inset(51.94% 0 8.33% 0)" }}
      />
    </span>
  );
}
