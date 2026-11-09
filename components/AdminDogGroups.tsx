"use client";
import { useSearchParams } from "next/navigation";
import { useState } from "react";
import { GroupTabs } from "./DogGroups";
import { DOG_GROUPS, GROUP_LABELS, type DogGroup } from "@/lib/dog-groups";

// The crew's dog list, one group at a time. The rows arrive already rendered.
// A search covers every group until a tab narrows it.
export function AdminDogGroups({ groups, searching }: { groups: Record<DogGroup, React.ReactNode[]>; searching: boolean }) {
  const params = useSearchParams();
  const [show, setShow] = useState<DogGroup | null>(DOG_GROUPS.find((g) => g === params.get("show")) ?? null);
  // Opens on the first group with dogs in it, so the list isn't empty on arrival.
  const group = show ?? (searching ? null : (DOG_GROUPS.find((g) => groups[g].length > 0) ?? "community"));
  const rows = group ? groups[group] : DOG_GROUPS.flatMap((g) => groups[g]);

  const urlFor = (g: DogGroup) => {
    const next = new URLSearchParams(params);
    next.set("show", g);
    return `/admin?${next}`;
  };

  return (
    <>
      <GroupTabs
        className="mt-2"
        active={group}
        labels={GROUP_LABELS}
        counts={{ community: groups.community.length, home: groups.home.length, memory: groups.memory.length }}
        hrefFor={urlFor}
        onSelect={(g) => {
          setShow(g);
          window.history.replaceState(null, "", urlFor(g));
        }}
      />
      <div className="mt-2">
        {rows}
        {rows.length === 0 && <p className="py-3 text-subhead text-label-2">No dogs here</p>}
      </div>
    </>
  );
}
