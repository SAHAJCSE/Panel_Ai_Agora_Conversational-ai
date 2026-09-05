'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import { HexagonPattern } from '@/registry/magicui/hexagon-pattern';

export interface HexagonBackgroundProps {
  className?: string;
}

export function HexagonBackground({ className }: HexagonBackgroundProps) {
  return (
    <div className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}>
      <HexagonPattern
        hexagons={[
          [1, 1],
          [4, 4],
          [2, 2],
          [3, 4],
          [5, 4],
          [8, 2],
          [6, 3],
          [8, 5],
          [10, 10],
        ]}
        className="inset-0 skew-y-6 opacity-80"
      />
    </div>
  );
}

export const HexagonBackgroundDemo = () => {
  return (
    <HexagonBackground className="absolute inset-0 flex items-center justify-center rounded-xl" />
  );
};
