import * as React from "react";
import { cn } from "@/lib/utils";

/**
 * Places items evenly around a center point and rotates the ring.
 * Used to orbit a person's taste anchors around a hub node.
 */
export function OrbitingCircles({
  children,
  radius = 120,
  duration = 28,
  reverse = false,
  className,
  startAngle = -90,
}: {
  children: React.ReactNode;
  radius?: number;
  duration?: number;
  reverse?: boolean;
  className?: string;
  startAngle?: number;
}) {
  const items = React.Children.toArray(children);
  const step = 360 / Math.max(items.length, 1);

  return (
    <div
      className={cn("pointer-events-none absolute inset-0", className)}
      style={
        {
          "--orbit-duration": `${duration}s`,
          animation: `orbit-spin ${duration}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        } as React.CSSProperties
      }
    >
      {items.map((child, i) => {
        const angle = startAngle + i * step;
        return (
          <div
            key={i}
            className="absolute left-1/2 top-1/2"
            style={{
              transform: `translate(-50%, -50%) rotate(${angle}deg) translate(${radius}px) rotate(${-angle}deg)`,
            }}
          >
            <div
              className="pointer-events-auto"
              style={{
                animation: `orbit-spin ${duration}s linear infinite`,
                animationDirection: reverse ? "normal" : "reverse",
              }}
            >
              {child}
            </div>
          </div>
        );
      })}
      <style>{`@keyframes orbit-spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );
}
