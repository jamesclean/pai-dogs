import "server-only";
import { and, count, desc, eq, ne } from "drizzle-orm";
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
