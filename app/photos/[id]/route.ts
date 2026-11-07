import { eq } from "drizzle-orm";
import { db, photos } from "@/db";

export async function GET(_req: Request, ctx: RouteContext<"/photos/[id]">) {
  const id = Number((await ctx.params).id);
  if (!Number.isInteger(id)) return new Response("Not found", { status: 404 });
  const [p] = await db.select().from(photos).where(eq(photos.id, id));
  if (!p) return new Response("Not found", { status: 404 });
  return new Response(new Uint8Array(p.data), {
    headers: {
      "content-type": p.mime,
      // Photos never change once stored (a new photo gets a new id).
      "cache-control": "public, max-age=31536000, immutable",
    },
  });
}
