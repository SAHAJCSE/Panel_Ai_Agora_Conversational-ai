'use client';

import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import { Sun, Moon, Hexagon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AnimatedThemeTogglerProps {
  variant?: 'hexagon' | 'default' | 'circle';
  className?: string;
}

export function AnimatedThemeToggler({
  variant = 'hexagon',
  className,
}: AnimatedThemeTogglerProps) {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = resolvedTheme || theme || 'dark';
  const isDark = currentTheme === 'dark';

  const toggleTheme = () => {
    const nextTheme = isDark ? 'light' : 'dark';
    setTheme(nextTheme);
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    } else {
      document.documentElement.classList.remove('dark');
      document.documentElement.classList.add('light');
    }
  };

  if (!mounted) {
    return (
      <div className={cn("w-10 h-10 rounded-xl bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-white/10 animate-pulse", className)} />
    );
  }

  if (variant === 'hexagon') {
    return (
      <button
        onClick={toggleTheme}
        aria-label="Toggle theme"
        type="button"
        className={cn(
          "group relative flex items-center justify-center p-2.5 rounded-2xl transition-all duration-300",
          "bg-white dark:bg-zinc-900/90 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-sm dark:shadow-none",
          "hover:border-pink-500/50 hover:shadow-[0_0_20px_rgba(236,72,153,0.3)] hover:scale-105 active:scale-95",
          className
        )}
      >
        <Hexagon className="w-6 h-6 text-pink-500 transition-transform duration-500 group-hover:rotate-90" />
        <div className="absolute inset-0 flex items-center justify-center">
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-pink-300 animate-in fade-in zoom-in duration-300" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500 animate-in fade-in zoom-in duration-300" />
          )}
        </div>
      </button>
    );
  }

  return (
    <button
      onClick={toggleTheme}
      aria-label="Toggle theme"
      type="button"
      className={cn(
        "flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-mono transition-all duration-300",
        "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-800 dark:text-zinc-200 shadow-sm",
        "hover:border-pink-500/40",
        className
      )}
    >
      {isDark ? (
        <>
          <Moon className="w-4 h-4 text-pink-400" />
          <span>Dark</span>
        </>
      ) : (
        <>
          <Sun className="w-4 h-4 text-amber-500" />
          <span>Light</span>
        </>
      )}
    </button>
  );
}
