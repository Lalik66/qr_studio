ALTER TABLE "qr_code" ADD COLUMN "frame_enabled" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "qr_code" ADD COLUMN "frame_style" text DEFAULT 'border' NOT NULL;--> statement-breakpoint
ALTER TABLE "qr_code" ADD COLUMN "frame_caption" text DEFAULT '' NOT NULL;--> statement-breakpoint
ALTER TABLE "qr_code" ADD COLUMN "frame_caption_position" text DEFAULT 'bottom' NOT NULL;--> statement-breakpoint
ALTER TABLE "qr_code" ADD COLUMN "frame_color" text DEFAULT '#5B5FE9' NOT NULL;