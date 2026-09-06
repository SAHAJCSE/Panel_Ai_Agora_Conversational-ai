'use client';

import { useState, useRef, Suspense, useEffect, useCallback } from 'react';
import dynamic from 'next/dynamic';
import type { RTMClient } from 'agora-rtm';
import type {
  AgoraTokenData,
  ClientStartRequest,
  AgentResponse,
  AgoraRenewalTokens,
  InterviewTrack,
} from '../types/conversation';
import { demoCandidate } from '@/data/demo';
import { ErrorBoundary } from './ErrorBoundary';
import { LoadingSkeleton } from './LoadingSkeleton';
import { Loader } from '@/components/ui/loader';
import { StitchLandingPage } from './landing/StitchLandingPage';
import type { CandidateBriefingData } from './landing/InterviewIntakeModal';
import { FinalAssessment } from './panel/FinalAssessment';
import { supabase } from '@/lib/supabase';

// Dynamically import the ConversationComponent with ssr disabled
const ConversationComponent = dynamic(() => import('./ConversationComponent'), {
  ssr: false,
});

// Dynamically import AgoraRTCProvider (browser-only).
const AgoraProvider = dynamic(
  async () => {
    const { AgoraRTCProvider, default: AgoraRTC } =
      await import('agora-rtc-react');
    return {
      default: function AgoraProviders({
        children,
      }: {
        children: React.ReactNode;
      }) {
        // useRef persists across StrictMode's simulated unmount/remount, so only
        // one RTC client is ever created per session (useMemo creates two in StrictMode).
        const clientRef = useRef<ReturnType<
          typeof AgoraRTC.createClient
        > | null>(null);
        if (!clientRef.current) {
          clientRef.current = AgoraRTC.createClient({
            mode: 'rtc',
            codec: 'vp8',
          });
        }
        return (
          <AgoraRTCProvider client={clientRef.current}>
            {children}
          </AgoraRTCProvider>
        );
      },
    };
  },
  { ssr: false },
);

