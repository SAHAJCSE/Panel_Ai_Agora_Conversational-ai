import type { RTMClient } from 'agora-rtm';
import type { InterviewScorecard } from '@/lib/interview/types';

export interface AgoraTokenData {
  token: string;
  uid: string;
  channel: string;
  agentId?: string;
}

export type InterviewTrack =
  | 'technical'
  | 'product'
  | 'hiring_manager';

/** Display profile for each interviewer agent. */
export interface InterviewerProfile {
  track: InterviewTrack;
  name: string;
  role: string;
  color: string;
}

export interface InterviewRoundConfig {
  roundNumber: number;
  track: InterviewTrack;
  title: string;
  interviewerName: string;
  interviewerRole: string;
  durationSeconds: number; // 180s for rounds 1-2, 120s for round 3
  focus: string[];
  description: string;
  nextRoundPreview?: {
    track: InterviewTrack;
    title: string;
    interviewerName: string;
    previewQuote: string;
  };
}

export interface RoundTransitionState {
  isTransitioning: boolean;
  completedRound: InterviewRoundConfig;
  nextRound: InterviewRoundConfig;
  contextSummary: string;
}

export interface ClientStartRequest {
  requester_id: string;
  channel_name: string;
  interview_track?: InterviewTrack;
  candidate_name?: string;
  role_title?: string;
  duration_minutes?: number;
  candidate_context?: string;
  context_memory?: string;
  pipeline_id?: string;
  force_template?: boolean;
}

export interface StopConversationRequest {
  agent_id: string;
}

export interface AgentResponse {
  agent_id: string;
  create_ts: number;
  state: string;
}

export interface AgoraRenewalTokens {
  rtcToken: string;
  rtmToken: string;
}

/** Handoff system message injected into the transcript stream. */
export interface HandoffEvent {
  fromTrack: InterviewTrack;
  toTrack: InterviewTrack;
  reason: string;
  timestamp: number;
}

export interface ConversationComponentProps {
  agoraData: AgoraTokenData;
  rtmClient: RTMClient;
  currentTrack?: InterviewTrack;
  durationMinutes?: number;
  candidateName?: string;
  roleTitle?: string;
  onTokenWillExpire: (uid: string) => Promise<AgoraRenewalTokens>;
  onEndConversation: (
    scorecard?: InterviewScorecard,
    duration?: string,
    transcript?: any[],
  ) => void;
  onSwitchTrack?: (newTrack: InterviewTrack) => Promise<void>;
}
