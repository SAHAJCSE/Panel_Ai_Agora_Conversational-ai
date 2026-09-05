'use client';

import React, { useCallback } from "react";
import { motion, useMotionTemplate, useMotionValue } from "framer-motion";
import { cn } from "@/lib/utils";

export interface MagicCardProps extends React.HTMLAttributes<HTMLDivElement> {
  mode?: "orb" | "gradient";
  glowFrom?: string;
  glowTo?: string;
  gradientSize?: number;
  gradientColor?: string;
  gradientOpacity?: number;
}

export function MagicCard({
  children,
  className,
  glowFrom = "#6366F1",
  glowTo = "#06B6D4",
  gradientSize = 250,
  gradientOpacity = 0.8,
  ...props
}: MagicCardProps) {
  const mouseX = useMotionValue(-gradientSize);
  const mouseY = useMotionValue(-gradientSize);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      const { left, top } = e.currentTarget.getBoundingClientRect();
      mouseX.set(e.clientX - left);
      mouseY.set(e.clientY - top);
    },
    [mouseX, mouseY]
  );

  const handleMouseLeave = useCallback(() => {
    mouseX.set(-gradientSize);
    mouseY.set(-gradientSize);
  }, [mouseX, mouseY, gradientSize]);

  return (
    <div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "group relative flex size-full overflow-hidden rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-6 text-slate-900 dark:text-white transition-all duration-300 shadow-md dark:shadow-none",
        className
      )}
      {...props}
    >
      <div className="relative z-10 size-full">{children}</div>
      <motion.div
        className="pointer-events-none absolute -inset-px rounded-2xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
        style={{
          background: useMotionTemplate`
            radial-gradient(
              ${gradientSize}px circle at ${mouseX}px ${mouseY}px,
              ${glowFrom},
              ${glowTo},
              transparent 80%
            )
          `,
          opacity: gradientOpacity,
        }}
      />
    </div>
  );
}
