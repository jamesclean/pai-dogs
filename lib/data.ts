import "server-only";
import { and, asc, count, desc, eq, ilike, isNull, ne, or, sql } from "drizzle-orm";
import { db, dogs, tags, sightings, newDogReports, adoptionQuestions } from "@/db";
import { normalizeCode } from "./codes";
import type { DogGroup } from "./dog-groups";

export async function getTag(rawCode: string) {
  const code = normalizeCode(rawCode);
  const [row] = await db
    .select({ tag: tags, dog: dogs })
    .from(tags)
    .leftJoin(dogs, eq(tags.dogId, dogs.id))
    .where(eq(tags.code, code));
  return row ?? null;
}

export async function getDog(id: number) {
  const [dog] = await db.select().from(dogs).where(eq(dogs.id, id));
  return dog ?? null;
}

export async function dogTags(dogId: number) {
  return db.select().from(tags).where(eq(tags.dogId, dogId)).orderBy(desc(tags.assignedAt));
}

export async function dogSightings(dogId: number, limit = 50) {
  return db
    .select()
    .from(sightings)
    .where(eq(sightings.dogId, dogId))
    .orderBy(desc(sightings.createdAt))
    .limit(limit);
}

export async function activeDogCount() {
  const [r] = await db
    .select({ n: count() })
    .from(dogs)
    .where(ne(dogs.status, "deceased"));
  return r.n;
}

const GROUP_FILTER = {
  community: and(ne(dogs.status, "deceased"), or(isNull(dogs.homeStatus), ne(dogs.homeStatus, "has_home"))),
  home: and(ne(dogs.status, "deceased"), eq(dogs.homeStatus, "has_home")),
  memory: eq(dogs.status, "deceased"),
};

function searchFilter(q: string) {
  return q ? or(ilike(dogs.name, `%${q}%`), ilike(dogs.area, `%${q}%`)) : undefined;
}

// How many dogs each Browse group holds, for the current search.
export async function dogGroupCounts(query = ""): Promise<Record<DogGroup, number>> {
  const [row] = await db
    .select({
      community: sql<number>`(count(*) filter (where ${GROUP_FILTER.community}))::int`,
      home: sql<number>`(count(*) filter (where ${GROUP_FILTER.home}))::int`,
      memory: sql<number>`(count(*) filter (where ${GROUP_FILTER.memory}))::int`,
    })
    .from(dogs)
    .where(searchFilter(query.trim()));
  return row;
}

// Public directory, tag or no tag.
export async function publicDogs(group: DogGroup, query = "") {
  const q = query.trim();
  return db
    .select({
      id: dogs.id,
      name: dogs.name,
      area: dogs.area,
      status: dogs.status,
      homeStatus: dogs.homeStatus,
      photoId: dogs.photoId,
    })
    .from(dogs)
    .where(and(GROUP_FILTER[group], searchFilter(q)))
    .orderBy(asc(dogs.name));
}

export async function dogAdoptionQuestions(dogId: number) {
  return db
    .select()
    .from(adoptionQuestions)
    .where(eq(adoptionQuestions.dogId, dogId))
    .orderBy(desc(adoptionQuestions.createdAt))
    .limit(20);
}

// Everything waiting for a volunteer, for the count on the Dogs tab.
export async function inboxCount() {
  const counts = await Promise.all(
    [sightings, newDogReports, adoptionQuestions].map((table) =>
      db.select({ n: count() }).from(table).where(eq(table.reviewed, false)),
    ),
  );
  return counts.reduce((sum, [r]) => sum + r.n, 0);
}
