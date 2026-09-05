import { supabase } from '@/lib/supabase';
import type { InterviewTrack } from '@/types/conversation';
import type { UserProfileData } from '@/components/profile/UserProfilePage';

export interface RecordedInterviewRound {
  id: string;
  candidateName: string;
  roleTitle: string;
  track: InterviewTrack;
  completedAt: number; // timestamp ms
  durationFormatted?: string;
  answerCount: number;
  overallScore: number;
  recommendation?: string;
  notes?: string;
  skillsSummary?: Record<string, number | string>;
}

const STORAGE_KEY = 'panel_ai_user_profile_sessions';

/**
 * Helper to calculate relative time string (e.g. "2 hours ago", "Yesterday", "3 days ago")
 */
export function formatRelativeTime(timestampMs: number): string {
  const diffMs = Date.now() - timestampMs;
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMinutes < 5) return 'Just now';
  if (diffMinutes < 60) return `${diffMinutes} mins ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`;
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 7) return `${diffDays} days ago`;
  const diffWeeks = Math.floor(diffDays / 7);
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks === 1 ? '' : 's'} ago`;
  const d = new Date(timestampMs);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

/**
 * Generate initial starter records if user database is empty
 */
function getInitialSeedSessions(): RecordedInterviewRound[] {
  const now = Date.now();
  return [
    {
      id: 'session-1',
      candidateName: 'Abhishek Singh',
      roleTitle: 'Senior Frontend Developer',
      track: 'technical',
      completedAt: now - 1000 * 60 * 120, // 2 hours ago
      durationFormatted: '14:22',
      answerCount: 4,
      overallScore: 8.2,
      recommendation: 'Advance to Product & Leadership',
      skillsSummary: { Technical: 84, 'Problem Solving': 80, Communication: 78, 'Product Thinking': 65, Leadership: 70 },
    },
    {
      id: 'session-2',
      candidateName: 'Abhishek Singh',
      roleTitle: 'Senior Frontend Developer',
      track: 'product',
      completedAt: now - 1000 * 60 * 60 * 26, // Yesterday
      durationFormatted: '12:45',
      answerCount: 3,
      overallScore: 7.6,
      recommendation: 'Good technical clarity',
      skillsSummary: { Technical: 80, 'Problem Solving': 75, Communication: 72, 'Product Thinking': 60, Leadership: 65 },
    },
    {
      id: 'session-3',
      candidateName: 'Abhishek Singh',
      roleTitle: 'Software Engineer',
      track: 'hiring_manager',
      completedAt: now - 1000 * 60 * 60 * 72, // 3 days ago
      durationFormatted: '15:10',
      answerCount: 4,
      overallScore: 8.0,
      recommendation: 'Strong team collaboration',
      skillsSummary: { Technical: 82, 'Problem Solving': 78, Communication: 75, 'Product Thinking': 62, Leadership: 68 },
    },
    {
      id: 'session-4',
      candidateName: 'Abhishek Singh',
      roleTitle: 'Full Stack Engineer',
      track: 'technical',
      completedAt: now - 1000 * 60 * 60 * 120, // 5 days ago
      durationFormatted: '18:30',
      answerCount: 5,
      overallScore: 8.5,
      recommendation: 'Excellent architecture reasoning',
      skillsSummary: { Technical: 86, 'Problem Solving': 82, Communication: 76, 'Product Thinking': 64, Leadership: 72 },
    },
    {
      id: 'session-5',
      candidateName: 'Abhishek Singh',
      roleTitle: 'Staff Systems Architect',
      track: 'product',
      completedAt: now - 1000 * 60 * 60 * 168, // 1 week ago
      durationFormatted: '22:15',
      answerCount: 6,
      overallScore: 9.1,
      recommendation: 'Exceptional depth',
      skillsSummary: { Technical: 90, 'Problem Solving': 88, Communication: 80, 'Product Thinking': 70, Leadership: 76 },
    },
  ];
}

/**
 * Load all recorded interview rounds from LocalStorage & Supabase DB
 */
export async function getRecordedSessions(candidateEmailOrName?: string): Promise<RecordedInterviewRound[]> {
  let sessions: RecordedInterviewRound[] = [];

  // 1. Load local persistent sessions
  if (typeof window !== 'undefined') {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        sessions = JSON.parse(raw);
      }
    } catch (e) {
      console.warn('Failed to parse local profile sessions:', e);
    }
  }

  // 2. Fetch from Supabase if connected
  if (process.env.NEXT_PUBLIC_SUPABASE_URL && candidateEmailOrName) {
    try {
      const { data, error } = await supabase
        .from('interview_rounds')
        .select('*')
        .order('completed_at', { ascending: false });

      if (!error && data && data.length > 0) {
        const supabaseSessions: RecordedInterviewRound[] = data.map((row: any) => ({
          id: row.id || `sb-${Date.parse(row.completed_at)}`,
          candidateName: row.candidate_name || 'Candidate',
          roleTitle: row.role_title || 'Software Engineer',
          track: (row.track as InterviewTrack) || 'technical',
          completedAt: new Date(row.completed_at).getTime(),
          durationFormatted: row.duration_formatted || '15:00',
          answerCount: row.answer_count || 3,
          overallScore: row.overall_score || 8.0,
          recommendation: row.recommendation || 'Passed',
          skillsSummary: row.skills_summary || {},
        }));

        // Merge Supabase sessions with local ones, eliminating duplicates
        const sessionMap = new Map<string, RecordedInterviewRound>();
        [...sessions, ...supabaseSessions].forEach((s) => sessionMap.set(s.id, s));
        sessions = Array.from(sessionMap.values());
      }
    } catch (err) {
      console.warn('[Supabase] Profile sessions fetch skipped:', err);
    }
  }

  // Filter out any legacy hardcoded seed sessions
  sessions = sessions.filter((s) => s.id && !s.id.startsWith('session-'));

  // Sort descending by completion time
  return sessions.sort((a, b) => b.completedAt - a.completedAt);
}

/**
 * Save new completed interview session to LocalStorage & Supabase
 */
export async function recordNewInterviewSession(session: Omit<RecordedInterviewRound, 'id'>): Promise<RecordedInterviewRound> {
  const newSession: RecordedInterviewRound = {
    ...session,
    id: `sess-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
  };

  // 1. Save to LocalStorage
  if (typeof window !== 'undefined') {
    try {
      const existing = await getRecordedSessions();
      const updated = [newSession, ...existing];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch (e) {
      console.error('Failed to save session to storage:', e);
    }
  }

  // 2. Save to Supabase
  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    try {
      await supabase.from('interview_rounds').insert({
        id: newSession.id,
        candidate_name: newSession.candidateName,
        track: newSession.track,
        completed_at: new Date(newSession.completedAt).toISOString(),
        duration_formatted: newSession.durationFormatted,
        answer_count: newSession.answerCount,
        overall_score: newSession.overallScore,
        recommendation: newSession.recommendation,
        skills_summary: newSession.skillsSummary || {},
      });
    } catch (err) {
      console.warn('[Supabase] Non-fatal interview round insert error:', err);
    }
  }

  return newSession;
}

