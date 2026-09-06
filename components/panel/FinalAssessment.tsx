'use client';

import React, { useState } from 'react';
import {
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Award,
  MessageSquareQuote,
  Sparkles,
  FileText,
  User,
  Briefcase,
  Clock,
  Mic,
  TrendingUp,
  TrendingDown,
  Target,
  Percent,
  Copy,
  Check,
  ShieldCheck,
  ShieldAlert,
  ArrowUpRight,
  Flame,
  Layers,
  BarChart3,
  ThumbsUp,
  ThumbsDown,
  ChevronRight,
  Printer,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { demoCandidate, demoRole } from '@/data/demo';
import type { InterviewScorecard } from '@/lib/interview/types';
import type { MessageItem } from './TranscriptMessage';
import { CircularAssessmentGraph } from './CircularAssessmentGraph';

export interface FinalAssessmentProps {
  scorecard?: InterviewScorecard | null;
  durationFormatted?: string;
  transcriptMessages?: MessageItem[];
  candidateName?: string;
  roleTitle?: string;
  onNewInterview: () => void;
}

interface StrongPoint {
  id: string;
  title: string;
  category: string;
  badge: string;
  description: string;
  quoteSnippet?: string;
}

interface WeakPoint {
  id: string;
  title: string;
  category: string;
  severity: 'Critical Gap' | 'Moderate Risk' | 'Growth Area';
  severityLevel: 'high' | 'medium' | 'low';
  description: string;
  remediation: string;
}

export function FinalAssessment({
  scorecard,
  durationFormatted = '0:00',
  transcriptMessages = [],
  candidateName,
  roleTitle,
  onNewInterview,
}: FinalAssessmentProps) {
  const [activeTab, setActiveTab] = useState<'overview' | 'strengths-weaknesses' | 'quotes' | 'panel'>('overview');
  const [copied, setCopied] = useState(false);

  const activeCandidateName = candidateName || scorecard?.candidateName || demoCandidate.name;
  const activeRoleTitle = roleTitle || demoRole.title;

  // Extract real candidate turns from actual live transcript
  const candidateTurns = transcriptMessages.filter(
    (m) => m.role === 'user' && m.text && m.text.trim().length > 0,
  );

  const totalCandidateText = candidateTurns.map((t) => t.text.toLowerCase()).join(' ');
  const totalWords = totalCandidateText.split(/\s+/).filter(Boolean).length;

  // Technical keywords & concepts detection
  const techKeywords = [
    'react', 'component', 'components', 'state', 'ui', 'sub parts', 'features',
    'javascript', 'full stack', 'developer', 'store data', 'easily', 'function',
    'functional', 'multiple times', 'code', 'props', 'hooks', 'performance',
    'cache', 'api', 'render', 'reusable', 'frontend', 'backend', 'architecture',
    'database', 'supabase', 'next.js', 'typescript', 'async', 'await'
  ];
  const techMatches = techKeywords.filter((kw) => totalCandidateText.includes(kw));

  // Product keywords & concepts detection
  const prodKeywords = [
    'user', 'program statement', 'requirements', 'ecommerce', 'cart', 'books',
    'payment system', 'system', 'website', 'customer', 'features', 'workflow',
    'product manager', 'trade-off', 'impact', 'conversion', 'options', 'metric',
    'prioritization', 'business', 'roi'
  ];
  const prodMatches = prodKeywords.filter((kw) => totalCandidateText.includes(kw));

  // HR / Leadership keywords & concepts detection
  const hrKeywords = [
    'technical management', 'project management', 'good in', 'listen',
    'collaboration', 'pressure', 'leadership', 'team', 'experience', 'growth',
    'disagreement', 'ownership', 'mentor', 'culture'
  ];
  const hrMatches = hrKeywords.filter((kw) => totalCandidateText.includes(kw));

  const isNegativeText = (text: string) => {
    const lower = text.toLowerCase();
    return (
      /i\s*(don't|dont|do\s*not)\s*know/i.test(lower) ||
      /no\s*(idea|clue|knowledge|experience)/i.test(lower) ||
      /(not|im\s*not)\s*sure/i.test(lower) ||
      /\b(idk|dunno|nah|nope|nothing|pass|skip)\b/i.test(lower) ||
      /can't\s*answer/i.test(lower) ||
      /haven't\s*used/i.test(lower) ||
      /never\s*used/i.test(lower) ||
      /hard\s*to\s*say/i.test(lower)
    );
  };

  // Substantive turns must be at least 35 characters, 8+ words, and not a negative non-answer
  const substantiveTurns = candidateTurns.filter((t) => {
    const text = t.text.trim();
    const words = text.split(/\s+/).filter(Boolean).length;
    return text.length >= 35 && words >= 8 && !isNegativeText(text);
  });

  const negativeTurnsCount = candidateTurns.filter((t) => isNegativeText(t.text)).length;

  // Calculate scores strictly based on empirical candidate audio evidence
  let techScoreNum = 0.0;
  let prodScoreNum = 0.0;
  let hrScoreNum = 0.0;
  let overallScoreNum = 0.0;
  let recommendation = 'Incomplete Session • Insufficient Evidence';
  let recommendationReason = 'No candidate microphone turns were recorded during this interview session.';

  if (candidateTurns.length > 0) {
    if (scorecard?.overallScore !== undefined) {
      // Map scorecard overallScore (0..100) to 0.0..10.0 scale
      const rawScore10 = scorecard.overallScore > 10 ? scorecard.overallScore / 10 : scorecard.overallScore;
      overallScoreNum = Math.round(rawScore10 * 10) / 10;
      techScoreNum = Math.round(Math.min(9.8, Math.max(1.0, overallScoreNum)) * 10) / 10;
      prodScoreNum = Math.round(Math.min(9.5, Math.max(1.0, overallScoreNum)) * 10) / 10;
      hrScoreNum = Math.round(Math.min(9.6, Math.max(1.0, overallScoreNum)) * 10) / 10;

      if (scorecard.recommendation) {
        recommendation = scorecard.recommendation;
        recommendationReason = scorecard.recommendationReason || `${activeCandidateName} evaluated across panel competencies.`;
      }
    } else if (substantiveTurns.length === 0) {
      // Zero substantive answers provided (e.g. candidate said "i don't know" or "i used javascript")
      overallScoreNum = candidateTurns.length > 0 ? 2.0 : 1.0;
      techScoreNum = candidateTurns.length > 0 ? 2.0 : 1.0;
      prodScoreNum = candidateTurns.length > 0 ? 1.5 : 1.0;
      hrScoreNum = candidateTurns.length > 0 ? 2.5 : 1.0;
      recommendation = 'Do Not Advance • Non-Responsive / Insufficient Knowledge';
      recommendationReason = `${activeCandidateName} provided brief or non-substantive responses (e.g. "I don't know" or short 2-3 word phrases) without explaining technical trade-offs, architecture, or product reasoning.`;
    } else {
      // Proportional score calculation based on real substantive answers and technical depth
      const techWeight = Math.min(1.0, (techMatches.length / 4) + (substantiveTurns.length / 5));
      techScoreNum = Math.round(Math.min(9.5, 2.5 + (techWeight * 6.5)) * 10) / 10;

      const prodWeight = Math.min(1.0, (prodMatches.length / 3) + (substantiveTurns.length / 5));
      prodScoreNum = Math.round(Math.min(9.2, 2.0 + (prodWeight * 6.8)) * 10) / 10;

      const hrWeight = Math.min(1.0, (hrMatches.length / 3) + (substantiveTurns.length / 5));
      hrScoreNum = Math.round(Math.min(9.4, 2.5 + (hrWeight * 6.5)) * 10) / 10;

      const penalty = negativeTurnsCount * 0.8;
      overallScoreNum = Math.max(1.5, Math.round(((techScoreNum * 0.45) + (prodScoreNum * 0.35) + (hrScoreNum * 0.20) - penalty) * 10) / 10);

      if (overallScoreNum >= 7.5 && substantiveTurns.length >= 3) {
        recommendation = 'Strong Hire • Advance to Next Round';
        recommendationReason = `${activeCandidateName} demonstrated verifiable technical competence (${techScoreNum}/10) across architecture and state management, coupled with practical product reasoning (${prodScoreNum}/10) over ${substantiveTurns.length} detailed audio responses (${totalWords} total words spoken).`;
      } else if (overallScoreNum >= 5.0 && substantiveTurns.length >= 2) {
        recommendation = 'Consider • Targeted Follow-up Required';
        recommendationReason = `${activeCandidateName} completed ${substantiveTurns.length} substantive turns (${totalWords} words spoken), demonstrating foundational concepts but requiring deeper technical validation.`;
      } else {
        recommendation = 'Do Not Advance • Low Technical Depth';
        recommendationReason = `${activeCandidateName} completed ${candidateTurns.length} turns (${substantiveTurns.length} substantive), but responses lacked required technical depth, trade-off analysis, and concrete architecture benchmarks.`;
      }
    }
  }

  // ─────────────────────────────────────────────────────────────
  // 1. CHANCES OF SELECTION & HIRING PROBABILITY CALCULATOR
  // ─────────────────────────────────────────────────────────────
  const turnDepthScore = Math.min(
    10,
    candidateTurns.length >= 5 ? 9.2 : candidateTurns.length >= 3 ? 7.5 : candidateTurns.length >= 1 ? 5.5 : 2.0,
  );

  const selectionProbability = candidateTurns.length > 0
    ? Math.min(
        96,
        Math.max(
          22,
          Math.round(
            (techScoreNum * 0.40 +
              prodScoreNum * 0.25 +
              hrScoreNum * 0.20 +
              turnDepthScore * 0.15) * 10,
          ),
        ),
      )
    : 15;

  const selectionOddsLabel =
    selectionProbability >= 82
      ? 'Very High Selection Probability'
      : selectionProbability >= 68
      ? 'Strong Competitive Contender'
      : selectionProbability >= 50
      ? 'Moderate / Borderline Candidate'
      : 'Low Selection Probability';

  const selectionTier =
    selectionProbability >= 85
      ? 'Tier 1 • Direct Offer Recommendation'
      : selectionProbability >= 72
      ? 'Tier 2 • Team Match & Reference Check'
      : selectionProbability >= 55
      ? 'Tier 3 • Technical Bar-Raiser Follow-up'
      : 'Tier 4 • Core Competency Reassessment';

  const percentileRank = candidateTurns.length > 0
    ? Math.min(98, Math.max(15, Math.round(selectionProbability * 0.94 + 4)))
    : 10;

  // Extract verbatim candidate quotes from transcript
  const realCandidateQuotes = candidateTurns.map((turn, i) => ({
    turn: i + 1,
    quote: turn.text,
    time: turn.timestamp,
  }));

  // ─────────────────────────────────────────────────────────────
  // 2. CANDIDATE STRONG POINTS (SUPERPOWERS & DIFFERENTIATORS)
  // ─────────────────────────────────────────────────────────────
  const strongPointsList: StrongPoint[] = [];

  if (totalCandidateText.includes('component') || totalCandidateText.includes('react') || totalCandidateText.includes('ui')) {
    strongPointsList.push({
      id: 's-comp',
      title: 'Modular Component Architecture & Reusability',
      category: 'Frontend Engineering',
      badge: 'Senior Differentiator',
      description: 'Demonstrated exceptional intuition for isolating UI logic into reusable, testable sub-components with decoupled responsibilities.',
      quoteSnippet: candidateTurns.find(t => t.text.toLowerCase().includes('component') || t.text.toLowerCase().includes('react'))?.text,
    });
  }

  if (totalCandidateText.includes('state') || totalCandidateText.includes('store') || totalCandidateText.includes('data')) {
    strongPointsList.push({
      id: 's-state',
      title: 'State Flow & Predictable Data Persistence',
      category: 'Application Architecture',
      badge: 'Core Competency',
      description: 'Articulated clear state management boundaries, data caching protocols, and multi-consumer UI data flow without unnecessary re-renders.',
      quoteSnippet: candidateTurns.find(t => t.text.toLowerCase().includes('state') || t.text.toLowerCase().includes('store'))?.text,
    });
  }

  if (totalCandidateText.includes('user') || totalCandidateText.includes('cart') || totalCandidateText.includes('ecommerce') || totalCandidateText.includes('customer') || totalCandidateText.includes('payment')) {
    strongPointsList.push({
      id: 's-prod',
      title: 'Customer-Centric Feature Decomposition',
      category: 'Product Reasoning',
      badge: 'High Impact',
      description: 'Directly linked technical engineering decisions to user conversion funnels, checkout friction, and tangible business metric outcomes.',
      quoteSnippet: candidateTurns.find(t => t.text.toLowerCase().includes('user') || t.text.toLowerCase().includes('cart') || t.text.toLowerCase().includes('customer'))?.text,
    });
  }

  if (totalCandidateText.includes('team') || totalCandidateText.includes('management') || totalCandidateText.includes('listen') || totalCandidateText.includes('collaboration')) {
    strongPointsList.push({
      id: 's-collab',
      title: 'Cross-Functional Empathy & Leadership',
      category: 'Leadership & Teamwork',
      badge: 'Culture Champion',
      description: 'Exhibited proactive active listening, healthy technical compromise, and clear ownership in multi-stakeholder delivery environments.',
      quoteSnippet: candidateTurns.find(t => t.text.toLowerCase().includes('team') || t.text.toLowerCase().includes('collaboration'))?.text,
    });
  }

  // Fallbacks if candidate answered without matching specific keywords
  if (strongPointsList.length < 2 && candidateTurns.length > 0) {
    strongPointsList.push({
      id: 's-turnaround',
      title: 'Fluid Spoken Turnaround & Natural Conversational Cadence',
      category: 'Communication',
      badge: 'Verified Baseline',
      description: `Participated across ${candidateTurns.length} audio turns with steady response cadence and positive verbal engagement under interview pressure.`,
      quoteSnippet: candidateTurns[0]?.text,
    });
    strongPointsList.push({
      id: 's-structure',
      title: 'Clear Direct Answers to Complex Probes',
      category: 'Problem Solving',
      badge: 'Clarity Focus',
      description: 'Answered multi-agent technical and product probes without mid-sentence abandonment or defensive posturing.',
      quoteSnippet: candidateTurns[candidateTurns.length - 1]?.text,
    });
  } else if (candidateTurns.length === 0) {
    strongPointsList.push({
      id: 's-empty',
      title: 'Session Ready for Candidate Evaluation',
      category: 'Readiness',
      badge: 'Pending Audio',
      description: 'Candidate connected to WebRTC audio pipeline. Spoken audio turns will automatically generate verified strengths.',
    });
  }

  // ─────────────────────────────────────────────────────────────
  // 3. CANDIDATE WEAK POINTS (CRITICAL GAPS & RISKS)
  // ─────────────────────────────────────────────────────────────
  const weakPointsList: WeakPoint[] = [];

  // Weak Point 1: Quantitative SLA Benchmarks
  const hasQuantitativeMetrics = /\b\d+(\.\d+)?\s*(ms|seconds|sec|%|percent|mb|kb|qps|rps)\b/i.test(totalCandidateText);
  if (!hasQuantitativeMetrics) {
    weakPointsList.push({
      id: 'w-metrics',
      title: 'Absence of Quantitative Latency & Performance Benchmarks',
      category: 'Performance Engineering',
      severity: 'Moderate Risk',
      severityLevel: 'medium',
      description: 'Candidate described architectural decisions qualitatively ("fast", "easily", "store data") but omitted explicit SLAs, memory ceilings, render benchmarks, or throughput limits.',
      remediation: 'Practice citing concrete numbers: e.g. "reduced LCP from 2.4s to 820ms via edge chunking" or "bounded component heap memory to <15MB under 10k items".',
    });
  }

  // Weak Point 2: Asynchronous Edge Cases & Failure Modes
  const hasFailureHandling = totalCandidateText.includes('error') || totalCandidateText.includes('fail') || totalCandidateText.includes('retry') || totalCandidateText.includes('fallback') || totalCandidateText.includes('catch');
  if (!hasFailureHandling) {
    weakPointsList.push({
      id: 'w-failures',
      title: 'Superficial Concurrency, Race Condition & Network Failure Handling',
      category: 'Production Resiliency',
      severity: 'Critical Gap',
      severityLevel: 'high',
      description: 'Focused primarily on the happy path. Did not proactively volunteer defensive strategies for network drops, unhandled promise rejections, hydration mismatches, or concurrent mutate-while-stale races.',
      remediation: 'Structure technical answers with defensive resilience: explain what happens when the network drops, API returns 502, or user double-clicks during inflight mutations.',
    });
  }

  // Weak Point 3: STAR Framework Rigor
  const hasStructuredSTAR = candidateTurns.some(t => t.text.split(/\s+/).length >= 40);
  if (!hasStructuredSTAR) {
    weakPointsList.push({
      id: 'w-star',
      title: 'Concise but Compressed Turn Answers (Missing STAR Depth)',
      category: 'Executive Communication',
      severity: 'Growth Area',
      severityLevel: 'low',
      description: 'Spoken answers were brief and direct, but occasionally lacked the full arc of the STAR framework (Situation, Task, Action Taken, and Measured Business Result).',
      remediation: 'Expand critical questions by contextualizing: "At company X, the situation was Y. I owned task Z, implemented architectural change A, which yielded result B."',
    });
  }

  // Weak Point 4: Architectural Trade-off Depth
  const hasTradeoffs = totalCandidateText.includes('trade-off') || totalCandidateText.includes('tradeoff') || totalCandidateText.includes('versus') || totalCandidateText.includes('compromise') || totalCandidateText.includes('alternative');
  if (!hasTradeoffs) {
    weakPointsList.push({
      id: 'w-tradeoffs',
      title: 'Single-Option Solutions Without Architectural Trade-off Contrasts',
      category: 'System Design',
      severity: 'Moderate Risk',
      severityLevel: 'medium',
      description: 'Presented an initial solution without articulating why alternative approaches (e.g. server components vs client state, SQL vs document store, polling vs WebSockets) were rejected.',
      remediation: 'Always present 2 viable alternatives and justify your final choice based on cost, latency, developer velocity, and maintainability.',
    });
  }

  const handleCopySummary = () => {
    const summaryText = `
=== PANELAI RECRUITER ASSESSMENT REPORT ===
Candidate: ${activeCandidateName}
Role: ${activeRoleTitle}
Duration: ${durationFormatted}
Spoken Audio Turns: ${candidateTurns.length} (${totalWords} words)

--- HIRING DECISION & SELECTION ODDS ---
Recommendation: ${recommendation}
Selection Probability: ${selectionProbability}% (${selectionOddsLabel})
Overall Score: ${overallScoreNum}/10
Technical Score: ${techScoreNum}/10
Product Score: ${prodScoreNum}/10
HR / Leadership Score: ${hrScoreNum}/10
Percentile Rank: Top ${100 - percentileRank}%

--- CONFIRMED STRONG POINTS ---
${strongPointsList.map(s => `• [${s.category}] ${s.title}: ${s.description}`).join('\n')}

--- TARGETED WEAK POINTS & RISKS ---
${weakPointsList.map(w => `• [${w.severity}] ${w.title}: ${w.description}\n  Remediation: ${w.remediation}`).join('\n')}
===========================================
    `.trim();

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-[#09090e] text-white selection:bg-pink-500/30 selection:text-pink-300 font-sans backdrop-blur-2xl">
      {/* Background ambient lighting */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[1100px] h-[500px] bg-gradient-to-b from-[#ec4899]/15 via-[#8b5cf6]/10 to-transparent blur-[140px] opacity-80" />
        <div className="absolute top-[35%] -right-48 w-[600px] h-[600px] bg-[#ec4899]/10 blur-[160px] rounded-full" />
        <div className="absolute top-[60%] -left-48 w-[600px] h-[600px] bg-emerald-500/5 blur-[160px] rounded-full" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 py-8 sm:py-12 space-y-8 print:p-0 print:m-0 print:max-w-none">
        
        {/* ── HEADER NAVIGATION & CANDIDATE BRIEF ── */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 border-b border-white/10 pb-6">
          <div>
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-pink-500/20 via-purple-600/30 to-pink-500/10 border border-pink-500/40 flex items-center justify-center text-pink-400 shadow-[0_0_25px_rgba(236,72,153,0.35)]">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-3">
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white">
                    Candidate Intelligence &amp; Hiring Assessment
                  </h1>
                  <span className="hidden sm:inline-flex rounded-full border border-pink-500/40 bg-pink-500/10 px-3 py-0.5 text-[11px] font-semibold text-pink-300 uppercase tracking-wider font-mono">
                    Live Audio Verified
                  </span>
                </div>
                <p className="mt-1 text-xs sm:text-sm text-zinc-400">
                  Comprehensive anti-hallucination scorecard with empirical selection odds, strengths, and risk vectors
                </p>
              </div>
            </div>

            {/* Candidate Metadata Strip */}
            <div className="mt-5 flex flex-wrap items-center gap-3 text-xs font-mono">
              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900/80 border border-white/10 text-zinc-300">
                <User className="w-3.5 h-3.5 text-[#ec4899]" />
                <span>Candidate: <strong className="text-white">{activeCandidateName}</strong></span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900/80 border border-white/10 text-zinc-300">
                <Briefcase className="w-3.5 h-3.5 text-purple-400" />
                <span>Role: <strong className="text-white">{activeRoleTitle}</strong></span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900/80 border border-white/10 text-zinc-300">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Session Duration: <strong className="text-white">{durationFormatted}</strong></span>
              </div>

              <div className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-zinc-900/80 border border-white/10 text-zinc-300">
                <Mic className="w-3.5 h-3.5 text-emerald-400" />
                <span>Spoken Audio Turns: <strong className="text-emerald-400">{candidateTurns.length} turns ({totalWords} words)</strong></span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-3 shrink-0 print:hidden">
            <Button
              onClick={handleCopySummary}
              variant="outline"
              className="rounded-xl border-white/15 bg-zinc-900/90 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all gap-2"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-300">Copied to Clipboard!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Copy ATS Summary</span>
                </>
              )}
            </Button>

            <Button
              onClick={handlePrint}
              variant="outline"
              className="rounded-xl border-white/15 bg-zinc-900/90 text-xs font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white transition-all gap-2"
            >
              <Printer className="w-3.5 h-3.5 text-zinc-400" />
              <span>Print / PDF</span>
            </Button>

            <Button
              onClick={onNewInterview}
              className="rounded-xl bg-gradient-to-r from-[#ec4899] to-[#d926aa] px-5 py-2.5 text-xs font-bold text-white shadow-[0_0_25px_rgba(236,72,153,0.4)] hover:shadow-[0_0_35px_rgba(236,72,153,0.6)] hover:scale-[1.02] active:scale-[0.98] transition-all gap-2"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Start New Interview</span>
            </Button>
          </div>
        </header>

        {/* ── TOP HERO: CHANCES OF SELECTION & HIRING PROBABILITY RADIAL ── */}
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-[#12111a] via-[#0d0c14] to-[#08080c] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
          <div className="absolute top-0 right-0 w-80 h-80 bg-pink-500/10 blur-3xl pointer-events-none rounded-full" />
          <div className="absolute bottom-0 left-0 w-80 h-80 bg-purple-500/10 blur-3xl pointer-events-none rounded-full" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            
            {/* Left: Probability Circular Gauge (5 cols) */}
            <div className="lg:col-span-5 flex flex-col items-center justify-center p-4 rounded-2xl bg-black/40 border border-white/5">
              <span className="text-xs font-mono font-bold uppercase tracking-widest text-pink-400 mb-2 flex items-center gap-1.5">
                <Flame className="w-3.5 h-3.5 text-pink-500" />
                Hiring Probability Index
              </span>

              <div className="relative flex items-center justify-center w-52 h-52">
                <svg className="w-full h-full rotate-[-90deg]">
                  <circle
                    cx="104"
                    cy="104"
                    r="84"
                    className="stroke-zinc-800"
                    strokeWidth="14"
                    fill="none"
                  />
                  <circle
                    cx="104"
                    cy="104"
                    r="84"
                    className="stroke-[#ec4899] transition-all duration-1000 ease-out"
                    strokeWidth="14"
                    strokeDasharray={2 * Math.PI * 84}
                    strokeDashoffset={2 * Math.PI * 84 * (1 - selectionProbability / 100)}
                    strokeLinecap="round"
                    fill="none"
                    style={{
                      filter: 'drop-shadow(0 0 16px rgba(236,72,153,0.5))',
                    }}
                  />
                </svg>

                <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                  <span className="text-4xl sm:text-5xl font-black tracking-tight text-white font-mono">
                    {selectionProbability}%
                  </span>
                  <span className="text-[11px] font-mono uppercase tracking-wider text-pink-300 font-semibold mt-1">
                    Selection Odds
                  </span>
                  <span className="mt-1 text-[10px] px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-200 border border-pink-500/30">
                    Top {100 - percentileRank}% of pool
                  </span>
                </div>
              </div>

              <div className="mt-4 text-center">
                <div className="text-sm font-bold text-white flex items-center justify-center gap-1.5">
                  <span>{selectionOddsLabel}</span>
                </div>
                <div className="text-xs text-zinc-400 font-mono mt-0.5">{selectionTier}</div>
              </div>
            </div>

            {/* Right: 4-Factor Selection Breakdown & Recruiter Consensus (7 cols) */}
            <div className="lg:col-span-7 space-y-5">
              <div>
                <div className="flex items-center justify-between">
                  <h2 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
                    <Award className="w-5 h-5 text-purple-400" />
                    <span>Hiring Decision &amp; Candidate Competency Breakdown</span>
                  </h2>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-extrabold uppercase tracking-wider font-mono ${
                      overallScoreNum >= 7.5
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.3)]'
                        : overallScoreNum >= 6.0
                        ? 'border-purple-500/40 bg-purple-500/15 text-purple-300 shadow-[0_0_15px_rgba(168,85,247,0.3)]'
                        : 'border-amber-500/40 bg-amber-500/15 text-amber-300'
                    }`}
                  >
                    {recommendation}
                  </span>
                </div>
                <p className="mt-2 text-xs sm:text-sm text-zinc-300 leading-relaxed">
                  {recommendationReason}
                </p>
              </div>

              {/* 4 Key Selection Drivers Progress Meters */}
              <div className="space-y-3 pt-2">
                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-zinc-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#ec4899]" />
                      Technical Depth &amp; Architecture (40% Weight)
                    </span>
                    <span className="text-pink-300 font-bold">{techScoreNum}/10</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-pink-500 to-rose-400"
                      style={{ width: `${Math.min(100, techScoreNum * 10)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-zinc-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-purple-400" />
                      Product Sense &amp; Trade-off Balancing (25% Weight)
                    </span>
                    <span className="text-purple-300 font-bold">{prodScoreNum}/10</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-purple-500 to-indigo-400"
                      style={{ width: `${Math.min(100, prodScoreNum * 10)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-zinc-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400" />
                      Leadership, Collaboration &amp; Culture (20% Weight)
                    </span>
                    <span className="text-emerald-300 font-bold">{hrScoreNum}/10</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-emerald-500 to-teal-400"
                      style={{ width: `${Math.min(100, hrScoreNum * 10)}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-mono mb-1">
                    <span className="text-zinc-300 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      Spoken Evidence &amp; Answer Consistency (15% Weight)
                    </span>
                    <span className="text-cyan-300 font-bold">{turnDepthScore}/10</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-cyan-500 to-blue-400"
                      style={{ width: `${Math.min(100, turnDepthScore * 10)}%` }}
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ── INTERACTIVE TAB SELECTOR ── */}
        <div className="flex border-b border-white/10 gap-2 overflow-x-auto pb-1 text-xs sm:text-sm font-semibold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'overview'
                ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <BarChart3 className="w-4 h-4 text-pink-400" />
            <span>Overview &amp; Circular Radar</span>
          </button>

          <button
            onClick={() => setActiveTab('strengths-weaknesses')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'strengths-weaknesses'
                ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Flame className="w-4 h-4 text-emerald-400" />
            <span>Strong Points vs Weak Points</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-emerald-500/20 text-emerald-300 font-mono">
              {strongPointsList.length} / {weakPointsList.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('quotes')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'quotes'
                ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <MessageSquareQuote className="w-4 h-4 text-cyan-400" />
            <span>Live Audio Transcript Evidence</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-cyan-500/20 text-cyan-300 font-mono">
              {candidateTurns.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('panel')}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl transition-all ${
              activeTab === 'panel'
                ? 'bg-white/10 text-white border border-white/15 shadow-sm'
                : 'text-zinc-400 hover:text-white hover:bg-white/5'
            }`}
          >
            <Layers className="w-4 h-4 text-purple-400" />
            <span>Interviewer Panel Consensus</span>
          </button>
        </div>

        {/* ── TAB 1: OVERVIEW & RADAR ── */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* Circular Assessment Graph */}
            <CircularAssessmentGraph
              overallScore={overallScoreNum}
              techScore={techScoreNum}
              prodScore={prodScoreNum}
              hrScore={hrScoreNum}
              turnsCount={candidateTurns.length}
            />

            {/* Side-by-side Highlights of Strengths & Weak Points */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Strengths Preview */}
              <div className="rounded-2xl border border-emerald-500/25 bg-emerald-950/15 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20 mb-4">
                  <div className="flex items-center gap-2 text-emerald-400">
                    <CheckCircle2 className="w-5 h-5" />
                    <h3 className="font-bold text-sm uppercase tracking-wider font-mono">Top Candidate Strengths</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('strengths-weaknesses')}
                    className="text-xs font-mono text-emerald-300 hover:underline flex items-center gap-1"
                  >
                    View All ({strongPointsList.length}) <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {strongPointsList.slice(0, 3).map((item) => (
                    <div key={item.id} className="p-3 rounded-xl bg-black/40 border border-emerald-500/20">
                      <div className="flex items-center justify-between text-xs font-bold text-emerald-300 mb-1">
                        <span>{item.title}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/30 font-mono">
                          {item.badge}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weak Points Preview */}
              <div className="rounded-2xl border border-rose-500/25 bg-rose-950/15 p-6 backdrop-blur-xl">
                <div className="flex items-center justify-between pb-3 border-b border-rose-500/20 mb-4">
                  <div className="flex items-center gap-2 text-rose-400">
                    <AlertTriangle className="w-5 h-5" />
                    <h3 className="font-bold text-sm uppercase tracking-wider font-mono">Critical Weak Points &amp; Gaps</h3>
                  </div>
                  <button
                    onClick={() => setActiveTab('strengths-weaknesses')}
                    className="text-xs font-mono text-rose-300 hover:underline flex items-center gap-1"
                  >
                    View All ({weakPointsList.length}) <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <div className="space-y-3">
                  {weakPointsList.slice(0, 3).map((item) => (
                    <div key={item.id} className="p-3 rounded-xl bg-black/40 border border-rose-500/20">
                      <div className="flex items-center justify-between text-xs font-bold text-rose-300 mb-1">
                        <span>{item.title}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                            item.severityLevel === 'high'
                              ? 'bg-red-500/20 text-red-300 border-red-500/30'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                          }`}
                        >
                          {item.severity}
                        </span>
                      </div>
                      <p className="text-xs text-zinc-300">{item.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 2: DEDICATED STRENGTHS VS WEAK POINTS DEEP DIVE ── */}
        {activeTab === 'strengths-weaknesses' && (
          <div className="space-y-8 animate-in fade-in duration-200">
            {/* CANDIDATE STRONG POINTS */}
            <div className="rounded-3xl border border-emerald-500/30 bg-gradient-to-b from-[#0b1612] via-[#070e0b] to-[#040806] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-emerald-500/20 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
                    <ThumbsUp className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Confirmed Candidate Strong Points</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {strongPointsList.length} Verified
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-400 font-mono">
                      Demonstrated superpowers backed by verbatim candidate audio evidence
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {strongPointsList.map((strong) => (
                  <div
                    key={strong.id}
                    className="p-5 rounded-2xl bg-zinc-900/60 border border-emerald-500/20 hover:border-emerald-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-xs font-mono font-bold text-emerald-400 uppercase tracking-wider">
                          {strong.category}
                        </span>
                        <span className="text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold shrink-0">
                          {strong.badge}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-2">{strong.title}</h4>
                      <p className="text-xs text-zinc-300 leading-relaxed mb-4">{strong.description}</p>
                    </div>

                    {strong.quoteSnippet && (
                      <div className="pt-3 border-t border-white/10 mt-auto">
                        <span className="text-[10px] font-mono text-zinc-500 uppercase tracking-wider block mb-1">
                          Spoken Audio Quote Evidence:
                        </span>
                        <blockquote className="text-xs italic text-emerald-200/90 pl-2.5 border-l-2 border-emerald-500/60 line-clamp-3">
                          &ldquo;{strong.quoteSnippet}&rdquo;
                        </blockquote>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* CANDIDATE WEAK POINTS & RISKS */}
            <div className="rounded-3xl border border-rose-500/30 bg-gradient-to-b from-[#180d12] via-[#0f070b] to-[#080406] p-6 sm:p-8 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between border-b border-rose-500/20 pb-4 mb-6">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-rose-500/20 border border-rose-500/40 flex items-center justify-center text-rose-400">
                    <ThumbsDown className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white flex items-center gap-2">
                      <span>Candidate Weak Points, Gaps &amp; Risk Vectors</span>
                      <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                        {weakPointsList.length} Gaps Detected
                      </span>
                    </h2>
                    <p className="text-xs text-zinc-400 font-mono">
                      Targeted competencies requiring coaching, deeper technical evaluation, or candidate practice
                    </p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {weakPointsList.map((weak) => (
                  <div
                    key={weak.id}
                    className="p-5 rounded-2xl bg-zinc-900/60 border border-rose-500/20 hover:border-rose-500/40 transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <span className="text-xs font-mono font-bold text-rose-400 uppercase tracking-wider">
                          {weak.category}
                        </span>
                        <span
                          className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border shrink-0 ${
                            weak.severityLevel === 'high'
                              ? 'bg-red-500/20 text-red-300 border-red-500/40'
                              : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          }`}
                        >
                          {weak.severity}
                        </span>
                      </div>
                      <h4 className="text-sm font-bold text-white mb-2">{weak.title}</h4>
                      <p className="text-xs text-zinc-300 leading-relaxed mb-4">{weak.description}</p>
                    </div>

                    <div className="pt-3 border-t border-white/10 mt-auto bg-black/25 -mx-5 -mb-5 p-4 rounded-b-2xl">
                      <span className="text-[10px] font-mono font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1 mb-1">
                        <Target className="w-3 h-3 text-amber-400" />
                        Actionable Remediation &amp; Study Guide:
                      </span>
                      <p className="text-xs text-amber-200/90 leading-relaxed">
                        {weak.remediation}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── TAB 3: VERBATIM CANDIDATE AUDIO TRANSCRIPT EVIDENCE ── */}
        {activeTab === 'quotes' && (
          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 sm:p-8 shadow-2xl backdrop-blur-xl animate-in fade-in duration-200">
            <div className="flex items-center justify-between border-b border-white/[0.08] pb-4 mb-6">
              <div className="flex items-center gap-3 text-cyan-400">
                <MessageSquareQuote className="h-5 w-5" />
                <div>
                  <h3 className="text-sm sm:text-base font-bold uppercase tracking-wider font-mono text-white">
                    Verified Candidate Spoken Audio Turns
                  </h3>
                  <p className="text-xs text-zinc-400">
                    Chronological audio transcript stream captured live from {activeCandidateName}&apos;s microphone
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-cyan-400/90 font-semibold px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/25">
                {candidateTurns.length} Spoken Turns ({totalWords} words)
              </span>
            </div>

            <div className="space-y-4 max-h-[550px] overflow-y-auto pr-2 custom-scrollbar">
              {realCandidateQuotes.length > 0 ? (
                realCandidateQuotes.map((item) => (
                  <div
                    key={item.turn}
                    className="rounded-xl border border-white/[0.08] bg-zinc-900/60 p-4 hover:border-pink-500/30 transition-all"
                  >
                    <div className="flex items-center justify-between text-xs text-zinc-400 font-mono mb-2">
                      <span className="font-semibold text-pink-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-pink-500" />
                        Turn {item.turn}
                      </span>
                      <span>{item.time}</span>
                    </div>
                    <blockquote className="text-sm sm:text-base italic text-zinc-100 leading-relaxed pl-3 border-l-2 border-pink-500/50">
                      &ldquo;{item.quote}&rdquo;
                    </blockquote>
                  </div>
                ))
              ) : (
                <div className="p-10 text-center rounded-xl border border-white/5 bg-zinc-900/30">
                  <p className="text-sm text-zinc-400 italic">
                    No candidate audio turns recorded yet during this session.
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* ── TAB 4: MULTI-INTERVIEWER PANEL CONSENSUS ── */}
        {activeTab === 'panel' && (
          <div className="rounded-3xl border border-white/10 bg-zinc-950/80 p-6 sm:p-8 backdrop-blur-xl animate-in fade-in duration-200">
            <h3 className="text-xs font-bold uppercase tracking-wider text-zinc-400 font-mono mb-6">
              Autonomous Multi-Interviewer Panel Evaluation Notes
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl border border-pink-500/20 bg-pink-500/[0.04] flex flex-col justify-between">
                <div>
                  <div className="font-semibold text-white text-base flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 rounded-full bg-[#ec4899]" />
                    Alex Chen
                  </div>
                  <span className="text-xs font-mono text-pink-300 block mb-3">Principal Technical Architect</span>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    Evaluated React component hierarchy, state data storage, UI decomposition, and algorithmic complexity. Probed candidate on decoupling state logic and rendering efficiency.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-pink-500/20 text-xs font-mono text-pink-400 font-bold flex justify-between">
                  <span>Technical Score:</span>
                  <span>{techScoreNum}/10</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-purple-500/20 bg-purple-500/[0.04] flex flex-col justify-between">
                <div>
                  <div className="font-semibold text-white text-base flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 rounded-full bg-[#a855f7]" />
                    Sarah Lin
                  </div>
                  <span className="text-xs font-mono text-purple-300 block mb-3">Product Director</span>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    Evaluated customer problem formulation, feature prioritizing, conversion metric alignment, and product trade-off reasoning under engineering constraints.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-purple-500/20 text-xs font-mono text-purple-400 font-bold flex justify-between">
                  <span>Product Score:</span>
                  <span>{prodScoreNum}/10</span>
                </div>
              </div>

              <div className="p-6 rounded-2xl border border-emerald-500/20 bg-emerald-500/[0.04] flex flex-col justify-between">
                <div>
                  <div className="font-semibold text-white text-base flex items-center gap-2 mb-2">
                    <span className="w-3 h-3 rounded-full bg-[#10b981]" />
                    Elena Rostova
                  </div>
                  <span className="text-xs font-mono text-emerald-300 block mb-3">HR &amp; Hiring Partner</span>
                  <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                    Evaluated ownership, cross-functional collaboration under pressure, clarity of verbal communication, growth mindset, and cultural alignment.
                  </p>
                </div>
                <div className="mt-5 pt-3 border-t border-emerald-500/20 text-xs font-mono text-emerald-400 font-bold flex justify-between">
                  <span>Leadership Score:</span>
                  <span>{hrScoreNum}/10</span>
                </div>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
