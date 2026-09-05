import type { InterviewTrack } from '@/types/conversation';
import type { InterviewScorecard } from './types';
import { demoCandidate } from '@/data/demo';
import {
  getCandidateProfile,
  recordCompletedRound,
  buildCrossAgentMemoryContext,
  clearCandidateMemory as clearDbCandidateMemory,
  upsertCandidateBriefing,
  type CandidateMemoryRecord,
  type RoundMemoryRecord,
} from './local-db';

export type RoundMemory = RoundMemoryRecord;
export type CandidateMemoryProfile = CandidateMemoryRecord;

/**
 * Initialize or get memory for a candidate from the local database
 */
export function getOrCreateCandidateMemory(name: string = demoCandidate.name): CandidateMemoryProfile {
  return getCandidateProfile(name);
}

/**
 * Record completed interview round into shared local database
 */
export function recordRoundMemory(
  candidateName: string = demoCandidate.name,
  track: InterviewTrack,
  scorecard?: InterviewScorecard,
  answers: string[] = [],
  durationFormatted?: string,
): CandidateMemoryProfile {
  const quotes: string[] = [];
  const skillsSummary: Record<string, string> = {};

  if (scorecard) {
    if (Array.isArray(scorecard.skills)) {
      for (const skill of scorecard.skills) {
        skillsSummary[skill.label || skill.skillId] = `${skill.state} (${Math.round(skill.strength)}%)`;
        if (skill.quote && !quotes.includes(skill.quote)) {
          quotes.push(skill.quote);
        }
      }
    }
    if (Array.isArray(scorecard.candidateQuotes)) {
      for (const item of scorecard.candidateQuotes) {
        if (item.quote && !quotes.includes(item.quote)) {
          quotes.push(item.quote);
        }
      }
    }
  }

  // Also include distinct candidate answers if quotes weren't extracted
  if (quotes.length === 0 && answers.length > 0) {
    quotes.push(...answers);
  }

  const roundMemory: RoundMemoryRecord = {
    track,
    completedAt: Date.now(),
    durationFormatted,
    answerCount: answers.length || quotes.length,
    quotes,
    skillsSummary,
    overallScore: scorecard?.overallScore,
    recommendation: scorecard?.recommendation,
  };

  return recordCompletedRound(candidateName, roundMemory);
}

/**
 * Save candidate briefing / pre-interview intake into local database
 */
export function saveCandidateBriefing(
  name: string,
  roleTitle: string,
  durationMinutes?: number,
  backgroundNotes?: string,
): CandidateMemoryProfile {
  return upsertCandidateBriefing(name, roleTitle, durationMinutes, backgroundNotes);
}

/**
 * Builds markdown memory injection context for the target interviewer
 */
export function buildMemoryContextPrompt(
  candidateName: string = demoCandidate.name,
  targetTrack: InterviewTrack,
): string {
  return buildCrossAgentMemoryContext(candidateName, targetTrack);
}

/**
 * Clear memory for candidate (e.g. Reset button)
 */
export function clearCandidateMemory(name: string = demoCandidate.name): void {
  clearDbCandidateMemory(name);
}
