import { notFound } from "next/navigation";
import { PublicShell } from "@/components/PublicShell";
import { DogPhoto } from "@/components/DogPhoto";
import { getLang, t } from "@/lib/i18n";
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

  return (
    <PublicShell lang={lang}>
      <div className="mb-5 flex items-center gap-3">
        <DogPhoto photoId={row.dog.photoId} alt={row.dog.name} className="h-14 w-14 rounded-full" />
        <div>
          <h1 className="text-xl font-bold">{s.reportTitle}</h1>
          <p className="text-stone-600">{row.dog.name}</p>
        </div>
      </div>
      <ReportForm code={row.tag.code} s={s} initial={typeof c === "string" ? c : "ok"} />
    </PublicShell>
  );
}
