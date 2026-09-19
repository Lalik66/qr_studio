ALTER TABLE "qr_code" ADD COLUMN "ssid" text;--> statement-breakpoint
ALTER TABLE "qr_code" ADD COLUMN "wifi_password" text;--> statement-breakpoint
ALTER TABLE "qr_code" ADD COLUMN "wifi_encryption" text;--> statement-breakpoint
ALTER TABLE "qr_code" ADD COLUMN "wifi_hidden" boolean;