export default function LandingPage() {
  const [showConversation, setShowConversation] = useState(false);
  const [showScorecard, setShowScorecard] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState<InterviewTrack>('technical');
  const [briefing, setBriefing] = useState<CandidateBriefingData>({
    candidateName: 'Candidate',
    roleTitle: 'Software Engineer',
    track: 'technical',
    durationMinutes: 15,
    contextNotes: '',
  });

  // Sync candidate identity with logged-in Supabase user if available
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      const u = session?.user;
      if (u) {
        const name = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || u.email || 'Candidate';
        setBriefing((prev) => ({
          ...prev,
          candidateName: name,
          contextNotes: prev.contextNotes === demoCandidate.resumeSummary ? '' : prev.contextNotes,
        }));
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const u = session?.user;
      if (u) {
        const name = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || u.email || 'Candidate';
        setBriefing((prev) => ({
          ...prev,
          candidateName: name,
          contextNotes: prev.contextNotes === demoCandidate.resumeSummary ? '' : prev.contextNotes,
        }));
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Preload heavy modules on mount so they're already cached when the user
  // clicks "Start Interview" — eliminates the ~1.8s dynamic-import delay.
  useEffect(() => {
    import('agora-rtc-react').catch(() => {});
    import('agora-rtm').catch(() => {});
  }, []);

  const [isLoading, setIsLoading] = useState(false);
  const [isRestoring, setIsRestoring] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [agoraData, setAgoraData] = useState<AgoraTokenData | null>(null);
  const [rtmClient, setRtmClient] = useState<RTMClient | null>(null);
  const [agentJoinError, setAgentJoinError] = useState(false);

  const saveActiveSession = useCallback((data: AgoraTokenData, track: InterviewTrack, b: CandidateBriefingData) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(
        'panel_ai_active_session',
        JSON.stringify({
          agoraData: data,
          selectedTrack: track,
          briefing: b,
          timestamp: Date.now(),
        }),
      );
    } catch {}
  }, []);

  // Restore active interview session if candidate refreshed the browser
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const saved = localStorage.getItem('panel_ai_active_session');
      if (!saved) {
        setIsRestoring(false);
        return;
      }
      const parsed = JSON.parse(saved);

      // Valid if less than 50 minutes old (Agora token expires at 60 minutes)
      const isFresh = parsed.timestamp && Date.now() - parsed.timestamp < 50 * 60 * 1000;
      if (isFresh && parsed.agoraData?.token && parsed.agoraData?.channel) {
        void handleResumeSession(parsed);
      } else {
        localStorage.removeItem('panel_ai_active_session');
        setIsRestoring(false);
      }
    } catch (e) {
      console.error('Failed to restore persisted session:', e);
      setIsRestoring(false);
    }
  }, []);

  const handleResumeSession = async (persisted: {
    agoraData: AgoraTokenData;
    briefing?: CandidateBriefingData;
    selectedTrack?: InterviewTrack;
  }) => {
    setIsLoading(true);
    setError(null);
    try {
      if (persisted.briefing) setBriefing(persisted.briefing);
      if (persisted.selectedTrack) setSelectedTrack(persisted.selectedTrack);

      const { default: AgoraRTM } = await import('agora-rtm');
      let rtcToken = persisted.agoraData.token;
      let rtmToken = persisted.agoraData.token;
      const channel = persisted.agoraData.channel;
      const uid = persisted.agoraData.uid;

      const rtm: RTMClient = new AgoraRTM.RTM(
        process.env.NEXT_PUBLIC_AGORA_APP_ID!,
        uid,
      );

      try {
        await rtm.login({ token: rtmToken });
      } catch (loginErr) {
        console.warn('Initial RTM login failed, fetching fresh token for existing channel...', loginErr);
        const freshRes = await fetch(`/api/generate-agora-token?channel=${channel}&uid=${uid}`);
        if (freshRes.ok) {
          const freshData = await freshRes.json();
          rtmToken = freshData.token;
          rtcToken = freshData.token;
          await rtm.login({ token: rtmToken });
        } else {
          throw loginErr;
        }
      }

      await rtm.subscribe(channel);

      const activeData: AgoraTokenData = {
        ...persisted.agoraData,
        token: rtcToken,
        channel,
        uid,
      };

      setRtmClient(rtm);
      setAgoraData(activeData);
      setShowConversation(true);
    } catch (err) {
      console.error('Error resuming conversation session:', err);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('panel_ai_active_session');
      }
      setError('Could not resume previous session. Please start a new interview.');
    } finally {
      setIsLoading(false);
      setIsRestoring(false);
    }
  };

  const handleStartConversation = async (newBriefing?: CandidateBriefingData) => {
    setIsLoading(true);
    setError(null);
    setAgentJoinError(false);
    setShowScorecard(false);

    const activeBriefing = newBriefing || briefing;
    if (newBriefing) {
      setBriefing(newBriefing);
    }
    const activeTrack = activeBriefing.track || selectedTrack;

    // Reset any previous session countdown so fresh duration is applied
    if (typeof window !== 'undefined') {
      try {
        localStorage.removeItem('panelai_round_progress');
      } catch {}
    }

    try {
      // 1. Fetch RTC token + channel
      const agoraResponse = await fetch('/api/generate-agora-token');
      const responseData = await agoraResponse.json();

      if (!agoraResponse.ok) {
        throw new Error(
          `Failed to generate Agora token: ${JSON.stringify(responseData)}`,
        );
      }

      // 2. Run agent invite and RTM setup in parallel
      const [agentData, rtm] = await Promise.all([
        // 2a. Start the AI agent with candidate briefing context and time limit
        fetch('/api/invite-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requester_id: responseData.uid,
            channel_name: responseData.channel,
            interview_track: activeTrack,
            candidate_name: activeBriefing.candidateName,
            role_title: activeBriefing.roleTitle,
            duration_minutes: activeBriefing.durationMinutes,
            candidate_context: activeBriefing.contextNotes,
          } as ClientStartRequest),
        })
          .then(async (res) => {
            if (!res.ok) {
              setAgentJoinError(true);
              return null;
            }
            return res.json() as Promise<AgentResponse>;
          })
          .catch((err) => {
            console.error('Failed to start conversation with agent:', err);
            setAgentJoinError(true);
            return null;
          }),

        // 2b. Set up RTM (dynamically imported to keep it client-only)
        (async () => {
          const { default: AgoraRTM } = await import('agora-rtm');
          const rtm: RTMClient = new AgoraRTM.RTM(
            process.env.NEXT_PUBLIC_AGORA_APP_ID!,
            responseData.uid,
          );
          await rtm.login({ token: responseData.token });
          await rtm.subscribe(responseData.channel);
          return rtm;
        })(),
      ]);

      // 3. All dependencies ready — store state and show conversation
      const finalAgoraData = { ...responseData, agentId: agentData?.agent_id };
      setRtmClient(rtm);
      setAgoraData(finalAgoraData);
      saveActiveSession(finalAgoraData, activeTrack, activeBriefing);
      setShowConversation(true);
    } catch (err) {
      setError('Failed to start conversation. Please try again.');
      console.error('Error starting conversation:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTokenWillExpire = useCallback(
    async (uid: string): Promise<AgoraRenewalTokens> => {
      try {
        const channel = agoraData?.channel;
        if (!channel) {
          throw new Error('Missing channel for token renewal');
        }

        const [rtcResponse, rtmResponse] = await Promise.all([
          fetch(`/api/generate-agora-token?channel=${channel}&uid=${uid}`),
          fetch(`/api/generate-agora-token?channel=${channel}&uid=${agoraData.uid}`),
        ]);
        const [rtcData, rtmData] = await Promise.all([
          rtcResponse.json(),
          rtmResponse.json(),
        ]);

        if (!rtcResponse.ok || !rtmResponse.ok) {
          throw new Error('Failed to generate renewal tokens');
        }

        return {
          rtcToken: rtcData.token,
          rtmToken: rtmData.token,
        };
      } catch (error) {
        console.error('Error renewing token:', error);
        throw error;
      }
    },
    [agoraData],
  );

  const [scorecard, setScorecard] = useState<import('@/lib/interview/types').InterviewScorecard | null>(null);
  const [interviewDuration, setInterviewDuration] = useState<string>('0:00');
  const [transcriptMessages, setTranscriptMessages] = useState<any[]>([]);

  const handleEndConversation = async (
    finalScorecard?: import('@/lib/interview/types').InterviewScorecard,
    duration?: string,
    messages?: any[],
  ) => {
    if (duration) setInterviewDuration(duration);
    if (messages) setTranscriptMessages(messages);
    if (finalScorecard) {
      setScorecard(finalScorecard);
      // Persist completed round evidence to cross-round memory
      fetch('/api/context-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: demoCandidate.name,
          track: selectedTrack,
          scorecard: finalScorecard,
        }),
      })
        .then((res) => res.json())
        .catch((err) => console.error('Failed to sync context memory:', err));
    }
    // Stop the AI agent
    // Sync completed round into local shared database
    if (finalScorecard) {
      fetch('/api/context-memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          candidateName: briefing.candidateName,
          track: selectedTrack,
          scorecard: finalScorecard,
          roleTitle: briefing.roleTitle,
          durationFormatted: interviewDuration,
          answers: messages?.filter((m) => m.role === 'user').map((m) => m.text) || [],
        }),
      }).catch(() => {});
    }

    if (agoraData?.agentId) {
      try {
        const response = await fetch('/api/stop-conversation', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agent_id: agoraData.agentId }),
        });
        if (!response.ok) {
          console.error('Failed to stop agent:', await response.text());
        }
      } catch (error) {
        console.error('Error stopping agent:', error);
      }
    }

    // Record completed session to DB & profile activity stats
    try {
      const { recordNewInterviewSession } = await import('@/lib/interview/profile-db-service');
      const realScore = scorecard?.overallScore !== undefined
        ? (scorecard.overallScore > 10 ? scorecard.overallScore / 10 : scorecard.overallScore)
        : 2.0;

      const realSkills = scorecard?.skills
        ? Object.fromEntries(scorecard.skills.map((s) => [s.label || s.skillId, Math.round(s.strength)]))
        : { Technical: 20, 'Problem Solving': 20, Communication: 25, 'Product Thinking': 15, Leadership: 20 };

      await recordNewInterviewSession({
        candidateName: briefing.candidateName,
        roleTitle: briefing.roleTitle,
        track: selectedTrack,
        completedAt: Date.now(),
        durationFormatted: interviewDuration,
        answerCount: transcriptMessages.length || 0,
        overallScore: realScore,
        recommendation: scorecard?.recommendation || 'Do Not Advance • Insufficient Evidence',
        skillsSummary: realSkills,
      });
    } catch (e) {
      console.warn('Failed to record session to profile db:', e);
    }

    // Clean up local session persistence
    if (typeof window !== 'undefined') {
      localStorage.removeItem('panel_ai_active_session');
      localStorage.removeItem('panelai_round_progress');
    }

    // Tear down RTM
    rtmClient?.logout().catch((err) => console.error('RTM logout error:', err));
    setRtmClient(null);
    setShowConversation(false);
    setShowScorecard(true);
  };

  const handleNewInterview = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('panel_ai_active_session');
      localStorage.removeItem('panelai_round_progress');
    }
    setShowScorecard(false);
    setScorecard(null);
    setAgoraData(null);
    setAgentJoinError(false);
    setError(null);
  };

  const handleSwitchTrack = useCallback(
    async (newTrack: InterviewTrack) => {
      if (!agoraData) return;
      try {
        // 1. Sync current session evidence to memory
        if (scorecard) {
          await fetch('/api/context-memory', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              candidateName: briefing.candidateName,
              track: selectedTrack,
              scorecard,
              roleTitle: briefing.roleTitle,
            }),
          }).catch(() => {});
        }

        // 2. Stop current agent
        if (agoraData.agentId) {
          await fetch('/api/stop-conversation', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ agent_id: agoraData.agentId }),
          }).catch(() => {});
        }

        // 3. Small pause to allow Agora cloud to terminate previous session
        await new Promise((r) => setTimeout(r, 600));

        // 4. Update track
        setSelectedTrack(newTrack);

        // 5. Invite new track agent with shared memory
        const inviteResponse = await fetch('/api/invite-agent', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            requester_id: agoraData.uid,
            channel_name: agoraData.channel,
            interview_track: newTrack,
            candidate_name: briefing.candidateName,
            role_title: briefing.roleTitle,
            duration_minutes: briefing.durationMinutes,
            candidate_context: briefing.contextNotes,
          } as ClientStartRequest),
        });

        if (inviteResponse.ok) {
          const newAgentData = (await inviteResponse.json()) as AgentResponse;
          const updated = { ...agoraData, agentId: newAgentData.agent_id };
          setAgoraData(updated);
          saveActiveSession(updated, newTrack, briefing);
        }
      } catch (err) {
        console.error('Error switching track:', err);
      }
    },
    [agoraData, scorecard, selectedTrack, briefing, saveActiveSession],
  );

  if (isRestoring) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-black flex flex-col items-center justify-center p-6 text-center">
        <Loader
          prefix="loading"
          subtitle="Restoring your active interview session, round progress, and live audio streams."
        />
      </div>
    );
  }

  if (!showConversation && !showScorecard) {
    return (
      <>
        {isLoading && (
          <div className="fixed inset-0 z-[100] flex flex-col items-center justify-center bg-black/85 backdrop-blur-xl animate-in fade-in duration-300">
            <Loader
              prefix="loading"
              subtitle="Connecting AI panel & real-time audio streams..."
            />
          </div>
        )}
        <StitchLandingPage
          isLoading={isLoading}
          error={error}
          selectedTrack={selectedTrack}
          onSelectTrack={(track) => setSelectedTrack(track)}
          onStartConversation={handleStartConversation}
        />
      </>
    );
  }

  return (
    <div
      className={`app-canvas relative flex min-h-dvh flex-col overflow-x-hidden text-foreground ${
        showConversation ? 'conversation-app-shell' : ''
      }`}
    >
      <main className="relative z-10 flex min-h-0 flex-1 flex-col w-full items-stretch xl:h-full">
        <div className="flex min-h-0 flex-1 flex-col">
          {showScorecard ? (
            <FinalAssessment
              scorecard={scorecard}
              durationFormatted={interviewDuration}
              transcriptMessages={transcriptMessages}
              candidateName={briefing.candidateName}
              roleTitle={briefing.roleTitle}
              onNewInterview={handleNewInterview}
            />
          ) : agoraData && rtmClient ? (
            <>
              {agentJoinError && (
                <div
                  className="fixed left-1/2 top-20 z-50 w-[min(92vw,28rem)] -translate-x-1/2 rounded-xl border border-red-500/20 bg-[#111827]/95 p-3 text-sm text-red-400 shadow-xl backdrop-blur-xl"
                  role="alert"
                >
                  Failed to connect with AI agent. The conversation may not work
                  as expected.
                </div>
              )}
              <Suspense fallback={<LoadingSkeleton />}>
                <ErrorBoundary>
                  <AgoraProvider>
                    <ConversationComponent
                      agoraData={agoraData}
                      rtmClient={rtmClient}
                      currentTrack={selectedTrack}
                      durationMinutes={briefing.durationMinutes}
                      candidateName={briefing.candidateName}
                      roleTitle={briefing.roleTitle}
                      onTokenWillExpire={handleTokenWillExpire}
                      onEndConversation={handleEndConversation}
                      onSwitchTrack={handleSwitchTrack}
                    />
                  </AgoraProvider>
                </ErrorBoundary>
              </Suspense>
            </>
          ) : (
            <p className="text-sm text-white/40 p-8 text-center">
              Failed to load conversation data.
            </p>
          )}
        </div>
      </main>
    </div>
  );
}
