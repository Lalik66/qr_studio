/**
 * Legal configuration for QR Studio.
 *
 * IMPORTANT: Before publishing, fill in the null fields below:
 * - entity: Your legal entity name (e.g., "Acme Inc.")
 * - contactEmail: Email for privacy/legal inquiries
 * - jurisdiction: Governing law (e.g., "the State of California, USA")
 */
export const legal = {
  appName: "QR Studio",
  /** Legal entity name — replace null with your company/entity name */
  entity: null as string | null,
  /** Privacy/legal contact email — replace null with a real address */
  contactEmail: null as string | null,
  /** Governing law jurisdiction — replace null with your jurisdiction */
  jurisdiction: null as string | null,
  /** Last updated date (ISO format) */
  lastUpdated: "2026-08-26",
} as const;

/** Type guard to check if a nullable legal field has been filled in */
export function isFilled(value: string | null): value is string {
  return value !== null && value.trim().length > 0;
}
