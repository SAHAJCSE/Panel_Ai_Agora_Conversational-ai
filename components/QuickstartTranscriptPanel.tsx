'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowDown, AudioLines } from 'lucide-react';
import { demoCandidate, INTERVIEWER_PROFILES } from '@/data/demo';
import type { InterviewTrack, HandoffEvent } from '@/types/conversation';

type TranscriptMessage = {
  turn_id?: string | number;
  uid: number;
  text?: string;
  createdAt?: number;
};

type QuickstartTranscriptPanelProps = {
  messageList: TranscriptMessage[];
  currentInProgressMessage: TranscriptMessage | null;
  agentUID: string;
  currentTrack?: InterviewTrack;
  handoffEvents?: HandoffEvent[];
};

function formatMessageTime(createdAt?: number) {
  if (!createdAt) return null;
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
  }).format(new Date(createdAt));
}

function preferredScrollBehavior(): ScrollBehavior {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
    ? 'auto'
    : 'smooth';
}

export function QuickstartTranscriptPanel({
  messageList,
  currentInProgressMessage,
  agentUID,
  currentTrack = 'technical',
  handoffEvents = [],
}: QuickstartTranscriptPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const announcedTurnCountRef = useRef(0);
  const [isFollowing, setIsFollowing] = useState(true);
  const [turnAnnouncement, setTurnAnnouncement] = useState('');
  const messages = useMemo(
    () =>
      currentInProgressMessage
        ? [...messageList, currentInProgressMessage]
        : messageList,
    [currentInProgressMessage, messageList],
  );

  useEffect(() => {
    const node = scrollRef.current;
    if (!node || !isFollowing) return;
    node.scrollTo({
      top: node.scrollHeight,
      behavior: preferredScrollBehavior(),
    });
  }, [messages, isFollowing]);

  useEffect(() => {
    const nextCount = messageList.length;
    if (nextCount > announcedTurnCountRef.current) {
      const latestMessage = messageList[nextCount - 1];
      const speaker =
        String(latestMessage?.uid) === agentUID
          ? 'Interviewer'
          : demoCandidate.name;
      const text = latestMessage?.text?.trim();
      if (text) setTurnAnnouncement(`${speaker}: ${text}`);
    }
    announcedTurnCountRef.current = nextCount;
  }, [agentUID, messageList]);

  const handleScroll = () => {
    const node = scrollRef.current;
    if (!node) return;
    const distanceFromBottom = node.scrollHeight - node.scrollTop - node.clientHeight;
    setIsFollowing(distanceFromBottom < 72);
  };

  const jumpToLive = () => {
    const node = scrollRef.current;
    if (!node) return;
    node.scrollTo({
      top: node.scrollHeight,
      behavior: preferredScrollBehavior(),
    });
    setIsFollowing(true);
  };

  const profile = INTERVIEWER_PROFILES[currentTrack];

  // Build interleaved items: messages and handoff events by timestamp
  type TimelineItem =
    | { type: 'message'; message: TranscriptMessage; index: number }
    | { type: 'handoff'; event: HandoffEvent };

  const timeline = useMemo<TimelineItem[]>(() => {
    const items: TimelineItem[] = messages.map((m, i) => ({
      type: 'message' as const,
      message: m,
      index: i,
    }));
    for (const event of handoffEvents) {
      // Insert handoff at the point closest to its timestamp
      const insertIdx = items.findIndex(
        (item) =>
          item.type === 'message' &&
          item.message.createdAt &&
          item.message.createdAt > event.timestamp,
      );
      const handoffItem: TimelineItem = { type: 'handoff', event };
      if (insertIdx === -1) {
        items.push(handoffItem);
      } else {
        items.splice(insertIdx, 0, handoffItem);
      }
    }
    return items;
  }, [messages, handoffEvents]);

  return (
    <section
      className="relative flex h-full min-h-0 w-full flex-col overflow-hidden"
      aria-labelledby="transcript-title"
    >
      {/* Header */}
      <div className="flex min-h-14 shrink-0 items-center justify-between gap-3 border-b border-white/[0.06] px-4 py-3 sm:px-5">
        <div className="flex items-center gap-3">
          <span className="grid h-8 w-8 place-items-center rounded-lg border border-white/[0.08] bg-white/[0.04] text-[var(--panel-blue)]">
            <AudioLines className="h-4 w-4" />
          </span>
          <div>
            <h2 id="transcript-title" className="text-sm font-semibold text-white">
              Live Transcript
            </h2>
            <p className="mt-0.5 text-[10px] text-white/30">
              {messageList.length} turns · {profile.name}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 rounded-full border border-[#22c55e]/15 bg-[#22c55e]/[0.06] px-2.5 py-1 text-[#22c55e]">
          <span className="h-1.5 w-1.5 rounded-full bg-current animate-pulse" />
          <span className="data-type text-[9px] font-semibold uppercase tracking-[0.1em]">
            Capturing
          </span>
        </div>
      </div>

      {/* Scrollable transcript */}
      <div
        ref={scrollRef}
        onScroll={handleScroll}
        className="scrollbar-thin min-h-0 flex-1 overflow-y-auto px-3 py-3 sm:px-5 sm:py-4"
        role="log"
        aria-live="off"
        aria-relevant="additions"
        aria-label="Interview transcript"
      >
        {timeline.length === 0 ? (
          <div className="flex h-full min-h-56 flex-col items-center justify-center px-6 text-center">
            <span className="relative grid h-14 w-14 place-items-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-[var(--panel-blue)] shadow-lg">
              <AudioLines className="h-6 w-6" />
              <span className="absolute -right-1 -top-1 h-3 w-3 rounded-full border-2 border-[#080b16] bg-[#22c55e]" />
            </span>
            <p className="mt-4 text-sm font-semibold text-white">Transcript standing by</p>
            <p className="mt-1.5 max-w-xs text-xs leading-5 text-white/40">
              Conversation will appear here as the interview begins.
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {timeline.map((item, idx) => {
              if (item.type === 'handoff') {
                const ev = item.event;
                return (
                  <div
                    key={`handoff-${ev.timestamp}`}
                    className="handoff-banner mx-1 my-1"
                  >
                    <span className="text-sm">👋</span>
                    <span>
                      HANDOFF → {INTERVIEWER_PROFILES[ev.toTrack].name.toUpperCase()}
                    </span>
                  </div>
                );
              }

              const message = item.message;
              const isAgent = String(message.uid) === agentUID;
              const isStreaming = message === currentInProgressMessage;
              const label = isAgent ? profile.name : demoCandidate.name;
              const text = message.text?.trim();
              const time = formatMessageTime(message.createdAt);

              return (
                <article
                  key={`${message.turn_id ?? message.uid}-${item.index}`}
                  className={`rounded-xl px-3.5 py-3 ${
                    isAgent
                      ? 'chat-bubble-agent'
                      : 'chat-bubble-user'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span
                        className="h-1.5 w-1.5 rounded-full"
                        style={{
                          background: isAgent ? profile.color : '#64748b',
                        }}
                      />
                      <span className="text-[11px] font-semibold text-white/70">
                        {label}
                      </span>
                      {isStreaming && (
                        <span className="data-type text-[8px] font-semibold uppercase tracking-[0.1em] text-[var(--panel-blue)]">
                          Live
                        </span>
                      )}
                    </div>
                    {time && (
                      <span className="data-type text-[9px] text-white/25">{time}</span>
                    )}
                  </div>

                  <p className="mt-1.5 min-w-0 whitespace-pre-wrap text-sm leading-6 text-white/85">
                    {text || (
                      <span className="inline-flex items-center gap-1 text-white/30">
                        <span className="h-1 w-1 animate-pulse rounded-full bg-current" />
                        <span className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:120ms]" />
                        <span className="h-1 w-1 animate-pulse rounded-full bg-current [animation-delay:240ms]" />
                      </span>
                    )}
                  </p>
                </article>
              );
            })}
          </div>
        )}
      </div>

      <p className="sr-only" role="status" aria-live="polite" aria-atomic="true">
        {turnAnnouncement}
      </p>

      {!isFollowing && (
        <button
          type="button"
          onClick={jumpToLive}
          className="absolute bottom-4 left-1/2 flex min-h-10 -translate-x-1/2 items-center gap-2 rounded-full border border-white/10 bg-[#111827] px-3 py-2 text-xs font-semibold text-[var(--panel-blue)] shadow-lg backdrop-blur"
        >
          <ArrowDown className="h-3.5 w-3.5" />
          Jump to live
        </button>
      )}
    </section>
  );
}
