ALTER TABLE "qr_code" ADD COLUMN "logo_path" text;--> statement-breakpoint
ALTER TABLE "user" ADD COLUMN "role" text DEFAULT 'user' NOT NULL;