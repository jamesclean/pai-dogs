import Link from "next/link";
import { ilike, or, sql } from "drizzle-orm";
import { db, dogs, tags } from "@/db";
import { AdminDogGroups } from "@/components/AdminDogGroups";
import { DogPhoto } from "@/components/DogPhoto";
import { AdminHeader, AdminNavRow } from "@/components/AdminHeader";
import { Chevron, Plus, Search } from "@/components/Icons";
import { fmtDateTime, rabiesCurrent } from "@/lib/dates";
import { groupOf, type DogGroup } from "@/lib/dog-groups";

// Every dog, for the crew. Home's At a glance links here, and to ?due=rabies for the
// living dogs whose rabies shot is due.
export default async function AdminHome({ searchParams }: PageProps<"/admin">) {
  const { q, due } = await searchParams;
  const query = typeof q === "string" ? q.trim() : "";
  const rabiesDue = due === "rabies";

  const all = await db
    .select({
      dog: dogs,
      // Plain SQL: Drizzle drops table names from columns selected from one table.
      tagCode: sql<
        string | null
      >`(select t.code from tags t where t.dog_id = dogs.id and not t.retired order by t.assigned_at desc limit 1)`,
      lastSeen: sql<
        string | null
      >`(select max(s.created_at) from sightings s where s.dog_id = dogs.id)`,
    })
    .from(dogs)
    .where(
      query
        ? or(
            ilike(dogs.name, `%${query}%`),
            ilike(dogs.area, `%${query}%`),
            ilike(dogs.caretakerName, `%${query}%`),
            sql`exists (select 1 from ${tags} where ${tags.dogId} = ${dogs.id} and ${tags.code} = ${query.toUpperCase()})`,
          )
        : undefined,
    )
    .orderBy(dogs.name);
  const list = rabiesDue
    ? all.filter(({ dog }) => dog.status !== "deceased" && !rabiesCurrent(dog.rabiesVaccinatedOn))
    : all;

  const dogRows = (group: DogGroup) =>
    list
      .filter(({ dog }) => groupOf(dog) === group)
      .map(({ dog, tagCode, lastSeen }) => {
        const flags = [
          !dog.sterilized && "Not sterilized",
          !rabiesCurrent(dog.rabiesVaccinatedOn) && "Rabies due",
        ].filter(Boolean);
        return (
          <Link
            key={dog.id}
            href={`/admin/dogs/${dog.id}`}
            className="flex items-center gap-3 py-2.5"
          >
            <DogPhoto
              photoId={dog.photoId}
              alt=""
              className="h-11 w-11 shrink-0 rounded-full"
            />
            <div className="min-w-0 flex-1">
              <p className="flex items-center gap-2">
                <span className="truncate text-callout">{dog.name}</span>
                {dog.status === "missing" && (
                  <span className="pill bg-bad-soft text-bad">Missing</span>
                )}
                {/* Only a search mixes the groups, so only then does it need saying. */}
                {query !== "" && dog.status === "deceased" && (
                  <span className="pill bg-fill text-label-2">In memory</span>
                )}
              </p>
              <p
                className={`truncate text-footnote ${flags.length ? "text-warn" : "text-label-2"}`}
              >
                {flags.length
                  ? flags.join(" • ")
                  : dog.area || "No location yet"}
              </p>
            </div>
            <div className="text-right">
              {tagCode ? (
                <p className="font-mono text-[13px] leading-[18px] font-medium tracking-[1.5px] text-label-2">
                  {tagCode}
                </p>
              ) : (
                <p className="text-footnote text-label-3">No tag</p>
              )}
              {lastSeen && (
                <p className="text-footnote text-label-3">
                  {fmtDateTime(new Date(lastSeen))}
                </p>
              )}
            </div>
            <Chevron className="h-4 w-4 shrink-0 text-label-3" />
          </Link>
        );
      });

  return (
    <>
      <AdminNavRow
        back={{ href: "/", label: "Home" }}
        right={
          <Link href="/admin/dogs/new" aria-label="Add dog" className="circle-btn">
            <Plus className="h-5 w-5" />
          </Link>
        }
      />
      <AdminHeader title={rabiesDue ? "Rabies due" : "Dogs"} />

      <form>
        {rabiesDue && <input type="hidden" name="due" value="rabies" />}
        <label className="search">
          <Search className="h-[18px] w-[18px] shrink-0" />
          <input
            name="q"
            defaultValue={query}
            placeholder="Name, area, caretaker or tag"
            className="bare-input"
          />
        </label>
      </form>

      <section className="mt-7">
        <h2 className="text-section">
          {list.length === 1 ? "1 dog" : `${list.length} dogs`}
        </h2>
        {list.length === 0 ? (
          <p className="py-3 text-subhead text-label-2">{rabiesDue ? "Every dog is up to date" : "No dogs yet"}</p>
        ) : (
          <AdminDogGroups
            searching={query !== "" || rabiesDue}
            groups={{
              community: dogRows("community"),
              home: dogRows("home"),
              memory: dogRows("memory"),
            }}
          />
        )}
      </section>
    </>
  );
}
