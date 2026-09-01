import "server-only";

import { put, del } from "@vercel/blob";
import type { SavedFile, StorageDriver } from "./types";

/**
 * Vercel Blob storage driver.
 * Used in production when BLOB_READ_WRITE_TOKEN is set.
 */
export const blobDriver: StorageDriver = {
  async save(key: string, data: Buffer, contentType: string): Promise<SavedFile> {
    const result = await put(key, data, {
      access: "public",
      contentType,
      addRandomSuffix: false,
      token: process.env.BLOB_READ_WRITE_TOKEN,
    });

    return {
      url: result.url,
      // Store the storage key as pathname (not result.pathname) for a stable
      // local/blob delete contract
      pathname: key,
    };
  },

  async delete(pathname: string): Promise<void> {
    try {
      // del accepts either a url or pathname; we use the key for consistency
      await del(pathname, {
        token: process.env.BLOB_READ_WRITE_TOKEN,
      });
    } catch (error) {
      // Swallow errors for missing blobs
      // BlobNotFoundError or similar should not throw
      if (
        error instanceof Error &&
        (error.name === "BlobNotFoundError" ||
          error.message.includes("not found") ||
          error.message.includes("does not exist"))
      ) {
        return;
      }
      throw error;
    }
  },
};
