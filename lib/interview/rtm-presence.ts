import type { RTMClient } from 'agora-rtm';
import type { InterviewTrack } from '@/types/conversation';
import { INTERVIEWER_PROFILES } from '@/data/demo';

export interface PresenceContextData {
  track: InterviewTrack;
  candidateName: string;
  lastAnswer?: string;
  evaluatedSkills?: Record<string, string>;
  turnNumber?: number;
  handoffReason?: string;
  notes?: string;
}

/**
 * Transmits custom context information to the Conversational AI agent
 * via Agora Signaling (RTM) Presence state management.
 * 
 * Before invoking the LLM, the Agora agent automatically retrieves the active
 * user's temporary status from Signaling and transmits it as context to the model
 * under `context.presence.<user_id>`.
 * 
 * Reference: Agora Conversational AI Agent Documentation:
 * "Transmit custom information to the Conversational AI agent to guide it in generating
 * responses customized for the user."
 */
export async function transmitAgentPresenceContext(
  rtmClient: RTMClient | null,
  channelName: string,
  data: PresenceContextData,
): Promise<void> {
  if (!rtmClient?.presence || !channelName) return;

  try {
    const profile = INTERVIEWER_PROFILES[data.track];
    const presenceState: Record<string, string> = {
      interviewer_track: data.track,
      interviewer_name: profile.name,
      interviewer_role: profile.role,
      candidate_name: data.candidateName,
      active_focus:
        data.track === 'product'
          ? 'Product sense, execution, metrics, and user trade-offs'
          : 'System architecture, performance, and frontend implementation',
      timestamp: String(Date.now()),
    };

    if (data.turnNumber !== undefined) {
      presenceState.turn_number = String(data.turnNumber);
    }
    if (data.lastAnswer) {
      presenceState.last_statement = data.lastAnswer.slice(0, 300);
    }
    if (data.evaluatedSkills) {
      presenceState.evaluated_skills = JSON.stringify(data.evaluatedSkills);
    }
    if (data.handoffReason) {
      presenceState.handoff_reason = data.handoffReason;
    }
    if (data.notes) {
      presenceState.interviewer_notes = data.notes;
    }

    await rtmClient.presence.setState(channelName, 'MESSAGE', presenceState);
    console.log('[Agora Signaling Presence] Context updated for agent:', presenceState);
  } catch (error) {
    console.warn('[Agora Signaling Presence] Could not update presence state:', error);
  }
}
