import { redirect } from "next/navigation";
import Link from "next/link";
import { count, desc, sql } from "drizzle-orm";
import { db, tags } from "@/db";
import { createBatch } from "../../actions";
import { normalizeCode } from "@/lib/codes";
import { AdminHeader } from "@/components/AdminHeader";
import { Chevron, Search } from "@/components/Icons";

async function findTag(form: FormData) {
  "use server";
  const code = normalizeCode(String(form.get("code") ?? ""));
  if (code) redirect(`/admin/tags/${code}`);
}

export default async function TagsPage() {
  const batches = await db
    .select({
      batch: tags.batch,
      total: count(),
      used: sql<number>`count(${tags.dogId})::int`,
    })
    .from(tags)
    .groupBy(tags.batch)
    .orderBy(desc(sql`min(${tags.createdAt})`));

  return (
    <>
      <AdminHeader title="Tags" />

      <form action={findTag}>
        <label className="search">
          <Search className="h-[18px] w-[18px] shrink-0" />
          <input
            name="code"
            placeholder="Tag code, e.g. K7M2X"
            autoCapitalize="characters"
            className="bare-input font-mono tracking-[0.15em] uppercase placeholder:font-sans placeholder:tracking-normal placeholder:normal-case"
          />
        </label>
      </form>
      <p className="mt-2 text-footnote text-label-3">Or scan a tag with your phone camera.</p>

      <form action={createBatch} className="mt-7">
        <h2 className="text-section">New batch</h2>
        <div className="card-rows mt-2">
          <label className="row">
            <span className="w-32 shrink-0 text-callout">Name</span>
            <input name="name" placeholder="2026-11-first100" className="bare-input text-right text-subhead text-label-2" />
          </label>
          <label className="row">
            <span className="flex-1 text-callout">How many</span>
            <input
              name="count"
              type="number"
              inputMode="numeric"
              min={1}
              max={500}
              defaultValue={100}
              className="bare-input w-20 flex-none text-right text-subhead text-label-2"
            />
          </label>
        </div>
        <p className="mt-2 text-footnote text-label-3">You get a CSV and a print sheet for the engraver.</p>
        <button className="btn-secondary mt-3 w-full">Create batch</button>
      </form>

      <section className="mt-8">
        <h2 className="text-section">Batches</h2>
        <div className="mt-1 divide-y divide-sep">
          {batches.map((b) => (
            <Link key={b.batch} href={`/admin/tags/batch/${encodeURIComponent(b.batch)}`} className="flex items-center gap-3.5 py-3.5">
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-3">
                  <span className="truncate text-callout">{b.batch}</span>
                  <span className="shrink-0 text-footnote text-label-2">
                    {b.used} of {b.total} used
                  </span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-fill">
                  <div
                    className={`h-full rounded-full ${b.used === b.total ? "bg-label-3" : "bg-brand"}`}
                    style={{ width: `${Math.max(2, (b.used / b.total) * 100)}%` }}
                  />
                </div>
              </div>
              <Chevron className="h-4 w-4 shrink-0 text-label-3" />
            </Link>
          ))}
          {batches.length === 0 && <p className="py-3 text-subhead text-label-2">No tags yet</p>}
        </div>
      </section>
    </>
  );
}
