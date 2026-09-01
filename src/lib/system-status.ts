import "server-only";

export interface SystemStatusItem {
  key: string;
  label: string;
  configured: boolean;
  detail: string;
}

/**
 * Returns an array of system configuration statuses WITHOUT leaking secret values.
 * Only booleans and safe public URLs are included.
 */
export function getSystemStatus(): SystemStatusItem[] {
  const resendConfigured = Boolean(process.env.RESEND_API_KEY);
  const blobConfigured = Boolean(process.env.BLOB_READ_WRITE_TOKEN);
  const authUrl = process.env.BETTER_AUTH_URL;
  const appUrl = process.env.APP_URL;

  return [
    {
      key: "email",
      label: "Email sending (Resend)",
      configured: resendConfigured,
      detail: resendConfigured
        ? "Emails are sent via Resend"
        : "Emails print to the server terminal (dev mode)",
    },
    {
      key: "storage",
      label: "Logo storage",
      configured: blobConfigured,
      detail: blobConfigured
        ? "Logos are stored in Vercel Blob"
        : "Logos are stored in public/uploads (local folder)",
    },
    {
      key: "auth-url",
      label: "Auth base URL",
      configured: Boolean(authUrl),
      detail: authUrl || "Not set",
    },
    {
      key: "app-url",
      label: "Public app URL",
      configured: Boolean(appUrl),
      detail: appUrl || "Not set",
    },
  ];
}

/**
 * Returns a summary of how many items are configured vs total.
 */
export function getSystemStatusSummary(): {
  configured: number;
  total: number;
} {
  const items = getSystemStatus();
  return {
    configured: items.filter((item) => item.configured).length,
    total: items.length,
  };
}
