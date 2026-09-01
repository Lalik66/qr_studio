import "server-only";

import * as fs from "fs/promises";
import * as path from "path";
import type { SavedFile, StorageDriver } from "./types";

/**
 * Local filesystem storage driver.
 * Stores files in public/uploads directory for development use.
 */
export const localDriver: StorageDriver = {
  async save(key: string, data: Buffer): Promise<SavedFile> {
    const filePath = path.join(process.cwd(), "public", "uploads", key);
    const dir = path.dirname(filePath);

    // Create parent directories if they don't exist
    await fs.mkdir(dir, { recursive: true });

    // Write the file
    await fs.writeFile(filePath, data);

    // Normalize key to forward slashes for URL
    const normalizedKey = key.split(path.sep).join("/");

    return {
      url: `/uploads/${normalizedKey}`,
      pathname: key,
    };
  },

  async delete(pathname: string): Promise<void> {
    const filePath = path.join(process.cwd(), "public", "uploads", pathname);

    // Use force: true so missing file doesn't throw
    await fs.rm(filePath, { force: true });
  },
};
