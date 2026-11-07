export const config = {
  siteUrl: (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  programName: process.env.PROGRAM_NAME ?? "Pai Dogs",
  contactLine: process.env.CONTACT_LINE ?? "",
  contactPhone: process.env.CONTACT_PHONE ?? "",
};

export function lineUrl(id: string) {
  const clean = id.trim().replace(/^@/, "");
  // Official accounts start with @, personal IDs use the ~ form.
  return id.trim().startsWith("@")
    ? `https://line.me/R/ti/p/@${clean}`
    : `https://line.me/ti/p/~${clean}`;
}
