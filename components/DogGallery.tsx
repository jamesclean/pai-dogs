"use client";
import { useRef, useState } from "react";
import { DogPhoto } from "./DogPhoto";

// Swipe between a dog's photos. The profile photo comes first.
export function DogGallery({ photoIds, alt, ofLabel }: { photoIds: number[]; alt: string; ofLabel: string }) {
  const [index, setIndex] = useState(0);
  const strip = useRef<HTMLDivElement>(null);

  if (photoIds.length < 2) return <DogPhoto photoId={photoIds[0] ?? null} alt={alt} className="aspect-[358/430] w-full" />;

  return (
    <>
      <div
        ref={strip}
        onScroll={() => {
          const el = strip.current;
          if (el) setIndex(Math.round(el.scrollLeft / el.clientWidth));
        }}
        className="flex snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {photoIds.map((id, i) => (
          <DogPhoto
            key={id}
            photoId={id}
            alt={alt}
            loading={i === 0 ? "eager" : "lazy"}
            className="aspect-[358/430] w-full shrink-0 snap-center"
          />
        ))}
      </div>
      <span className="chip absolute top-4 right-4">
        {index + 1} {ofLabel} {photoIds.length}
      </span>
    </>
  );
}
