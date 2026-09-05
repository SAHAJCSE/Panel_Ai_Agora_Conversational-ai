'use client';

import React, { forwardRef, useRef } from 'react';
import { cn } from '@/lib/utils';
import { AnimatedBeam } from '@/registry/magicui/animated-beam';
import { Cpu, Radio, Network, Sparkles, User, Layers, Brain, Bot } from 'lucide-react';

const Circle = forwardRef<
  HTMLDivElement,
  { className?: string; children?: React.ReactNode }
>(({ className, children }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        'z-10 flex size-14 items-center justify-center overflow-hidden rounded-full border-2 bg-white dark:bg-zinc-950 shadow-[0_0_25px_-5px_rgba(236,72,153,0.35)] transition-all hover:scale-105',
        className
      )}
    >
      {children}
    </div>
  );
});

Circle.displayName = 'Circle';

export function PanelAIFlow({
  className,
}: {
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);

  const agent1Ref = useRef<HTMLDivElement>(null);
  const agent2Ref = useRef<HTMLDivElement>(null);
  const agent3Ref = useRef<HTMLDivElement>(null);

  const aiRef = useRef<HTMLDivElement>(null);
  const candidateRef = useRef<HTMLDivElement>(null);

  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-16" id="panel-flow">
      {/* Section Header */}
      <div className="text-center max-w-3xl mx-auto mb-10 space-y-3">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-mono font-bold text-pink-600 dark:text-pink-300">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multi-Agent Neural Flow</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Synchronized Panel AI Architecture
        </h2>
        <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-300 leading-relaxed">
          Watch 3 specialized AI interviewers deliberate through the central AI Coordinator in real-time.
        </p>
      </div>

      {/* Beam Flow Graphic Container */}
      <div
        ref={containerRef}
        className={cn(
          'relative flex min-h-[360px] w-full items-center justify-center overflow-hidden rounded-3xl bg-white/70 dark:bg-zinc-950/70 border border-zinc-200 dark:border-white/10 p-8 shadow-2xl backdrop-blur-2xl',
          className
        )}
      >
        <div className="flex w-full max-w-4xl items-center justify-between gap-6 sm:gap-12 z-10">

          {/* 3 AI INTERVIEWERS */}
          <div className="flex flex-col items-center justify-center gap-8">
            <div className="flex flex-col items-center gap-1.5 text-center">
              <Circle ref={agent1Ref} className="border-pink-500/60 bg-pink-500/10">
                <Cpu className="w-6 h-6 text-pink-500" />
              </Circle>
              <span className="text-xs font-bold text-slate-900 dark:text-zinc-200 font-mono">
                Technical
              </span>
            </div>

            <div className="flex flex-col items-center gap-1.5 text-center">
              <Circle ref={agent2Ref} className="border-purple-500/60 bg-purple-500/10">
                <Radio className="w-6 h-6 text-purple-400" />
              </Circle>
              <span className="text-xs font-bold text-slate-900 dark:text-zinc-200 font-mono">
                Product
              </span>
            </div>

            <div className="flex flex-col items-center gap-1.5 text-center">
              <Circle ref={agent3Ref} className="border-emerald-500/60 bg-emerald-500/10">
                <Network className="w-6 h-6 text-emerald-400" />
              </Circle>
              <span className="text-xs font-bold text-slate-900 dark:text-zinc-200 font-mono">
                Behavioural
              </span>
            </div>
          </div>

          {/* CENTER AI COORDINATOR */}
          <div className="flex flex-col items-center gap-3 text-center">
            <Circle
              ref={aiRef}
              className="size-20 border-violet-400/80 bg-violet-500/15 shadow-[0_0_35px_rgba(168,85,247,0.5)]"
            >
              <Bot className="w-10 h-10 text-violet-400 animate-pulse" />
            </Circle>

            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono bg-violet-500/10 px-3 py-1 rounded-full border border-violet-500/20">
              AI Coordinator
            </span>
          </div>

          {/* CANDIDATE */}
          <div className="flex flex-col items-center gap-3 text-center">
            <Circle
              ref={candidateRef}
              className="size-20 border-cyan-400/80 bg-cyan-500/15 shadow-[0_0_35px_rgba(6,182,212,0.5)]"
            >
              <User className="w-10 h-10 text-cyan-400" />
            </Circle>

            <span className="text-sm font-bold text-slate-900 dark:text-white font-mono bg-cyan-500/10 px-3 py-1 rounded-full border border-cyan-500/20">
              Candidate
            </span>
          </div>
        </div>

        {/* ANIMATED BEAMS (3 -> 1) */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={agent1Ref}
          toRef={aiRef}
          curvature={35}
          endYOffset={-25}
          gradientStartColor="#ec4899"
          gradientStopColor="#a855f7"
        />

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={agent2Ref}
          toRef={aiRef}
          curvature={0}
          gradientStartColor="#a855f7"
          gradientStopColor="#ec4899"
        />

        <AnimatedBeam
          containerRef={containerRef}
          fromRef={agent3Ref}
          toRef={aiRef}
          curvature={-35}
          endYOffset={25}
          gradientStartColor="#10b981"
          gradientStopColor="#a855f7"
        />

        {/* ANIMATED BEAM (1 -> 1) */}
        <AnimatedBeam
          containerRef={containerRef}
          fromRef={aiRef}
          toRef={candidateRef}
          curvature={0}
          gradientStartColor="#a855f7"
          gradientStopColor="#06b6d4"
        />
      </div>
    </section>
  );
}

export default PanelAIFlow;
