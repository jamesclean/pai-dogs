export const config = {
  siteUrl: (process.env.SITE_URL ?? "http://localhost:3000").replace(/\/$/, ""),
  programName: process.env.PROGRAM_NAME ?? "Pai Dogs",
  contactLine: process.env.CONTACT_LINE ?? "",
  contactPhone: process.env.CONTACT_PHONE ?? "",
  vetName: process.env.VET_NAME ?? "Dr. Karuna",
  vetPhone: process.env.VET_PHONE ?? "0804111985",
};

export type Vet = { name: string; phone: string };

export const vet: Vet = { name: config.vetName, phone: config.vetPhone };

export function fmtPhone(phone: string) {
  return phone.replace(/^(\d{3})(\d{3})(\d{4})$/, "$1 $2 $3");
}

export function lineUrl(id: string) {
  const clean = id.trim().replace(/^@/, "");
  // Official accounts start with @, personal IDs use the ~ form.
  return id.trim().startsWith("@")
    ? `https://line.me/R/ti/p/@${clean}`
    : `https://line.me/ti/p/~${clean}`;
}
