import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { user as userTable, qrCode } from "@/lib/db/schema";
import { sendEmail } from "@/lib/email";
import { deleteFile } from "@/lib/storage";
import { siteUrl } from "@/lib/site";
import VerifyEmail from "@/emails/verify-email";
import ResetPassword from "@/emails/reset-password";

export const auth = betterAuth({
  appName: "QR Studio",
  // Pin the origin explicitly so CSRF/origin validation and email links do not
  // depend on Better Auth inferring the base URL from request headers.
  baseURL: siteUrl,
  trustedOrigins: [siteUrl],
  database: drizzleAdapter(db, { provider: "pg" }),
  emailAndPassword: {
    enabled: true,
    sendResetPassword: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Reset your QR Studio password",
        react: ResetPassword({ url, name: user.name }),
        template: "reset-password",
      });
    },
  },
  emailVerification: {
    sendOnSignUp: true,
    autoSignInAfterVerification: true,
    sendVerificationEmail: async ({ user, url }) => {
      await sendEmail({
        to: user.email,
        subject: "Confirm your email address",
        react: VerifyEmail({ url, name: user.name }),
        template: "verify-email",
      });
    },
  },
  session: {
    // Require a fresh session for sensitive actions (change password, delete
    // account) without forcing an immediate re-login prompt in this app.
    freshAge: 0,
  },
  user: {
    additionalFields: {
      // The first account to sign up becomes the admin; everyone else is a
      // regular user. Set server-side only — never accepted from client input.
      role: {
        type: "string",
        required: false,
        defaultValue: "user",
        input: false,
      },
    },
    deleteUser: {
      enabled: true,
      // Remove the user's stored logo files before their rows cascade away.
      beforeDelete: async (user) => {
        const rows = await db
          .select({ logoPath: qrCode.logoPath })
          .from(qrCode)
          .where(eq(qrCode.userId, user.id));
        for (const row of rows) {
          if (row.logoPath) {
            try {
              await deleteFile(row.logoPath);
            } catch {
              // A missing logo file must not block account deletion.
            }
          }
        }
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        before: async (user) => {
          const [{ count }] = await db
            .select({ count: sql<number>`count(*)::int` })
            .from(userTable);
          return {
            data: { ...user, role: count === 0 ? "admin" : "user" },
          };
        },
      },
    },
  },
});
