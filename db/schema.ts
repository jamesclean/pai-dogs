import {
  pgTable,
  serial,
  text,
  integer,
  boolean,
  date,
  timestamp,
  doublePrecision,
  customType,
  index,
} from "drizzle-orm/pg-core";

const bytea = customType<{ data: Buffer }>({
  dataType: () => "bytea",
});

// Photos live in Postgres. They're resized in the browser to ~1280px JPEG
// (~150 KB), so a free 500 MB database holds a few thousand.
export const photos = pgTable("photos", {
  id: serial("id").primaryKey(),
  data: bytea("data").notNull(),
  mime: text("mime").notNull().default("image/jpeg"),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
});

export const dogs = pgTable("dogs", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  sex: text("sex", { enum: ["male", "female", "unknown"] }).notNull().default("unknown"),
  description: text("description").notNull().default(""), // colour, markings, size
  temperament: text("temperament", { enum: ["friendly", "shy", "careful"] })
    .notNull()
    .default("friendly"),
  status: text("status", { enum: ["community", "missing", "adopted", "deceased"] })
    .notNull()
    .default("community"),
  area: text("area").notNull().default(""), // e.g. "Walking Street, near 7-Eleven"
  homeLat: doublePrecision("home_lat"),
  homeLng: doublePrecision("home_lng"),
  caretakerName: text("caretaker_name").notNull().default(""),
  caretakerLine: text("caretaker_line").notNull().default(""), // public
  caretakerPhone: text("caretaker_phone").notNull().default(""), // admin only
  sterilized: boolean("sterilized").notNull().default(false),
  sterilizedOn: date("sterilized_on"),
  rabiesVaccinatedOn: date("rabies_vaccinated_on"),
  otherVaccines: text("other_vaccines").notNull().default(""),
  publicNotes: text("public_notes").notNull().default(""),
  privateNotes: text("private_notes").notNull().default(""),
  photoId: integer("photo_id").references(() => photos.id, { onDelete: "set null" }),
  createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
});

// A tag is a physical engraved QR tag. Tags are made in batches before any dog
// exists, then linked to a dog when collared. A dog can collect several tags
// over its life (lost collar, replacement).
export const tags = pgTable(
  "tags",
  {
    code: text("code").primaryKey(),
    batch: text("batch").notNull(),
    dogId: integer("dog_id").references(() => dogs.id, { onDelete: "set null" }),
    retired: boolean("retired").notNull().default(false),
    assignedAt: timestamp("assigned_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("tags_dog_idx").on(t.dogId), index("tags_batch_idx").on(t.batch)],
);

export const sightings = pgTable(
  "sightings",
  {
    id: serial("id").primaryKey(),
    dogId: integer("dog_id")
      .notNull()
      .references(() => dogs.id, { onDelete: "cascade" }),
    tagCode: text("tag_code"),
    // "scan" is a passive sighting: someone opened the tag page and shared their location.
    source: text("source", { enum: ["public", "volunteer", "scan"] }).notNull().default("public"),
    condition: text("condition", { enum: ["ok", "injured", "sick", "lost", "other"] })
      .notNull()
      .default("ok"),
    note: text("note").notNull().default(""),
    contact: text("contact").notNull().default(""),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    accuracy: doublePrecision("accuracy"),
    photoId: integer("photo_id").references(() => photos.id, { onDelete: "set null" }),
    reviewed: boolean("reviewed").notNull().default(false),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("sightings_dog_idx").on(t.dogId, t.createdAt)],
);

// A dog someone spotted without an orange collar. Volunteers turn these into
// dogs (dogId is set once they do).
export const newDogReports = pgTable(
  "new_dog_reports",
  {
    id: serial("id").primaryKey(),
    note: text("note").notNull().default(""),
    contact: text("contact").notNull().default(""),
    lat: doublePrecision("lat"),
    lng: doublePrecision("lng"),
    accuracy: doublePrecision("accuracy"),
    photoId: integer("photo_id").references(() => photos.id, { onDelete: "set null" }),
    reviewed: boolean("reviewed").notNull().default(false),
    dogId: integer("dog_id").references(() => dogs.id, { onDelete: "set null" }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("new_dog_reports_reviewed_idx").on(t.reviewed, t.createdAt)],
);

// One row per public submission, keyed by a salted hash of the IP (never the
// IP itself). Used to rate-limit reports, scans and sign-in attempts.
export const rateHits = pgTable(
  "rate_hits",
  {
    id: serial("id").primaryKey(),
    key: text("key").notNull(),
    at: timestamp("at", { withTimezone: true }).notNull().defaultNow(),
  },
  (t) => [index("rate_hits_key_idx").on(t.key, t.at)],
);

export type Dog = typeof dogs.$inferSelect;
export type NewDogReport = typeof newDogReports.$inferSelect;
export type Sighting = typeof sightings.$inferSelect;
export type Tag = typeof tags.$inferSelect;
