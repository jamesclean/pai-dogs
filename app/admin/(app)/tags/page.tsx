import Link from "next/link";
import { redirect } from "next/navigation";
import { count, desc, sql } from "drizzle-orm";
import { db, tags } from "@/db";
import { createBatch } from "../../actions";
import { normalizeCode } from "@/lib/codes";

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
      created: sql<string>`min(${tags.createdAt})`,
    })
    .from(tags)
    .groupBy(tags.batch)
    .orderBy(desc(sql`min(${tags.createdAt})`));

  return (
    <div className="space-y-6">
      <section className="card">
        <h2 className="font-semibold">Link a tag by code</h2>
        <form action={findTag} className="mt-3 flex gap-2">
          <input name="code" placeholder="K7M2X" className="input font-mono uppercase tracking-widest" autoCapitalize="characters" />
          <button className="btn-brand">Open</button>
        </form>
        <p className="mt-2 text-sm text-stone-500">
          Or just scan a blank tag with your phone while logged in. It offers to link it.
        </p>
      </section>

      <section className="card">
        <h2 className="font-semibold">Make a new batch of tag codes</h2>
        <p className="mt-1 text-sm text-stone-600">
          Generates unique codes, then gives you a CSV and print sheet to send to the engraver.
        </p>
        <form action={createBatch} className="mt-3 grid grid-cols-[1fr_7rem_auto] gap-2">
          <input name="name" placeholder="Batch name, e.g. 2026-11-first100" className="input" />
          <input name="count" type="number" min={1} max={500} defaultValue={100} className="input" />
          <button className="btn-brand">Create</button>
        </form>
      </section>

      <section>
        <h2 className="mb-2 font-semibold">Batches</h2>
        <ul className="divide-y divide-stone-200 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          {batches.map((b) => (
            <li key={b.batch}>
              <Link href={`/admin/tags/batch/${encodeURIComponent(b.batch)}`} className="flex justify-between p-3 hover:bg-stone-50">
                <span className="font-medium">{b.batch}</span>
                <span className="text-stone-500">
                  {b.used}/{b.total} on dogs
                </span>
              </Link>
            </li>
          ))}
          {batches.length === 0 && <li className="p-3 text-stone-500">No tags yet.</li>}
        </ul>
      </section>
    </div>
  );
}
