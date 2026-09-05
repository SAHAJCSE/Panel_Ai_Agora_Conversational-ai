import fs from 'fs';
import path from 'path';
import type { InterviewTrack } from '@/types/conversation';
import { demoCandidate } from '@/data/demo';
import { supabase } from '@/lib/supabase';

export interface RoundMemoryRecord {
  track: InterviewTrack;
  completedAt: number;
  durationFormatted?: string;
  answerCount: number;
  quotes: string[];
  skillsSummary: Record<string, string>;
  overallScore?: number;
  recommendation?: string;
  notes?: string;
}

export interface CandidateMemoryRecord {
  candidateName: string;
  roleTitle: string;
  targetDurationMinutes?: number;
  backgroundNotes?: string;
  lastUpdated: number;
  rounds: RoundMemoryRecord[];
}

export interface LocalDatabase {
  version: number;
  lastUpdated: number;
  candidates: Record<string, CandidateMemoryRecord>;
}

const DB_FILE_PATH = path.join(process.cwd(), 'data', 'memory-db.json');

// Default initial seed records for demo candidate
const SEED_DATABASE: LocalDatabase = {
  version: 1,
  lastUpdated: Date.now(),
  candidates: {
    'abhishek singh': {
      candidateName: 'Abhishek Singh',
      roleTitle: 'Senior Frontend Developer',
      targetDurationMinutes: 15,
      backgroundNotes:
        '5+ years engineering high-throughput React & Next.js web applications. Led ShopFlow storefront optimization reducing render latency by 61%. Deep expertise in performance, DOM reconciliation, state management, and edge streaming.',
      lastUpdated: Date.now() - 1000 * 60 * 30,
      rounds: [
        {
          track: 'technical',
          completedAt: Date.now() - 1000 * 60 * 30,
          durationFormatted: '14:22',
          answerCount: 3,
          quotes: [
            'The product list rerendered on every filter change. I used React DevTools Profiler, memoized ItemCard, and reduced render time from about 180 milliseconds to 70.',
            'Memoization adds comparison and memory overhead, so I would profile first and avoid it when renders are already cheap or props change constantly.',
            'I would debounce input, cancel the previous request with AbortController, and only render the result belonging to the latest query.',
          ],
          skillsSummary: {
            React: 'Proven (render optimization, memoization)',
            Performance: 'Proven (profiling, render measurement)',
            JavaScript: 'Proven (async handling, AbortController)',
            'Problem Solving': 'Solid (systematic debugging)',
          },
          overallScore: 8.2,
          recommendation: 'Advance to Product & Leadership',
          notes: 'Strong technical reasoning during API and cache invalidation scenarios.',
        },
      ],
    },
  },
};

// In-memory cache for ultra-fast, serverless-safe responses
let cachedDb: LocalDatabase | null = null;

function normalizeName(name: string): string {
  return name.trim().toLowerCase();
}

/**
 * Sync candidate profile to Supabase (asynchronous, non-blocking)
 */
async function syncCandidateToSupabase(profile: CandidateMemoryRecord): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  try {
    await supabase.from('candidates').upsert(
      {
        candidate_name: profile.candidateName,
        role_title: profile.roleTitle,
        target_duration_minutes: profile.targetDurationMinutes || 15,
        background_notes: profile.backgroundNotes || '',
        updated_at: new Date(profile.lastUpdated).toISOString(),
      },
      { onConflict: 'candidate_name' },
    );
  } catch (err) {
    console.warn('[Supabase] Non-fatal candidate sync error:', err);
  }
}

/**
 * Sync round memory record to Supabase (asynchronous, non-blocking)
 */
async function syncRoundToSupabase(
  candidateName: string,
  round: RoundMemoryRecord,
): Promise<void> {
  if (!process.env.NEXT_PUBLIC_SUPABASE_URL) return;
  try {
    await supabase.from('interview_rounds').upsert(
      {
        candidate_name: candidateName,
        track: round.track,
        completed_at: new Date(round.completedAt).toISOString(),
        duration_formatted: round.durationFormatted || null,
        answer_count: round.answerCount || 0,
        quotes: round.quotes || [],
        skills_summary: round.skillsSummary || {},
        overall_score: round.overallScore || null,
        recommendation: round.recommendation || null,
        notes: round.notes || null,
      },
      { onConflict: 'candidate_name,track' },
    );
  } catch (err) {
    console.warn('[Supabase] Non-fatal round sync error:', err);
  }
}

