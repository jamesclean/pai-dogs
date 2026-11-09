// The three groups a dog can be in. Stored as `status` and `homeStatus`, shown as one switcher.
export const DOG_GROUPS = ["community", "home", "memory"] as const;
export type DogGroup = (typeof DOG_GROUPS)[number];

export function groupOf(dog: { status: string; homeStatus: string | null }): DogGroup {
  if (dog.status === "deceased") return "memory";
  return dog.homeStatus === "has_home" ? "home" : "community";
}

export const GROUP_LABELS: Record<DogGroup, string> = {
  community: "Street dog",
  home: "Family dog",
  memory: "In memory",
};
