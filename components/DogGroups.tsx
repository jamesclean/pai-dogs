import { Flower, HasFamily, StreetDog } from "./Icons";
import { DOG_GROUPS, type DogGroup } from "@/lib/dog-groups";

const GROUP_ICONS: Record<DogGroup, (p: { className?: string }) => React.ReactNode> = {
  community: StreetDog,
  home: HasFamily,
  memory: Flower,
};

// The tabs are equal widths, so one white pill can slide between them without
// measuring anything, and it is already in place in the server-rendered page.
export function GroupTabs({
  active,
  counts,
  labels,
  hrefFor,
  onSelect,
  className = "",
}: {
  active: DogGroup | null;
  counts: Record<DogGroup, number>;
  labels: Record<DogGroup, string>;
  hrefFor: (g: DogGroup) => string;
  onSelect: (g: DogGroup) => void;
  className?: string;
}) {
  const index = active ? DOG_GROUPS.indexOf(active) : -1;
  return (
    <div className={`relative flex rounded-full bg-fill p-[3px] ${className}`}>
      {/* No tab is selected during a search that covers every group. */}
      <span
        aria-hidden
        style={{ transform: `translateX(${Math.max(index, 0) * 100}%)` }}
        className={`absolute top-[3px] bottom-[3px] left-[3px] w-[calc((100%-6px)/3)] rounded-full bg-surface-raised shadow-control transition-[transform,opacity] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
          index < 0 ? "opacity-0" : ""
        }`}
      />
      {DOG_GROUPS.map((g) => {
        const Icon = GROUP_ICONS[g];
        const on = g === active;
        return (
          <a
            key={g}
            href={hrefFor(g)}
            onClick={(e) => {
              e.preventDefault();
              onSelect(g);
            }}
            aria-current={on ? "true" : undefined}
            className={`tappable relative flex h-9 min-w-0 flex-1 basis-0 items-center justify-center gap-1 rounded-full px-0.5 text-[12px] leading-[18px] font-medium whitespace-nowrap transition max-[389px]:gap-[3px] ${
              on ? "text-label" : "text-label-2"
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0 max-[374px]:hidden" />
            {labels[g]}
            {/* The selected tab is already white, so its circle is grey. */}
            <span
              className={`flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full px-1 text-[11px] leading-none tabular-nums transition ${
                on ? "bg-fill text-label" : "bg-surface-raised text-label-2"
              }`}
            >
              {counts[g]}
            </span>
          </a>
        );
      })}
    </div>
  );
}
