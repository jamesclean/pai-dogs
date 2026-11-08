"use server";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { and, eq, isNull, sql } from "drizzle-orm";
import { adoptionQuestions, db, dogs, photos, tags, sightings, newDogReports, type NewDogReport } from "@/db";
import { requireAdmin } from "@/lib/auth";
import { savePhoto } from "@/lib/photos";
import { newCode, normalizeCode } from "@/lib/codes";
import { DOG_GROUPS } from "@/lib/dog-groups";

function str(f: FormData, k: string, max = 500) {
  return String(f.get(k) ?? "").trim().slice(0, max);
}
function dateOrNull(f: FormData, k: string) {
  const v = str(f, k, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(v) ? v : null;
}
function numOrNull(f: FormData, k: string) {
  const v = str(f, k, 30);
  const n = Number(v);
  return v && Number.isFinite(n) ? n : null;
}
function pick<T extends string>(v: string, allowed: readonly T[], fallback: T): T {
  return (allowed as readonly string[]).includes(v) ? (v as T) : fallback;
}

// A report joining a dog's history. Anything but "looks fine" stays open for a volunteer.
function sightingFromReport(report: NewDogReport, dogId: number) {
  return {
    dogId,
    source: "public" as const,
    condition: report.condition,
    note: report.note,
    contact: report.contact,
    lat: report.lat,
    lng: report.lng,
    accuracy: report.accuracy,
    photoId: report.photoId,
    reviewed: report.condition === "ok",
    createdAt: report.createdAt,
  };
}

// A fresh value each time, so the Saved toast plays on every save.
function savedUrl(dogId: number) {
  return `/admin/dogs/${dogId}?saved=${Date.now()}`;
}

function dogFields(f: FormData) {
  return {
    name: str(f, "name", 80) || "Unnamed",
    sex: pick(str(f, "sex"), ["male", "female", "unknown"] as const, "unknown"),
    temperament: pick(str(f, "temperament"), ["friendly", "shy", "careful"] as const, "friendly"),
    description: str(f, "description"),
    area: str(f, "area", 200),
    homeLat: numOrNull(f, "lat"),
    homeLng: numOrNull(f, "lng"),
    caretakerName: str(f, "caretakerName", 120),
    caretakerLine: str(f, "caretakerLine", 120),
    caretakerPhone: str(f, "caretakerPhone", 60),
    sterilized: f.get("sterilized") === "on",
    sterilizedOn: dateOrNull(f, "sterilizedOn"),
    rabiesVaccinatedOn: dateOrNull(f, "rabiesVaccinatedOn"),
    otherVaccines: str(f, "otherVaccines"),
    publicNotes: str(f, "publicNotes", 2000),
    privateNotes: str(f, "privateNotes", 4000),
  };
}

export async function createDog(form: FormData) {
  await requireAdmin();
  const fields = dogFields(form);
  const group = pick(str(form, "group"), DOG_GROUPS, "community");
  // Made from a "new dog" report: reuse its photo and spot unless replaced.
  const reportId = Number(form.get("report"));
  const [report] = Number.isInteger(reportId) && reportId > 0
    ? await db.select().from(newDogReports).where(eq(newDogReports.id, reportId))
    : [];
  const photoId = (await savePhoto(form.get("photo"))) ?? report?.photoId ?? null;
  if (report && fields.homeLat === null && report.lat !== null) {
    fields.homeLat = report.lat;
    fields.homeLng = report.lng;
  }
  const [dog] = await db
    .insert(dogs)
    .values({
      ...fields,
      photoId,
      status: group === "memory" ? "deceased" : "community",
      homeStatus: group === "home" ? "has_home" : group === "community" && form.get("adoption") === "on" ? "ask_adoption" : null,
    })
    .returning({ id: dogs.id });
  if (report) {
    await db.update(newDogReports).set({ reviewed: true, dogId: dog.id }).where(eq(newDogReports.id, report.id));
  }

  const code = normalizeCode(str(form, "tag", 20));
  if (code) {
    await db
      .update(tags)
      .set({ dogId: dog.id, assignedAt: new Date() })
      .where(and(eq(tags.code, code), isNull(tags.dogId)));
  }
  if (report) {
    await db.insert(sightings).values(sightingFromReport(report, dog.id));
  } else if (fields.homeLat !== null) {
    await db.insert(sightings).values({
      dogId: dog.id,
      source: "volunteer",
      note: "Collared / registered",
      lat: fields.homeLat,
      lng: fields.homeLng,
      reviewed: true,
    });
  }
  revalidatePath("/admin", "layout");
  redirect(savedUrl(dog.id));
}

export async function updateDog(id: number, form: FormData) {
  await requireAdmin();
  const photoId = await savePhoto(form.get("photo"));
  const fields = dogFields(form);
  const group = pick(str(form, "group"), DOG_GROUPS, "community");
  await db
    .update(dogs)
    .set({
      ...fields,
      ...(photoId ? { photoId } : {}),
      status: group === "memory" ? "deceased" : form.get("missing") === "on" ? "missing" : "community",
      homeStatus: group === "home" ? "has_home" : group === "community" && form.get("adoption") === "on" ? "ask_adoption" : null,
      updatedAt: new Date(),
    })
    .where(eq(dogs.id, id));
  revalidatePath("/", "layout");
  redirect(savedUrl(id));
}

export async function deleteDog(id: number) {
  await requireAdmin();
  await db.update(tags).set({ dogId: null, assignedAt: null, retired: true }).where(eq(tags.dogId, id));
  await db.delete(dogs).where(eq(dogs.id, id));
  redirect("/admin");
}

export async function volunteerSighting(dogId: number, form: FormData) {
  await requireAdmin();
  const photoId = await savePhoto(form.get("photo"));
  await db.insert(sightings).values({
    dogId,
    source: "volunteer",
    condition: pick(str(form, "condition"), ["ok", "injured", "sick", "lost", "other"] as const, "ok"),
    note: str(form, "note", 2000),
    lat: numOrNull(form, "lat"),
    lng: numOrNull(form, "lng"),
    accuracy: numOrNull(form, "accuracy"),
    photoId,
    reviewed: true,
  });
  revalidatePath(`/admin/dogs/${dogId}`);
}

export async function dismissNewDog(reportId: number) {
  await requireAdmin();
  await db.update(newDogReports).set({ reviewed: true }).where(eq(newDogReports.id, reportId));
  revalidatePath("/admin", "layout");
  redirect("/admin");
}

// The reported dog is one we already know: its report joins that dog's history.
export async function matchReport(reportId: number, dogId: number) {
  await requireAdmin();
  await db.transaction(async (tx) => {
    const [report] = await tx
      .update(newDogReports)
      .set({ reviewed: true, dogId })
      .where(and(eq(newDogReports.id, reportId), eq(newDogReports.reviewed, false)))
      .returning();
    if (report) await tx.insert(sightings).values(sightingFromReport(report, dogId));
  });
  revalidatePath("/admin", "layout");
  redirect(savedUrl(dogId));
}

// Removes a history entry and its map pin. Its photo goes too, unless the dog
// or another entry still uses it.
export async function deleteSighting(sightingId: number) {
  await requireAdmin();
  await db.transaction(async (tx) => {
    const [gone] = await tx.delete(sightings).where(eq(sightings.id, sightingId)).returning({ photoId: sightings.photoId });
    if (!gone?.photoId) return;
    await tx.delete(photos).where(
      and(
        eq(photos.id, gone.photoId),
        sql`not exists (select 1 from ${dogs} where ${dogs.photoId} = ${photos.id})`,
        sql`not exists (select 1 from ${sightings} where ${sightings.photoId} = ${photos.id})`,
        sql`not exists (select 1 from ${newDogReports} where ${newDogReports.photoId} = ${photos.id})`,
      ),
    );
  });
  revalidatePath("/admin", "layout");
}

export async function markAdoptionDone(questionId: number) {
  await requireAdmin();
  await db.update(adoptionQuestions).set({ reviewed: true }).where(eq(adoptionQuestions.id, questionId));
  revalidatePath("/admin", "layout");
}

export async function markReviewed(sightingId: number) {
  await requireAdmin();
  await db.update(sightings).set({ reviewed: true }).where(eq(sightings.id, sightingId));
  revalidatePath("/admin", "layout");
}

export async function linkTag(code: string, form: FormData) {
  await requireAdmin();
  const dogId = Number(form.get("dogId"));
  if (!Number.isInteger(dogId) || dogId <= 0) return;
  await db
    .update(tags)
    .set({ dogId, assignedAt: new Date(), retired: false })
    .where(eq(tags.code, normalizeCode(code)));
  redirect(savedUrl(dogId));
}

export async function retireTag(code: string) {
  await requireAdmin();
  const [t] = await db
    .update(tags)
    .set({ retired: true })
    .where(eq(tags.code, normalizeCode(code)))
    .returning({ dogId: tags.dogId });
  revalidatePath(t?.dogId ? `/admin/dogs/${t.dogId}` : "/admin/tags");
}

export async function createBatch(form: FormData) {
  await requireAdmin();
  const count = Math.min(500, Math.max(1, Number(form.get("count")) || 0));
  const batch =
    str(form, "name", 40).replace(/[^\w-]/g, "-") ||
    new Date().toISOString().slice(0, 10);
  const codes = new Set<string>();
  while (codes.size < count) codes.add(newCode());
  // A collision with an existing code is astronomically unlikely (31^5 ≈ 28M),
  // and onConflictDoNothing makes it harmless; top up if any were skipped.
  let inserted = (
    await db
      .insert(tags)
      .values([...codes].map((code) => ({ code, batch })))
      .onConflictDoNothing()
      .returning({ code: tags.code })
  ).length;
  while (inserted < count) {
    const r = await db.insert(tags).values({ code: newCode(), batch }).onConflictDoNothing().returning();
    inserted += r.length;
  }
  redirect(`/admin/tags/batch/${encodeURIComponent(batch)}`);
}
