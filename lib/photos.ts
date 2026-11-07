import "server-only";
import { db, photos } from "@/db";

const MAX_BYTES = 3 * 1024 * 1024;

// Expects the browser to have already resized the image (see PhotoInput).
export async function savePhoto(file: FormDataEntryValue | null) {
  if (!(file instanceof File) || file.size === 0) return null;
  if (!file.type.startsWith("image/")) throw new Error("Not an image");
  if (file.size > MAX_BYTES) throw new Error("Photo too large");
  const data = Buffer.from(await file.arrayBuffer());
  const [row] = await db.insert(photos).values({ data, mime: file.type }).returning({ id: photos.id });
  return row.id;
}
