import "server-only";
import { and, asc, count, desc, eq, ilike, ne, notInArray, or, sql } from "drizzle-orm";
import { db, dogs, tags, sightings } from "@/db";
import { normalizeCode } from "./codes";

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
    .where(and(ne(dogs.status, "deceased"), ne(dogs.status, "adopted")));
  return r.n;
}

// Public directory: community and missing dogs, with the tag their page lives at.
export async function publicDogs(query = "") {
  const q = query.trim();
  return db
    .select({
      id: dogs.id,
      name: dogs.name,
      area: dogs.area,
      status: dogs.status,
      photoId: dogs.photoId,
      tagCode: sql<string | null>`(select code from ${tags} where ${tags.dogId} = ${dogs.id} and not ${tags.retired} order by ${tags.assignedAt} desc limit 1)`,
    })
    .from(dogs)
    .where(
      and(
        notInArray(dogs.status, ["deceased", "adopted"]),
        q ? or(ilike(dogs.name, `%${q}%`), ilike(dogs.area, `%${q}%`)) : undefined,
      ),
    )
    .orderBy(asc(dogs.name));
}
