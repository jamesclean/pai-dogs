import { notFound } from "next/navigation";
import { PublicShell } from "@/components/PublicShell";
import { DogPhoto } from "@/components/DogPhoto";
import { getLang, t, fill } from "@/lib/i18n";
import { getTag } from "@/lib/data";
import { ReportForm } from "./ReportForm";

export const metadata = { robots: { index: false } };

export default async function ReportPage({ params, searchParams }: PageProps<"/d/[code]/report">) {
  const { code } = await params;
  const { c } = await searchParams;
  const lang = await getLang();
  const s = t(lang);
  const row = await getTag(code);
  if (!row?.dog) notFound();
  const { dog, tag } = row;

  return (
    <PublicShell lang={lang} back={{ href: `/d/${tag.code}`, label: dog.name }}>
      <div className="flex items-center gap-3">
        <DogPhoto photoId={dog.photoId} alt="" className="h-12 w-12 rounded-[14px]" />
        <div className="min-w-0">
          <p className="text-callout">{dog.name}</p>
          <p className="truncate text-footnote text-label-2">
            {s.tag} {tag.code}
            {dog.area && ` • ${dog.area}`}
          </p>
        </div>
      </div>
      <h1 className="mt-6 text-title">{fill(s.howIs, { name: dog.name })}</h1>
      <ReportForm
        code={tag.code}
        photoId={dog.photoId}
        s={s}
        backLabel={fill(s.backTo, { name: dog.name })}
        initial={typeof c === "string" ? c : "ok"}
      />
    </PublicShell>
  );
}
