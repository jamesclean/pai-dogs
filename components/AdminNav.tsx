"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Paw, Tag } from "./Icons";

// Floating tab bar at the bottom of volunteer screens.
export function AdminNav() {
  const path = usePathname();
  // Only the two list screens show the tab bar; detail screens have a back button.
  if (path !== "/admin" && path !== "/admin/tags") return null;
  const tab = path.startsWith("/admin/tags") ? "tags" : "dogs";
  const items = [
    { key: "dogs", href: "/admin", label: "Dogs", Icon: Paw },
    { key: "tags", href: "/admin/tags", label: "Tags", Icon: Tag },
  ] as const;
  return (
    <nav className="pointer-events-none fixed inset-x-0 bottom-0 z-30 flex justify-center bg-linear-to-t from-bg from-50% to-transparent pt-8 pb-[max(env(safe-area-inset-bottom),16px)] print:hidden">
      <div className="pointer-events-auto flex gap-1 rounded-full border border-sep bg-surface-raised p-1 shadow-float">
        {items.map(({ key, href, label, Icon }) => (
          <Link
            key={key}
            href={href}
            aria-current={tab === key ? "page" : undefined}
            className={`flex h-12 w-[84px] flex-col items-center justify-center gap-0.5 rounded-full text-caption ${
              tab === key ? "bg-fill text-label" : "text-label-2"
            }`}
          >
            <Icon className="h-[22px] w-[22px]" />
            {label}
          </Link>
        ))}
      </div>
    </nav>
  );
}
