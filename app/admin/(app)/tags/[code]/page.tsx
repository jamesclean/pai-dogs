import Link from "next/link";
import { notFound } from "next/navigation";
import { asc, ne } from "drizzle-orm";
import { db, dogs } from "@/db";
import { getTag } from "@/lib/data";
import { linkTag } from "../../../actions";
import { qrSvg } from "@/lib/qr";
import { AdminNavRow } from "@/components/AdminHeader";
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
  // Engraved look: the QR in dark steel grey on a brushed-steel tag.
  const svg = (await qrSvg(tag.code, 0)).replace(/#000000/g, "#2b2e33").replace(/fill="#ffffff"/g, 'fill="none"');

  return (
    <>
      <AdminNavRow back={{ href: "/admin/tags", label: "Tags" }} />

      <div className="relative mt-2 flex h-80 items-center justify-center overflow-hidden rounded-[28px] border border-sep bg-surface">
        <span className="chip absolute top-4 left-4">
          {dog ? (
            <>
              On{" "}
              <Link href={`/admin/dogs/${dog.id}`} className="text-brand">
                {dog.name}
              </Link>
              {tag.retired && " (lost)"}
            </>
          ) : (
            "Not linked"
          )}
        </span>
        <div className="relative mt-4 h-[236px] w-[184px] rounded-[30px] border border-[#bdc2c9] bg-[linear-gradient(135deg,#f5f6f8_0%,#d6dadf_35%,#f2f3f5_55%,#cbd0d6_100%)] shadow-[0_14px_30px_-8px_rgba(0,0,0,0.18),inset_0_1px_0_#fff]">
          <span className="absolute top-[18px] left-[38px] h-2.5 w-[108px] rounded-full bg-surface shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)]" />
          <div className="absolute top-[44px] left-[30px] h-[124px] w-[124px] opacity-90 [&>svg]:h-full [&>svg]:w-full" dangerouslySetInnerHTML={{ __html: svg }} />
          <p className="absolute inset-x-0 top-[178px] text-center font-mono text-[13px] font-medium tracking-[4px] text-[#3a3d42]">
            {tag.code}
          </p>
          <span className="absolute bottom-[18px] left-[38px] h-2.5 w-[108px] rounded-full bg-surface shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)]" />
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="font-mono text-[40px] leading-[44px] font-medium tracking-[8px]">{tag.code}</p>
        <p className="mt-1.5 text-subhead text-label-2">Batch {tag.batch}</p>
      </div>

      <Link href={`/admin/dogs/new?tag=${tag.code}`} className="btn-primary mt-7 w-full">
        Add new dog
      </Link>

      {all.length > 0 && (
        <form action={linkTag.bind(null, tag.code)} className="mt-9">
          <h2 className="text-section">Replacement tag</h2>
          <div className="card-rows mt-2">
            <label className="row">
              <span className="text-callout">Choose a dog</span>
              <select
                name="dogId"
                required
                defaultValue=""
                className="min-w-0 flex-1 cursor-pointer appearance-none bg-transparent text-right text-subhead text-label-2 outline-none"
              >
                <option value="" disabled>
                  Choose
                </option>
                {all.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                    {d.area ? ` • ${d.area}` : ""}
                  </option>
                ))}
              </select>
              <UpDown className="-ml-1 h-4 w-4 shrink-0 text-label-3" />
            </label>
          </div>
          <button className="btn-secondary mt-3 w-full">Link tag</button>
        </form>
      )}
    </>
  );
}
