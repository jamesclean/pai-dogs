import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, ne } from "drizzle-orm";
import { db, dogs } from "@/db";
import { getTag } from "@/lib/data";
import { linkTag } from "../../../actions";
import { UpDown } from "@/components/Icons";

export default async function TagPage({ params }: PageProps<"/admin/tags/[code]">) {
  const row = await getTag((await params).code);
  if (!row) notFound();
  const { tag, dog } = row;
  const all = await db
    .select({ id: dogs.id, name: dogs.name, area: dogs.area })
    .from(dogs)
    .where(ne(dogs.status, "deceased"))
    .orderBy(asc(dogs.name));

  return (
    <div className="pt-12">
      <div className="text-center">
        <p className="font-mono text-[40px] font-medium tracking-[0.2em]">{tag.code}</p>
        <p className="mt-1 text-[15px] text-label-2">Batch {tag.batch}</p>
        {dog && (
          <p className="mt-3 text-[17px]">
            On{" "}
            <Link href={`/admin/dogs/${dog.id}`} className="font-semibold text-brand">
              {dog.name}
            </Link>
            {tag.retired && <span className="text-label-2"> (retired)</span>}
          </p>
        )}
      </div>

      <Link href={`/admin/dogs/new?tag=${tag.code}`} className="btn-brand mt-10 w-full">
        New dog with this tag
      </Link>

      {all.length > 0 && (
        <form action={linkTag.bind(null, tag.code)} className="mt-10">
          <h2 className="section-header">Replacement tag for</h2>
          <div className="inset-group">
            <label className="cell">
              <select name="dogId" required defaultValue="" className="flex-1 cursor-pointer appearance-none bg-transparent text-[17px] text-label outline-none">
                <option value="" disabled>
                  Choose a dog
                </option>
                {all.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                    {d.area ? ` — ${d.area}` : ""}
                  </option>
                ))}
              </select>
              <UpDown className="h-4 w-4 text-label-3" />
            </label>
          </div>
          <button className="btn-gray mt-3 w-full">Link tag</button>
        </form>
      )}
    </div>
  );
}
