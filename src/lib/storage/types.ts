/**
 * Result of saving a file to storage.
 */
export type SavedFile = {
  /** Browser-usable URL to access the file */
  url: string;
  /** Storage-relative path, used as the key for deletion */
  pathname: string;
};

/**
 * Storage driver interface for file operations.
 */
export interface StorageDriver {
  /**
   * Save a file to storage.
   * @param key Storage-relative path (e.g., "logos/userId/uuid.png")
   * @param data File content as a Buffer
   * @param contentType MIME type of the file
   * @returns The saved file info with url and pathname
   */
  save(key: string, data: Buffer, contentType: string): Promise<SavedFile>;

  /**
   * Delete a file from storage.
   * @param pathname Storage-relative path returned from save()
   */
  delete(pathname: string): Promise<void>;
}