/**
 * Load database from disk / memory cache / fallback seed
 */
export function getLocalDatabase(): LocalDatabase {
  if (cachedDb) return cachedDb;

  try {
    if (fs.existsSync(DB_FILE_PATH)) {
      const raw = fs.readFileSync(DB_FILE_PATH, 'utf-8');
      cachedDb = JSON.parse(raw) as LocalDatabase;
      return cachedDb;
    }
  } catch (err) {
    console.warn('[LocalDB] Disk read skipped or unavailable, using seed:', err);
  }

  // If disk file doesn't exist or is read-only serverless, use seed
  cachedDb = { ...SEED_DATABASE, lastUpdated: Date.now() };
  saveLocalDatabase(cachedDb);
  return cachedDb;
}

/**
 * Save database to disk (if writable) and update memory cache
 */
export function saveLocalDatabase(db: LocalDatabase): void {
  cachedDb = db;
  db.lastUpdated = Date.now();

  try {
    const dir = path.dirname(DB_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempPath = `${DB_FILE_PATH}.tmp.${Date.now()}`;
    fs.writeFileSync(tempPath, JSON.stringify(db, null, 2), 'utf-8');
    fs.renameSync(tempPath, DB_FILE_PATH);
  } catch (err) {
    // Expected on Vercel serverless read-only environment - memory cache & Supabase handle state!
    // console.info('[LocalDB] Disk write disabled on serverless runtime.');
  }
}

/**
 * Get or create candidate record in local DB / Supabase
 */
export function getCandidateProfile(name: string = demoCandidate.name): CandidateMemoryRecord {
  const db = getLocalDatabase();
  const key = normalizeName(name);

  if (!db.candidates[key]) {
    db.candidates[key] = {
      candidateName: name.trim(),
      roleTitle: 'Software Engineer',
      lastUpdated: Date.now(),
      rounds: [],
    };
    saveLocalDatabase(db);
    syncCandidateToSupabase(db.candidates[key]).catch(() => {});
  }

  return db.candidates[key];
}

/**
 * Upsert candidate intake information (name, role, duration, background notes)
 */
export function upsertCandidateBriefing(
  name: string,
  roleTitle: string,
  durationMinutes?: number,
  backgroundNotes?: string,
): CandidateMemoryRecord {
  const db = getLocalDatabase();
  const key = normalizeName(name);

  const existing = db.candidates[key] || {
    candidateName: name.trim(),
    roleTitle,
    lastUpdated: Date.now(),
    rounds: [],
  };

  existing.candidateName = name.trim();
  existing.roleTitle = roleTitle || existing.roleTitle;
  if (durationMinutes) existing.targetDurationMinutes = durationMinutes;
  if (backgroundNotes) existing.backgroundNotes = backgroundNotes;
  existing.lastUpdated = Date.now();

  db.candidates[key] = existing;
  saveLocalDatabase(db);
  syncCandidateToSupabase(existing).catch(() => {});

  return existing;
}

/**
 * Record completed interview round into shared database & Supabase
 */
export function recordCompletedRound(
  candidateName: string,
  roundData: RoundMemoryRecord,
): CandidateMemoryRecord {
  const db = getLocalDatabase();
  const key = normalizeName(candidateName);
  const profile = getCandidateProfile(candidateName);

  // Replace existing round of same track or append
  const idx = profile.rounds.findIndex((r) => r.track === roundData.track);
  if (idx >= 0) {
    profile.rounds[idx] = roundData;
  } else {
    profile.rounds.push(roundData);
  }

  profile.lastUpdated = Date.now();
  db.candidates[key] = profile;
  saveLocalDatabase(db);

  // Sync candidate and round to Supabase DB asynchronously
  syncCandidateToSupabase(profile).catch(() => {});
  syncRoundToSupabase(candidateName, roundData).catch(() => {});

  return profile;
}

/**
 * Builds cross-agent shared memory context prompt to inject into LLM system instructions
 */
export function buildCrossAgentMemoryContext(
  candidateName: string,
  targetTrack: InterviewTrack,
): string {
  const profile = getCandidateProfile(candidateName);
  const otherRounds = profile.rounds.filter((r) => r.track !== targetTrack);

  const lines: string[] = [];
  lines.push(`# Shared Memory Database Context (${profile.candidateName})`);
  lines.push(`- Target Role: ${profile.roleTitle}`);
  if (profile.targetDurationMinutes) {
    lines.push(`- Time Budget: ${profile.targetDurationMinutes} minutes`);
  }
  if (profile.backgroundNotes) {
    lines.push(`- Candidate Context & Background: ${profile.backgroundNotes}`);
  }

  if (otherRounds.length > 0) {
    lines.push(`\n## Prior Panel Assessment Rounds (Cross-Agent Memory)`);
    for (const round of otherRounds) {
      const trackLabel =
        round.track === 'technical'
          ? 'Technical Lead (Alex Chen)'
          : round.track === 'product'
          ? 'Product Director (Sarah Lin)'
          : 'HR Manager (Elena Rostova)';

      lines.push(`\n### ${trackLabel}`);
      if (round.durationFormatted) lines.push(`- Duration: ${round.durationFormatted}`);
      if (round.overallScore) lines.push(`- Overall Rating: ${round.overallScore}/10`);
      if (round.recommendation) lines.push(`- Panel Recommendation: ${round.recommendation}`);

      if (round.quotes.length > 0) {
        lines.push('- Verbatim Candidate Quotes & Claims:');
        round.quotes.forEach((q, i) => lines.push(`  ${i + 1}. "${q}"`));
      }

      const skills = Object.entries(round.skillsSummary);
      if (skills.length > 0) {
        lines.push('- Evaluated Competencies:');
        skills.forEach(([skill, rating]) => lines.push(`  • ${skill}: ${rating}`));
      }
    }
  }

  lines.push(`\n## Instructions for ${targetTrack.toUpperCase()} Interviewer:`);
  if (targetTrack === 'product') {
    lines.push(
      `1. Cross-Reference Technical Claims: In your follow-up questions, directly mention what ${profile.candidateName} told Alex Chen in the technical round. ` +
        `2. Challenge Trade-offs: Ask how their technical solutions impact user experience, conversion metrics, and business ROI. ` +
        `3. Keep speech concise (1–2 sentences max).`,
    );
  } else if (targetTrack === 'hiring_manager') {
    lines.push(
      `1. Cross-Reference Prior Rounds: Warmly reference ${profile.candidateName}'s earlier technical and product responses. ` +
        `2. Probe Collaboration & Conflict: Ask how ${profile.candidateName} handled disagreements with technical or product teammates during those project scenarios. ` +
        `3. Keep speech concise (1–2 sentences max).`,
    );
  } else {
    lines.push(
      `1. Cross-Reference Product/Business Goals: Inquire how ${profile.candidateName}'s technical architecture supports stated product metrics. ` +
        `2. Challenge Feasibility: Probe deeply into state management, profiling, and algorithmic performance. ` +
        `3. Keep speech concise (1–2 sentences max).`,
    );
  }

  return lines.join('\n');
}

/**
 * Clear memory for candidate in database & Supabase
 */
export function clearCandidateMemory(name: string): void {
  const db = getLocalDatabase();
  const key = normalizeName(name);
  if (db.candidates[key]) {
    delete db.candidates[key];
    saveLocalDatabase(db);
  }

  if (process.env.NEXT_PUBLIC_SUPABASE_URL) {
    (async () => {
      try {
        await supabase
          .from('candidates')
          .delete()
          .eq('candidate_name', name.trim());
      } catch (err) {
        console.warn('[Supabase] Clear candidate error:', err);
      }
    })();
  }
}
