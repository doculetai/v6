CREATE INDEX "agent_commissions_agent_status_idx" ON "agent_commissions" USING btree ("agent_id","status");--> statement-breakpoint
CREATE INDEX "documents_user_status_idx" ON "documents" USING btree ("user_id","status");--> statement-breakpoint
CREATE INDEX "documents_expires_at_idx" ON "documents" USING btree ("expires_at");--> statement-breakpoint
CREATE INDEX "profiles_role_idx" ON "profiles" USING btree ("role");--> statement-breakpoint
CREATE INDEX "sponsorships_student_status_idx" ON "sponsorships" USING btree ("student_id","status");--> statement-breakpoint
CREATE INDEX "sponsorships_sponsor_status_idx" ON "sponsorships" USING btree ("sponsor_id","status");--> statement-breakpoint
CREATE INDEX "partner_api_keys_partner_id_idx" ON "partner_api_keys" USING btree ("partner_id");--> statement-breakpoint
CREATE UNIQUE INDEX "university_profiles_school_id_unique" ON "university_profiles" USING btree ("school_id") WHERE "university_profiles"."school_id" IS NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "notification_preferences_user_channel_idx" ON "notification_preferences" USING btree ("user_id","channel");--> statement-breakpoint
CREATE INDEX "notifications_user_id_idx" ON "notifications" USING btree ("user_id");--> statement-breakpoint
CREATE INDEX "notifications_read_at_idx" ON "notifications" USING btree ("read_at");