// Crew-facing labels for a report's condition. "Looks fine" has no pill.
export const CONDITION: Record<string, [string, string] | null> = {
  ok: null,
  injured: ["Injured", "bg-bad-soft text-bad"],
  sick: ["Looks sick", "bg-bad-soft text-bad"],
  lost: ["Seems lost", "bg-warn-soft text-warn"],
  other: ["Other", "bg-fill text-label-2"],
};
