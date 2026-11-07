import { qrSvg } from "@/lib/qr";
import { normalizeCode } from "@/lib/codes";

// Vector QR for one tag, for engravers who want one file per code.
export async function GET(_req: Request, ctx: RouteContext<"/qr/[code]">) {
  const code = normalizeCode((await ctx.params).code.replace(/\.svg$/i, ""));
  const svg = await qrSvg(code, 0);
  return new Response(svg, { headers: { "content-type": "image/svg+xml" } });
}
