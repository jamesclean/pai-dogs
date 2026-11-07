// A small SF Symbols-flavoured icon set: 24px grid, 1.8 stroke, round caps.
type P = { className?: string };
const base = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.8,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
};

export const Check = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}>
    <path d="M5 12.5l4.5 4.5L19 7.5" />
  </svg>
);
export const Bang = (p: P) => (
  <svg {...base} strokeWidth={2.4} {...p}>
    <path d="M12 6v8M12 18h.01" />
  </svg>
);
export const Chevron = (p: P) => (
  <svg {...base} strokeWidth={2.2} {...p}>
    <path d="M9 5l7 7-7 7" />
  </svg>
);
export const ChevronLeft = (p: P) => (
  <svg {...base} strokeWidth={2.2} {...p}>
    <path d="M15 5l-7 7 7 7" />
  </svg>
);
export const Pin = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0113 0c0 5.4-6.5 11-6.5 11z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);
export const Person = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="8" r="3.8" />
    <path d="M4.5 20.5c1.2-3.8 4-5.6 7.5-5.6s6.3 1.8 7.5 5.6" />
  </svg>
);
export const Shield = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 3l7 3v5.5c0 4.6-3 8.1-7 9.5-4-1.4-7-4.9-7-9.5V6l7-3z" />
    <path d="M9 12l2.2 2.2L15.5 10" />
  </svg>
);
export const Syringe = (p: P) => (
  <svg {...base} {...p}>
    <path d="M18 3l3 3M19.5 4.5l-3 3M16.5 4.5l3 3" />
    <path d="M17 7.5L8 16.5l-2.5.5.5-2.5 9-9" />
    <path d="M11 10.5l2.5 2.5M5.5 17l-2.5 4" />
  </svg>
);
export const Camera = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 8.5A1.5 1.5 0 015.5 7h2l1.5-2h6l1.5 2h2A1.5 1.5 0 0120 8.5v9a1.5 1.5 0 01-1.5 1.5h-13A1.5 1.5 0 014 17.5z" />
    <circle cx="12" cy="13" r="3.5" />
  </svg>
);
export const Search = (p: P) => (
  <svg {...base} strokeWidth={2} {...p}>
    <circle cx="10.5" cy="10.5" r="6" />
    <path d="M15 15l5 5" />
  </svg>
);
export const Heart = (p: P) => (
  <svg {...base} {...p}>
    <path d="M12 20s-7.5-4.6-7.5-10.2A4.3 4.3 0 0112 7.3a4.3 4.3 0 017.5 2.5C19.5 15.4 12 20 12 20z" />
  </svg>
);
export const Bubble = (p: P) => (
  <svg {...base} {...p}>
    <path d="M4 11.5C4 7.4 7.6 4.5 12 4.5s8 2.9 8 7-3.6 7-8 7c-.9 0-1.8-.1-2.6-.4L5 19.5l1.2-3.4C4.8 14.9 4 13.3 4 11.5z" />
  </svg>
);
export const Plus = (p: P) => (
  <svg {...base} strokeWidth={2.2} {...p}>
    <path d="M12 5v14M5 12h14" />
  </svg>
);
export const Tag = (p: P) => (
  <svg {...base} {...p}>
    <path d="M3.5 12.2V4.5a1 1 0 011-1h7.7l8.3 8.3a1 1 0 010 1.4l-7.3 7.3a1 1 0 01-1.4 0z" />
    <circle cx="8" cy="8" r="1.4" />
  </svg>
);
export const Globe = (p: P) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="M3.5 12h17M12 3.5c2.4 2.4 3.5 5.2 3.5 8.5s-1.1 6.1-3.5 8.5c-2.4-2.4-3.5-5.2-3.5-8.5S9.6 5.9 12 3.5z" />
  </svg>
);
export const Phone = (p: P) => (
  <svg {...base} {...p}>
    <path d="M6.5 3.5h3l1.5 4-2 1.5a11 11 0 005.9 5.9l1.5-2 4 1.5v3a2 2 0 01-2 2A16.5 16.5 0 014.5 5.5a2 2 0 012-2z" />
  </svg>
);
export const UpDown = (p: P) => (
  <svg {...base} strokeWidth={2} {...p}>
    <path d="M8 9.5l4-4 4 4M8 14.5l4 4 4-4" />
  </svg>
);
