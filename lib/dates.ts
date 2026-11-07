export function daysSince(isoDate: string | null) {
  if (!isoDate) return null;
  return Math.floor((Date.now() - new Date(isoDate).getTime()) / 86_400_000);
}

// Thai guidance is yearly rabies boosters.
export function rabiesCurrent(isoDate: string | null) {
  const d = daysSince(isoDate);
  return d !== null && d <= 365;
}

export function fmtDate(d: string | Date | null, lang: "en" | "th" = "en") {
  if (!d) return "—";
  return new Date(d).toLocaleDateString(lang === "th" ? "th-TH" : "en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Bangkok",
  });
}

export function fmtDateTime(d: Date, lang: "en" | "th" = "en") {
  return d.toLocaleString(lang === "th" ? "th-TH" : "en-GB", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Bangkok",
  });
}
