import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicShell, BAR_HEIGHT } from "@/components/PublicShell";
import { DogPhoto } from "@/components/DogPhoto";
import { Check, Bang, Pin, Person, Bubble, Chevron, Heart } from "@/components/Icons";
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
        <div className="pt-16 text-center">
          <p className="font-mono text-[28px] tracking-[0.25em]">{tag.code}</p>
          <p className="mt-3 text-[17px] text-label-2">{s.tagNotLinked}</p>
          {admin && (
            <Link href={`/admin/tags/${tag.code}`} className="btn-brand mt-8 w-full">
              Link this tag to a dog
            </Link>
          )}
        </div>
      </PublicShell>
    );
  }

  const rabiesOk = rabiesCurrent(dog.rabiesVaccinatedOn);
  const contactLine = dog.caretakerLine || config.contactLine;
  const statusLabel = dog.status === "community" || dog.status === "missing" ? s.communityDog : s[dog.status];

  const bottomBar =
    dog.status === "deceased" ? undefined : (
      <>
        <Link href={`/d/${tag.code}/report?c=injured`} className="btn-gray flex-1 px-3 text-bad">
          {s.needsHelp}
        </Link>
        <Link href={`/d/${tag.code}/report`} className="btn-brand flex-1 px-3">
          {s.reportBtn}
        </Link>
      </>
    );

  return (
    <PublicShell lang={lang} bottomBar={bottomBar}>
      {/* Full-bleed photo that runs up under the glass bar. */}
      <div
        className="relative -mx-4 sm:mx-0 sm:mt-4"
        style={{ marginTop: `calc(-${BAR_HEIGHT}px - env(safe-area-inset-top))` }}
      >
        <DogPhoto photoId={dog.photoId} alt={dog.name} className="aspect-[4/5] w-full sm:rounded-[28px]" />
        <div className="absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-black/55 to-transparent sm:rounded-b-[28px]" />
        <div className="absolute inset-x-0 bottom-0 px-5 pb-5 text-white">
          <span className="glass mb-3 inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-[13px] font-semibold text-label">
            <span className="h-2 w-2 rounded-full bg-brand" />
            {statusLabel}
          </span>
          <h1 className="large-title text-[44px]">{dog.name}</h1>
          <p className="mt-1 text-[17px] text-white/85">
            {s[dog.sex]} · {s[dog.temperament]}
          </p>
        </div>
      </div>

      {dog.status === "missing" && (
        <div className="mt-5 flex items-center gap-3 rounded-[14px] bg-bad px-4 py-3.5 font-semibold text-white">
          <Bang className="h-5 w-5 shrink-0" />
          {s.missing}
        </div>
      )}

      {dog.status === "community" && (
        <p className="mt-6 text-[17px] leading-relaxed text-label-2">{s.communityDogBody}</p>
      )}

      <div className="inset-group mt-6">
        <div className={`cell cell-icon`}>
          <StatusTile ok={dog.sterilized} />
          <div className="flex-1">
            <p>{dog.sterilized ? s.sterilized : s.notSterilized}</p>
            {dog.sterilized && dog.sterilizedOn && (
              <p className="text-[15px] text-label-2">{fmtDate(dog.sterilizedOn, lang)}</p>
            )}
          </div>
        </div>
        <div className="cell cell-icon">
          <StatusTile ok={rabiesOk} />
          <div className="flex-1">
            <p>{dog.rabiesVaccinatedOn ? (rabiesOk ? s.rabies : s.rabiesDue) : s.noRabies}</p>
            {dog.rabiesVaccinatedOn && (
              <p className="text-[15px] text-label-2">{fmtDate(dog.rabiesVaccinatedOn, lang)}</p>
            )}
          </div>
        </div>
      </div>

      {(dog.area || dog.description) && (
        <div className="inset-group mt-6">
          {dog.area && (
            <div className="cell cell-icon">
              <span className="icon-tile bg-link">
                <Pin className="h-[18px] w-[18px]" />
              </span>
              <div className="flex-1">
                <p className="text-[13px] text-label-2">{s.lives}</p>
                <p>{dog.area}</p>
              </div>
            </div>
          )}
          {dog.description && (
            <div className="cell cell-icon">
              <span className="icon-tile bg-brand">
                <Heart className="h-[18px] w-[18px]" />
              </span>
              <p className="flex-1">{dog.description}</p>
            </div>
          )}
        </div>
      )}

      {dog.publicNotes && (
        <p className="mt-6 px-1 text-[17px] leading-relaxed whitespace-pre-line">{dog.publicNotes}</p>
      )}

      {(dog.caretakerName || contactLine) && (
        <section className="mt-8">
          <h2 className="section-header">{s.caredBy}</h2>
          <div className="inset-group">
            {dog.caretakerName && (
              <div className="cell cell-icon">
                <span className="icon-tile bg-label-2">
                  <Person className="h-[18px] w-[18px]" />
                </span>
                <p className="flex-1">{dog.caretakerName}</p>
              </div>
            )}
            {contactLine && (
              <a href={lineUrl(contactLine)} className="cell cell-icon active:bg-fill">
                <span className="icon-tile bg-[#06C755]">
                  <Bubble className="h-[18px] w-[18px]" />
                </span>
                <span className="flex-1">{s.contactLine}</span>
                <Chevron className="h-4 w-4 text-label-3" />
              </a>
            )}
          </div>
        </section>
      )}

      <p className="mt-10 text-center font-mono text-[12px] tracking-[0.3em] text-label-3">{tag.code}</p>
      {admin && (
        <Link href={`/admin/dogs/${dog.id}`} className="mt-2 block text-center text-[15px] text-link">
          Edit (volunteer)
        </Link>
      )}
    </PublicShell>
  );
}

function StatusTile({ ok }: { ok: boolean }) {
  return (
    <span className={`icon-tile ${ok ? "bg-ok" : "bg-warn"}`}>
      {ok ? <Check className="h-[17px] w-[17px]" /> : <Bang className="h-[17px] w-[17px]" />}
    </span>
  );
}
