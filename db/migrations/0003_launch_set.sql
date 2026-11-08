CREATE TABLE "adoption_questions" (
	"id" serial PRIMARY KEY NOT NULL,
	"dog_id" integer NOT NULL,
	"contact" text NOT NULL,
	"note" text DEFAULT '' NOT NULL,
	"reviewed" boolean DEFAULT false NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "dogs" ADD COLUMN "home_status" text;--> statement-breakpoint
ALTER TABLE "new_dog_reports" ADD COLUMN "condition" text DEFAULT 'ok' NOT NULL;--> statement-breakpoint
ALTER TABLE "adoption_questions" ADD CONSTRAINT "adoption_questions_dog_id_dogs_id_fk" FOREIGN KEY ("dog_id") REFERENCES "public"."dogs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "adoption_questions_reviewed_idx" ON "adoption_questions" USING btree ("reviewed","created_at");--> statement-breakpoint
UPDATE "dogs" SET "home_status" = 'has_home', "status" = 'community' WHERE "status" = 'adopted';
--> statement-breakpoint
ALTER TABLE "adoption_questions" ENABLE ROW LEVEL SECURITY;
