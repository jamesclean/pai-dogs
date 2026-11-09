"use client";
import { useRef, useState } from "react";
import { DogPhoto } from "./DogPhoto";
import { Chevron, ChevronLeft } from "./Icons";

// Over the photo, so it needs its own raised fill. Touch screens swipe instead.
const arrow = "circle-btn absolute top-1/2 -translate-y-1/2 bg-surface-raised! shadow-control [@media(hover:none)]:hidden";

// Swipe between a dog's photos, or use the arrows with a mouse. The profile photo comes first.
export function DogGallery({
  photoIds,
  alt,
  ofLabel,
  previousLabel,
  nextLabel,
}: {
  photoIds: number[];
  alt: string;
  ofLabel: string;
  previousLabel: string;
  nextLabel: string;
}) {
  const [index, setIndex] = useState(0);
  const strip = useRef<HTMLDivElement>(null);

  if (photoIds.length < 2) return <DogPhoto photoId={photoIds[0] ?? null} alt={alt} className="aspect-[358/430] w-full" />;

  const goTo = (i: number) => {
    const el = strip.current;
    if (el) el.scrollTo({ left: i * el.clientWidth, behavior: "smooth" });
  };

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
      {index > 0 && (
        <button type="button" aria-label={previousLabel} onClick={() => goTo(index - 1)} className={`${arrow} left-3`}>
          <ChevronLeft className="h-5 w-5" />
        </button>
      )}
      {index < photoIds.length - 1 && (
        <button type="button" aria-label={nextLabel} onClick={() => goTo(index + 1)} className={`${arrow} right-3`}>
          <Chevron className="h-5 w-5" />
        </button>
      )}
      <span className="chip absolute top-4 right-4">
        {index + 1} {ofLabel} {photoIds.length}
      </span>
    </>
  );
}
