'use client';

export interface MessageItem {
  id: string;
  speaker: string; // e.g., 'Technical Panelist', 'Candidate', 'Product Panelist', 'HR Manager'
  role: 'agent' | 'user' | 'system';
  timestamp: string; // e.g. '3:44 PM'
  text: string;
  isHandoff?: boolean;
  handoffFrom?: string;
  handoffTo?: string;
  isRoundBoundary?: boolean;
  roundNumber?: number;
  roundTitle?: string;
  interviewerName?: string;
}

export function TranscriptMessage({ message }: { message: MessageItem }) {
  if (message.isRoundBoundary) {
    return (
      <div className="my-5 flex items-center gap-3">
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-pink-500/40 to-transparent"></div>
        <div className="flex items-center gap-2 rounded-full border border-pink-500/40 bg-black/60 px-4 py-1.5 text-xs font-mono text-pink-300 shadow-[0_0_15px_rgba(236,72,153,0.2)]">
          <span className="h-2 w-2 rounded-full bg-[#ec4899] animate-pulse"></span>
          <span className="font-semibold uppercase tracking-wider">
            ROUND {message.roundNumber}: {message.roundTitle?.replace(/^Round \d+ — /, '')}
          </span>
          {message.interviewerName && (
            <span className="text-zinc-400 font-normal">({message.interviewerName})</span>
          )}
        </div>
        <div className="h-[1px] flex-1 bg-gradient-to-r from-transparent via-pink-500/40 to-transparent"></div>
      </div>
    );
  }

  if (message.isHandoff) {
    return (
      <div className="my-3 flex flex-col items-center justify-center gap-1 rounded-lg border border-[#ec4899]/30 bg-[#ec4899]/[0.06] p-2.5 text-center">
        <span className="text-[10px] font-bold tracking-widest uppercase text-[#ec4899]">
          PANEL TRANSITION
        </span>
        <span className="text-xs font-semibold text-white/90">
          {message.handoffFrom || 'Technical'} → {message.handoffTo || 'Product'}
        </span>
        {message.text && (
          <span className="text-[11px] text-white/50">{message.text}</span>
        )}
      </div>
    );
  }

  const isUser = message.role === 'user';

  return (
    <div className="flex flex-col gap-1.5">
      {/* Speaker header */}
      <div className="flex items-center justify-between text-xs">
        <span
          className={`font-semibold ${
            isUser
              ? 'text-cyan-400'
              : message.speaker.includes('Product')
              ? 'text-purple-400'
              : message.speaker.includes('HR') || message.speaker.includes('Hiring')
              ? 'text-emerald-400'
              : 'text-pink-400'
          }`}
        >
          {message.speaker}
        </span>
        <span className="text-[11px] text-white/40">{message.timestamp}</span>
      </div>

      {/* Bubble with dark charcoal surface, subtle border, rounded corners */}
      <div className="rounded-xl border border-[#2e2e34] bg-[#222226] p-3 text-[13px] leading-relaxed text-white/90 shadow-sm">
        {message.text}
      </div>
    </div>
  );
}
