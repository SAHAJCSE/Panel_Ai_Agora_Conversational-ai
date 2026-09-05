'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface LightModePatternProps {
  className?: string;
}

export function LightModePattern({ className }: LightModePatternProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 w-full h-full bg-[#F3F3F3]",
        className
      )}
      style={{
        backgroundImage: `
          linear-gradient(0deg, transparent 24%, #E1E1E1 25%, #E1E1E1 26%, transparent 27%, transparent 74%, #E1E1E1 75%, #E1E1E1 76%, transparent 77%, transparent),
          linear-gradient(90deg, transparent 24%, #E1E1E1 25%, #E1E1E1 26%, transparent 27%, transparent 74%, #E1E1E1 75%, #E1E1E1 76%, transparent 77%, transparent)
        `,
        backgroundSize: '55px 55px',
      }}
    />
  );
}

export default LightModePattern;
