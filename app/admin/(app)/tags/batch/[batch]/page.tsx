import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, tags } from "@/db";
import { qrSvg, qrModules, tagUrl } from "@/lib/qr";
import { PrintButton } from "./PrintButton";

export default async function BatchPage({ params }: PageProps<"/admin/tags/batch/[batch]">) {
  const batch = decodeURIComponent((await params).batch);
  const list = await db.select().from(tags).where(eq(tags.batch, batch)).orderBy(asc(tags.code));
  if (list.length === 0) notFound();
  const svgs = await Promise.all(list.map((t) => qrSvg(t.code)));
  const modules = qrModules(list[0].code);

  return (
    <div>
      <div className="mb-8 space-y-4 pt-8 print:hidden">
        <h1 className="large-title">{batch}</h1>
        <p className="text-[17px] leading-relaxed text-label-2">
          {list.length} codes. Each QR is {modules}×{modules} modules and opens{" "}
          <span className="font-mono text-[15px] text-label">{tagUrl(list[0].code)}</span>. Engrave it at least 18 mm wide
          (≈{(18 / (modules + 2)).toFixed(2)} mm per dot) with the code printed underneath.
        </p>
        <div className="flex gap-2">
          <a href={`/admin/tags-csv/${encodeURIComponent(batch)}`} className="btn-brand flex-1">
            Download CSV for engraver
          </a>
          <PrintButton />
        </div>
      </div>
      <div className="inset-group grid grid-cols-3 gap-x-4 gap-y-5 p-5 sm:grid-cols-5 print:grid-cols-6 print:rounded-none print:p-0">
        {list.map((t, i) => (
          <figure key={t.code} className="break-inside-avoid text-center">
            <div className="aspect-square overflow-hidden rounded-[6px] bg-white" dangerouslySetInnerHTML={{ __html: svgs[i] }} />
            <figcaption className={`mt-1.5 font-mono text-[12px] tracking-[0.2em] ${t.dogId ? "text-label-3" : "text-label-2"}`}>
              {t.code}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
