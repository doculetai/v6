ALTER TABLE "schools" ADD COLUMN "city" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "state" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "zip" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "website_url" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "accreditor" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "student_size" integer;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "institution_type" text;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "scorecard_id" integer;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "out_of_state_tuition" integer;--> statement-breakpoint
ALTER TABLE "schools" ADD COLUMN "data_source" text DEFAULT 'manual' NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "schools_scorecard_id_unique_idx" ON "schools" USING btree ("scorecard_id");--> statement-breakpoint
CREATE INDEX "schools_country_idx" ON "schools" USING btree ("country");--> statement-breakpoint
CREATE INDEX "schools_state_idx" ON "schools" USING btree ("state");