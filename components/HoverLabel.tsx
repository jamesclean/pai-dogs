// A small label that appears on hover or keyboard focus. The parent needs
// `group relative hover:z-40 focus-visible:z-40`: pressing it scales the parent,
// and without its own z-index this label would drop behind later content.
// Hover-only devices get it; phones keep the button or link as it is.
export function HoverLabel({ children, className }: { children: React.ReactNode; className: string }) {
  return (
    <span
      role="tooltip"
      className={`pointer-events-none absolute z-40 rounded-full bg-inverse px-3 py-1.5 text-footnote whitespace-nowrap text-on-inverse opacity-0 shadow-float transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100 ${className}`}
    >
      {children}
    </span>
  );
}
