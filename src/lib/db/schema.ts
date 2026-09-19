import { pgTable, uuid, text, integer, boolean, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const qrCode = pgTable(
  "qr_code",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    // What the QR encodes: "link" | "phone" | "contact". Existing rows are links.
    type: text("type").notNull().default("link"),
    // Link content. Empty string for phone/contact codes.
    destinationUrl: text("destination_url").notNull(),
    // Phone content, and the contact's number for the "contact" type.
    phone: text("phone"),
    // Contact content ("contact" type only).
    firstName: text("first_name"),
    lastName: text("last_name"),
    email: text("email"),
    org: text("org"),
    // WiFi content ("wifi" type only). Nullable so existing rows are unaffected.
    // The network name; the password (blank/omitted for open networks); the
    // encryption token stored as it's encoded ("WPA" | "WEP" | "nopass"); and
    // whether the network is hidden.
    ssid: text("ssid"),
    wifiPassword: text("wifi_password"),
    wifiEncryption: text("wifi_encryption"),
    wifiHidden: boolean("wifi_hidden"),
    foregroundColor: text("foreground_color").notNull().default("#000000"),
    backgroundColor: text("background_color").notNull().default("#FFFFFF"),
    size: integer("size").notNull().default(512),
    logoUrl: text("logo_url"),
    logoPath: text("logo_path"),
    // Optional decorative frame + "Scan me" caption drawn OUTSIDE the QR and its
    // quiet zone. Purely visual output styling stored per code (like the content
    // colours) — it never changes what the QR encodes. Default off, so existing
    // codes keep their plain output.
    frameEnabled: boolean("frame_enabled").notNull().default(false),
    // "border" | "card" | "banner"
    frameStyle: text("frame_style").notNull().default("border"),
    frameCaption: text("frame_caption").notNull().default(""),
    // "top" | "bottom"
    frameCaptionPosition: text("frame_caption_position").notNull().default("bottom"),
    frameColor: text("frame_color").notNull().default("#5B5FE9"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at")
      .notNull()
      .defaultNow()
      .$onUpdate(() => new Date()),
  },
  (t) => [
    // Serves the dashboard's owner-scoped list ordered by newest first.
    index("qr_code_user_id_created_at_idx").on(t.userId, t.createdAt.desc()),
  ],
);

export const emailLog = pgTable(
  "email_log",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    to: text("to").notNull(),
    subject: text("subject").notNull(),
    template: text("template").notNull(),
    status: text("status").notNull(), // pending | logged | sent | delivered | bounced | complained | failed
    providerId: text("provider_id"),
    error: text("error"),
    createdAt: timestamp("created_at").notNull().defaultNow(),
    updatedAt: timestamp("updated_at").notNull().defaultNow(),
  },
  (t) => [index("email_log_created_at_idx").on(t.createdAt.desc())],
);

export * from "./auth-schema";
