import { notFound } from "next/navigation";
import { PublicShell } from "@/components/PublicShell";
import { DogPhoto } from "@/components/DogPhoto";
import { ReportForm } from "@/components/ReportForm";
import { submitReport } from "@/app/report/actions";
import { getLang, t, fill } from "@/lib/i18n";
import { getDog } from "@/lib/data";
import { vet } from "@/lib/config";

export const metadata = { robots: { index: false } };

export default async function DogReportPage({ params, searchParams }: PageProps<"/dogs/[id]/report">) {
  const id = Number((await params).id);
  const { c, tag } = await searchParams;
  const dog = Number.isInteger(id) && id > 0 ? await getDog(id) : null;
  if (!dog) notFound();
  const lang = await getLang();
  const s = t(lang);
  const href = `/dogs/${dog.id}`;

  return (
    <PublicShell lang={lang} back={{ href, label: dog.name }} title={fill(s.howIs, { name: dog.name })}>
      <div className="mb-5 flex items-center gap-3">
        <DogPhoto photoId={dog.photoId} alt="" className="h-12 w-12 rounded-[14px]" />
        <div className="min-w-0">
          <p className="text-callout">{dog.name}</p>
          {dog.area && <p className="truncate text-footnote text-label-2">{dog.area}</p>}
        </div>
      </div>
      <ReportForm
        action={submitReport.bind(null, dog.id, typeof tag === "string" ? tag : undefined)}
        s={s}
        initial={typeof c === "string" ? c : "ok"}
        back={{ href, label: fill(s.backTo, { name: dog.name }) }}
        photoId={dog.photoId}
        vet={vet}
      />
    </PublicShell>
  );
}
