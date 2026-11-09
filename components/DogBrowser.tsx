"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { DogPhoto } from "./DogPhoto";
import { GROUP_ICONS, GROUP_TRACK, groupItemClass } from "./DogGroups";
import { Search } from "./Icons";
import { DOG_GROUPS, groupOf, type DogGroup } from "@/lib/dog-groups";
import type { Dict } from "@/lib/i18n";

export type BrowseDog = {
  id: number;
  name: string;
  area: string;
  status: string;
  homeStatus: string | null;
  photoId: number | null;
};

function urlFor(query: string, show: DogGroup | null) {
  const params = new URLSearchParams();
  if (show && (show !== "community" || query)) params.set("show", show);
  if (query) params.set("q", query);
  const qs = params.toString();
  return qs ? `/dogs?${qs}` : "/dogs";
}

// Filters on the phone, so results change with every key and need no network.
// The address keeps the search, so reload and Back return to the same results.
export function DogBrowser({ dogs, s }: { dogs: BrowseDog[]; s: Dict }) {
  const params = useSearchParams();
  const [text, setText] = useState(params.get("q") ?? "");
  const [show, setShow] = useState<DogGroup | null>(DOG_GROUPS.find((g) => g === params.get("show")) ?? null);
  const query = text.trim();
  // A search covers every group until a tab narrows it.
  const group = show ?? (query ? null : "community");

  useEffect(() => {
    const timer = setTimeout(() => window.history.replaceState(null, "", urlFor(query, show)), 300);
    return () => clearTimeout(timer);
  }, [query, show]);

  const needle = query.toLowerCase();
  const matches = dogs.filter((d) => !needle || d.name.toLowerCase().includes(needle) || d.area.toLowerCase().includes(needle));
  const list = group ? matches.filter((d) => groupOf(d) === group) : matches;
  const labels = { community: s.communityDog, home: s.hasFamily, memory: s.deceased };

  return (
    <>
      <form action="/dogs" onSubmit={(e) => e.preventDefault()}>
        <label className="search">
          <Search className="h-[18px] w-[18px] shrink-0" />
          <input
            name="q"
            value={text}
            onChange={(e) => {
              setText(e.target.value);
              setShow(null);
            }}
            enterKeyHint="search"
            autoComplete="off"
            placeholder={s.searchDogs}
            className="bare-input"
          />
          {text && (
            <button type="button" onClick={() => setText("")} className="shrink-0 text-footnote text-label-2">
              {s.clearSearch}
            </button>
          )}
        </label>
      </form>

      <div className={`${GROUP_TRACK} mt-3`}>
        {DOG_GROUPS.map((g) => {
          const Icon = GROUP_ICONS[g];
          return (
            <a
              key={g}
              href={urlFor(query, g)}
              onClick={(e) => {
                e.preventDefault();
                setShow(g);
              }}
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
                {matches.filter((d) => groupOf(d) === g).length}
              </span>
            </a>
          );
        })}
      </div>

      {query && <h2 className="mt-5 text-section">{s.searchResults}</h2>}

      <div className={`${query ? "mt-3" : "mt-4"} grid grid-cols-2 gap-x-2.5 gap-y-5 sm:grid-cols-3`}>
        {list.map((d) => (
          <Link key={d.id} href={`/dogs/${d.id}`} prefetch={false} className="block transition active:scale-[0.98]">
            <span className="photo-hover rounded-[20px]">
              <DogPhoto photoId={d.photoId} alt={d.name} className="aspect-square w-full rounded-[20px]" />
            </span>
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
    </>
  );
}
