import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { PublicShell } from "@/components/PublicShell";
import { DogPhoto } from "@/components/DogPhoto";
import { ScanCard } from "@/components/ScanCard";
import { Alert, Eye, Paw, Pin, Shield, Syringe } from "@/components/Icons";
import { getLang, t, fill } from "@/lib/i18n";
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
          <p className="font-mono text-[40px] leading-[44px] font-medium tracking-[8px]">{tag.code}</p>
          <p className="mt-3 text-body text-label-2">{s.tagNotLinked}</p>
          {admin && (
            <Link href={`/admin/tags/${tag.code}`} className="btn-primary mt-8 w-full">
              Link this tag to a dog
            </Link>
          )}
        </div>
      </PublicShell>
    );
  }

  const rabiesOk = rabiesCurrent(dog.rabiesVaccinatedOn);
  const contactLine = dog.caretakerLine || config.contactLine;
  const statusLabel =
    dog.status === "missing" ? s.missingLabel : dog.status === "community" ? s.communityDog : s[dog.status];

  const bottomBar =
    dog.status === "deceased" ? undefined : (
      <>
        <Link href={`/d/${tag.code}/report?c=injured`} className="btn-danger flex-1">
          {s.getHelp}
        </Link>
        <Link href={`/d/${tag.code}/report`} className="btn-primary flex-1">
          {s.sawDog}
        </Link>
      </>
    );

  return (
    <PublicShell lang={lang} bottomBar={bottomBar}>
      <div className="relative overflow-hidden rounded-[28px] shadow-card">
        <DogPhoto photoId={dog.photoId} alt={dog.name} className="aspect-[358/430] w-full" />
        <span className={`chip absolute top-4 left-4 ${dog.status === "missing" ? "text-bad" : ""}`}>
          {dog.status === "missing" ? <Alert className="h-4 w-4" /> : <Paw className="h-4 w-4" />}
          {statusLabel}
        </span>
      </div>

      {dog.status !== "deceased" && (
        <ScanCard
          code={tag.code}
          labels={{
            title: fill(s.scanTitle, { name: dog.name }),
            body: s.scanBody,
            share: s.shareLocation,
            notNow: s.notNow,
            done: s.scanDone,
          }}
        />
      )}

      <h1 className="mt-5 text-display">{dog.name}</h1>
      <p className="mt-1 text-subhead text-label-2">
        {s[dog.sex]} • {s[dog.temperament]}
      </p>

      {dog.status === "missing" && (
        <p className="mt-4 rounded-[20px] bg-bad-soft px-4 py-3.5 text-callout text-bad">{s.missing}</p>
      )}
      {dog.status === "community" && <p className="mt-4 text-body">{s.communityDogBody}</p>}

      <div className="card-rows mt-6">
        <HealthRow
          Icon={Shield}
          title={s.sterilization}
          sub={dog.sterilized && dog.sterilizedOn ? fmtDate(dog.sterilizedOn, lang) : undefined}
          pill={dog.sterilized ? [s.done, "ok"] : [s.notYet, "warn"]}
        />
        <HealthRow
          Icon={Syringe}
          title={s.rabiesVaccine}
          sub={dog.rabiesVaccinatedOn ? fmtDate(dog.rabiesVaccinatedOn, lang) : undefined}
          pill={dog.rabiesVaccinatedOn ? (rabiesOk ? [s.upToDate, "ok"] : [s.due, "warn"]) : [s.notRecorded, "warn"]}
        />
      </div>

      {(dog.area || dog.description) && (
        <div className="mt-3">
          {dog.area && <InfoRow Icon={Pin} title={dog.area} sub={s.livesAround} />}
          {dog.description && <InfoRow Icon={Eye} title={dog.description} sub={s.looksLike} />}
        </div>
      )}

      {dog.publicNotes && (
        <p className="mt-2 rounded-[20px] bg-brand-soft px-4 py-3.5 text-subhead whitespace-pre-line">{dog.publicNotes}</p>
      )}

      {(dog.caretakerName || contactLine) && (
        <section className="mt-8">
          <h2 className="text-section">{s.caredBy}</h2>
          <div className="row mt-1">
            <span className="tile h-11 w-11 rounded-full bg-fill text-footnote font-medium text-label-2">
              {initials(dog.caretakerName || config.programName)}
            </span>
            <p className="min-w-0 flex-1 text-callout">{dog.caretakerName || config.programName}</p>
            {contactLine && (
              <a href={lineUrl(contactLine)} className="btn-outline btn-sm">
                {s.messageOnLine}
              </a>
            )}
          </div>
        </section>
      )}

      <div className="mt-10 text-center">
        <p className="text-caption text-label-3">{s.tag}</p>
        <p className="mt-1 text-code text-label-3">{tag.code}</p>
        {admin && (
          <Link href={`/admin/dogs/${dog.id}`} className="mt-3 inline-block text-subhead text-link">
            Edit dog
          </Link>
        )}
      </div>
    </PublicShell>
  );
}

function initials(name: string) {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

function HealthRow({
  Icon,
  title,
  sub,
  pill,
}: {
  Icon: (p: { className?: string }) => React.ReactNode;
  title: string;
  sub?: string;
  pill: [string, "ok" | "warn"];
}) {
  return (
    <div className="row">
      <Icon className="h-[22px] w-[22px] shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-callout">{title}</p>
        {sub && <p className="text-footnote text-label-2">{sub}</p>}
      </div>
      <span className={`pill ${pill[1] === "ok" ? "bg-ok-soft text-ok" : "bg-warn-soft text-warn"}`}>{pill[0]}</span>
    </div>
  );
}

function InfoRow({ Icon, title, sub }: { Icon: (p: { className?: string }) => React.ReactNode; title: string; sub: string }) {
  return (
    <div className="row">
      <Icon className="h-[22px] w-[22px] shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="text-callout">{title}</p>
        <p className="text-footnote text-label-2">{sub}</p>
      </div>
    </div>
  );
}
