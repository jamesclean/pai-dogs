import { Flower, HasFamily, StreetDog } from "./Icons";
import type { DogGroup } from "@/lib/dog-groups";

export const GROUP_ICONS: Record<DogGroup, (p: { className?: string }) => React.ReactNode> = {
  community: StreetDog,
  home: HasFamily,
  memory: Flower,
};

export const GROUP_TRACK = "flex rounded-full bg-fill p-[3px]";

const ITEM =
  "flex h-9 flex-auto items-center justify-center gap-1.5 rounded-full text-[13px] leading-[18px] font-medium whitespace-nowrap transition";

export function groupItemClass(active: boolean, extra = "") {
  return `${ITEM} ${active ? "bg-surface-raised text-label shadow-control" : "text-label-2"} ${extra}`;
}
