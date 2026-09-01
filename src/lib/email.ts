import "server-only";
import { randomUUID } from "crypto";
import { Resend } from "resend";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { emailLog } from "@/lib/db/schema";

const apiKey = process.env.RESEND_API_KEY;

const resend = apiKey ? new Resend(apiKey) : null;
const from = process.env.EMAIL_FROM ?? "QR Studio <onboarding@resend.dev>";

type SendArgs = {
  to: string;
  subject: string;
  react: React.ReactNode;
  template: string;
};

/** Update a log row's status, swallowing errors so logging never breaks a flow. */
async function markEmailLog(
  id: string,
  values: Partial<typeof emailLog.$inferInsert>,
): Promise<void> {
  try {
    await db.update(emailLog).set(values).where(eq(emailLog.id, id));
  } catch (err) {
    console.warn("Failed to update email log", err);
  }
}

/** The only place that talks to Resend. Logs every message first, sends second. */
export async function sendEmail({ to, subject, react, template }: SendArgs): Promise<{ id: string | null }> {
  // Logging is best-effort: a logging failure must never break sign-up / reset,
  // so a failed insert degrades to sending without a log row rather than throwing.
  let logId: string | null = null;
  try {
    const [row] = await db
      .insert(emailLog)
      .values({ to, subject, template, status: "pending" })
      .returning();
    logId = row.id;
  } catch (err) {
    console.warn("Failed to write email log", err);
  }

  if (!resend) {
    console.info(
      `\n[email] ${subject}\n[email] to: ${to}\n[email] not sent — RESEND_API_KEY is empty. Logged as ${logId ?? "(unlogged)"}.\n`,
    );
    if (logId) await markEmailLog(logId, { status: "logged" });
    return { id: logId };
  }

  try {
    const { data, error } = await resend.emails.send(
      { from, to, subject, react },
      { idempotencyKey: `${template}/${logId ?? randomUUID()}` },
    );

    if (logId) {
      await markEmailLog(
        logId,
        error
          ? { status: "failed", error: error.message }
          : { status: "sent", providerId: data?.id ?? null },
      );
    }
  } catch (err) {
    // Never let a transport failure reject the caller (e.g. sign-up); record it.
    const message = err instanceof Error ? err.message : "Unknown send error";
    if (logId) await markEmailLog(logId, { status: "failed", error: message });
  }

  return { id: logId };
}
