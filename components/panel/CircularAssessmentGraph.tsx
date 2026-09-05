'use client';

import React from 'react';
import { 
  Code2, 
  Briefcase, 
  UserCheck, 
  Award, 
  TrendingUp, 
  Sparkles,
  Zap,
  CheckCircle2
} from 'lucide-react';

interface CircularAssessmentGraphProps {
  overallScore: number; // e.g. 7.8
  techScore: number;    // e.g. 8.2
  prodScore: number;    // e.g. 7.4
  hrScore: number;      // e.g. 7.6
  turnsCount: number;
  techAttempted?: boolean;
  prodAttempted?: boolean;
  hrAttempted?: boolean;
}

export function CircularAssessmentGraph({
  overallScore,
  techScore,
  prodScore,
  hrScore,
  turnsCount,
  techAttempted = true,
  prodAttempted = true,
  hrAttempted = true,
}: CircularAssessmentGraphProps) {
  // SVG circular radius constants
  const size = 260;
  const center = size / 2;

  const rTech = 100;
  const circTech = 2 * Math.PI * rTech;
  const offsetTech = circTech - (circTech * ((techAttempted ? techScore : 0) / 10));

  const rProd = 80;
  const circProd = 2 * Math.PI * rProd;
  const offsetProd = circProd - (circProd * ((prodAttempted ? prodScore : 0) / 10));

  const rHr = 60;
  const circHr = 2 * Math.PI * rHr;
  const offsetHr = circHr - (circHr * ((hrAttempted ? hrScore : 0) / 10));

  const statusLabel =
    overallScore >= 7.5
      ? 'Strong Hire'
      : overallScore >= 6.0
      ? 'Qualified'
      : overallScore >= 4.0
      ? 'Under Review'
      : 'Unqualified';

  return (
    <div className="relative overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-[#0c0c12] via-[#07070a] to-black p-6 sm:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.85)]">
      {/* Background Ambience */}
      <div className="pointer-events-none absolute -top-24 -left-24 w-72 h-72 rounded-full bg-[#ec4899]/10 blur-[90px]"></div>
      <div className="pointer-events-none absolute -bottom-24 -right-24 w-72 h-72 rounded-full bg-[#7c3aed]/15 blur-[90px]"></div>

      {/* Header Strip */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/[0.08] pb-5">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-pink-500/15 border border-pink-500/30 text-[#ec4899]">
            <Sparkles className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-base font-bold text-white tracking-tight">
              Multi-Dimensional Circular Competency Analysis
            </h2>
            <p className="text-xs text-zinc-400 font-mono">
              Synchronized Multi-Agent Telemetry • {turnsCount} Live Turns Evaluated
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="text-xs font-mono text-emerald-300 font-semibold uppercase tracking-wider">
            Evidence Synthesized
          </span>
        </div>
      </div>

      {/* Main Graph & Metric Cards Grid */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* Concentric Circle Graph */}
        <div className="lg:col-span-5 flex flex-col items-center justify-center relative">
          <div className="relative flex items-center justify-center w-[260px] h-[260px]">
            <svg
              width={size}
              height={size}
              className="rotate-[-90deg] drop-shadow-[0_0_25px_rgba(236,72,153,0.35)]"
            >
              {/* Definitions for Gradients */}
              <defs>
                <linearGradient id="techGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#ec4899" />
                  <stop offset="100%" stopColor="#f43f5e" />
                </linearGradient>
                <linearGradient id="prodGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#c084fc" />
                  <stop offset="100%" stopColor="#9333ea" />
                </linearGradient>
                <linearGradient id="hrGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#34d399" />
                  <stop offset="100%" stopColor="#059669" />
                </linearGradient>
              </defs>

              {/* Background Track Rings */}
              <circle
                cx={center}
                cy={center}
                r={rTech}
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="10"
              />
              <circle
                cx={center}
                cy={center}
                r={rProd}
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="10"
              />
              <circle
                cx={center}
                cy={center}
                r={rHr}
                fill="none"
                stroke="rgba(255, 255, 255, 0.06)"
                strokeWidth="10"
              />

              {/* Active Progress Rings */}
              {/* Outer Ring: Technical */}
              <circle
                cx={center}
                cy={center}
                r={rTech}
                fill="none"
                stroke="url(#techGrad)"
                strokeWidth="10"
                strokeDasharray={circTech}
                strokeDashoffset={offsetTech}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />

              {/* Middle Ring: Product */}
              <circle
                cx={center}
                cy={center}
                r={rProd}
                fill="none"
                stroke="url(#prodGrad)"
                strokeWidth="10"
                strokeDasharray={circProd}
                strokeDashoffset={offsetProd}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />

              {/* Inner Ring: HR */}
              <circle
                cx={center}
                cy={center}
                r={rHr}
                fill="none"
                stroke="url(#hrGrad)"
                strokeWidth="10"
                strokeDasharray={circHr}
                strokeDashoffset={offsetHr}
                strokeLinecap="round"
                className="transition-all duration-1000 ease-out"
              />
            </svg>

            {/* Centered Overall Score */}
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
              <span className="text-[10px] font-mono uppercase tracking-widest text-zinc-400">
                Score
              </span>
              <div className="flex items-baseline justify-center gap-0.5 mt-0.5">
                <span className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-br from-white via-pink-100 to-[#ec4899] drop-shadow-[0_0_15px_rgba(236,72,153,0.6)]">
                  {overallScore.toFixed(1)}
                </span>
                <span className="text-xs text-zinc-500 font-mono">/10</span>
              </div>
              <span
                className={`text-[10px] font-semibold font-mono mt-1 uppercase tracking-wider ${
                  overallScore >= 7.5
                    ? 'text-pink-300'
                    : overallScore >= 6.0
                    ? 'text-purple-300'
                    : overallScore >= 4.0
                    ? 'text-amber-400'
                    : 'text-rose-400 font-bold'
                }`}
              >
                {statusLabel}
              </span>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-center gap-4 text-xs font-mono">
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#ec4899]"></span>
              Tech
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#a855f7]"></span>
              Product
            </span>
            <span className="flex items-center gap-1.5 text-zinc-400">
              <span className="w-2.5 h-2.5 rounded-full bg-[#10b981]"></span>
              HR/Culture
            </span>
          </div>
        </div>

        {/* Breakdown Metric Cards */}
        <div className="lg:col-span-7 space-y-3.5">
          {/* Technical Track Card */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-pink-500/20 hover:border-pink-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-pink-500/10 text-[#ec4899]">
                  <Code2 className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    Technical Architecture &amp; Code Rigor
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    React Components, State Management, Full-Stack Execution
                  </div>
                </div>
              </div>
              <div className="text-right">
                {techAttempted ? (
                  <>
                    <span className="text-lg font-bold text-[#ec4899] font-mono">
                      {techScore.toFixed(1)}
                    </span>
                    <span className="text-xs text-zinc-500"> /10</span>
                  </>
                ) : (
                  <span className="text-xs font-mono font-semibold text-zinc-500 rounded bg-white/5 px-2 py-1">
                    Not Attempted
                  </span>
                )}
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-3 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-pink-500 to-[#ec4899] transition-all duration-1000"
                style={{ width: `${techAttempted ? Math.min(100, (techScore / 10) * 100) : 0}%` }}
              ></div>
            </div>
          </div>

          {/* Product Track Card */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-purple-500/20 hover:border-purple-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
                  <Briefcase className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    Product Intuition &amp; Requirements
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    User Workflows, Ecommerce Features, Checkout Cart Trade-offs
                  </div>
                </div>
              </div>
              <div className="text-right">
                {prodAttempted ? (
                  <>
                    <span className="text-lg font-bold text-purple-400 font-mono">
                      {prodScore.toFixed(1)}
                    </span>
                    <span className="text-xs text-zinc-500"> /10</span>
                  </>
                ) : (
                  <span className="text-xs font-mono font-semibold text-zinc-500 rounded bg-white/5 px-2 py-1">
                    Not Attempted
                  </span>
                )}
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-3 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-purple-500 to-[#a855f7] transition-all duration-1000"
                style={{ width: `${prodAttempted ? Math.min(100, (prodScore / 10) * 100) : 0}%` }}
              ></div>
            </div>
          </div>

          {/* HR & Culture Track Card */}
          <div className="p-4 rounded-xl bg-white/[0.02] border border-emerald-500/20 hover:border-emerald-500/40 transition-all">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                  <UserCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    People, Culture &amp; Leadership Alignment
                  </div>
                  <div className="text-[11px] text-zinc-400">
                    Project Management, Collaboration, Active Responsiveness
                  </div>
                </div>
              </div>
              <div className="text-right">
                {hrAttempted ? (
                  <>
                    <span className="text-lg font-bold text-emerald-400 font-mono">
                      {hrScore.toFixed(1)}
                    </span>
                    <span className="text-xs text-zinc-500"> /10</span>
                  </>
                ) : (
                  <span className="text-xs font-mono font-semibold text-zinc-500 rounded bg-white/5 px-2 py-1">
                    Not Attempted
                  </span>
                )}
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-3 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-emerald-400 transition-all duration-1000"
                style={{ width: `${hrAttempted ? Math.min(100, (hrScore / 10) * 100) : 0}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
