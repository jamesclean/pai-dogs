import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicShell } from "@/components/PublicShell";
import { DogPhoto } from "@/components/DogPhoto";
import { getLang, t } from "@/lib/i18n";
import { getTag } from "@/lib/data";
import { isAdmin } from "@/lib/auth";
import { fmtDate, rabiesCurrent } from "@/lib/dates";
import { config, lineUrl } from "@/lib/config";

export async function generateMetadata({ params }: PageProps<"/d/[code]">): Promise<Metadata> {
  const row = await getTag((await params).code);
  return { title: row?.dog?.name ?? "Tag", robots: { index: false } };
}

export default async function DogByTag({ params }: PageProps<"/d/[code]">) {
  const { code } = await params;
  const lang = await getLang();
  const s = t(lang);
  const row = await getTag(code);
  const admin = await isAdmin();

  if (!row) notFound();
  const { tag, dog } = row;

  if (!dog || tag.retired) {
    return (
      <PublicShell lang={lang}>
        <div className="card text-center">
          <p className="font-mono text-2xl tracking-widest">{tag.code}</p>
          <p className="mt-2 text-stone-600">{s.tagNotLinked}</p>
          {admin && (
            <Link href={`/admin/tags/${tag.code}`} className="btn-brand mt-4 w-full">
              Link this tag to a dog
            </Link>
          )}
        </div>
      </PublicShell>
    );
  }

  const rabiesOk = rabiesCurrent(dog.rabiesVaccinatedOn);
  const contactLine = dog.caretakerLine || config.contactLine;

  return (
    <PublicShell lang={lang}>
      {dog.status === "missing" && (
        <div className="mb-4 rounded-xl bg-red-600 px-4 py-3 text-center font-bold text-white">{s.missing}</div>
      )}

      <article className="overflow-hidden rounded-3xl border border-stone-200 bg-white">
        <DogPhoto photoId={dog.photoId} alt={dog.name} className="aspect-square w-full" />
        <div className="p-5">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1 className="text-3xl font-bold">{dog.name}</h1>
              <p className="text-stone-600">
                {s[dog.sex]} · {s[dog.temperament]}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-brand-soft px-3 py-1 text-sm font-semibold text-brand-dark">
              {dog.status === "community" || dog.status === "missing" ? s.communityDog : s[dog.status]}
            </span>
          </div>

          {dog.status === "community" && <p className="mt-3 text-stone-700">{s.communityDogBody}</p>}

          {dog.area && (
            <p className="mt-3">
              <span className="text-stone-500">{s.lives}</span> {dog.area}
            </p>
          )}
          {dog.description && <p className="mt-1 text-stone-700">{dog.description}</p>}

          <ul className="mt-4 space-y-2">
            <Fact ok={dog.sterilized}>
              {dog.sterilized ? s.sterilized : s.notSterilized}
              {dog.sterilized && dog.sterilizedOn && (
                <span className="text-stone-500"> · {fmtDate(dog.sterilizedOn, lang)}</span>
              )}
            </Fact>
            <Fact ok={rabiesOk}>
              {dog.rabiesVaccinatedOn ? (
                <>
                  {rabiesOk ? s.rabies : s.rabiesDue}
                  <span className="text-stone-500"> · {fmtDate(dog.rabiesVaccinatedOn, lang)}</span>
                </>
              ) : (
                s.noRabies
              )}
            </Fact>
          </ul>

          {dog.publicNotes && <p className="mt-4 whitespace-pre-line text-stone-700">{dog.publicNotes}</p>}

          {(dog.caretakerName || contactLine) && (
            <div className="mt-5 rounded-xl bg-stone-50 p-4">
              {dog.caretakerName && (
                <p>
                  <span className="text-stone-500">{s.caredBy}</span> {dog.caretakerName}
                </p>
              )}
              {contactLine && (
                <a href={lineUrl(contactLine)} className="btn mt-3 w-full bg-[#06C755] text-white">
                  {s.contactLine}
                </a>
              )}
            </div>
          )}
        </div>
      </article>

      {dog.status !== "deceased" && (
        <div className="mt-5 grid gap-3">
          <Link href={`/d/${tag.code}/report`} className="btn-brand py-4 text-lg">
            {s.reportBtn}
          </Link>
          <Link href={`/d/${tag.code}/report?c=injured`} className="btn-ghost">
            {s.reportInjured}
          </Link>
        </div>
      )}

      {admin && (
        <Link href={`/admin/dogs/${dog.id}`} className="mt-6 block text-center text-sm text-stone-500 underline">
          Edit (volunteer)
        </Link>
      )}
      <p className="mt-6 text-center font-mono text-xs tracking-widest text-stone-400">{tag.code}</p>
    </PublicShell>
  );
}

function Fact({ ok, children }: { ok: boolean; children: React.ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span
        className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-sm font-bold text-white ${
          ok ? "bg-emerald-600" : "bg-amber-500"
        }`}
      >
        {ok ? "✓" : "!"}
      </span>
      <span>{children}</span>
    </li>
  );
}
