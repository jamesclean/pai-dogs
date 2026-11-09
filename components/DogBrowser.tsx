"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { DogPhoto } from "./DogPhoto";
import { Map } from "./Map";
import { GroupTabs } from "./DogGroups";
import { Search } from "./Icons";
import { DOG_GROUPS, groupOf, type DogGroup } from "@/lib/dog-groups";
import { isNearPai } from "@/lib/pai";
import type { Dict } from "@/lib/i18n";

export type BrowseDog = {
  id: number;
  name: string;
  area: string;
  status: string;
  homeStatus: string | null;
  photoId: number | null;
  lat: number | null;
  lng: number | null;
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
  const visible = list.map((d) => d.id).join();
  // Rebuilt only when the dogs shown change, because a new map reloads its tiles.
  const pins = useMemo(
    () =>
      list.flatMap((d) =>
        d.lat !== null && d.lng !== null && isNearPai(d.lat, d.lng)
          ? [{ lat: d.lat, lng: d.lng, label: d.name, href: `/dogs/${d.id}`, kind: "latest" as const }]
          : [],
      ),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- list is a new array each render; visible tracks its contents
    [visible],
  );
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

      <GroupTabs
        className="mt-3"
        active={group}
        labels={labels}
        counts={{
          community: matches.filter((d) => groupOf(d) === "community").length,
          home: matches.filter((d) => groupOf(d) === "home").length,
          memory: matches.filter((d) => groupOf(d) === "memory").length,
        }}
        hrefFor={(g) => urlFor(query, g)}
        onSelect={setShow}
      />

      {query && <h2 className="mt-5 text-section">{s.searchResults}</h2>}

      {!query && pins.length > 0 && <Map pins={pins} className="mt-4 h-52" />}

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
