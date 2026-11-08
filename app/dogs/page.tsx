import Link from "next/link";
import { PublicShell } from "@/components/PublicShell";
import { DogPhoto } from "@/components/DogPhoto";
import { Search } from "@/components/Icons";
import { getLang, t, fill } from "@/lib/i18n";
import { publicDogs } from "@/lib/data";

export const metadata = { title: "Dogs" };

export default async function BrowseDogs({ searchParams }: PageProps<"/dogs">) {
  const { q } = await searchParams;
  const query = typeof q === "string" ? q : "";
  const lang = await getLang();
  const s = t(lang);
  const list = await publicDogs(query);

  return (
    <PublicShell lang={lang} back={{ href: "/", label: s.back }}>
      <h1 className="text-title">{s.dogsOfPai}</h1>
      <p className="mt-1 text-subhead text-label-2">{fill(s.dogsCount, { n: list.length })}</p>

      <form className="mt-4">
        <label className="search">
          <Search className="h-[18px] w-[18px] shrink-0" />
          <input name="q" defaultValue={query} placeholder={s.searchDogs} className="bare-input" />
        </label>
      </form>

      <div className="mt-5 grid grid-cols-2 gap-x-2.5 gap-y-5 sm:grid-cols-3">
        {list.map((d) => {
          const body = (
            <>
              <DogPhoto photoId={d.photoId} alt={d.name} className="aspect-square w-full rounded-[20px]" />
              <span className="mt-2 flex items-center gap-1.5 px-0.5">
                <span className="truncate text-callout">{d.name}</span>
                {d.status === "missing" && <span className="pill bg-bad-soft text-bad">{s.missingLabel}</span>}
              </span>
              {d.area && <span className="block truncate px-0.5 text-footnote text-label-2">{d.area}</span>}
            </>
          );
          return d.tagCode ? (
            <Link key={d.id} href={`/d/${d.tagCode}`} className="block transition active:scale-[0.98]">
              {body}
            </Link>
          ) : (
            <div key={d.id}>{body}</div>
          );
        })}
      </div>
      {list.length === 0 && <p className="mt-10 text-center text-subhead text-label-2">{s.noDogsFound}</p>}
    </PublicShell>
  );
}
