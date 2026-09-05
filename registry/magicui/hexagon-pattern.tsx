'use client';

import { useId } from "react";
import { cn } from "@/lib/utils";

interface HexagonPatternProps extends React.SVGProps<SVGSVGElement> {
  width?: number;
  height?: number;
  x?: number;
  y?: number;
  hexagons?: [x: number, y: number][];
  className?: string;
}

export function HexagonPattern({
  width = 40,
  height = 40,
  x = -1,
  y = -1,
  hexagons,
  className,
  ...props
}: HexagonPatternProps) {
  const id = useId();

  return (
    <svg
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 h-full w-full stroke-zinc-400/25 fill-zinc-500/5 dark:stroke-zinc-800/40 dark:fill-zinc-900/10",
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
            d={`M ${width / 2} 0 L ${width} ${height / 4} L ${width} ${(height * 3) / 4} L ${width / 2} ${height} L 0 ${(height * 3) / 4} L 0 ${height / 4} Z`}
            fill="none"
            strokeWidth="1"
          />
        </pattern>
      </defs>
      <rect width="100%" height="100%" strokeWidth={0} fill={`url(#${id})`} />
      {hexagons && (
        <svg x={x} y={y} className="overflow-visible">
          {hexagons.map(([hx, hy], i) => (
            <path
              key={`${hx}-${hy}-${i}`}
              d={`M ${hx * width + width / 2} ${hy * height} L ${(hx + 1) * width} ${hy * height + height / 4} L ${(hx + 1) * width} ${hy * height + (height * 3) / 4} L ${hx * width + width / 2} ${(hy + 1) * height} L ${hx * width} ${hy * height + (height * 3) / 4} L ${hx * width} ${hy * height + height / 4} Z`}
              className="fill-pink-500/20 dark:fill-pink-500/30 stroke-pink-500/50 dark:stroke-pink-400/60 transition-all duration-500 hover:fill-pink-500/40"
              strokeWidth="1"
            />
          ))}
        </svg>
      )}
    </svg>
  );
}
