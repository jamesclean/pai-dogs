import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";
import { DogPhoto } from "@/components/DogPhoto";
import { GROUP_ICONS, GROUP_TRACK, groupItemClass } from "@/components/DogGroups";
import { Search } from "@/components/Icons";
import { getLang, t, fill } from "@/lib/i18n";
import { publicDogs } from "@/lib/data";
import { DOG_GROUPS, type DogGroup } from "@/lib/dog-groups";

export const metadata = { title: "Dogs" };

export default async function BrowseDogs({ searchParams }: PageProps<"/dogs">) {
  const { q, show } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const group: DogGroup = DOG_GROUPS.find((g) => g === show) ?? "community";
  const lang = await getLang();
  const s = t(lang);
  const list = await publicDogs(group, query);
  const labels = { community: s.communityDog, home: s.hasFamily, memory: s.deceased };

  function hrefFor(g: DogGroup) {
    const params = new URLSearchParams();
    if (g !== "community") params.set("show", g);
    if (query) params.set("q", query);
    const qs = params.toString();
    return qs ? `/dogs?${qs}` : "/dogs";
  }

  return (
    <PublicShell lang={lang} back={{ href: "/", label: s.back }} title={s.dogsOfPai}>
      <div className={GROUP_TRACK}>
        {DOG_GROUPS.map((g) => {
          const Icon = GROUP_ICONS[g];
          return (
            <Link
              key={g}
              href={hrefFor(g)}
              scroll={false}
              aria-current={g === group ? "true" : undefined}
              className={groupItemClass(g === group)}
            >
              <Icon className="h-4 w-4 shrink-0" />
              {labels[g]}
            </Link>
          );
        })}
      </div>

      <form className="mt-3">
        {group !== "community" && <input type="hidden" name="show" value={group} />}
        <label className="search">
          <Search className="h-[18px] w-[18px] shrink-0" />
          <input name="q" defaultValue={query} placeholder={s.searchDogs} className="bare-input" />
        </label>
      </form>

      <p className="mt-4 text-subhead text-label-2">{list.length === 1 ? s.oneDog : fill(s.dogsCount, { n: list.length })}</p>

      <div className="mt-2 grid grid-cols-2 gap-x-2.5 gap-y-5 sm:grid-cols-3">
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