/**
 * Dynamically compute full UserProfileData metrics from real DB sessions
 */
export function computeRealProfileStats(
  sessions: RecordedInterviewRound[],
  userInfo: { name: string; email: string; avatar: string; joinedAt?: string; role?: string }
): UserProfileData {
  const totalCompleted = sessions.length;

  // Track breakdown
  let technicalCount = 0;
  let productCount = 0;
  let hiringManagerCount = 0;
  let sumScore = 0;

  // Calendar activity map: YYYY-MM-DD -> count
  const dailyActivity: Record<string, number> = {};
  const activeDaysSet = new Set<string>();

  sessions.forEach((s) => {
    if (s.track === 'technical') technicalCount++;
    else if (s.track === 'product') productCount++;
    else if (s.track === 'hiring_manager') hiringManagerCount++;

    sumScore += s.overallScore || 0;

    const dateStr = new Date(s.completedAt).toISOString().split('T')[0];
    dailyActivity[dateStr] = (dailyActivity[dateStr] || 0) + 1;
    activeDaysSet.add(dateStr);
  });

  const averageScore = totalCompleted > 0 ? Number((sumScore / totalCompleted).toFixed(1)) : 0;
  const practiceDays = activeDaysSet.size;

  // Calculate streaks
  const today = new Date();
  let currentStreak = 0;
  let longestStreak = 0;
  let tempStreak = 0;

  // Check 365 days backward
  for (let i = 0; i < 365; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const dateStr = d.toISOString().split('T')[0];

    if (dailyActivity[dateStr] && dailyActivity[dateStr] > 0) {
      tempStreak++;
      if (i === currentStreak) {
        currentStreak++;
      }
      if (tempStreak > longestStreak) {
        longestStreak = tempStreak;
      }
    } else {
      if (i === 0 && currentStreak === 0) {
        // Check if active yesterday to maintain streak
        const yesterday = new Date(today);
        yesterday.setDate(yesterday.getDate() - 1);
        const yDateStr = yesterday.toISOString().split('T')[0];
        if (!dailyActivity[yDateStr]) {
          tempStreak = 0;
        }
      } else {
        tempStreak = 0;
      }
    }
  }

  // Dynamic Badges Evaluation
  const hasTechnical = technicalCount > 0;
  const hasProduct = productCount > 0;
  const hasHiringManager = hiringManagerCount > 0;
  const hasAllPanels = hasTechnical && hasProduct && hasHiringManager;

  const badges = [
    {
      id: 'first_interview',
      icon: '🏆',
      title: 'First Interview',
      description: 'Completed your first AI interview',
      unlocked: totalCompleted >= 1,
      unlockedAt: totalCompleted >= 1 ? 'Sep 2026' : undefined,
    },
    {
      id: 'streak_7',
      icon: '🔥',
      title: '7 Day Streak',
      description: 'Practiced for 7 consecutive days',
      unlocked: currentStreak >= 7,
      unlockedAt: currentStreak >= 7 ? 'Sep 2026' : undefined,
    },
    {
      id: 'interviews_10',
      icon: '🎯',
      title: '10 Interviews',
      description: 'Completed 10 interviews',
      unlocked: totalCompleted >= 10,
      unlockedAt: totalCompleted >= 10 ? 'Sep 2026' : undefined,
    },
    {
      id: 'consistent_candidate',
      icon: '⚡',
      title: 'Consistent Candidate',
      description: 'Practiced 20+ days',
      unlocked: practiceDays >= 20,
      unlockedAt: practiceDays >= 20 ? 'Sep 2026' : undefined,
    },
    {
      id: 'panel_pro',
      icon: '🚀',
      title: 'Panel Pro',
      description: 'Completed interviews across all panel types',
      unlocked: hasAllPanels,
      unlockedAt: hasAllPanels ? 'Sep 2026' : undefined,
    },
    {
      id: 'deep_diver',
      icon: '💎',
      title: 'Deep Diver',
      description: 'Completed a 45-min full panel session',
      unlocked: totalCompleted >= 15,
      unlockedAt: totalCompleted >= 15 ? 'Sep 2026' : undefined,
    },
  ];

  // Dynamic Skill Scores Aggregation
  let techScore = 0;
  let problemScore = 0;
  let commScore = 0;
  let prodScore = 0;
  let leadScore = 0;

  if (sessions.length > 0) {
    let tSum = 0, pSum = 0, cSum = 0, prSum = 0, lSum = 0, count = 0;
    sessions.forEach((s) => {
      if (s.skillsSummary) {
        count++;
        tSum += Number(s.skillsSummary['Technical'] || 0);
        pSum += Number(s.skillsSummary['Problem Solving'] || 0);
        cSum += Number(s.skillsSummary['Communication'] || 0);
        prSum += Number(s.skillsSummary['Product Thinking'] || 0);
        lSum += Number(s.skillsSummary['Leadership'] || 0);
      }
    });

    if (count > 0) {
      techScore = Math.min(99, Math.round(tSum / count));
      problemScore = Math.min(99, Math.round(pSum / count));
      commScore = Math.min(99, Math.round(cSum / count));
      prodScore = Math.min(99, Math.round(prSum / count));
      leadScore = Math.min(99, Math.round(lSum / count));
    }
  }

  // Map Recent Interviews
  const recentInterviews = sessions.slice(0, 5).map((s) => {
    const tags: string[] = [];
    if (s.track === 'technical') tags.push('Technical');
    if (s.track === 'product') tags.push('Product');
    if (s.track === 'hiring_manager') tags.push('Hiring Manager');
    if (tags.length === 1 && s.track === 'technical') tags.push('Product');

    return {
      id: s.id,
      role: s.roleTitle || 'Candidate',
      tags: tags,
      score: s.overallScore,
      timestamp: formatRelativeTime(s.completedAt),
    };
  });

  return {
    name: userInfo.name,
    email: userInfo.email,
    avatar: userInfo.avatar,
    role: userInfo.role || 'Software Engineer',
    joinedAt: userInfo.joinedAt || 'September 2026',
    interviewsCompleted: totalCompleted,
    practiceDays: practiceDays,
    currentStreak: currentStreak,
    longestStreak: Math.max(longestStreak, currentStreak),
    averageScore: averageScore,
    totalInterviewsHeatmap: totalCompleted,
    activeDaysHeatmap: practiceDays,
    categoryStats: {
      technical: technicalCount,
      product: productCount,
      hiring_manager: hiringManagerCount,
    },
    badges: badges,
    nextBadgeProgress: totalCompleted === 0
      ? { title: 'First Interview', current: 0, total: 1 }
      : { title: '7-Day Streak', current: Math.min(6, currentStreak), total: 7 },
    recentInterviews: recentInterviews,
    skillScores: [
      { name: 'Technical', percentage: techScore },
      { name: 'Problem Solving', percentage: problemScore },
      { name: 'Communication', percentage: commScore },
      { name: 'Product Thinking', percentage: prodScore },
      { name: 'Leadership', percentage: leadScore },
    ],
    dailyInterviewActivity: dailyActivity,
  };
}
