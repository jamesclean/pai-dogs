"use client";
import { useEffect, useState } from "react";

// Bar title for a page whose own large title sits lower down: fades in once that title scrolls away.
export function RevealTitle({ targetId, children }: { targetId: string; children: React.ReactNode }) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const target = document.getElementById(targetId);
    if (!target) return;
    const observer = new IntersectionObserver(([e]) => setShow(!e.isIntersecting && e.boundingClientRect.top < 72), {
      rootMargin: "-72px 0px 0px 0px",
    });
    observer.observe(target);
    return () => observer.disconnect();
  }, [targetId]);

  return (
    <p aria-hidden className={`truncate text-center text-section transition-opacity ${show ? "opacity-100" : "opacity-0"}`}>
      {children}
    </p>
  );
}
