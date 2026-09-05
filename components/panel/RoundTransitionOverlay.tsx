'use client';

import React from 'react';
import { CheckCircle2, ArrowRight, Sparkles, Clock, ShieldCheck } from 'lucide-react';
import type { InterviewRoundConfig } from '@/types/conversation';

interface RoundTransitionOverlayProps {
  completedRound: InterviewRoundConfig;
  nextRound?: InterviewRoundConfig;
  onContinue: () => void;
}

export function RoundTransitionOverlay({
  completedRound,
  nextRound,
  onContinue,
}: RoundTransitionOverlayProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-xl rounded-2xl border border-pink-500/30 bg-[#0c0c12] p-6 sm:p-8 shadow-[0_0_60px_rgba(236,72,153,0.25)] text-white">
        {/* Glow Accent */}
        <div className="absolute -top-12 left-1/2 -translate-x-1/2 w-64 h-24 bg-[#ec4899]/20 blur-3xl pointer-events-none rounded-full" />

        {/* Top Status Header */}
        <div className="flex items-center justify-between pb-4 border-b border-white/10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300 text-xs font-mono font-semibold">
            <Clock className="w-3.5 h-3.5 text-pink-400" />
            <span>ROUND {completedRound.roundNumber} COMPLETE</span>
          </div>
          <div className="text-xs font-mono text-zinc-400">
            {Math.floor(completedRound.durationSeconds / 60)}:00 / {Math.floor(completedRound.durationSeconds / 60)}:00
          </div>
        </div>

        {/* Round Title & Completion Confirmation */}
        <div className="mt-5">
          <h2 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2.5">
            <span>{completedRound.title.replace(/^Round \d+ — /, '')} Completed</span>
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
          </h2>
          <p className="mt-1.5 text-sm text-zinc-300">
            {completedRound.interviewerName} ({completedRound.interviewerRole}) has finalized this round&apos;s evaluation.
          </p>
        </div>

        {/* Context Memory Sync Banner */}
        <div className="mt-5 rounded-xl border border-emerald-500/30 bg-emerald-950/20 p-4">
          <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>Context Shared with Next Interviewer ✓</span>
          </div>
          <p className="mt-1 text-xs text-zinc-400 leading-relaxed">
            Candidate statements, architectural trade-offs, and technical evidence have been committed to local memory and injected into the upcoming interviewer&apos;s active prompt.
          </p>
        </div>

        {/* Next Round Preview Card */}
        {nextRound ? (
          <div className="mt-5 rounded-xl border border-white/10 bg-zinc-900/60 p-4">
            <div className="flex items-center justify-between text-xs font-mono text-zinc-400 mb-2">
              <span className="uppercase tracking-wider text-[#ec4899] font-semibold">
                Up Next: Round {nextRound.roundNumber} of 3
              </span>
              <span>{Math.floor(nextRound.durationSeconds / 60)} Minutes</span>
            </div>

            <div className="text-base font-bold text-white">
              {nextRound.title.replace(/^Round \d+ — /, '')} — {nextRound.interviewerName}
            </div>
            <div className="text-xs text-zinc-400 font-mono mt-0.5">
              {nextRound.interviewerRole}
            </div>

            {completedRound.nextRoundPreview?.previewQuote && (
              <div className="mt-3 rounded-lg bg-black/40 border border-white/5 p-3 text-xs italic text-zinc-300">
                &ldquo;{completedRound.nextRoundPreview.previewQuote}&rdquo;
              </div>
            )}

            <div className="mt-3 flex flex-wrap gap-1.5">
              {nextRound.focus.slice(0, 4).map((topic) => (
                <span
                  key={topic}
                  className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-zinc-300"
                >
                  {topic}
                </span>
              ))}
            </div>
          </div>
        ) : (
          <div className="mt-5 rounded-xl border border-white/10 bg-zinc-900/60 p-4 text-center">
            <div className="text-sm font-semibold text-emerald-300">
              All 3 Interview Rounds Complete!
            </div>
            <p className="text-xs text-zinc-400 mt-1">
              Synthesizing comprehensive scorecard, circular radar metrics, and evidence trace.
            </p>
          </div>
        )}

        {/* Action CTA */}
        <div className="mt-6 flex items-center justify-end">
          <button
            type="button"
            onClick={onContinue}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3 rounded-full bg-gradient-to-r from-[#ec4899] to-[#d926aa] text-white text-sm font-semibold shadow-[0_0_25px_rgba(236,72,153,0.5)] hover:shadow-[0_0_35px_rgba(236,72,153,0.8)] hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            <span>{nextRound ? `Continue to ${nextRound.interviewerName}` : 'View Final Assessment'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
