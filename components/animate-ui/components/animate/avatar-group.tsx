'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

export interface AvatarGroupProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

export function AvatarGroup({ children, className, ...props }: AvatarGroupProps) {
  return (
    <div
      className={cn("flex items-center -space-x-3 hover:-space-x-1 transition-all duration-300", className)}
      {...props}
    >
      {children}
    </div>
  );
}

export interface AvatarGroupTooltipProps extends React.HTMLAttributes<HTMLSpanElement> {
  children: React.ReactNode;
}

export function AvatarGroupTooltip({ children, className, ...props }: AvatarGroupTooltipProps) {
  return (
    <span
      className={cn(
        "pointer-events-none absolute -top-10 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-slate-900 dark:bg-white px-2.5 py-1 text-xs font-semibold text-white dark:text-slate-900 opacity-0 shadow-lg transition-all duration-200 group-hover:opacity-100 group-hover:-top-11 z-50",
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
