import { and, eq, ilike, ne, or } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { db, dogs, newDogReports } from "@/db";
import { AdminNavRow } from "@/components/AdminHeader";
import { DogPhoto } from "@/components/DogPhoto";
import { Chevron, Megaphone, Search } from "@/components/Icons";
import { matchReport } from "../../../../actions";
import { CONDITION } from "@/lib/conditions";
import { fmtDateTime } from "@/lib/dates";

// Rough distance in metres. Plenty for sorting dogs around one small town.
function metres(lat1: number, lng1: number, lat2: number, lng2: number) {
  const x = (lng2 - lng1) * Math.cos((lat1 * Math.PI) / 180);
  return Math.round(Math.hypot(x, lat2 - lat1) * 111_320);
}

export default async function MatchReport({ params, searchParams }: PageProps<"/admin/reports/[id]/match">) {
  const id = Number((await params).id);
  const { q } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const [report] = Number.isInteger(id) && id > 0 ? await db.select().from(newDogReports).where(eq(newDogReports.id, id)) : [];
  if (!report) notFound();
  if (report.reviewed) redirect("/admin");

  const rows = await db
    .select()
    .from(dogs)
    .where(
      and(ne(dogs.status, "deceased"), query ? or(ilike(dogs.name, `%${query}%`), ilike(dogs.area, `%${query}%`)) : undefined),
    )
    .orderBy(dogs.name);

  // Dogs usually found closest to the report come first.
  const list = rows
    .map((dog) => ({
      dog,
      distance:
        report.lat !== null && report.lng !== null && dog.homeLat !== null && dog.homeLng !== null
          ? metres(report.lat, report.lng, dog.homeLat, dog.homeLng)
          : null,
    }))
    .sort((a, b) => (a.distance ?? Infinity) - (b.distance ?? Infinity));

  const condition = CONDITION[report.condition];

  return (
    <>
      <AdminNavRow back={{ href: "/admin", label: "Dogs" }} />
      <h1 className="pt-2 text-title">Already in our records</h1>

      <div className="card mt-4 flex items-start gap-3 p-4">
        {report.photoId ? (
          <DogPhoto photoId={report.photoId} alt="" className="h-20 w-20 shrink-0 rounded-[14px]" />
        ) : (
          <span className="tile h-11 w-11 rounded-[12px] bg-brand-soft text-brand">
            <Megaphone className="h-[22px] w-[22px]" />
          </span>
        )}
        <div className="min-w-0 flex-1">
          {condition && <span className={`pill mb-1 ${condition[1]}`}>{condition[0]}</span>}
          {report.note && <p className="text-callout">{report.note}</p>}
          <p className="mt-0.5 text-footnote text-label-2">
            {[fmtDateTime(report.createdAt), report.contact].filter(Boolean).join(" • ")}
          </p>
        </div>
      </div>

      <form className="mt-4">
        <label className="search">
          <Search className="h-[18px] w-[18px] shrink-0" />
          <input name="q" defaultValue={query} placeholder="Name or location" className="bare-input" />
        </label>
      </form>

      <div className="card-rows mt-3">
        {list.map(({ dog, distance }) => (
          <form key={dog.id} action={matchReport.bind(null, report.id, dog.id)}>
            <button className="row w-full text-left">
              <DogPhoto photoId={dog.photoId} alt="" className="h-14 w-14 shrink-0 rounded-[14px]" />
              <span className="min-w-0 flex-1">
                <span className="block truncate text-callout">{dog.name}</span>
                <span className="block truncate text-footnote text-label-2">
                  {[dog.area, distance !== null && `${distance} m away`].filter(Boolean).join(" • ")}
                </span>
              </span>
              <Chevron className="h-4 w-4 shrink-0 text-label-3" />
            </button>
          </form>
        ))}
        {list.length === 0 && <p className="row text-subhead text-label-2">No dogs match</p>}
      </div>
    </>
  );
}
