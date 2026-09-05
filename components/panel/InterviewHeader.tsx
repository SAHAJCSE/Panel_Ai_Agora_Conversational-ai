'use client';

import { Activity } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface InterviewHeaderProps {
  latencyMs?: number;
  onEndConversation: () => void;
  isEnding?: boolean;
}

export function InterviewHeader({
  latencyMs = 233,
  onEndConversation,
  isEnding = false,
}: InterviewHeaderProps) {
  return (
    <header className="relative z-30 flex w-full shrink-0 items-center justify-between border-b border-[#27272a] bg-[#181818] px-5 py-3 sm:px-8">
      {/* LEFT: MP Logo, Title, Pipeline badges, Latency */}
      <div className="flex flex-wrap items-center gap-3 sm:gap-4">
        {/* Circular MP Avatar Icon */}
        <div className="relative flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-tr from-[#ec4899] via-[#a855f7] to-[#06b6d4] p-[1.5px] shadow-[0_0_12px_rgba(236,72,153,0.3)]">
          <div className="flex h-full w-full items-center justify-center rounded-full bg-[#181818]">
            <span className="text-xs font-bold tracking-tight text-white">MP</span>
          </div>
        </div>

        {/* Title and Subtitle */}
        <div className="flex flex-col">
          <span className="text-sm font-semibold tracking-tight text-white leading-none">
            Multi Persona
          </span>
          <span className="text-[10px] font-medium tracking-wide uppercase text-white/40 leading-tight mt-0.5">
            Pipeline
          </span>
        </div>

        {/* Pipeline Separator */}
        <div className="hidden h-4 w-px bg-white/10 sm:block" />

        {/* Technology Pipeline Badges */}
        <div className="hidden items-center gap-1.5 text-[11px] text-white/60 sm:flex">
          <span className="rounded-md border border-[#2e2e32] bg-[#222226] px-2 py-0.5 font-medium text-white/80">
            Deepgram STT
          </span>
          <span className="text-white/30">/</span>
          <span className="rounded-md border border-[#2e2e32] bg-[#222226] px-2 py-0.5 font-medium text-white/80">
            OpenAI LLM
          </span>
          <span className="text-white/30">/</span>
          <span className="rounded-md border border-[#2e2e32] bg-[#222226] px-2 py-0.5 font-medium text-white/80">
            MiniMax TTS
          </span>
        </div>

        {/* Latency badge */}
        <div className="flex items-center gap-1 rounded-md border border-[#2e2e32] bg-[#222226] px-2 py-0.5 text-[10px] font-medium text-white/70">
          <Activity className="h-3 w-3 text-emerald-400" />
          <span>{latencyMs}ms</span>
        </div>
      </div>

      {/* RIGHT: Green online indicator & End Conversation button */}
      <div className="flex items-center gap-3">
        {/* Online Indicator */}
        <div className="flex items-center gap-1.5 px-1 text-[11px] font-medium text-white/60">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-500" />
          </span>
          <span className="hidden text-white/40 sm:inline">Online</span>
        </div>

        {/* End Conversation Button: dark transparent background, thin red border, subtle hover state */}
        <Button
          variant="outline"
          size="sm"
          onClick={onEndConversation}
          disabled={isEnding}
          className="h-8 rounded-lg border border-red-500/40 bg-red-500/[0.04] px-3.5 text-xs font-medium text-red-400 transition-all hover:border-red-500/80 hover:bg-red-500/10 hover:text-red-300 disabled:opacity-50"
        >
          {isEnding ? 'Ending…' : 'End Conversation'}
        </Button>
      </div>
    </header>
  );
}
