"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type ColorFieldProps = {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

/**
 * The app's colour picker: a native swatch beside a hex input, kept in sync.
 * Shared by the QR foreground/background and the frame colour so every colour
 * control in the form looks and behaves identically.
 */
export function ColorField({
  id,
  label,
  value,
  onChange,
  placeholder = "#000000",
}: ColorFieldProps) {
  return (
    <div className="flex flex-col gap-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="flex gap-2">
        <input
          type="color"
          id={id}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-8 w-12 cursor-pointer rounded-lg border border-input bg-transparent p-0.5"
        />
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="flex-1 font-mono"
          maxLength={7}
          aria-label={label}
        />
      </div>
    </div>
  );
}
