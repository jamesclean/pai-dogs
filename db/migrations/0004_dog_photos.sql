CREATE TABLE "dog_photos" (
	"id" serial PRIMARY KEY NOT NULL,
	"dog_id" integer NOT NULL,
	"photo_id" integer NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dog_photos" ADD CONSTRAINT "dog_photos_dog_id_dogs_id_fk" FOREIGN KEY ("dog_id") REFERENCES "public"."dogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dog_photos" ADD CONSTRAINT "dog_photos_photo_id_photos_id_fk" FOREIGN KEY ("photo_id") REFERENCES "public"."photos"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "dog_photos_dog_photo_idx" ON "dog_photos" USING btree ("dog_id","photo_id");--> statement-breakpoint
INSERT INTO "dog_photos" ("dog_id", "photo_id") SELECT "id", "photo_id" FROM "dogs" WHERE "photo_id" IS NOT NULL;
--> statement-breakpoint
ALTER TABLE "dog_photos" ENABLE ROW LEVEL SECURITY;
