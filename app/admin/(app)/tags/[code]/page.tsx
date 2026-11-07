import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, ne } from "drizzle-orm";
import { db, dogs } from "@/db";
import { getTag } from "@/lib/data";
import { linkTag } from "../../../actions";

export default async function TagPage({ params }: PageProps<"/admin/tags/[code]">) {
  const row = await getTag((await params).code);
  if (!row) notFound();
  const { tag, dog } = row;
  const all = await db.select({ id: dogs.id, name: dogs.name, area: dogs.area }).from(dogs).where(ne(dogs.status, "deceased")).orderBy(asc(dogs.name));

  return (
    <div className="space-y-5">
      <div className="card text-center">
        <p className="font-mono text-3xl tracking-widest">{tag.code}</p>
        <p className="text-stone-500">batch {tag.batch}</p>
        {dog && (
          <p className="mt-2">
            On{" "}
            <Link href={`/admin/dogs/${dog.id}`} className="font-semibold underline">
              {dog.name}
            </Link>
            {tag.retired && " (retired)"}
          </p>
        )}
      </div>

      <Link href={`/admin/dogs/new?tag=${tag.code}`} className="btn-brand w-full py-4 text-lg">
        New dog with this tag
      </Link>

      {all.length > 0 && (
        <form action={linkTag.bind(null, tag.code)} className="card space-y-3">
          <p className="font-semibold">…or put it on a dog already registered (replacement tag)</p>
          <select name="dogId" className="input" required defaultValue="">
            <option value="" disabled>
              Choose dog
            </option>
            {all.map((d) => (
              <option key={d.id} value={d.id}>
                {d.name}
                {d.area ? ` — ${d.area}` : ""}
              </option>
            ))}
          </select>
          <button className="btn-ghost w-full">Link tag</button>
        </form>
      )}
    </div>
  );
}
