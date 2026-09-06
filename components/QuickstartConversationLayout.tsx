'use client';

import { type ReactNode } from 'react';
import { InterviewHeader } from './panel/InterviewHeader';
import { PanelSwitcher, type PanelTrack } from './panel/PanelSwitcher';

export interface QuickstartConversationLayoutProps {
  transcriptPanel: ReactNode;
  visualizer: ReactNode;
  controls: ReactNode;
  currentTrack?: PanelTrack | string;
  elapsedFormatted: string;
  currentRoundIndex?: number;
  roundSecondsRemaining?: number;
  totalMinutes?: number;
  latencyMs?: number;
  onEndConversation: () => void;
  isEnding?: boolean;
}

export function QuickstartConversationLayout({
  transcriptPanel,
  visualizer,
  controls,
  currentTrack = 'technical',
  elapsedFormatted,
  currentRoundIndex = 0,
  roundSecondsRemaining = 180,
  totalMinutes,
  latencyMs = 233,
  onEndConversation,
  isEnding = false,
}: QuickstartConversationLayoutProps) {
  const safeTrack: PanelTrack =
    currentTrack === 'product'
      ? 'product'
      : currentTrack === 'hiring_manager'
      ? 'hiring_manager'
      : 'technical';

  return (
    <div className="flex min-h-dvh w-full flex-col bg-[#141414] text-white selection:bg-[#ec4899]/30">
      {/* ── 1. Top Header ── */}
      <InterviewHeader
        latencyMs={latencyMs}
        onEndConversation={onEndConversation}
        isEnding={isEnding}
      />

      {/* ── 2. Panel Switcher (3-Round Autonomous Progress Bar) ── */}
      <PanelSwitcher
        currentTrack={safeTrack}
        elapsedFormatted={elapsedFormatted}
        currentRoundIndex={currentRoundIndex}
        roundSecondsRemaining={roundSecondsRemaining}
        totalMinutes={totalMinutes}
      />

      {/* ── 3. Main Content Split: ~30% Left / 70% Right ── */}
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        {/* Left: Transcript (approx 30%) */}
        <section
          aria-label="Transcript Panel"
          className="flex min-h-[45vh] w-full flex-col lg:h-[calc(100dvh-95px)] lg:w-[32%] lg:max-w-[420px]"
        >
          {transcriptPanel}
        </section>

        {/* Right: AI Avatar and Voice Controls (approx 70%) */}
        <section
          aria-label="AI Interviewer"
          className="relative flex flex-1 flex-col items-center justify-between p-6 sm:p-10 lg:h-[calc(100dvh-95px)]"
        >
          {/* Subtle Ambient Background Gradient */}
          <div
            className="pointer-events-none absolute inset-0 opacity-20"
            style={{
              background:
                'radial-gradient(ellipse at 50% 45%, rgba(168,85,247,0.15), rgba(6,182,212,0.08), transparent 70%)',
            }}
          />

          {/* Spacer top */}
          <div className="h-4" />

          {/* Center: Abstract AI Avatar & State Typography */}
          <div className="relative z-10 flex flex-col items-center justify-center my-auto">
            {visualizer}
          </div>

          {/* Bottom Controls: Floating minimal group at lower center-right */}
          <div className="relative z-20 flex w-full justify-center pb-2 pt-6">
            {controls}
          </div>
        </section>
      </div>
    </div>
  );
}
