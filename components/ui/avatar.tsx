'use client';

import * as React from "react";
import { cn } from "@/lib/utils";

export const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-12 w-12 shrink-0 overflow-hidden rounded-full border-2 border-slate-100 dark:border-zinc-800 shadow-md",
      className
    )}
    {...props}
  />
));
Avatar.displayName = "Avatar";

export const AvatarImage = React.forwardRef<
  HTMLImageElement,
  React.ImgHTMLAttributes<HTMLImageElement>
>(({ className, src, alt, ...props }, ref) => {
  const [hasError, setHasError] = React.useState(!src);

  if (hasError || !src) return null;

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt || "Avatar"}
      onError={() => setHasError(true)}
      className={cn("aspect-square h-full w-full object-cover", className)}
      {...props}
    />
  );
});
AvatarImage.displayName = "AvatarImage";

export const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gradient-to-br from-pink-500/20 to-purple-600/30 font-mono text-sm font-bold text-pink-600 dark:text-pink-300",
      className
    )}
    {...props}
  />
));
AvatarFallback.displayName = "AvatarFallback";
