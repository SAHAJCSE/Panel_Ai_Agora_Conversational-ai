'use client';

import { useEffect, useRef } from 'react';
import { TranscriptMessage, type MessageItem } from './TranscriptMessage';

export interface TranscriptProps {
  messages: MessageItem[];
  inProgressMessage?: {
    speaker: string;
    text: string;
    role: 'agent' | 'user';
  } | null;
}

export function Transcript({ messages, inProgressMessage }: TranscriptProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll on new turns
  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) {
      el.scrollTop = el.scrollHeight;
    }
  }, [messages, inProgressMessage]);

  return (
    <aside className="flex h-full flex-col border-r border-[#27272a] bg-[#161616]">
      {/* Header */}
      <div className="flex flex-col border-b border-[#27272a] px-5 py-4">
        <h3 className="text-sm font-semibold tracking-tight text-white">
          Transcript
        </h3>
        <p className="text-[11px] text-white/40">
          Live voice turns
        </p>
      </div>

      {/* Message List */}
      <div
        ref={scrollContainerRef}
        className="flex-1 space-y-4 overflow-y-auto p-4 sm:p-5"
      >
        {messages.map((msg, idx) => (
          <TranscriptMessage key={`${msg.id}-${idx}`} message={msg} />
        ))}

        {/* Streaming In-Progress turn indicator */}
        {inProgressMessage && inProgressMessage.text && (
          <div className="flex flex-col gap-1.5 opacity-70">
            <div className="flex items-center justify-between text-xs">
              <span
                className={`font-semibold ${
                  inProgressMessage.role === 'user' ? 'text-cyan-400' : 'text-pink-400'
                }`}
              >
                {inProgressMessage.speaker}
              </span>
              <span className="text-[10px] text-white/40 animate-pulse">speaking…</span>
            </div>
            <div className="rounded-xl border border-dashed border-[#3a3a42] bg-[#222226]/80 p-3 text-[13px] leading-relaxed text-white/75">
              {inProgressMessage.text}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
