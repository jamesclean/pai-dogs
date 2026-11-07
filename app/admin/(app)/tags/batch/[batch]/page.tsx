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
      <div className="mb-5 space-y-3 print:hidden">
        <h1 className="text-2xl font-bold">Batch {batch}</h1>
        <p className="text-stone-600">
          {list.length} codes. Each QR is {modules}×{modules} modules and opens{" "}
          <span className="font-mono text-sm">{tagUrl(list[0].code)}</span>. Engrave it at least 18 mm wide
          (≈{(18 / (modules + 2)).toFixed(2)} mm per dot) with the code printed underneath.
        </p>
        <div className="flex flex-wrap gap-2">
          <a href={`/admin/tags-csv/${encodeURIComponent(batch)}`} className="btn-brand">
            Download CSV for engraver
          </a>
          <PrintButton />
        </div>
      </div>
      <div className="grid grid-cols-4 gap-3 sm:grid-cols-6 print:grid-cols-6">
        {list.map((t, i) => (
          <figure key={t.code} className="break-inside-avoid text-center">
            <div className="aspect-square" dangerouslySetInnerHTML={{ __html: svgs[i] }} />
            <figcaption className={`font-mono text-xs tracking-widest ${t.dogId ? "text-stone-400" : ""}`}>
              {t.code}
            </figcaption>
          </figure>
        ))}
      </div>
    </div>
  );
}
