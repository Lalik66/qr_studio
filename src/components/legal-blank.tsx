import { isFilled } from "@/lib/legal";

/**
 * Renders a clearly-marked placeholder for an unfilled legal field.
 * Greppable marker: "[ ... — to be completed ]"
 */
export function LegalBlank({ label }: { label: string }) {
  return (
    <span className="inline-flex items-center rounded-md bg-warning/20 px-2 py-0.5 text-sm font-medium text-warning">
      [ {label} — to be completed ]
    </span>
  );
}

/**
 * Renders a legal field value if filled, otherwise renders a LegalBlank placeholder.
 * Use this inline in prose to gracefully handle null configuration values.
 */
export function LegalField({
  value,
  label,
}: {
  value: string | null;
  label: string;
}) {
  if (isFilled(value)) {
    return <>{value}</>;
  }
  return <LegalBlank label={label} />;
}
