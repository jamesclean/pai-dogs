"use server";
import { db, newDogReports } from "@/db";
import { savePhoto } from "@/lib/photos";
import { notify } from "@/lib/notify";
import { config } from "@/lib/config";
import { allow } from "@/lib/ratelimit";

function num(v: FormDataEntryValue | null) {
  const n = Number(v);
  return v !== null && v !== "" && Number.isFinite(n) ? n : null;
}

export type AddState = { ok: boolean; error?: "photo" | "upload" | "rate" };

// Someone spotted a dog without an orange collar. Volunteers see it in their
// inbox and can turn it into a dog.
export async function submitNewDog(_prev: AddState, form: FormData): Promise<AddState> {
  if (form.get("website")) return { ok: true }; // honeypot
  if (!(await allow("newdog", 5, 3600))) return { ok: false, error: "rate" };

  const file = form.get("photo");
  if (!(file instanceof File) || file.size === 0) return { ok: false, error: "photo" };
  let photoId: number | null = null;
  try {
    photoId = await savePhoto(file);
  } catch {
    return { ok: false, error: "upload" };
  }

  const note = String(form.get("note") ?? "").slice(0, 2000);
  const contact = String(form.get("contact") ?? "").slice(0, 200);
  const lat = num(form.get("lat"));
  const lng = num(form.get("lng"));
  await db.insert(newDogReports).values({ note, contact, lat, lng, accuracy: num(form.get("accuracy")), photoId });

  await notify(
    [
      "📣 New dog without a collar",
      note && `“${note}”`,
      contact && `Contact: ${contact}`,
      lat !== null && `https://maps.google.com/?q=${lat},${lng}`,
      `${config.siteUrl}/admin`,
    ]
      .filter(Boolean)
      .join("\n"),
  );
  return { ok: true };
}
