ALTER TABLE "qr_code" ADD COLUMN "type" text DEFAULT 'link' NOT NULL;--> statement-breakpoint
ALTER TABLE "qr_code" ADD COLUMN "phone" text;--> statement-breakpoint
ALTER TABLE "qr_code" ADD COLUMN "first_name" text;--> statement-breakpoint
ALTER TABLE "qr_code" ADD COLUMN "last_name" text;--> statement-breakpoint
ALTER TABLE "qr_code" ADD COLUMN "email" text;--> statement-breakpoint
ALTER TABLE "qr_code" ADD COLUMN "org" text;