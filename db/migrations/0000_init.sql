CREATE TABLE "dogs" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"sex" text DEFAULT 'unknown' NOT NULL,
	"description" text DEFAULT '' NOT NULL,
	"temperament" text DEFAULT 'friendly' NOT NULL,
	"status" text DEFAULT 'community' NOT NULL,
	"area" text DEFAULT '' NOT NULL,
	"home_lat" double precision,
	"home_lng" double precision,
	"caretaker_name" text DEFAULT '' NOT NULL,
	"caretaker_line" text DEFAULT '' NOT NULL,
	"caretaker_phone" text DEFAULT '' NOT NULL,
	"sterilized" boolean DEFAULT false NOT NULL,
	"sterilized_on" date,
	"rabies_vaccinated_on" date,
	"other_vaccines" text DEFAULT '' NOT NULL,
	"public_notes" text DEFAULT '' NOT NULL,
	"private_notes" text DEFAULT '' NOT NULL,
	"photo_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"data" "bytea" NOT NULL,
	"mime" text DEFAULT 'image/jpeg' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sightings" (
	"id" serial PRIMARY KEY NOT NULL,
	"dog_id" integer NOT NULL,
	"tag_code" text,
	"source" text DEFAULT 'public' NOT NULL,
	"condition" text DEFAULT 'ok' NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"contact" text DEFAULT '' NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"accuracy" double precision,
	"photo_id" integer,
	"reviewed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "tags" (
	"code" text PRIMARY KEY NOT NULL,
	"batch" text NOT NULL,
	"dog_id" integer,
	"retired" boolean DEFAULT false NOT NULL,
	"assigned_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dogs" ADD CONSTRAINT "dogs_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sightings" ADD CONSTRAINT "sightings_dog_id_dogs_id_fk" FOREIGN KEY ("dog_id") REFERENCES "public"."dogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sightings" ADD CONSTRAINT "sightings_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "tags" ADD CONSTRAINT "tags_dog_id_dogs_id_fk" FOREIGN KEY ("dog_id") REFERENCES "public"."dogs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "sightings_dog_idx" ON "sightings" USING btree ("dog_id","created_at");--> statement-breakpoint
CREATE INDEX "tags_dog_idx" ON "tags" USING btree ("dog_id");--> statement-breakpoint
CREATE INDEX "tags_batch_idx" ON "tags" USING btree ("batch");