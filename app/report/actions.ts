"use server";
import { adoptionQuestions, db, newDogReports, sightings } from "@/db";
import { getDog, getTag } from "@/lib/data";
import { savePhoto } from "@/lib/photos";
import { allow } from "@/lib/ratelimit";

const CONDITIONS = ["ok", "injured", "sick", "lost", "other"] as const;

function num(v: FormDataEntryValue | null) {
  const n = Number(v);
  return v !== null && v !== "" && Number.isFinite(n) ? n : null;
}

function reportFields(form: FormData) {
  const raw = form.get("condition");
  const place = String(form.get("place") ?? "").trim().slice(0, 200);
  const written = String(form.get("note") ?? "").trim();
  return {
    condition: CONDITIONS.find((c) => c === raw) ?? ("other" as const),
    note: [place && `Seen at ${place}`, written].filter(Boolean).join(" • ").slice(0, 2000),
    contact: String(form.get("contact") ?? "").slice(0, 200),
    lat: num(form.get("lat")),
    lng: num(form.get("lng")),
    accuracy: num(form.get("accuracy")),
  };
}

// The name of a spot, for the report form. The position is rounded to about
// 100 m first, and goes to OpenStreetMap from our server, not the person's phone.
export async function placeName(lat: number, lng: number, lang: "en" | "th"): Promise<string | null> {
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) return null;
  if (!(await allow("place", 30, 600))) return null;
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&zoom=17&lat=${lat.toFixed(3)}&lon=${lng.toFixed(3)}&accept-language=${lang === "th" ? "th" : "en"}`;
    const res = await fetch(url, {
      headers: { "User-Agent": "PaiDogs/1.0 (https://paidogs.vercel.app)" },
      signal: AbortSignal.timeout(4000),
    });
    if (!res.ok) return null;
    const { address: a } = (await res.json()) as { address?: Record<string, string> };
    if (!a) return null;
    const area = a.neighbourhood ?? a.suburb ?? a.village ?? a.town ?? a.city;
    return [a.road, area].filter(Boolean).join(", ") || null;
  } catch {
    return null;
  }
}

export type ReportState = { ok: boolean; error?: "rate" | "upload" | "failed" };

// A report about a dog already in the records.
export async function submitReport(
  dogId: number,
  rawTag: string | undefined,
  _prev: ReportState,
  form: FormData,
): Promise<ReportState> {
  if (form.get("website")) return { ok: true }; // honeypot: bots fill every field
  if (!(await allow("report", 6, 600))) return { ok: false, error: "rate" };

  const dog = await getDog(dogId);
  if (!dog) return { ok: false, error: "failed" };

  let photoId: number | null = null;
  try {
    photoId = await savePhoto(form.get("photo"));
  } catch {
    return { ok: false, error: "upload" };
  }

  const fields = reportFields(form);
  const row = rawTag ? await getTag(rawTag) : null;
  await db.insert(sightings).values({
    ...fields,
    dogId,
    tagCode: row?.tag.dogId === dogId && !row.tag.retired ? row.tag.code : null,
    source: "public",
    photoId,
    // Plain "looks fine" sightings with no note don't need a volunteer to look.
    reviewed: fields.condition === "ok" && !fields.note,
  });
  return { ok: true };
}

// A report where the person doesn't know which dog it is. Volunteers add it as
// a new dog or match it to one in the records.
export async function submitNewReport(_prev: ReportState, form: FormData): Promise<ReportState> {
  if (form.get("website")) return { ok: true }; // honeypot
  if (!(await allow("newdog", 5, 3600))) return { ok: false, error: "rate" };

  let photoId: number | null = null;
  try {
    photoId = await savePhoto(form.get("photo"));
  } catch {
    return { ok: false, error: "upload" };
  }

  await db.insert(newDogReports).values({ ...reportFields(form), photoId });
  return { ok: true };
}

export async function submitAdoptionQuestion(dogId: number, _prev: ReportState, form: FormData): Promise<ReportState> {
  if (form.get("website")) return { ok: true }; // honeypot
  const contact = String(form.get("contact") ?? "").trim().slice(0, 200);
  if (!contact) return { ok: false, error: "failed" };
  if (!(await allow("adopt", 5, 3600))) return { ok: false, error: "rate" };

  const dog = await getDog(dogId);
  if (dog?.homeStatus !== "ask_adoption") return { ok: false, error: "failed" };

  await db.insert(adoptionQuestions).values({
    dogId,
    contact,
    note: String(form.get("note") ?? "").slice(0, 2000),
  });
  return { ok: true };
}
