import { eq } from "drizzle-orm";
import { db, newDogReports } from "@/db";
import { DogForm } from "@/components/DogForm";
import { DogPhoto } from "@/components/DogPhoto";
import { AdminNavRow } from "@/components/AdminHeader";
import { Megaphone } from "@/components/Icons";
import { createDog, dismissNewDog } from "../../../actions";
import { normalizeCode } from "@/lib/codes";
import { fmtDateTime } from "@/lib/dates";

export default async function NewDog({ searchParams }: PageProps<"/admin/dogs/new">) {
  const { tag, report: reportParam } = await searchParams;
  const code = typeof tag === "string" ? normalizeCode(tag) : undefined;
  const reportId = Number(reportParam);
  const [report] =
    Number.isInteger(reportId) && reportId > 0
      ? await db.select().from(newDogReports).where(eq(newDogReports.id, reportId))
      : [];

  return (
    <>
      <AdminNavRow back={{ href: "/admin", label: "Dogs" }} />
      <h1 className="pt-2 text-title">New dog</h1>
      {code && (
        <p className="mt-1 text-subhead text-label-2">
          Tag <span className="font-mono font-medium tracking-[2px] text-label">{code}</span>
        </p>
      )}

      {report && (
        <div className="card mt-4 flex items-start gap-3 p-4">
          {report.photoId ? (
            <DogPhoto photoId={report.photoId} alt="" className="h-14 w-14 shrink-0 rounded-[14px]" />
          ) : (
            <span className="tile h-11 w-11 rounded-[12px] bg-brand-soft text-brand">
              <Megaphone className="h-[22px] w-[22px]" />
            </span>
          )}
          <div className="min-w-0 flex-1">
            {report.note && <p className="text-callout">{report.note}</p>}
            <p className="mt-0.5 text-footnote text-label-2">
              {[fmtDateTime(report.createdAt), report.contact].filter(Boolean).join(" • ")}
            </p>
          </div>
        </div>
      )}

      <DogForm
        action={createDog}
        tag={code}
        report={report?.id}
        prefill={report ? { description: report.note, homeLat: report.lat, homeLng: report.lng } : undefined}
        submit="Add dog"
      />

      {report && (
        <form action={dismissNewDog.bind(null, report.id)} className="mt-6">
          <button className="btn-secondary w-full">Dismiss report</button>
          <p className="mt-2 text-center text-footnote text-label-3">For a duplicate, or a dog that already has a collar.</p>
        </form>
      )}
    </>
  );
}
