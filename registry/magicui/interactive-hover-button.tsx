'use client';

import React from "react";
import { ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

export interface InteractiveHoverButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline';
  className?: string;
}

export const InteractiveHoverButton = React.forwardRef<
  HTMLButtonElement,
  InteractiveHoverButtonProps
>(({ children, variant = 'primary', className, ...props }, ref) => {
  return (
    <button
      ref={ref}
      className={cn(
        "group relative inline-flex items-center justify-center cursor-pointer overflow-hidden rounded-full border p-3.5 px-7 text-center font-bold transition-all duration-300",
        variant === 'primary' && [
          "bg-gradient-to-r from-[#ec4899] via-[#d926aa] to-[#8b5cf6] text-white border-pink-400/40",
          "shadow-[0_0_30px_rgba(236,72,153,0.5)] hover:shadow-[0_0_45px_rgba(236,72,153,0.85)] hover:scale-[1.02]",
        ],
        variant === 'secondary' && [
          "bg-purple-950/40 dark:bg-purple-950/70 text-purple-900 dark:text-purple-100 border-purple-500/40 dark:border-purple-500/50",
          "hover:border-pink-500/70 hover:bg-purple-900/50 dark:hover:bg-purple-900/80 shadow-md",
        ],
        variant === 'outline' && [
          "bg-white/80 dark:bg-zinc-950/80 text-slate-900 dark:text-white border-zinc-200 dark:border-zinc-800",
          "hover:border-pink-500/50 shadow-sm",
        ],
        className
      )}
      {...props}
    >
      <div className="flex items-center justify-center gap-2 transition-transform duration-300 group-hover:-translate-x-1">
        <span>{children}</span>
        <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
      </div>
    </button>
  );
});

InteractiveHoverButton.displayName = "InteractiveHoverButton";
