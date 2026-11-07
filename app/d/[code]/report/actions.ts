"use server";
import { db, sightings } from "@/db";
import { getTag } from "@/lib/data";
import { savePhoto } from "@/lib/photos";
import { notify } from "@/lib/notify";
import { config } from "@/lib/config";

const CONDITIONS = ["ok", "injured", "sick", "lost", "other"] as const;

function num(v: FormDataEntryValue | null) {
  const n = Number(v);
  return v !== null && v !== "" && Number.isFinite(n) ? n : null;
}

export type ReportState = { ok: boolean; error?: string };

export async function submitReport(code: string, _prev: ReportState, form: FormData): Promise<ReportState> {
  if (form.get("website")) return { ok: true }; // honeypot: bots fill every field

  const row = await getTag(code);
  if (!row?.dog) return { ok: false, error: "Unknown tag" };

  const condition = CONDITIONS.includes(form.get("condition") as never)
    ? (form.get("condition") as (typeof CONDITIONS)[number])
    : "other";
  const note = String(form.get("note") ?? "").slice(0, 2000);
  const contact = String(form.get("contact") ?? "").slice(0, 200);
  const lat = num(form.get("lat"));
  const lng = num(form.get("lng"));

  let photoId: number | null = null;
  try {
    photoId = await savePhoto(form.get("photo"));
  } catch {
    return { ok: false, error: "Photo upload failed" };
  }

  await db.insert(sightings).values({
    dogId: row.dog.id,
    tagCode: row.tag.code,
    source: "public",
    condition,
    note,
    contact,
    lat,
    lng,
    accuracy: num(form.get("accuracy")),
    photoId,
    // Plain "looks fine" sightings with no note don't need a volunteer to look.
    reviewed: condition === "ok" && !note,
  });

  const urgent = condition === "injured" || condition === "sick" || condition === "lost";
  await notify(
    [
      `${urgent ? "🚨" : "🐕"} ${row.dog.name} (${row.tag.code}) — ${condition}`,
      note && `“${note}”`,
      contact && `Contact: ${contact}`,
      lat !== null && `https://maps.google.com/?q=${lat},${lng}`,
      `${config.siteUrl}/admin/dogs/${row.dog.id}`,
    ]
      .filter(Boolean)
      .join("\n"),
  );

  return { ok: true };
}
