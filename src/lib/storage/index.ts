import type { SavedFile, StorageDriver } from "./types";

export type { SavedFile } from "./types";

/**
 * Decide whether to use Vercel Blob. Selection is by explicit env, never by the
 * incidental presence of a token — so a developer who copies a production
 * `BLOB_READ_WRITE_TOKEN` into their local `.env` does not silently write to the
 * production store. Set `STORAGE_DRIVER=blob|local` to force a driver; otherwise
 * Blob is used only in a production build that has a token configured.
 */
function shouldUseBlob(): boolean {
  const explicit = process.env.STORAGE_DRIVER;
  if (explicit === "blob") return true;
  if (explicit === "local") return false;
  return (
    process.env.NODE_ENV === "production" &&
    typeof process.env.BLOB_READ_WRITE_TOKEN === "string" &&
    process.env.BLOB_READ_WRITE_TOKEN.length > 0
  );
}

// Resolve the driver once and reuse it. Dynamic import keeps the unused driver
// (and its dependencies) out of the bundle.
let driverPromise: Promise<StorageDriver> | null = null;

function getDriver(): Promise<StorageDriver> {
  if (!driverPromise) {
    driverPromise = shouldUseBlob()
      ? import("./blob").then((m) => m.blobDriver)
      : import("./local").then((m) => m.localDriver);
  }
  return driverPromise;
}

/**
 * Save a file to storage.
 * @param key Storage-relative path (e.g., "logos/userId/uuid.png")
 * @param data File content as a Buffer
 * @param contentType MIME type of the file
 * @returns The saved file info with url and pathname
 */
export async function saveFile(
  key: string,
  data: Buffer,
  contentType: string
): Promise<SavedFile> {
  const driver = await getDriver();
  return driver.save(key, data, contentType);
}

/**
 * Delete a file from storage.
 * @param pathname Storage-relative path returned from saveFile()
 */
export async function deleteFile(pathname: string): Promise<void> {
  const driver = await getDriver();
  return driver.delete(pathname);
}
