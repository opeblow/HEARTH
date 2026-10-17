"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

/** Native range input, styled to the token system. Keeps full a11y semantics. */
export const RangeSlider = React.forwardRef<
  HTMLInputElement,
  Omit<React.InputHTMLAttributes<HTMLInputElement>, "type">
>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    type="range"
    className={cn(
      "h-1.5 w-full cursor-pointer appearance-none rounded-full bg-surface-3 accent-[var(--ember)]",
      "[&::-webkit-slider-thumb]:size-4 [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-ember-ink [&::-webkit-slider-thumb]:bg-ember [&::-webkit-slider-thumb]:shadow-[var(--glow-ember)] [&::-webkit-slider-thumb]:transition-transform hover:[&::-webkit-slider-thumb]:scale-110",
      "[&::-moz-range-thumb]:size-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-ember-ink [&::-moz-range-thumb]:bg-ember",
      className,
    )}
    {...props}
  />
));
RangeSlider.displayName = "RangeSlider";
