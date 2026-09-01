import { randomUUID } from "crypto";
import sharp from "sharp";
import { getSession } from "@/lib/session";
import { saveFile } from "@/lib/storage";

export const runtime = "nodejs";

const MAX_FILE_SIZE = 500 * 1024; // 500 KB
const ALLOWED_MIME_TYPES = ["image/png", "image/jpeg", "image/svg+xml"];

export async function POST(req: Request): Promise<Response> {
  // Check authentication
  const session = await getSession();
  if (!session) {
    return Response.json({ message: "Please sign in and try again" }, { status: 401 });
  }
  const user = session.user;

  // Parse form data
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return Response.json({ message: "That upload could not be read, try again" }, { status: 400 });
  }

  const file = form.get("file");

  // Validate file is present and is a File/Blob
  if (!file || !(file instanceof Blob)) {
    return Response.json({ message: "Choose an image to upload" }, { status: 400 });
  }

  // Check file size
  if (file.size > MAX_FILE_SIZE) {
    return Response.json(
      { message: "That logo is over 500 KB, try a smaller image" },
      { status: 400 },
    );
  }

  // Check MIME type
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    return Response.json({ message: "Use a PNG, JPG or SVG image" }, { status: 400 });
  }

  // Read file bytes
  const input = Buffer.from(await file.arrayBuffer());

  // Rasterize to PNG using sharp (normalizes format and removes any scripts in SVG)
  let png: Buffer;
  try {
    png = await sharp(input, { density: 384 })
      .resize(512, 512, { fit: "inside", withoutEnlargement: true })
      .png()
      .toBuffer();
  } catch {
    return Response.json(
      { message: "That image could not be processed, try another file" },
      { status: 400 },
    );
  }

  // Build storage key
  const key = `logos/${user.id}/${randomUUID()}.png`;

  // Save to storage
  let saved;
  try {
    saved = await saveFile(key, png, "image/png");
  } catch (err) {
    console.error("Failed to save uploaded logo", err);
    return Response.json(
      { message: "That logo could not be saved, try again" },
      { status: 500 },
    );
  }

  return Response.json({ url: saved.url, pathname: saved.pathname });
}
