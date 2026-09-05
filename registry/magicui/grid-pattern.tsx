'use client';

import { useId } from "react";
import { cn } from "@/lib/utils";

interface GridPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  squares?: [x: number, y: number][];
  strokeDasharray?: string;
  className?: string;
}

export function GridPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  squares,
  strokeDasharray,
  className,
  ...props
}: GridPatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full stroke-zinc-400/40 fill-zinc-500/5 dark:stroke-zinc-800/40 dark:fill-zinc-900/10",
        className
      )}
      {...props}
    >
      <defs>
        <pattern
          id={id}
          width={width}
          height={height}
          patternUnits="userSpaceOnUse"
          x={x}
          y={y}
        >
          <path
            d={`M.5 ${height}V.5H${width}`}
            fill="none"
            strokeDasharray={strokeDasharray}
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      {squares && (
        <svg x={x} y={y} className="overflow-visible">
          {squares.map(([sx, sy], i) => (
            <rect
              strokeWidth="0"
              key={`${sx}-${sy}-${i}`}
              width={width - 1}
              height={height - 1}
              x={sx * width + 1}
              y={sy * height + 1}
              className="fill-pink-500/20 stroke-pink-500/40"
            />
          ))}
        </svg>
      )}
    </svg>
  );
}
