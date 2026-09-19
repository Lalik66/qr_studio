"use server";

import { revalidatePath } from "next/cache";
import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { qrCode } from "@/lib/db/schema";
import { requireUser } from "@/lib/session";
import { deleteFile } from "@/lib/storage";
import { isSafeLogoRef } from "@/lib/qr";
import {
  resolveQrType,
  resolveWifiEncryption,
  type QrType,
  type WifiEncryption,
} from "@/lib/qr-content";
import {
  MAX_CAPTION_LENGTH,
  resolveCaptionPosition,
  resolveFrameStyle,
  type CaptionPosition,
  type FrameStyle,
} from "@/lib/qr-frame";

type ActionResult = { ok: true } | { ok: false; error: string };

type QrCodeInput = {
  title: string;
  type?: string;
  destinationUrl?: string;
  phone?: string | null;
  firstName?: string | null;
  lastName?: string | null;
  email?: string | null;
  org?: string | null;
  ssid?: string | null;
  wifiPassword?: string | null;
  wifiEncryption?: string | null;
  wifiHidden?: boolean | null;
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  logoUrl?: string | null;
  logoPath?: string | null;
  frameEnabled?: boolean;
  frameStyle?: string;
  frameCaption?: string;
  frameCaptionPosition?: string;
  frameColor?: string;
};

type ValidatedFields = {
  title: string;
  type: QrType;
  destinationUrl: string;
  phone: string | null;
  firstName: string | null;
  lastName: string | null;
  email: string | null;
  org: string | null;
  ssid: string | null;
  wifiPassword: string | null;
  wifiEncryption: WifiEncryption | null;
  wifiHidden: boolean | null;
  foregroundColor: string;
  backgroundColor: string;
  size: number;
  logoUrl: string | null;
  logoPath: string | null;
  frameEnabled: boolean;
  frameStyle: FrameStyle;
  frameCaption: string;
  frameCaptionPosition: CaptionPosition;
  frameColor: string;
};

function isValidHexColor(color: string): boolean {
  return /^#[0-9A-Fa-f]{6}$/.test(color);
}

function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeSize(size: number): number {
  if (size === 256 || size === 512 || size === 1024) {
    return size;
  }
  return 512;
}

// A stored logo filename is always a UUID-shaped ".png" produced by the upload
// route; anything else is rejected.
const SAFE_LOGO_FILE = /^[A-Za-z0-9_-]+\.png$/;

/**
 * A logo pair (storage key + browser URL) is only accepted if it lives under
 * the *current user's* own logo folder. Uploads are keyed `logos/<userId>/…`,
 * so this both closes the IDOR/traversal path (a user can never reference — and
 * therefore never delete — another user's file) and confirms the URL matches
 * the key it claims to be. `logoPath` is never trusted from the client without
 * this check.
 */
function isOwnedLogo(
  logoPath: string,
  logoUrl: string,
  userId: string,
): boolean {
  const prefix = `logos/${userId}/`;
  if (!logoPath.startsWith(prefix)) return false;
  if (!SAFE_LOGO_FILE.test(logoPath.slice(prefix.length))) return false;
  if (!isSafeLogoRef(logoUrl)) return false;

  // The URL must resolve to exactly this key (local path or Blob URL).
  if (logoUrl === `/uploads/${logoPath}`) return true;
  try {
    return new URL(logoUrl).pathname === `/${logoPath}`;
  } catch {
    return false;
  }
}

/**
 * Validate and normalize the shared fields for create/update. Rejects invalid
 * input with a plain, actionable message instead of silently coercing it, and
 * refuses any logo reference that does not point at the caller's own storage.
 */
