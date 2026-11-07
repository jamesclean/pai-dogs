import { notFound } from "next/navigation";
import { asc, eq } from "drizzle-orm";
import { db, tags } from "@/db";
import { qrSvg } from "@/lib/qr";
import { AdminNavRow } from "@/components/AdminHeader";
import { PrintButton } from "./PrintButton";

export default async function BatchPage({ params }: PageProps<"/admin/tags/batch/[batch]">) {
  const batch = decodeURIComponent((await params).batch);
  const list = await db.select().from(tags).where(eq(tags.batch, batch)).orderBy(asc(tags.code));
  if (list.length === 0) notFound();
  const svgs = await Promise.all(list.map((t) => qrSvg(t.code)));
  const used = list.filter((t) => t.dogId).length;

  return (
    <div>
      <div className="print:hidden">
        <AdminNavRow back={{ href: "/admin/tags", label: "Tags" }} />
        <h1 className="pt-2 text-title">{batch}</h1>
        <p className="mt-2.5 text-subhead text-label-2">
          {list.length} codes • {used} used
        </p>
        <p className="mt-1.5 text-subhead text-label-2">
          Engrave each QR at least 18 mm wide, with the code underneath.
        </p>
        <div className="mt-5 flex gap-2.5">
          <a href={`/admin/tags-csv/${encodeURIComponent(batch)}`} className="btn-primary flex-1">
            Download CSV
          </a>
          <PrintButton />
        </div>
      </div>
      <div className="card mt-6 grid grid-cols-3 gap-x-3 gap-y-4 p-4 sm:grid-cols-5 print:mt-0 print:grid-cols-6 print:rounded-none print:border-0 print:p-0">
        {list.map((t, i) => (
          <figure key={t.code} className="break-inside-avoid text-center">
            <div
              className={`aspect-square overflow-hidden rounded-[12px] border border-sep bg-white p-2 print:rounded-none print:border-0 print:p-0 ${t.dogId ? "opacity-40 print:opacity-100" : ""}`}
              dangerouslySetInnerHTML={{ __html: svgs[i] }}
            />
            <figcaption className={`mt-1.5 font-mono text-[12px] tracking-[0.2em] ${t.dogId ? "text-label-3" : "text-label-2"}`}>
              {t.code}
            </figcaption>
          </figure>
        ))}
      </div>
      {used > 0 && <p className="mt-2 text-center text-footnote text-label-3 print:hidden">Faded codes are on a dog.</p>}
    </div>
  );
}
