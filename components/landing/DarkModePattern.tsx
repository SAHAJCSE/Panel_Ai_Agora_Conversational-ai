'use client';

import React from 'react';
import { cn } from '@/lib/utils';

export interface DarkModePatternProps {
  className?: string;
}

export function DarkModePattern({ className }: DarkModePatternProps) {
  return (
    <div
      className={cn(
        "pointer-events-none absolute inset-0 w-full h-full bg-[#08080a]",
        className
      )}
      style={{
        backgroundColor: '#08080a',
        backgroundImage: `
          linear-gradient(0deg, transparent 24%, rgba(114, 114, 114, 0.25) 25%, rgba(114, 114, 114, 0.25) 26%, transparent 27%, transparent 74%, rgba(114, 114, 114, 0.25) 75%, rgba(114, 114, 114, 0.25) 76%, transparent 77%, transparent),
          linear-gradient(90deg, transparent 24%, rgba(114, 114, 114, 0.25) 25%, rgba(114, 114, 114, 0.25) 26%, transparent 27%, transparent 74%, rgba(114, 114, 114, 0.25) 75%, rgba(114, 114, 114, 0.25) 76%, transparent 77%, transparent)
        `,
        backgroundSize: '55px 55px',
      }}
    />
  );
}

export default DarkModePattern;