function validateInput(
  input: QrCodeInput,
  userId: string,
): { ok: true; data: ValidatedFields } | { ok: false; error: string } {
  const title = input.title?.trim();
  if (!title) {
    return { ok: false, error: "Title is required" };
  }

  // Content depends on the type. Only the fields relevant to the chosen type
  // are validated and stored; the rest are cleared so a code never carries
  // stale content from a type the user switched away from.
  const type = resolveQrType(input.type);
  let destinationUrl = "";
  let phone: string | null = null;
  let firstName: string | null = null;
  let lastName: string | null = null;
  let email: string | null = null;
  let org: string | null = null;
  let ssid: string | null = null;
  let wifiPassword: string | null = null;
  let wifiEncryption: WifiEncryption | null = null;
  let wifiHidden: boolean | null = null;

  if (type === "link") {
    destinationUrl = input.destinationUrl?.trim() ?? "";
    if (!isValidUrl(destinationUrl)) {
      return { ok: false, error: "Enter a valid URL starting with http:// or https://" };
    }
  } else if (type === "phone") {
    phone = input.phone?.trim() ?? "";
    if (!phone) {
      return { ok: false, error: "Enter a phone number" };
    }
  } else if (type === "wifi") {
    ssid = input.ssid?.trim() ?? "";
    wifiEncryption = resolveWifiEncryption(input.wifiEncryption);
    wifiHidden = input.wifiHidden === true;
    if (!ssid) {
      return { ok: false, error: "Enter the network name (SSID)" };
    }
    if (wifiEncryption === "nopass") {
      // Open network: no password is stored.
      wifiPassword = null;
    } else {
      // Passwords may contain leading/trailing spaces, so don't trim them.
      wifiPassword = input.wifiPassword ?? "";
      if (!wifiPassword) {
        return { ok: false, error: "Enter the WiFi password" };
      }
    }
  } else {
    // contact
    firstName = input.firstName?.trim() ?? "";
    lastName = input.lastName?.trim() ?? "";
    phone = input.phone?.trim() ?? "";
    email = input.email?.trim() ?? "";
    org = input.org?.trim() || null;
    if (!firstName) {
      return { ok: false, error: "Enter a first name" };
    }
    if (!lastName) {
      return { ok: false, error: "Enter a last name" };
    }
    if (!phone) {
      return { ok: false, error: "Enter a phone number" };
    }
    if (!isValidEmail(email)) {
      return { ok: false, error: "Enter a valid email address" };
    }
  }

  if (!isValidHexColor(input.foregroundColor)) {
    return { ok: false, error: "Enter the foreground colour as a hex value like #1B1B1B" };
  }
  if (!isValidHexColor(input.backgroundColor)) {
    return { ok: false, error: "Enter the background colour as a hex value like #FFFFFF" };
  }

  // Frame is purely visual output styling stored per code (like the content
  // colours). Unknown style/position values fall back to their defaults, and the
  // caption is trimmed and capped so the layout stays predictable.
  const frameEnabled = input.frameEnabled === true;
  const frameStyle = resolveFrameStyle(input.frameStyle);
  const frameCaptionPosition = resolveCaptionPosition(input.frameCaptionPosition);
  const frameCaption = (input.frameCaption ?? "").trim().slice(0, MAX_CAPTION_LENGTH);
  const frameColor = input.frameColor ?? "#5B5FE9";
  if (!isValidHexColor(frameColor)) {
    return { ok: false, error: "Enter the frame colour as a hex value like #5B5FE9" };
  }

  const logoUrl = input.logoUrl ?? null;
  const logoPath = input.logoPath ?? null;
  // A logo is stored as a URL + key pair; both are present or neither is.
  if ((logoUrl && !logoPath) || (!logoUrl && logoPath)) {
    return { ok: false, error: "That logo could not be used, upload it again" };
  }
  if (logoUrl && logoPath && !isOwnedLogo(logoPath, logoUrl, userId)) {
    return { ok: false, error: "That logo could not be used, upload it again" };
  }

  return {
    ok: true,
    data: {
      title,
      type,
      destinationUrl,
      phone,
      firstName,
      lastName,
      email,
      org,
      ssid,
      wifiPassword,
      wifiEncryption,
      wifiHidden,
      foregroundColor: input.foregroundColor,
      backgroundColor: input.backgroundColor,
      size: normalizeSize(input.size),
      logoUrl,
      logoPath,
      frameEnabled,
      frameStyle,
      frameCaption,
      frameCaptionPosition,
      frameColor,
    },
  };
}

/** Delete a stored logo, logging (not throwing) so a missing file never fails the action. */
async function safeDeleteLogo(pathname: string): Promise<void> {
  try {
    await deleteFile(pathname);
  } catch (err) {
    console.warn(`Failed to delete logo file "${pathname}"`, err);
  }
}

export async function createQrCode(input: QrCodeInput): Promise<ActionResult> {
  const user = await requireUser();

  const validated = validateInput(input, user.id);
  if (!validated.ok) {
    // The logo was already uploaded this session; remove the orphan on rejection.
    if (input.logoPath && isOwnedLogo(input.logoPath, input.logoUrl ?? "", user.id)) {
      await safeDeleteLogo(input.logoPath);
    }
    return { ok: false, error: validated.error };
  }

  try {
    await db.insert(qrCode).values({
      userId: user.id,
      ...validated.data,
    });
  } catch (err) {
    console.error("Failed to create QR code", err);
    // The insert failed after the logo was stored; remove the now-orphaned file.
    if (validated.data.logoPath) {
      await safeDeleteLogo(validated.data.logoPath);
    }
    return { ok: false, error: "Something went wrong, try again" };
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function updateQrCode(
  id: string,
  input: QrCodeInput,
): Promise<ActionResult> {
  const user = await requireUser();

  const validated = validateInput(input, user.id);
  if (!validated.ok) {
    return { ok: false, error: validated.error };
  }

  // Fetch ownership + old logo and apply the update atomically.
  let found = false;
  let oldLogoPath: string | null = null;
  try {
    await db.transaction(async (tx) => {
      const [existing] = await tx
        .select({ logoPath: qrCode.logoPath })
        .from(qrCode)
        .where(and(eq(qrCode.id, id), eq(qrCode.userId, user.id)))
        .limit(1);
      if (!existing) return;

      found = true;
      oldLogoPath = existing.logoPath;

      await tx
        .update(qrCode)
        .set({ ...validated.data, updatedAt: new Date() })
        .where(and(eq(qrCode.id, id), eq(qrCode.userId, user.id)));
    });
  } catch (err) {
    console.error("Failed to update QR code", err);
    return { ok: false, error: "Something went wrong, try again" };
  }

  if (!found) {
    return { ok: false, error: "QR code not found" };
  }

  // After the commit, remove the replaced logo file if it changed.
  const newLogoPath = validated.data.logoPath;
  if (oldLogoPath && oldLogoPath !== newLogoPath) {
    await safeDeleteLogo(oldLogoPath);
  }

  revalidatePath("/dashboard");
  return { ok: true };
}

export async function deleteQrCode(id: string): Promise<ActionResult> {
  const user = await requireUser();

  // Owner-scoped delete in one statement; RETURNING gives us the logo to clean up.
  let deleted: { logoPath: string | null } | undefined;
  try {
    [deleted] = await db
      .delete(qrCode)
      .where(and(eq(qrCode.id, id), eq(qrCode.userId, user.id)))
      .returning({ logoPath: qrCode.logoPath });
  } catch (err) {
    console.error("Failed to delete QR code", err);
    return { ok: false, error: "Something went wrong, try again" };
  }

  if (!deleted) {
    return { ok: false, error: "QR code not found" };
  }

  if (deleted.logoPath) {
    await safeDeleteLogo(deleted.logoPath);
  }

  revalidatePath("/dashboard");
  return { ok: true };
}
