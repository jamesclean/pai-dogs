import "server-only";
import { and, asc, count, desc, eq, ne } from "drizzle-orm";
import { db, dogs, tags, sightings, newDogReports, adoptionQuestions } from "@/db";
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
    .where(ne(dogs.status, "deceased"));
  return r.n;
}

// Public directory, tag or no tag. Meet our dogs filters this on the phone.
export async function publicDogs() {
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
  const [[a], [b], [c], [d], [e]] = await Promise.all([
    db.select({ n: count() }).from(sightings).where(eq(sightings.reviewed, false)),
    db.select({ n: count() }).from(newDogReports).where(eq(newDogReports.reviewed, false)),
    db.select({ n: count() }).from(adoptionQuestions).where(eq(adoptionQuestions.reviewed, false)),
    db.select({ n: count() }).from(sightings).where(and(eq(sightings.reviewed, false), ne(sightings.condition, "ok"))),
    db.select({ n: count() }).from(newDogReports).where(and(eq(newDogReports.reviewed, false), ne(newDogReports.condition, "ok"))),
  ]);
  return { total: a.n + b.n + c.n, needsHelp: d.n + e.n };
}
