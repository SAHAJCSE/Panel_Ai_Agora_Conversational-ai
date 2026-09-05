'use client';

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import AgoraRTC, {
  useRTCClient,
  useLocalMicrophoneTrack,
  useRemoteUsers,
  useClientEvent,
  useJoin,
  usePublish,
  RemoteUser,
  UID,
} from 'agora-rtc-react';
import {
  AgoraVoiceAI,
  AgoraVoiceAIEvents,
  AgentState,
  MessageSalStatus,
  TranscriptHelperMode,
  type TranscriptHelperItem,
  type UserTranscription,
  type AgentTranscription,
} from 'agora-agent-client-toolkit';
import { DEFAULT_AGENT_UID } from '@/lib/agora';
import {
  getCurrentInProgressMessage,
  getMessageList,
  mapAgentVisualizerState,
  normalizeTimestampMs,
  normalizeTranscript,
} from '@/lib/conversation';
import { QuickstartConversationLayout } from './QuickstartConversationLayout';
import { Transcript } from './panel/Transcript';
import type { MessageItem } from './panel/TranscriptMessage';
import { AIInterviewerAvatar, type AvatarState } from './panel/AIInterviewerAvatar';
import { VoiceControls } from './panel/VoiceControls';
import type {
  ConversationComponentProps,
  HandoffEvent,
  InterviewTrack,
} from '@/types/conversation';
import { INTERVIEWER_PROFILES, demoCandidate, PANEL_ROUNDS } from '@/data/demo';
import { RoundTransitionOverlay } from './panel/RoundTransitionOverlay';
import {
  orchestrateTurn,
  initializeSessionOpener,
} from '@/lib/interview/orchestrator';
import { sessionStore } from '@/lib/interview/state-store';
import { generateScorecard } from '@/lib/interview/scorecard';
import { transmitAgentPresenceContext } from '@/lib/interview/rtm-presence';
import type { InterviewSession } from '@/lib/interview/types';

// Cap the displayed issues list to avoid overwhelming the UI during a cascade of errors.
const MAX_CONNECTION_ISSUES = 6;

type AgoraRtcWithParameters = typeof AgoraRTC & {
  setParameter?: (key: string, value: unknown) => void;
};

// Payload shape for signaling-level errors forwarded by the agent over RTM.
type RtmMessageErrorPayload = {
  object: 'message.error';
  module?: string;
  code?: number;
  message?: string;
  send_ts?: number;
};

// Payload shape for SAL (Session Abstraction Layer) registration status messages.
type RtmSalStatusPayload = {
  object: 'message.sal_status';
  status?: string;
  timestamp?: number;
};

function isRtmMessageErrorPayload(value: unknown): value is RtmMessageErrorPayload {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as { object?: unknown }).object === 'message.error'
  );
}

function isRtmSalStatusPayload(value: unknown): value is RtmSalStatusPayload {
  return (
    !!value &&
    typeof value === 'object' &&
    (value as { object?: unknown }).object === 'message.sal_status'
  );
}

