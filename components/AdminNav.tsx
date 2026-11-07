"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

// iOS segmented control.
export function AdminNav() {
  const path = usePathname();
  const tab = path.startsWith("/admin/tags") ? "tags" : "dogs";
  const item = (key: string, href: string, label: string) => (
    <Link
      href={href}
      className={`flex-1 rounded-[7px] px-5 py-1 text-center text-[13px] font-semibold transition ${
        tab === key ? "bg-surface text-label shadow-[0_2px_6px_rgba(0,0,0,0.12)]" : "text-label-2"
      }`}
    >
      {label}
    </Link>
  );
  return (
    <nav className="flex w-44 rounded-[9px] bg-fill p-0.5">
      {item("dogs", "/admin", "Dogs")}
      {item("tags", "/admin/tags", "Tags")}
    </nav>
  );
}
