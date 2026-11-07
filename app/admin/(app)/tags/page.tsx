import Link from "next/link";
import { redirect } from "next/navigation";
import { count, desc, sql } from "drizzle-orm";
import { db, tags } from "@/db";
import { createBatch } from "../../actions";
import { normalizeCode } from "@/lib/codes";
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
      <h1 className="large-title pt-8 pb-4">Tags</h1>

      <form action={findTag}>
        <label className="field flex items-center gap-2 py-0">
          <Search className="h-[18px] w-[18px] shrink-0 text-label-2" />
          <input name="code" placeholder="Open a tag by code" autoCapitalize="characters" className="cell-input h-11 font-mono uppercase tracking-[0.2em] placeholder:font-sans placeholder:normal-case placeholder:tracking-normal" />
        </label>
      </form>
      <p className="section-footer">Or scan a blank tag with your phone camera while signed in.</p>

      <form action={createBatch} className="mt-8">
        <h2 className="section-header">New batch</h2>
        <div className="inset-group">
          <label className="cell">
            <span className="w-32 shrink-0">Name</span>
            <input name="name" placeholder="2026-11-first100" className="cell-input text-right" />
          </label>
          <label className="cell">
            <span className="flex-1">How many</span>
            <input name="count" type="number" inputMode="numeric" min={1} max={500} defaultValue={100} className="cell-input w-20 flex-none text-right" />
          </label>
        </div>
        <p className="section-footer">Makes unique codes plus a CSV and print sheet for the engraver.</p>
        <button className="btn-tinted mt-3 w-full">Create batch</button>
      </form>

      <section className="mt-8">
        <h2 className="section-header">Batches</h2>
        <div className="inset-group">
          {batches.map((b) => (
            <Link key={b.batch} href={`/admin/tags/batch/${encodeURIComponent(b.batch)}`} className="cell active:bg-fill">
              <span className="flex-1">{b.batch}</span>
              <span className="text-label-2">
                {b.used} of {b.total} used
              </span>
              <Chevron className="h-4 w-4 text-label-3" />
            </Link>
          ))}
          {batches.length === 0 && <p className="cell text-label-2">No tags yet</p>}
        </div>
      </section>
    </>
  );
}
