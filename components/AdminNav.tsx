"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Paw, Tag } from "./Icons";

// Floating tab bar at the bottom of volunteer screens.
export function AdminNav({
  inbox,
}: {
  inbox: { total: number; needsHelp: number };
}) {
  const path = usePathname();
  // Only the two main screens show the tab bar; detail screens have a back button.
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
            aria-label={
              key === "dogs" && inbox.total > 0
                ? `${label}, ${inbox.total} to check`
                : undefined
            }
            className={`relative flex h-12 w-[84px] flex-col items-center justify-center gap-0.5 rounded-full text-caption ${
              tab === key ? "bg-fill text-label" : "text-label-2"
            }`}
          >
            <Icon className="h-[22px] w-[22px]" />
            {label}
            {key === "dogs" && inbox.total > 0 && (
              <span
                className={`absolute top-0.5 left-1/2 ml-1.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full px-1 text-[11px] leading-none font-medium ${
                  inbox.needsHelp > 0
                    ? "bg-warn text-on-inverse"
                    : "bg-inverse text-on-inverse"
                }`}
              >
                {inbox.total > 99 ? "99+" : inbox.total}
              </span>
            )}
          </Link>
        ))}
      </div>
    </nav>
  );
}
