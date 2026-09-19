// Shared, client- and server-safe logic for turning a QR code's stored fields
// into the string that gets encoded, plus a human-readable version of the same
// data. Both the form preview/tooltip (client), the dashboard list (client) and
// the download route (server) derive from this one source, so the encoded QR
// and everything shown about it can never drift apart.
//
// This module must stay free of server-only imports — it runs in the browser.

export const qrTypes = ["link", "phone", "contact", "wifi"] as const;
export type QrType = (typeof qrTypes)[number];

export const defaultQrType: QrType = "link";

/** Narrow an untrusted value to a supported QR type, falling back to "link". */
export function resolveQrType(value: string | null | undefined): QrType {
  return (qrTypes as readonly string[]).includes(value ?? "")
    ? (value as QrType)
    : defaultQrType;
}

// The WiFi encryption tokens, stored and encoded exactly as the WiFi QR spec
// expects: WPA covers WPA/WPA2, WEP is legacy, nopass is an open network.
export const wifiEncryptions = ["WPA", "WEP", "nopass"] as const;
export type WifiEncryption = (typeof wifiEncryptions)[number];

export const defaultWifiEncryption: WifiEncryption = "WPA";

/** Narrow an untrusted value to a supported encryption, falling back to WPA. */
export function resolveWifiEncryption(
  value: string | null | undefined,
): WifiEncryption {
  return (wifiEncryptions as readonly string[]).includes(value ?? "")
    ? (value as WifiEncryption)
    : defaultWifiEncryption;
}

/** The fields, in one place, that every content builder reads. */
export type QrContentFields = {
  type: QrType;
  destinationUrl: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  org: string | null;
  ssid: string | null;
  wifiPassword: string | null;
  wifiEncryption: string | null;
  wifiHidden: boolean | null;
};

/** Strip whitespace from a phone number so `tel:`/`TEL` values dial cleanly. */
export function sanitizePhone(phone: string): string {
  return phone.replace(/\s+/g, "");
}

/** Escape a value for safe inclusion in a vCard field (RFC 6350 §3.4). */
function escapeVCard(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\n/g, "\\n")
    .replace(/,/g, "\\,")
    .replace(/;/g, "\\;");
}

/**
 * Build a vCard 3.0 string. Required identity lines (N/FN/TEL) are always
 * present; EMAIL and ORG are omitted when empty so scanners don't offer blank
 * fields. Lines are joined with CRLF as the vCard spec expects.
 */
function buildVCard(fields: QrContentFields): string {
  const firstName = (fields.firstName ?? "").trim();
  const lastName = (fields.lastName ?? "").trim();
  const phone = sanitizePhone((fields.phone ?? "").trim());
  const email = (fields.email ?? "").trim();
  const org = (fields.org ?? "").trim();

  const fullName = [firstName, lastName].filter(Boolean).join(" ");

  const lines = [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `N:${escapeVCard(lastName)};${escapeVCard(firstName)}`,
    `FN:${escapeVCard(fullName)}`,
    `TEL:${phone}`,
  ];
  if (email) lines.push(`EMAIL:${escapeVCard(email)}`);
  if (org) lines.push(`ORG:${escapeVCard(org)}`);
  lines.push("END:VCARD");

  return lines.join("\r\n");
}

/**
 * Escape a value for a WiFi QR field: a backslash, semicolon, comma, colon and
 * double-quote must each be prefixed with a backslash (WiFi QR spec), so the
 * value can't break out of the `KEY:value;` structure.
 */
function escapeWifi(value: string): string {
  return value.replace(/([\\;,":])/g, "\\$1");
}

/**
 * Build a `WIFI:...;;` string a phone reads to auto-join a network:
 *   WIFI:T:<encryption>;S:<ssid>;P:<password>;H:true;;
 * For an open network (nopass) the password is omitted entirely. `H:true` is
 * only added when the network is hidden; otherwise it's left out.
 */
function buildWifi(fields: QrContentFields): string {
  const enc = resolveWifiEncryption(fields.wifiEncryption);
  const ssid = escapeWifi((fields.ssid ?? "").trim());
  // Hidden networks flag it; visible ones omit H entirely.
  const hidden = fields.wifiHidden ? "H:true;" : "";
  if (enc === "nopass") {
    return `WIFI:T:nopass;S:${ssid};${hidden};`;
  }
  // Passwords may legitimately contain leading/trailing spaces, so don't trim.
  const password = escapeWifi(fields.wifiPassword ?? "");
  return `WIFI:T:${enc};S:${ssid};P:${password};${hidden};`;
}

/**
 * Build the string encoded into the QR code for the selected type:
 * - link:    the destination URL as-is
 * - phone:   `tel:<number>` so scanning opens the dialer
 * - contact: a vCard 3.0 string so scanning offers "Save contact"
 * - wifi:    a `WIFI:...;;` string so scanning offers to join the network
 */
export function buildQrContent(fields: QrContentFields): string {
  switch (fields.type) {
    case "phone":
      return `tel:${sanitizePhone((fields.phone ?? "").trim())}`;
    case "contact":
      return buildVCard(fields);
    case "wifi":
      return buildWifi(fields);
    case "link":
    default:
      return fields.destinationUrl.trim();
  }
}

/** Translated labels the readable builder needs, supplied by the caller. */
export type ReadableLabels = {
  call: string; // e.g. "Call:" / "Zəng et:"
  saveContact: string; // e.g. "Save contact" / "Əlaqə saxla"
  wifi: string; // e.g. "WiFi:" / "WiFi:"
};

/**
 * A human-readable rendering of the same data shown in the hover/focus tooltip
 * and the dashboard list. Returns an empty string when there's nothing to show
 * yet, so callers can fall back to a placeholder.
 */
export function buildReadableContent(
  fields: QrContentFields,
  labels: ReadableLabels,
): string {
  switch (fields.type) {
    case "phone": {
      const phone = (fields.phone ?? "").trim();
      return phone ? `${labels.call} ${phone}` : "";
    }
    case "contact": {
      const name = [fields.firstName ?? "", fields.lastName ?? ""]
        .map((v) => v.trim())
        .filter(Boolean)
        .join(" ");
      const parts = [name, (fields.phone ?? "").trim(), (fields.email ?? "").trim()].filter(
        Boolean,
      );
      return parts.length ? `${labels.saveContact}: ${parts.join(" — ")}` : "";
    }
    case "wifi": {
      // Never surface the password here — the tooltip/list only name the network.
      const ssid = (fields.ssid ?? "").trim();
      return ssid ? `${labels.wifi} ${ssid}` : "";
    }
    case "link":
    default:
      return fields.destinationUrl.trim();
  }
}
