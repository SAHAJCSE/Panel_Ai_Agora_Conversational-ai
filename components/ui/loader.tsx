"use client";

import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import { MorphingSpinner } from "./morphing-spinner";

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
}

export function Loader({
  title = "Configuring your account...",
  subtitle = "Please wait while we prepare everything for you",
  size = "md",
  className,
  ...props
}: LoaderProps) {
  const sizeConfig = {
    sm: {
      spinnerSize: "sm" as const,
      container: "size-20",
      titleClass: "text-sm/tight font-medium",
      subtitleClass: "text-xs/relaxed",
      spacing: "space-y-2",
      maxWidth: "max-w-48",
    },
    md: {
      spinnerSize: "lg" as const,
      container: "size-32",
      titleClass: "text-base/snug font-medium",
      subtitleClass: "text-sm/relaxed",
      spacing: "space-y-3",
      maxWidth: "max-w-56",
    },
    lg: {
      spinnerSize: "xl" as const,
      container: "size-40",
      titleClass: "text-lg/tight font-semibold",
      subtitleClass: "text-base/relaxed",
      spacing: "space-y-4",
      maxWidth: "max-w-64",
    },
  };

  const config = sizeConfig[size];

  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-6 p-8 text-slate-900 dark:text-white selection:bg-pink-500/30 selection:text-pink-300",
        className
      )}
      {...props}
    >
      {/* Morphing Spinner Container with Ambient Pulsing Glow */}
      <motion.div
        animate={{
          scale: [1, 1.05, 1],
        }}
        className={cn("relative flex items-center justify-center", config.container)}
        transition={{
          duration: 3,
          repeat: Number.POSITIVE_INFINITY,
          ease: [0.4, 0, 0.6, 1],
        }}
      >
        {/* Background Radial Glow */}
        <div className="absolute inset-0 bg-pink-500/20 blur-xl rounded-full animate-pulse"></div>

        {/* Morphing Spinner core animation */}
        <MorphingSpinner size={config.spinnerSize} />
      </motion.div>

      {/* Typography */}
      <motion.div
        animate={{
          opacity: 1,
          y: 0,
        }}
        className={cn("text-center", config.spacing, config.maxWidth)}
        initial={{ opacity: 0, y: 12 }}
        transition={{
          delay: 0.2,
          duration: 0.8,
          ease: [0.4, 0, 0.2, 1],
        }}
      >
        <motion.h1
          className={cn(
            config.titleClass,
            "font-semibold text-slate-900 leading-[1.15] tracking-[-0.02em] antialiased dark:text-white"
          )}
        >
          <motion.span
            animate={{
              opacity: [0.9, 0.65, 0.9],
            }}
            transition={{
              duration: 3,
              repeat: Number.POSITIVE_INFINITY,
              ease: [0.4, 0, 0.6, 1],
            }}
          >
            {title}
          </motion.span>
        </motion.h1>

        <motion.p
          className={cn(
            config.subtitleClass,
            "font-normal text-slate-600 leading-[1.45] tracking-[-0.01em] antialiased dark:text-zinc-400"
          )}
        >
          <motion.span
            animate={{
              opacity: [0.7, 0.45, 0.7],
            }}
            transition={{
              duration: 3.5,
              repeat: Number.POSITIVE_INFINITY,
              ease: [0.4, 0, 0.6, 1],
            }}
          >
            {subtitle}
          </motion.span>
        </motion.p>
      </motion.div>
    </div>
  );
}

export default Loader;