export default function ConversationComponent({
  agoraData,
  rtmClient,
  currentTrack = 'technical',
  onTokenWillExpire,
  onEndConversation,
  onSwitchTrack,
}: ConversationComponentProps) {
  const client = useRTCClient();
  const remoteUsers = useRemoteUsers();
  const [isEnabled, setIsEnabled] = useState(true);
  const [isAgentConnected, setIsAgentConnected] = useState(false);
  const [handoffEvents, setHandoffEvents] = useState<HandoffEvent[]>([]);
  const [isSwitchingTrack, setIsSwitchingTrack] = useState(false);
  const [isEnding, setIsEnding] = useState(false);
  const handoffCooldownRef = useRef(false);

  // Elapsed interview timer with reload persistence
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('panelai_round_progress');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.elapsedSeconds === 'number') return parsed.elapsedSeconds;
        }
      } catch {}
    }
    return 0;
  });

  useEffect(() => {
    const timer = window.setInterval(() => {
      setElapsedSeconds((s: number) => s + 1);
    }, 1000);
    return () => window.clearInterval(timer);
  }, []);

  const elapsedFormatted = useMemo(() => {
    const mins = Math.floor(elapsedSeconds / 60);
    const secs = elapsedSeconds % 60;
    return `${mins}:${String(secs).padStart(2, '0')}`;
  }, [elapsedSeconds]);

  // 3-Stage Autonomous Round State with reload persistence
  const [currentRoundIndex, setCurrentRoundIndex] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('panelai_round_progress');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.currentRoundIndex === 'number' && parsed.currentRoundIndex >= 0 && parsed.currentRoundIndex < PANEL_ROUNDS.length) {
            return parsed.currentRoundIndex;
          }
        }
      } catch {}
    }
    const idx = PANEL_ROUNDS.findIndex((r) => r.track === currentTrack);
    return idx >= 0 ? idx : 0;
  });

  const currentRound = PANEL_ROUNDS[currentRoundIndex] || PANEL_ROUNDS[0];

  const [roundSecondsRemaining, setRoundSecondsRemaining] = useState<number>(() => {
    if (typeof window !== 'undefined') {
      try {
        const saved = localStorage.getItem('panelai_round_progress');
        if (saved) {
          const parsed = JSON.parse(saved);
          if (typeof parsed.roundSecondsRemaining === 'number' && parsed.roundSecondsRemaining > 0) {
            return parsed.roundSecondsRemaining;
          }
        }
      } catch {}
    }
    return currentRound.durationSeconds;
  });

  const [showTransitionOverlay, setShowTransitionOverlay] = useState(false);
  const [roundBoundaries, setRoundBoundaries] = useState<Array<{
    timestamp: number;
    roundNumber: number;
    roundTitle: string;
    interviewerName: string;
  }>>([
    {
      timestamp: Date.now(),
      roundNumber: PANEL_ROUNDS[0].roundNumber,
      roundTitle: PANEL_ROUNDS[0].title,
      interviewerName: PANEL_ROUNDS[0].interviewerName,
    },
  ]);

  // Persist round state to localStorage on update
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        'panelai_round_progress',
        JSON.stringify({
          currentRoundIndex,
          roundSecondsRemaining,
          elapsedSeconds,
          track: currentTrack,
        }),
      );
    } catch {}
  }, [currentRoundIndex, roundSecondsRemaining, elapsedSeconds, currentTrack]);

  // Round countdown timer (pauses during round transition modal or ending)
  useEffect(() => {
    if (showTransitionOverlay || isEnding) return;

    const timer = window.setInterval(() => {
      setRoundSecondsRemaining((prev: number) => {
        if (prev <= 1) {
          setShowTransitionOverlay(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [showTransitionOverlay, isEnding]);

  // Tracks granular RTC connection state
  const [connectionState, setConnectionState] = useState<string>('CONNECTING');
  const [joinedUID, setJoinedUID] = useState<UID>(0);

  // In an Agora 1-on-1 interview, sentinel "0" and client.uid identify candidate speech.
  // Any other remote participant is the AI interviewer agent.
  const isAgentUID = useCallback(
    (uid: string | number | undefined | null) => {
      if (uid === undefined || uid === null) return false;
      const str = String(uid);
      if (str === '0' || str === String(client?.uid) || (joinedUID && str === String(joinedUID))) {
        return false;
      }
      return true;
    },
    [client?.uid, joinedUID],
  );

  // Transcript + agent state
  const [rawTranscript, setRawTranscript] = useState<
    TranscriptHelperItem<Partial<UserTranscription | AgentTranscription>>[]
  >([]);
  const [agentState, setAgentState] = useState<AgentState | null>(null);
  const [liveSession, setLiveSession] = useState<InterviewSession | null>(null);
  const processedTurnsRef = useRef<Set<string | number>>(new Set());

  // StrictMode guard for useJoin
  const [isReady, setIsReady] = useState(false);
  useEffect(() => {
    let cancelled = false;
    const id = setTimeout(() => {
      if (!cancelled) setIsReady(true);
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(id);
      setIsReady(false);
    };
  }, []);

  const { isConnected: joinSuccess } = useJoin(
    {
      appid: process.env.NEXT_PUBLIC_AGORA_APP_ID!,
      channel: agoraData.channel,
      token: agoraData.token,
      uid: parseInt(agoraData.uid, 10),
    },
    isReady,
  );

  const { localMicrophoneTrack } = useLocalMicrophoneTrack(isReady);

  useEffect(() => {
    if (!client) return;
    try {
      (AgoraRTC as AgoraRtcWithParameters).setParameter?.(
        'ENABLE_AUDIO_PTS',
        true,
      );
    } catch (error) {
      console.warn('Could not set ENABLE_AUDIO_PTS:', error);
    }
  }, [client]);

  useEffect(() => {
    if (joinSuccess && client) {
      const uid = client.uid;
      if (uid !== null && uid !== undefined) {
        setJoinedUID(uid);
      }
    }
  }, [joinSuccess, client]);

  // Initialize AgoraVoiceAI once the channel is joined
  useEffect(() => {
    if (!isReady || !joinSuccess) return;

    let cancelled = false;

    (async () => {
      try {
        const ai = await AgoraVoiceAI.init({
          rtcEngine: client,
          rtmConfig: { rtmEngine: rtmClient },
          renderMode: TranscriptHelperMode.TEXT,
          enableLog: true,
        });

        if (cancelled) {
          try {
            if (AgoraVoiceAI.getInstance() === ai) {
              ai.unsubscribe();
              ai.destroy();
            }
          } catch {}
          return;
        }

        ai.on(AgoraVoiceAIEvents.TRANSCRIPT_UPDATED, (t) => {
          setRawTranscript([...t]);
        });
        ai.on(AgoraVoiceAIEvents.AGENT_STATE_CHANGED, (_, event) =>
          setAgentState(event.state),
        );
        ai.on(AgoraVoiceAIEvents.AGENT_ERROR, (agentUserId, error) => {
          console.warn('[AgoraVoiceAI] Agent error event:', agentUserId, error);
        });
        ai.subscribeMessage(agoraData.channel);
      } catch (error) {
        if (!cancelled) {
          console.error('[AgoraVoiceAI] init failed:', error);
        }
      }
    })();

    return () => {
      cancelled = true;
      try {
        const ai = AgoraVoiceAI.getInstance();
        if (ai) {
          ai.unsubscribe();
          ai.destroy();
        }
      } catch {}
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, joinSuccess]);

  // Transmit initial Signaling presence context and initialize session opener
  useEffect(() => {
    if (!isReady || !joinSuccess || !agoraData.channel) return;
    const initial = initializeSessionOpener(agoraData.channel);
    setLiveSession({ ...initial });

    void transmitAgentPresenceContext(rtmClient, agoraData.channel, {
      track: currentTrack,
      candidateName: demoCandidate.name,
    });
  }, [isReady, joinSuccess, agoraData.channel, rtmClient, currentTrack]);

  // Persist completed round context to memory-db when round timer expires
  useEffect(() => {
    if (!showTransitionOverlay || !agoraData.channel) return;
    const currentSession = sessionStore.getSession(agoraData.channel) || liveSession;
    const activeScorecard = currentSession?.scorecard || (currentSession ? generateScorecard(currentSession) : undefined);

    fetch('/api/context-memory', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        candidateName: demoCandidate.name,
        track: currentRound.track,
        scorecard: activeScorecard,
        roundNumber: currentRound.roundNumber,
        roundTitle: currentRound.title,
      }),
    }).catch((err) => console.error('Failed to sync context memory on round complete:', err));
  }, [showTransitionOverlay, agoraData.channel, liveSession, currentRound]);


  // Transcript remapping
  const transcript = useMemo(() => {
    return normalizeTranscript(rawTranscript, String(client.uid));
  }, [rawTranscript, client.uid]);

  const messageList = useMemo(() => getMessageList(transcript), [transcript]);

  const currentInProgressMessage = useMemo(() => {
    return getCurrentInProgressMessage(transcript);
  }, [transcript]);

  // Process finalized candidate turns with intelligence orchestrator
  useEffect(() => {
    if (!agoraData.channel) return;

    const candidateTurns = messageList.filter(
      (msg) => !isAgentUID(msg.uid) && Boolean(msg.text?.trim()),
    );

    for (let i = 0; i < candidateTurns.length; i++) {
      const turn = candidateTurns[i];
      const turnKey = turn.turn_id ?? `${turn.createdAt ?? i}`;

      if (!processedTurnsRef.current.has(turnKey)) {
        processedTurnsRef.current.add(turnKey);

        const turnNumber = i + 1;
        const result = orchestrateTurn({
          sessionIdOrChannel: agoraData.channel,
          turnNumber,
          candidateAnswer: turn.text!,
        });

        setLiveSession({ ...result.session });

        // Transmit updated turn context and evaluated skills to Agora Signaling presence
        const skillsMap: Record<string, string> = {};
        if (result.session.skills) {
          for (const s of Object.values(result.session.skills)) {
            skillsMap[s.label] = `${s.state} (${Math.round(s.strength * 100)}%)`;
          }
        }
        void transmitAgentPresenceContext(rtmClient, agoraData.channel, {
          track: currentTrack,
          candidateName: demoCandidate.name,
          turnNumber,
          lastAnswer: turn.text!,
          evaluatedSkills: skillsMap,
        });
      }
    }
  }, [messageList, agoraData.channel, isAgentUID, currentTrack, rtmClient]);

  // Format message list for clean single continuous UI with round boundaries
  const formattedMessages: MessageItem[] = useMemo(() => {
    const defaultTime = '3:44 PM';
    const items: MessageItem[] = [];

    // Round 1 boundary banner at the very start
    const r1 = PANEL_ROUNDS[0];
    items.push({
      id: 'round-boundary-1',
      speaker: 'System',
      role: 'system',
      timestamp: defaultTime,
      text: '',
      isRoundBoundary: true,
      roundNumber: 1,
      roundTitle: r1.title,
      interviewerName: r1.interviewerName,
    });

    const initialStarter: MessageItem = {
      id: 'initial-starter',
      speaker:
        currentTrack === 'product'
          ? 'Sarah Lin (Product)'
          : currentTrack === 'hiring_manager'
          ? 'Elena Rostova (HR)'
          : 'Alex Chen (Technical)',
      role: 'agent',
      timestamp: defaultTime,
      text:
        currentTrack === 'product'
          ? "Hi, I'm Sarah Lin, Product Director. Let's explore customer workflows, trade-offs, and north-star metrics."
          : currentTrack === 'hiring_manager'
          ? "Hi, I'm Elena Rostova, HR Manager. Let's explore leadership, collaboration, and culture fit."
          : "Hi, I'm Alex Chen, Technical Lead. Let's dive into system architecture, component decomposition, and performance.",
    };

    if (messageList.length === 0) {
      items.push(initialStarter);
      return items;
    }

    const hasAgentIntro = messageList.some((m) => isAgentUID(m.uid));
    if (!hasAgentIntro) {
      items.push(initialStarter);
    }

    const subsequentBoundaries = roundBoundaries.filter((b) => b.roundNumber > 1);

    messageList.forEach((msg, idx) => {
      const isAgent = isAgentUID(msg.uid);
      const turnTime = msg.createdAt
        ? new Date(msg.createdAt).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
        : defaultTime;

      // Insert any round boundary that occurred before this message
      for (const boundary of subsequentBoundaries) {
        if (msg.createdAt && msg.createdAt >= boundary.timestamp) {
          const alreadyAdded = items.some((it) => it.id === `round-boundary-${boundary.roundNumber}`);
          if (!alreadyAdded) {
            items.push({
              id: `round-boundary-${boundary.roundNumber}`,
              speaker: 'System',
              role: 'system',
              timestamp: turnTime,
              text: '',
              isRoundBoundary: true,
              roundNumber: boundary.roundNumber,
              roundTitle: boundary.roundTitle,
              interviewerName: boundary.interviewerName,
            });
          }
        }
      }

      const activeSpeaker = isAgent
        ? currentTrack === 'product'
          ? 'Sarah Lin (Product)'
          : currentTrack === 'hiring_manager'
          ? 'Elena Rostova (HR)'
          : 'Alex Chen (Technical)'
        : 'Candidate';

      items.push({
        id: `turn-${msg.turn_id ?? 'turn'}-${msg.uid ?? (isAgent ? 'agent' : 'candidate')}-${idx}`,
        speaker: activeSpeaker,
        role: isAgent ? 'agent' : 'user',
        timestamp: turnTime,
        text: msg.text || '',
      });
    });

    // If a boundary occurred after all messages, append it at the end
    for (const boundary of subsequentBoundaries) {
      const alreadyAdded = items.some((it) => it.id === `round-boundary-${boundary.roundNumber}`);
      if (!alreadyAdded) {
        items.push({
          id: `round-boundary-${boundary.roundNumber}`,
          speaker: 'System',
          role: 'system',
          timestamp: defaultTime,
          text: '',
          isRoundBoundary: true,
          roundNumber: boundary.roundNumber,
          roundTitle: boundary.roundTitle,
          interviewerName: boundary.interviewerName,
        });
      }
    }

    return items;
  }, [messageList, isAgentUID, currentTrack, roundBoundaries]);

  // Streaming In-Progress turn
  const formattedInProgress = useMemo(() => {
    if (!currentInProgressMessage || !currentInProgressMessage.text?.trim()) return null;
    const isAgent = isAgentUID(currentInProgressMessage.uid);
    return {
      speaker: isAgent
        ? currentTrack === 'product'
          ? 'Sarah Lin (Product)'
          : currentTrack === 'hiring_manager'
          ? 'Elena Rostova (HR)'
          : 'Alex Chen (Technical)'
        : 'Candidate',
      text: currentInProgressMessage.text,
      role: isAgent ? ('agent' as const) : ('user' as const),
    };
  }, [currentInProgressMessage, isAgentUID, currentTrack]);

  // Audio track publish
  usePublish([localMicrophoneTrack]);

  useClientEvent(client, 'user-published', async (user, mediaType) => {
    if (mediaType === 'audio') {
      try {
        await client.subscribe(user, mediaType);
        user.audioTrack?.play();
      } catch (err) {
        console.warn('[Agora RTC] Error subscribing to remote audio track:', err);
      }
    }
  });

  useClientEvent(client, 'user-joined', (user) => {
    if (isAgentUID(user.uid)) setIsAgentConnected(true);
  });

  useClientEvent(client, 'user-left', (user) => {
    const remainingAgents = remoteUsers.filter(
      (u) => u.uid !== user.uid && isAgentUID(u.uid),
    );
    setIsAgentConnected(remainingAgents.length > 0);
  });

  useEffect(() => {
    const hasAgent = remoteUsers.some((user) => isAgentUID(user.uid));
    setIsAgentConnected(hasAgent);
  }, [remoteUsers, isAgentUID]);

  useClientEvent(client, 'connection-state-change', (curState) => {
    setConnectionState(curState);
  });

  const visualizerState = useMemo(
    () =>
      mapAgentVisualizerState(agentState, isAgentConnected, connectionState),
    [agentState, isAgentConnected, connectionState],
  );

  // Map to AvatarState: 'idle' | 'listening' | 'thinking' | 'speaking' | 'handoff'
  const avatarState: AvatarState = useMemo(() => {
    if (isSwitchingTrack) return 'handoff';
    if (visualizerState === 'talking') return 'speaking';
    if (visualizerState === 'listening') return 'listening';
    if (visualizerState === 'analyzing') return 'thinking';
    return 'idle';
  }, [isSwitchingTrack, visualizerState]);

  const profile = INTERVIEWER_PROFILES[currentTrack];

  const handleMicToggle = useCallback(async () => {
    const next = !isEnabled;
    const track = localMicrophoneTrack;
    if (!track) {
      setIsEnabled(next);
      return;
    }
    try {
      await track.setEnabled(next);
      setIsEnabled(next);
    } catch (error) {
      console.error('Failed to toggle microphone:', error);
    }
  }, [isEnabled, localMicrophoneTrack]);

  const handleTokenWillExpire = useCallback(async () => {
    if (!onTokenWillExpire || !joinedUID) return;
    try {
      const { rtcToken, rtmToken } = await onTokenWillExpire(
        joinedUID.toString(),
      );
      await client?.renewToken(rtcToken);
      await rtmClient.renewToken(rtmToken);
    } catch (error) {
      console.error('Failed to renew Agora token:', error);
    }
  }, [client, onTokenWillExpire, joinedUID, rtmClient]);

  useClientEvent(client, 'token-privilege-will-expire', handleTokenWillExpire);

  const handleEndConversation = useCallback(async () => {
    if (isEnding) return;
    setIsEnding(true);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('panelai_round_progress');
      localStorage.removeItem('panel_ai_active_session');
    }
    const currentSession =
      sessionStore.getSession(agoraData.channel) || liveSession;
    const finalScorecard =
      currentSession?.scorecard ??
      (currentSession ? generateScorecard(currentSession) : undefined);
    onEndConversation(finalScorecard, elapsedFormatted, formattedMessages);
  }, [isEnding, onEndConversation, agoraData.channel, liveSession, elapsedFormatted, formattedMessages]);

  // Advance to next autonomous round or conclude interview
  const handleContinueRound = useCallback(async () => {
    const nextIndex = currentRoundIndex + 1;
    if (nextIndex < PANEL_ROUNDS.length) {
      const nextRoundConfig = PANEL_ROUNDS[nextIndex];

      // 1. Record boundary for single continuous transcript
      setRoundBoundaries((prev) => [
        ...prev,
        {
          timestamp: Date.now(),
          roundNumber: nextRoundConfig.roundNumber,
          roundTitle: nextRoundConfig.title,
          interviewerName: nextRoundConfig.interviewerName,
        },
      ]);

      // 2. Advance round state
      setCurrentRoundIndex(nextIndex);
      setRoundSecondsRemaining(nextRoundConfig.durationSeconds);
      setShowTransitionOverlay(false);

      // 3. Inform Agora signaling of round advance
      await transmitAgentPresenceContext(rtmClient, agoraData.channel, {
        track: nextRoundConfig.track,
        candidateName: demoCandidate.name,
        handoffReason: `Autonomous advance to Round ${nextRoundConfig.roundNumber}: ${nextRoundConfig.title}`,
      });

      // 4. Switch interviewer agent with shared memory
      if (onSwitchTrack) {
        setIsSwitchingTrack(true);
        try {
          await onSwitchTrack(nextRoundConfig.track);
        } finally {
          setIsSwitchingTrack(false);
        }
      }
    } else {
      // All 3 rounds complete!
      setShowTransitionOverlay(false);
      await handleEndConversation();
    }
  }, [currentRoundIndex, rtmClient, agoraData.channel, onSwitchTrack, handleEndConversation]);

  return (
    <>
      <QuickstartConversationLayout
        currentTrack={currentTrack}
        elapsedFormatted={elapsedFormatted}
        currentRoundIndex={currentRoundIndex}
        roundSecondsRemaining={roundSecondsRemaining}
        latencyMs={233}
        isEnding={isEnding}
        onEndConversation={handleEndConversation}
        transcriptPanel={
          <Transcript
            messages={formattedMessages}
            inProgressMessage={formattedInProgress}
          />
        }
        visualizer={
          <>
            <AIInterviewerAvatar
              state={avatarState}
              interviewerName={profile.name}
              interviewerRole={profile.role}
            />
            {/* Subscribed Remote Users Audio Element */}
            {remoteUsers.map((user) => (
              <div key={user.uid} className="hidden">
                <RemoteUser user={user} playAudio={true} playVideo={false} />
              </div>
            ))}
          </>
        }
        controls={
          <VoiceControls
            isEnabled={isEnabled}
            onToggleMic={() => void handleMicToggle()}
            onStopAgent={() => void handleEndConversation()}
            isEnding={isEnding}
            localMicrophoneTrack={localMicrophoneTrack}
          />
        }
      />

      {showTransitionOverlay && (
        <RoundTransitionOverlay
          completedRound={currentRound}
          nextRound={PANEL_ROUNDS[currentRoundIndex + 1]}
          onContinue={() => void handleContinueRound()}
        />
      )}
    </>
  );
}
