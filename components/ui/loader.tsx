"use client";

import React from "react";
import { cn } from "@/lib/utils";

export interface LoaderProps extends React.HTMLAttributes<HTMLDivElement> {
  prefix?: string;
  words?: string[];
  title?: string;
  subtitle?: string;
  size?: "sm" | "md" | "lg";
}

export const DEFAULT_LOADER_WORDS = [
  "ai agents",
  "agent 1",
  "agent 2",
  "agent 3",
  "Ui",
  "buttons",
  "ai agents",
];

export function Loader({
  prefix = "loading",
  words = DEFAULT_LOADER_WORDS,
  title,
  subtitle,
  className,
  ...props
}: LoaderProps) {
  // If a legacy title was passed, use it as the prefix if prefix wasn't customized
  const displayPrefix = title && prefix === "loading" ? title.toLowerCase().replace(/\.+$/, "") : prefix;

  return (
    <div
      className={cn("flex flex-col items-center justify-center gap-4 text-center", className)}
      {...props}
    >
      <div className="styled-loader-wrapper">
        <style>{`
          .styled-loader-wrapper .card {
            /* color used to softly clip top and bottom of the .words container */
            --bg-color: #111;
            background-color: var(--bg-color);
            padding: 1rem 2rem;
            border-radius: 1.25rem;
            border: 1px solid rgba(255, 255, 255, 0.08);
            box-shadow: 0 10px 30px -10px rgba(0, 0, 0, 0.7), 0 0 25px -5px rgba(149, 106, 250, 0.35);
          }
          .styled-loader-wrapper .loader {
            color: rgb(124, 124, 124);
            font-family: "Poppins", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            font-weight: 500;
            font-size: 25px;
            -webkit-box-sizing: content-box;
            box-sizing: content-box;
            height: 40px;
            padding: 10px 10px;
            display: -webkit-box;
            display: -ms-flexbox;
            display: flex;
            align-items: center;
            border-radius: 8px;
          }
          .styled-loader-wrapper .loader p {
            margin: 0;
            padding: 0;
            line-height: 40px;
          }
          .styled-loader-wrapper .words {
            overflow: hidden;
            position: relative;
            height: 40px;
          }
          .styled-loader-wrapper .words::after {
            content: "";
            position: absolute;
            inset: 0;
            background: linear-gradient(
              var(--bg-color) 10%,
              transparent 30%,
              transparent 70%,
              var(--bg-color) 90%
            );
            z-index: 20;
            pointer-events: none;
          }
          .styled-loader-wrapper .word {
            display: block;
            height: 40px;
            line-height: 40px;
            padding-left: 8px;
            color: #956afa;
            animation: spin_4991 6s infinite;
            white-space: nowrap;
          }
          @keyframes spin_4991 {
            0% {
              transform: translateY(0%);
            }
            7% {
              transform: translateY(-102%);
            }
            16.66% {
              transform: translateY(-100%);
            }
            21% {
              transform: translateY(-100%);
            }
            24% {
              transform: translateY(-202%);
            }
            33.33% {
              transform: translateY(-200%);
            }
            38% {
              transform: translateY(-200%);
            }
            41% {
              transform: translateY(-302%);
            }
            50% {
              transform: translateY(-300%);
            }
            55% {
              transform: translateY(-300%);
            }
            58% {
              transform: translateY(-402%);
            }
            66.66% {
              transform: translateY(-400%);
            }
            71% {
              transform: translateY(-400%);
            }
            75% {
              transform: translateY(-502%);
            }
            83.33% {
              transform: translateY(-500%);
            }
            88% {
              transform: translateY(-500%);
            }
            92% {
              transform: translateY(-602%);
            }
            100% {
              transform: translateY(-600%);
            }
          }
        `}</style>
        <div className="card">
          <div className="loader">
            <p>{displayPrefix}</p>
            <div className="words">
              {words.map((word, idx) => (
                <span key={idx} className="word">
                  {word}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {subtitle && (
        <p className="text-xs sm:text-sm text-zinc-400 font-mono tracking-wide max-w-sm animate-pulse">
          {subtitle}
        </p>
      )}
    </div>
  );
}

export default Loader;
