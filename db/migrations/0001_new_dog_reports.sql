CREATE TABLE "new_dog_reports" (
	"id" serial PRIMARY KEY NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"contact" text DEFAULT '' NOT NULL,
	"lat" double precision,
	"lng" double precision,
	"accuracy" double precision,
	"photo_id" integer,
	"reviewed" boolean DEFAULT false NOT NULL,
	"dog_id" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "new_dog_reports" ADD CONSTRAINT "new_dog_reports_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "new_dog_reports" ADD CONSTRAINT "new_dog_reports_dog_id_dogs_id_fk" FOREIGN KEY ("dog_id") REFERENCES "public"."dogs"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "new_dog_reports_reviewed_idx" ON "new_dog_reports" USING btree ("reviewed","created_at");