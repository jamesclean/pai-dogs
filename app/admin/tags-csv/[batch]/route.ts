import { asc, eq } from "drizzle-orm";
import { db, tags } from "@/db";
import { isAdmin } from "@/lib/auth";
import { tagUrl } from "@/lib/qr";
import { config } from "@/lib/config";

// Most engraving shops take a CSV and generate the QR in their own software.
// svg_url points at a ready-made vector if they'd rather import files.
export async function GET(_req: Request, ctx: RouteContext<"/admin/tags-csv/[batch]">) {
  if (!(await isAdmin())) return new Response("Unauthorized", { status: 401 });
  const batch = decodeURIComponent((await ctx.params).batch);
  const list = await db.select().from(tags).where(eq(tags.batch, batch)).orderBy(asc(tags.code));
  const rows = [
    "code,qr_content,svg_url",
    ...list.map((t) => `${t.code},${tagUrl(t.code)},${config.siteUrl}/qr/${t.code}.svg`),
  ];
  return new Response(rows.join("\n") + "\n", {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="tags-${batch.replace(/[^\w-]/g, "_")}.csv"`,
    },
  });
}
