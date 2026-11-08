"use server";
import { and, desc, eq, gt } from "drizzle-orm";
import { db, sightings } from "@/db";
import { getTag } from "@/lib/data";
import { allow } from "@/lib/ratelimit";

// A scan with a shared location becomes a quiet sighting: no inbox item, no
// alert, just a point on the volunteers' map.
export async function logScan(code: string, lat: number, lng: number, accuracy: number) {
  if (![lat, lng, accuracy].every(Number.isFinite)) return;
  if (Math.abs(lat) > 90 || Math.abs(lng) > 180) return;
  const row = await getTag(code);
  if (!row?.dog || row.tag.retired) return;
  if (!(await allow("scan", 30, 3600))) return;

  // One scan per dog every 5 minutes is plenty, and stops refresh spam.
  const [recent] = await db
    .select({ id: sightings.id })
    .from(sightings)
    .where(
      and(
        eq(sightings.dogId, row.dog.id),
        eq(sightings.source, "scan"),
        gt(sightings.createdAt, new Date(Date.now() - 5 * 60_000)),
      ),
    )
    .orderBy(desc(sightings.createdAt))
    .limit(1);
  if (recent) return;

  await db.insert(sightings).values({
    dogId: row.dog.id,
    tagCode: row.tag.code,
    source: "scan",
    condition: "ok",
    lat,
    lng,
    accuracy,
    reviewed: true,
  });
}
