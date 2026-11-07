import "server-only";
import { createHash } from "node:crypto";
import { headers } from "next/headers";
import { and, count, eq, gt, lt } from "drizzle-orm";
import { db, rateHits } from "@/db";

// Allows `max` hits per `windowSec` for one bucket and one visitor. The
// visitor is a salted hash of their IP, so no IP address is stored.
export async function allow(bucket: string, max: number, windowSec: number) {
  const h = await headers();
  const ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim();
  const key = createHash("sha256")
    .update(`${process.env.SESSION_SECRET ?? ""}:${bucket}:${ip}`)
    .digest("base64url");
  const [{ n }] = await db
    .select({ n: count() })
    .from(rateHits)
    .where(and(eq(rateHits.key, key), gt(rateHits.at, new Date(Date.now() - windowSec * 1000))));
  if (n >= max) return false;
  await db.insert(rateHits).values({ key });
  // Now and then, clear out anything older than a day.
  if (Math.random() < 0.02) await db.delete(rateHits).where(lt(rateHits.at, new Date(Date.now() - 86_400_000)));
  return true;
}
