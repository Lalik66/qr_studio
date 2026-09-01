import { pgTable, uuid, text, integer, timestamp, index } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

export const qrCode = pgTable(
  "qr_code",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    destinationUrl: text("destination_url").notNull(),
    foregroundColor: text("foreground_color").notNull().default("#000000"),
    backgroundColor: text("background_color").notNull().default("#FFFFFF"),
    size: integer("size").notNull().default(512),
    logoUrl: text("logo_url"),
    logoPath: text("logo_path"),
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
