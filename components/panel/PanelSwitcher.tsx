'use client';

import React from 'react';
import type { InterviewTrack } from '@/types/conversation';
import { PANEL_ROUNDS } from '@/data/demo';
import { Clock, CheckCircle2, Shield } from 'lucide-react';

export type PanelTrack = 'technical' | 'product' | 'hiring_manager';

export interface PanelSwitcherProps {
  currentTrack: InterviewTrack;
  elapsedFormatted: string;
  currentRoundIndex?: number;
  roundSecondsRemaining?: number;
}

export function PanelSwitcher({
  currentTrack,
  elapsedFormatted,
  currentRoundIndex = 0,
  roundSecondsRemaining = 180,
}: PanelSwitcherProps) {
  const roundMins = Math.floor(roundSecondsRemaining / 60);
  const roundSecs = roundSecondsRemaining % 60;
  const roundFormatted = `${roundMins}:${String(roundSecs).padStart(2, '0')}`;

  return (
    <div className="flex w-full flex-wrap items-center justify-between gap-3 border-b border-[#27272a] bg-[#101014] px-5 py-2.5 sm:px-8">
      {/* Left: Round Progress Sequence */}
      <div className="flex items-center gap-2 overflow-x-auto py-0.5">
        <span className="text-xs font-semibold text-white/50 hidden sm:inline mr-1">
          Panel Rounds:
        </span>

        {PANEL_ROUNDS.map((round, idx) => {
          const isCurrent = idx === currentRoundIndex;
          const isCompleted = idx < currentRoundIndex;

          return (
            <div
              key={round.roundNumber}
              className={`flex items-center gap-2 rounded-full px-3 py-1 text-xs font-medium transition-all duration-300 select-none ${
                isCurrent
                  ? 'border border-[#ec4899]/80 bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-pink-500/10 text-white shadow-[0_0_15px_rgba(236,72,153,0.3)]'
                  : isCompleted
                  ? 'border border-emerald-500/40 bg-emerald-950/30 text-emerald-300'
                  : 'border border-[#27272c] bg-[#1a1a1f] text-white/40'
              }`}
            >
              {isCompleted ? (
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
              ) : isCurrent ? (
                <span className="w-2 h-2 rounded-full bg-[#ec4899] animate-pulse shrink-0" />
              ) : (
                <span className="text-[10px] font-mono text-zinc-500">{round.roundNumber}</span>
              )}

              <span className="font-medium">
                {round.interviewerName.split(' ')[0]} ({round.track === 'technical' ? 'Tech' : round.track === 'product' ? 'Product' : 'HR'})
              </span>

              {isCurrent && (
                <span className="font-mono text-[11px] font-bold text-pink-300 bg-black/40 px-1.5 py-0.2 rounded border border-pink-500/30">
                  {roundFormatted}
                </span>
              )}
            </div>
          );
        })}
      </div>

      {/* Right: Round Countdown & Total Elapsed Telemetry */}
      <div className="flex items-center gap-4 text-xs font-mono">
        <div className="flex items-center gap-1.5 text-pink-300 bg-pink-500/10 border border-pink-500/25 px-2.5 py-1 rounded-full">
          <Clock className="w-3.5 h-3.5 text-[#ec4899]" />
          <span>Round Timer: <strong className="text-white">{roundFormatted}</strong></span>
        </div>

        <div className="hidden md:flex items-center gap-1 text-zinc-400">
          <span>Total:</span>
          <span className="text-zinc-200">{elapsedFormatted}</span>
        </div>
      </div>
    </div>
  );
}
