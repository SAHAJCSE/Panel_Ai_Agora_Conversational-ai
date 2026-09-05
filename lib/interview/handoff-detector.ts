/**
 * Panel AI — Deterministic Handoff Detector
 *
 * Analyzes candidate answer text for cross-domain signals to decide
 * whether a dynamic interviewer handoff should occur.
 *
 * This is intentionally heuristic-based (keyword matching) to stay
 * deterministic and fast — no LLM call required.
 */

import type { InterviewTrack } from '@/types/conversation';

export interface HandoffSignal {
  shouldHandoff: boolean;
  suggestedTrack: InterviewTrack;
  reason: string;
  confidence: number; // 0..1
}

const PRODUCT_KEYWORDS = [
  'user workflow', 'user experience', 'conversion', 'retention',
  'customer impact', 'customer feedback', 'business value',
  'business outcome', 'product decision', 'product roadmap',
  'user research', 'a/b test', 'metrics', 'kpi', 'engagement',
  'churn', 'onboarding', 'adoption', 'user journey', 'funnel',
  'bounce rate', 'daily active', 'monthly active', 'revenue impact',
  'stakeholder', 'prioritization', 'trade-off', 'tradeoff',
];

const BEHAVIOURAL_KEYWORDS = [
  'team conflict', 'disagreement', 'leadership', 'mentoring',
  'collaboration', 'cross-functional', 'difficult conversation',
  'feedback to', 'managed a team', 'led a team', 'delegated',
  'under pressure', 'tight deadline', 'failed project', 'failure',
  'learned from', 'adapted when', 'took initiative',
  'conflict resolution', 'compromise', 'persuaded',
];

const HIRING_MANAGER_KEYWORDS = [
  'career goal', 'career vision', 'long-term', 'growth',
  'culture fit', 'company values', 'why this role', 'why this company',
  'motivation', 'passion for', 'inspired by', 'ownership',
  'entrepreneurial', 'side project',
];

function countMatches(text: string, keywords: string[]): number {
  const lower = text.toLowerCase();
  return keywords.reduce((count, keyword) => {
    return count + (lower.includes(keyword) ? 1 : 0);
  }, 0);
}

/**
 * Analyze a candidate's answer to detect cross-domain signals.
 *
 * @param candidateAnswer - The candidate's verbatim answer text
 * @param currentTrack - The currently active interviewer track
 * @returns A handoff signal indicating whether to switch and to which track
 */
export function detectHandoff(
  candidateAnswer: string,
  currentTrack: InterviewTrack,
): HandoffSignal {
  if (!candidateAnswer || candidateAnswer.length < 20) {
    return {
      shouldHandoff: false,
      suggestedTrack: currentTrack,
      reason: 'Insufficient content for handoff analysis',
      confidence: 0,
    };
  }

  const productScore = countMatches(candidateAnswer, PRODUCT_KEYWORDS);
  const behaviouralScore = countMatches(candidateAnswer, BEHAVIOURAL_KEYWORDS);
  const hiringManagerScore = countMatches(candidateAnswer, HIRING_MANAGER_KEYWORDS);

  // Build scored candidates excluding the current track
  const candidates: { track: InterviewTrack; score: number; reason: string }[] = [];

  if (currentTrack !== 'product' && productScore >= 2) {
    candidates.push({
      track: 'product',
      score: productScore,
      reason: `Candidate response contains ${productScore} product/business signals`,
    });
  }
  const hrCombinedScore = behaviouralScore + hiringManagerScore;
  if (currentTrack !== 'hiring_manager' && hrCombinedScore >= 2) {
    candidates.push({
      track: 'hiring_manager',
      score: hrCombinedScore,
      reason: `Candidate response contains ${hrCombinedScore} culture/leadership signals`,
    });
  }

  if (candidates.length === 0) {
    return {
      shouldHandoff: false,
      suggestedTrack: currentTrack,
      reason: 'No cross-domain signals detected',
      confidence: 0,
    };
  }

  // Pick the highest-scoring alternative track
  candidates.sort((a, b) => b.score - a.score);
  const best = candidates[0];
  const confidence = Math.min(1, best.score / 5);

  return {
    shouldHandoff: confidence >= 0.4,
    suggestedTrack: best.track,
    reason: best.reason,
    confidence,
  };
}
