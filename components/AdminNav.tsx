"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Heart, Paw, Tag } from "./Icons";

// Floating tab bar at the bottom of volunteer screens.
export function AdminNav({ inbox }: { inbox: number }) {
  const path = usePathname();
  // Only the three main screens show the tab bar; detail screens have a back button.
  if (path !== "/admin" && path !== "/admin/tags" && path !== "/admin/crew") return null;
  const tab = path.startsWith("/admin/tags") ? "tags" : path.startsWith("/admin/crew") ? "crew" : "dogs";
  const items = [
    { key: "dogs", href: "/admin", label: "Dogs", Icon: Paw },
    { key: "tags", href: "/admin/tags", label: "Tags", Icon: Tag },
    { key: "crew", href: "/admin/crew", label: "Crew", Icon: Heart },
  ] as const;
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center bg-linear-to-t from-bg from-50% to-transparent pt-8 pb-[max(env(safe-area-inset-bottom),16px)] print:hidden">
      <div className="pointer-events-auto flex gap-1 rounded-full border border-sep bg-surface-raised p-1 shadow-float">
        {items.map(({ key, href, label, Icon }) => (
          <Link
            key={key}
            href={href}
            aria-current={tab === key ? "page" : undefined}
            aria-label={key === "dogs" && inbox > 0 ? `${label}, ${inbox} to check` : undefined}
            className={`relative flex h-12 w-[84px] flex-col items-center justify-center gap-0.5 rounded-full text-caption ${
              tab === key ? "bg-fill text-label" : "text-label-2"
            }`}
          >
            <Icon className="h-[22px] w-[22px]" />
            {label}
            {key === "dogs" && inbox > 0 && (
              <span className="absolute top-0.5 left-1/2 ml-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-bad px-1 text-[11px] leading-none font-medium text-white">
                {inbox > 99 ? "99+" : inbox}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
