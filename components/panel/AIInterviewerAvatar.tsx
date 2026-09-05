'use client';

export type AvatarState = 'idle' | 'listening' | 'thinking' | 'speaking' | 'handoff';

export interface AIInterviewerAvatarProps {
  state: AvatarState;
  interviewerName?: string;
  interviewerRole?: string;
}

export function AIInterviewerAvatar({
  state,
}: AIInterviewerAvatarProps) {
  // Map internal state to user's desired display label
  const getDisplayState = () => {
    switch (state) {
      case 'speaking':
        return 'Talking';
      case 'listening':
        return 'Listening';
      case 'thinking':
        return 'Thinking';
      case 'handoff':
        return 'Switching interviewer';
      case 'idle':
      default:
        return 'Ready';
    }
  };

  const isSpeaking = state === 'speaking';
  const isListening = state === 'listening';
  const isThinking = state === 'thinking';
  const isHandoff = state === 'handoff';

  return (
    <div className="flex flex-col items-center justify-center select-none">
      {/* ── Layered 3D Abstract Glass Avatar ── */}
      <div className="relative flex h-64 w-64 items-center justify-center sm:h-72 sm:w-72">
        {/* Ambient Outer Glow Field */}
        <div
          className={`absolute inset-[-24px] rounded-full transition-all duration-700 ${
            isSpeaking
              ? 'opacity-80 scale-110'
              : isThinking
              ? 'opacity-50 scale-100 animate-pulse'
              : isListening
              ? 'opacity-60 scale-105'
              : 'opacity-40 scale-95'
          }`}
          style={{
            background: isHandoff
              ? 'radial-gradient(circle, rgba(236,72,153,0.4) 0%, rgba(168,85,247,0.3) 40%, transparent 70%)'
              : 'radial-gradient(circle, rgba(6,182,212,0.35) 0%, rgba(168,85,247,0.35) 45%, rgba(236,72,153,0.2) 70%, transparent 100%)',
            filter: 'blur(36px)',
          }}
        />

        {/* Outer Ring Wave (animated when speaking/listening) */}
        <div
          className={`absolute inset-0 rounded-full border border-cyan-400/20 transition-all duration-700 ${
            isSpeaking
              ? 'scale-110 border-cyan-400/50 shadow-[0_0_30px_rgba(6,182,212,0.3)] animate-ping'
              : isListening
              ? 'border-purple-400/30 shadow-[0_0_20px_rgba(168,85,247,0.2)]'
              : 'opacity-20'
          }`}
          style={{ animationDuration: '3s' }}
        />

        {/* Middle Glass Disc - Cyan Accent */}
        <div
          className={`absolute h-48 w-48 rounded-full border border-cyan-400/30 backdrop-blur-md transition-all duration-700 ${
            isSpeaking
              ? 'scale-105 translate-x-2 -translate-y-2'
              : isThinking
              ? 'rotate-45 scale-100'
              : 'translate-x-1 -translate-y-1'
          }`}
          style={{
            background:
              'linear-gradient(135deg, rgba(6,182,212,0.25) 0%, rgba(59,130,246,0.1) 60%, rgba(168,85,247,0.2) 100%)',
            boxShadow:
              'inset 0 1px 1px 0 rgba(255,255,255,0.4), 0 10px 30px 0 rgba(6,182,212,0.25)',
          }}
        />

        {/* Overlapping Glass Disc - Purple/Pink Accent */}
        <div
          className={`absolute h-44 w-44 rounded-full border border-purple-400/40 backdrop-blur-lg transition-all duration-700 ${
            isSpeaking
              ? 'scale-105 -translate-x-2 translate-y-2'
              : isThinking
              ? '-rotate-45 scale-95'
              : '-translate-x-1 translate-y-1'
          }`}
          style={{
            background:
              'linear-gradient(225deg, rgba(168,85,247,0.35) 0%, rgba(236,72,153,0.2) 50%, rgba(59,130,246,0.15) 100%)',
            boxShadow:
              'inset 0 1px 1px 0 rgba(255,255,255,0.5), 0 12px 35px 0 rgba(168,85,247,0.3)',
          }}
        />

        {/* Central Core Luminescent Orb */}
        <div
          className={`relative z-10 flex h-36 w-36 items-center justify-center rounded-full border border-white/30 backdrop-blur-xl transition-transform duration-500 ${
            isSpeaking
              ? 'scale-110 shadow-[0_0_40px_rgba(236,72,153,0.5)]'
              : isListening
              ? 'scale-100 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
              : isThinking
              ? 'scale-95 animate-pulse shadow-[0_0_20px_rgba(168,85,247,0.3)]'
              : 'scale-90 opacity-70'
          }`}
          style={{
            background:
              'radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5) 0%, rgba(168,85,247,0.3) 40%, rgba(15,23,42,0.85) 90%)',
            boxShadow:
              'inset 0 2px 4px 0 rgba(255,255,255,0.6), inset 0 -4px 10px 0 rgba(0,0,0,0.6), 0 15px 40px rgba(0,0,0,0.5)',
          }}
        >
          {/* Internal Iris / Core Light */}
          <div
            className={`h-16 w-16 rounded-full transition-all duration-500 ${
              isSpeaking
                ? 'scale-125 bg-gradient-to-r from-pink-400 via-purple-400 to-cyan-400 opacity-90 blur-[6px]'
                : isListening
                ? 'scale-100 bg-gradient-to-r from-cyan-400 to-purple-400 opacity-80 blur-[8px]'
                : isThinking
                ? 'scale-90 bg-purple-400 opacity-60 blur-[10px]'
                : 'scale-75 bg-slate-500 opacity-40 blur-[12px]'
            }`}
          />
        </div>
      </div>

      {/* ── State Typography: "Talking", "Listening", etc. ── */}
      <div className="mt-8 text-center">
        <h2 className="text-2xl font-light tracking-normal text-white sm:text-3xl">
          {getDisplayState()}
        </h2>
      </div>
    </div>
  );
}
