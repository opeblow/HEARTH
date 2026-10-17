"use client";

import * as React from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  color: string;
  rot: number;
  vr: number;
};

const COLORS = ["#fb6a24", "#ff8a4c", "#e7b66a", "#c9603e", "#f5efe6"];

/** Fires a single ember confetti burst. Respects reduced-motion. */
export function Confetti({
  fire,
  className,
}: {
  fire: boolean;
  className?: string;
}) {
  const canvasRef = React.useRef<HTMLCanvasElement>(null);
  const firedRef = React.useRef(false);

  React.useEffect(() => {
    if (!fire || firedRef.current) return;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    firedRef.current = true;
    if (reduced) return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    const originX = rect.width / 2;
    const originY = rect.height * 0.35;
    const count = 140;
    let particles: Particle[] = Array.from({ length: count }, () => {
      const angle = Math.random() * Math.PI * 2;
      const speed = 3 + Math.random() * 7;
      return {
        x: originX,
        y: originY,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed - 3,
        life: 1,
        size: 4 + Math.random() * 6,
        color: COLORS[Math.floor(Math.random() * COLORS.length)]!,
        rot: Math.random() * Math.PI,
        vr: (Math.random() - 0.5) * 0.3,
      };
    });

    let raf = 0;
    const step = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);
      particles = particles.filter((p) => p.life > 0);
      for (const p of particles) {
        p.vy += 0.14;
        p.vx *= 0.995;
        p.x += p.vx;
        p.y += p.vy;
        p.life -= 0.008;
        p.rot += p.vr;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.life);
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rot);
        ctx.fillStyle = p.color;
        ctx.fillRect(-p.size / 2, -p.size / 4, p.size, p.size / 2);
        ctx.restore();
      }
      if (particles.length > 0) {
        raf = requestAnimationFrame(step);
      } else {
        ctx.clearRect(0, 0, rect.width, rect.height);
      }
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [fire]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden="true"
      className={className ?? "pointer-events-none fixed inset-0 z-50 h-full w-full"}
    />
  );
}
