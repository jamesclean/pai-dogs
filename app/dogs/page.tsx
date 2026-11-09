import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";
import { DogPhoto } from "@/components/DogPhoto";
import { GROUP_ICONS, GROUP_TRACK, groupItemClass } from "@/components/DogGroups";
import { Search } from "@/components/Icons";
import { getLang, t } from "@/lib/i18n";
import { dogGroupCounts, publicDogs } from "@/lib/data";
import { DOG_GROUPS, groupOf, type DogGroup } from "@/lib/dog-groups";

export const metadata = { title: "Meet our dogs" };

export default async function BrowseDogs({ searchParams }: PageProps<"/dogs">) {
  const { q, show } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  // A search covers every group until a tab narrows it.
  const group: DogGroup | null = DOG_GROUPS.find((g) => g === show) ?? (query ? null : "community");
  const lang = await getLang();
  const s = t(lang);
  const [list, counts] = await Promise.all([publicDogs(group, query), dogGroupCounts(query)]);
  const labels = { community: s.communityDog, home: s.hasFamily, memory: s.deceased };

  function hrefFor(g: DogGroup) {
    const params = new URLSearchParams();
    if (g !== "community" || query) params.set("show", g);
    if (query) params.set("q", query);
    const qs = params.toString();
    return qs ? `/dogs?${qs}` : "/dogs";
  }

  return (
    <PublicShell lang={lang} back={{ href: "/", label: s.back }} title={s.browseDogs}>
      <form>
        <label className="search">
          <Search className="h-[18px] w-[18px] shrink-0" />
          <input key={query} name="q" defaultValue={query} placeholder={s.searchDogs} className="bare-input" />
          {query && (
            <Link href={group && group !== "community" ? `/dogs?show=${group}` : "/dogs"} scroll={false} className="shrink-0 text-footnote text-label-2">
              {s.clearSearch}
            </Link>
          )}
        </label>
      </form>

      <div className={`${GROUP_TRACK} mt-3`}>
        {DOG_GROUPS.map((g) => {
          const Icon = GROUP_ICONS[g];
          return (
            <Link
              key={g}
              href={hrefFor(g)}
              scroll={false}
              aria-current={g === group ? "true" : undefined}
              className={groupItemClass(g === group, "gap-1 px-0.5 text-[12px]! max-[389px]:gap-[3px]")}
            >
              <Icon className="h-3.5 w-3.5 shrink-0 max-[374px]:hidden" />
              {labels[g]}
              {/* The selected tab is already white, so its circle is grey. */}
              <span
                className={`flex h-[18px] min-w-[18px] shrink-0 items-center justify-center rounded-full px-1 text-[11px] leading-none tabular-nums ${
                  g === group ? "bg-fill text-label" : "bg-surface-raised text-label-2"
                }`}
              >
                {counts[g]}
              </span>
            </Link>
          );
        })}
      </div>


      <div className="mt-4 grid grid-cols-2 gap-x-2.5 gap-y-5 sm:grid-cols-3">
        {list.map((d) => (
          <Link key={d.id} href={`/dogs/${d.id}`} className="block transition active:scale-[0.98]">
            <DogPhoto photoId={d.photoId} alt={d.name} className="aspect-square w-full rounded-[20px]" />
            <span className="mt-2 flex items-center gap-1.5 px-0.5">
              <span className="truncate text-callout">{d.name}</span>
              {d.status === "missing" && <span className="pill bg-bad-soft text-bad">{s.missingLabel}</span>}
            </span>
            {d.area && d.status !== "deceased" && (
              <span className="block truncate px-0.5 text-footnote text-label-2">{d.area}</span>
            )}
            {!group && groupOf(d) !== "community" && (
              <span className="block truncate px-0.5 text-footnote text-label-2">{labels[groupOf(d)]}</span>
            )}
            {d.homeStatus === "ask_adoption" && d.status !== "deceased" && (
              <span className="block truncate px-0.5 text-footnote text-label-2">{s.askAdoption}</span>
            )}
          </Link>
        ))}
      </div>
      {list.length === 0 && <p className="mt-10 text-center text-subhead text-label-2">{s.noDogsFound}</p>}
    </PublicShell>
  );
}
