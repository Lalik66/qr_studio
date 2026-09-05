import type { ComponentPropsWithoutRef } from "react";
import { cn } from "@/lib/utils";

export const ANIMATION_DURATION_MS = 500;
export const STAGGER_STEP_MS = 70;
export const MAX_STAGGER_INDEX = 8;

export function staggerDelayMs(index: number): number {
  return Math.min(Math.max(index, 0), MAX_STAGGER_INDEX) * STAGGER_STEP_MS;
}

export const animatedBlockClassName =
  "animate-in fade-in slide-in-from-bottom-2 fill-mode-both motion-reduce:animate-none";

/** Subtle lift + primary ring on hover — matches card blocks across the app. */
export const interactiveBlockClassName =
  "ring-1 ring-transparent ease-out transition duration-200 hover:-translate-y-0.5 hover:ring-primary/40 motion-reduce:transition-none motion-reduce:hover:translate-y-0";

type AnimatedBlockProps = ComponentPropsWithoutRef<"div"> & {
  index?: number;
};

export function AnimatedBlock({
  index = 0,
  className,
  style,
  children,
  ...props
}: AnimatedBlockProps) {
  return (
    <div
      style={{
        animationDuration: `${ANIMATION_DURATION_MS}ms`,
        animationDelay: `${staggerDelayMs(index)}ms`,
        ...style,
      }}
      className={cn(animatedBlockClassName, className)}
      {...props}
    >
      {children}
    </div>
  );
}
