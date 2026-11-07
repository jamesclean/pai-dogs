import Link from "next/link";
import { notFound } from "next/navigation";
import { PublicShell } from "@/components/PublicShell";
import { DogPhoto } from "@/components/DogPhoto";
import { ChevronLeft } from "@/components/Icons";
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
      <div>
        <Link href={`/d/${row.tag.code}`} className="-ml-1.5 mt-3 inline-flex items-center gap-0.5 text-[17px] text-brand">
          <ChevronLeft className="h-5 w-5" />
          {row.dog.name}
        </Link>
        <div className="mt-4 mb-8 flex items-center gap-4">
          <DogPhoto photoId={row.dog.photoId} alt={row.dog.name} className="h-16 w-16 rounded-full" />
          <h1 className="large-title">{s.reportTitle}</h1>
        </div>
        <ReportForm code={row.tag.code} s={s} initial={typeof c === "string" ? c : "ok"} />
      </div>
    </PublicShell>
  );
}
