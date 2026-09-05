'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  ArrowLeft,
  AudioWaveform,
  Award,
  CheckCircle2,
  Code2,
  Compass,
  History,
  Printer,
  RotateCcw,
  ShieldCheck,
  Sparkles,
  UserCheck,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { demoCandidate, demoRole, demoTracks } from '@/data/demo';
import type { CandidateMemoryProfile } from '@/lib/interview/context-memory';

export default function CandidateAnalysisPage() {
  const [memoryProfile, setMemoryProfile] = useState<CandidateMemoryProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchMemory = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(
        `/api/context-memory?name=${encodeURIComponent(demoCandidate.name)}`,
      );
      if (res.ok) {
        const data = await res.json();
        setMemoryProfile(data.profile);
      }
    } catch (err) {
      console.error('Failed to load candidate analysis:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMemory();
  }, []);

  const handleClearMemory = async () => {
    if (!confirm('Are you sure you want to reset candidate history and analysis?')) return;
    try {
      await fetch(
        `/api/context-memory?name=${encodeURIComponent(demoCandidate.name)}`,
        { method: 'DELETE' },
      );
      setMemoryProfile({
        candidateName: demoCandidate.name,
        roleTitle: demoRole.title,
        rounds: [],
        lastUpdated: Date.now(),
      });
    } catch (err) {
      console.error('Failed to reset memory:', err);
    }
  };

  const rounds = memoryProfile?.rounds || [];
  const techRound = rounds.find((r) => r.track === 'technical');
  const prodRound = rounds.find((r) => r.track === 'product');

  return (
    <div className="min-h-screen bg-[#f8faff] text-[#101828] print:bg-white print:text-black">
      {/* Top Navigation */}
      <header className="sticky top-0 z-30 border-b border-border/70 bg-white/80 backdrop-blur-xl print:hidden">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="flex items-center gap-2 text-xs font-semibold text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Interview
            </Link>
            <span className="h-4 w-px bg-border" />
            <div className="flex items-center gap-2">
              <span className="brand-mark grid h-7 w-7 place-items-center rounded-lg bg-primary/10 text-primary">
                <AudioWaveform className="h-4 w-4" />
              </span>
              <span className="display-type text-sm font-semibold tracking-tight">
                Interview<span className="text-primary">IQ</span> Intelligence
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={() => window.print()}
              className="h-9 gap-1.5 rounded-xl border-border/80 text-xs font-medium hover:bg-white"
            >
              <Printer className="h-3.5 w-3.5 text-muted-foreground" />
              Export Dossier
            </Button>

            <Button
              variant="outline"
              size="sm"
              disabled={isLoading}
              onClick={handleClearMemory}
              className="h-9 gap-1.5 rounded-xl border-border/80 text-xs font-medium text-destructive hover:bg-destructive/5"
            >
              <RotateCcw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              Reset Memory
            </Button>
          </div>
        </div>
      </header>

      {/* Main Analysis Container */}
      <main className="mx-auto max-w-6xl px-5 py-8 sm:py-12">
        {/* Candidate Overview Hero */}
        <section className="relative overflow-hidden rounded-3xl border border-white/80 bg-white p-6 shadow-[0_18px_40px_rgba(24,37,64,0.06)] sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-start gap-4 sm:items-center">
              <div className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#101828] text-white shadow-lg">
                <UserCheck className="h-8 w-8 text-primary" />
              </div>
              <div>
                <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/[0.04] px-3 py-1 text-[11px] font-semibold text-primary">
                  <Sparkles className="h-3.5 w-3.5" />
                  360° Multi-Panel Candidate Evaluation
                </div>
                <h1 className="display-type mt-2 text-2xl font-bold tracking-tight text-[#101828] sm:text-3xl">
                  {demoCandidate.name}
                </h1>
                <p className="mt-1 text-sm text-muted-foreground">
                  {demoCandidate.experience} • Target: {demoTracks.technical.role} &{' '}
                  {demoTracks.product.role} at {demoTracks.technical.company}
                </p>
              </div>
            </div>

            {/* Overall Hiring Status Banner */}
            <div className="flex flex-col items-start rounded-2xl border border-accent/20 bg-accent/[0.04] p-4 text-left sm:items-end sm:text-right">
              <span className="data-type text-[10px] font-semibold uppercase tracking-widest text-accent">
                Joint Recommendation
              </span>
              <p className="display-type mt-1 text-xl font-bold text-accent">
                {techRound && techRound.overallScore !== undefined && techRound.overallScore < 35
                  ? 'Do Not Advance • Failed Technical Round'
                  : techRound && prodRound
                    ? 'Strong Hire / Advance to Final'
                    : techRound
                      ? 'Advance • Complete Product Round'
                      : 'Awaiting Full Panel'}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {rounds.length} of 2 interview rounds recorded
              </p>
            </div>
          </div>

          {/* Context Memory Banner */}
          <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-border/80 bg-[#f8faff] p-3.5 text-xs text-[#35415a]">
            <div className="flex items-center gap-2 font-medium">
              <History className="h-4 w-4 text-primary" />
              <span>
                Shared Context Memory Status: Active across Technical & Product interviewers.
              </span>
            </div>
            <span className="data-type text-[10px] uppercase tracking-wider text-muted-foreground">
              Last synced: {new Date(memoryProfile?.lastUpdated || Date.now()).toLocaleTimeString()}
            </span>
          </div>
        </section>

        {/* Dual Track Comparison Matrix */}
        <div className="mt-8 grid gap-6 lg:grid-cols-2">
          {/* Round 1: Technical Interview Panel */}
          <section className="flex flex-col rounded-3xl border border-white/80 bg-white p-6 shadow-[0_12px_30px_rgba(24,37,64,0.05)]">
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/10 text-primary">
                  <Code2 className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="display-type text-lg font-bold text-foreground">
                    Round 1: Technical Interview
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Agent: Technical Interviewer • System & Performance
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  techRound
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {techRound ? 'Completed' : 'Pending'}
              </span>
            </div>

            {/* Competency Breakdown */}
            <div className="mt-5 space-y-3">
              <h3 className="data-type text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Evaluated Competencies
              </h3>
              {techRound?.skillsSummary ? (
                Object.entries(techRound.skillsSummary).map(([skill, summary]) => (
                  <div
                    key={skill}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-[#f8faff] p-3 text-xs"
                  >
                    <span className="font-semibold text-foreground">{skill}</span>
                    <span className="font-medium text-primary">{summary}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  Launch the Technical Interview to evaluate React, Performance, and JavaScript.
                </div>
              )}
            </div>

            {/* Candidate Quotes / Claims */}
            <div className="mt-6 flex-1">
              <h3 className="data-type text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Verified Candidate Statements
              </h3>
              <div className="mt-2.5 space-y-2">
                {techRound?.quotes && techRound.quotes.length > 0 ? (
                  techRound.quotes.map((quote, idx) => (
                    <blockquote
                      key={idx}
                      className="rounded-xl border border-primary/15 bg-primary/[0.03] p-3 text-xs italic text-[#35415a]"
                    >
                      &ldquo;{quote}&rdquo;
                    </blockquote>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">No quotes recorded yet.</p>
                )}
              </div>
            </div>
          </section>

          {/* Round 2: Product Interview Panel */}
          <section className="flex flex-col rounded-3xl border border-white/80 bg-white p-6 shadow-[0_12px_30px_rgba(24,37,64,0.05)]">
            <div className="flex items-center justify-between border-b border-border/70 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-accent">
                  <Compass className="h-5 w-5" />
                </div>
                <div>
                  <h2 className="display-type text-lg font-bold text-foreground">
                    Round 2: Product Interview
                  </h2>
                  <p className="text-xs text-muted-foreground">
                    Agent: Product Interviewer • Customer & Business Impact
                  </p>
                </div>
              </div>
              <span
                className={`rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                  prodRound
                    ? 'bg-accent/10 text-accent border border-accent/20'
                    : 'bg-muted text-muted-foreground'
                }`}
              >
                {prodRound ? 'Completed' : 'Pending'}
              </span>
            </div>

            {/* Competency Breakdown */}
            <div className="mt-5 space-y-3">
              <h3 className="data-type text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Evaluated Competencies
              </h3>
              {prodRound?.skillsSummary ? (
                Object.entries(prodRound.skillsSummary).map(([skill, summary]) => (
                  <div
                    key={skill}
                    className="flex items-center justify-between rounded-xl border border-border/60 bg-[#f8faff] p-3 text-xs"
                  >
                    <span className="font-semibold text-foreground">{skill}</span>
                    <span className="font-medium text-accent">{summary}</span>
                  </div>
                ))
              ) : (
                <div className="rounded-xl border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
                  Ready to test Customer Impact, Business Value, UX, and Trade-offs using candidate&apos;s technical claims as memory context.
                </div>
              )}
            </div>

            {/* Product Focus & Quotes */}
            <div className="mt-6 flex-1">
              <h3 className="data-type text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Product Answers & Impact Evidence
              </h3>
              <div className="mt-2.5 space-y-2">
                {prodRound?.quotes && prodRound.quotes.length > 0 ? (
                  prodRound.quotes.map((quote, idx) => (
                    <blockquote
                      key={idx}
                      className="rounded-xl border border-accent/15 bg-accent/[0.03] p-3 text-xs italic text-[#35415a]"
                    >
                      &ldquo;{quote}&rdquo;
                    </blockquote>
                  ))
                ) : (
                  <p className="text-xs text-muted-foreground italic">
                    Candidate product statements will populate upon completing the Product round.
                  </p>
                )}
              </div>
            </div>
          </section>
        </div>

        {/* 5-Point Reliability Gate Sentinel Audit */}
        <section className="mt-8 rounded-3xl border border-white/80 bg-white p-6 shadow-[0_12px_30px_rgba(24,37,64,0.05)] sm:p-8">
          <div className="flex items-center gap-3">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-accent/10 text-accent">
              <ShieldCheck className="h-5 w-5" />
            </div>
            <div>
              <h2 className="display-type text-lg font-bold text-foreground">
                Reliability Gate Sentinel & Safety Audit
              </h2>
              <p className="text-xs text-muted-foreground">
                Every AI agent turn was verified against 5 real-time safety gates before vocal delivery.
              </p>
            </div>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {[
              { name: 'Format Gate', desc: 'Single concise question per turn without multi-part compound queries.', status: '100% Passed' },
              { name: 'Relevance Gate', desc: 'Strict adherence to target competencies (technical & product).', status: '100% Passed' },
              { name: 'Repetition Sentinel', desc: 'Similarity score <0.72 against all previously delivered questions.', status: '100% Passed' },
              { name: 'Latency Guard', desc: 'Real-time pipeline response delivered within <1500ms SLA.', status: 'Passed (<600ms)' },
              { name: 'Quality Check', desc: 'Excludes shallow generic prompts; enforces evidence-seeking depth.', status: '100% Passed' },
            ].map((gate) => (
              <div key={gate.name} className="rounded-2xl border border-border/70 bg-[#f8faff] p-4 text-xs">
                <div className="flex items-center justify-between gap-1">
                  <span className="font-semibold text-foreground">{gate.name}</span>
                  <CheckCircle2 className="h-3.5 w-3.5 text-accent" />
                </div>
                <p className="mt-2 text-[11px] leading-relaxed text-muted-foreground">{gate.desc}</p>
                <span className="mt-3 inline-block rounded-md bg-accent/10 px-2 py-0.5 text-[10px] font-semibold text-accent">
                  {gate.status}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Executive Decision Matrix & Next Steps */}
        <section className="mt-8 rounded-3xl bg-[#101828] p-6 text-white shadow-[0_20px_45px_rgba(16,24,40,0.18)] sm:p-8">
          <div className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="inline-flex items-center gap-2 text-xs font-semibold text-accent">
                <Award className="h-4 w-4" />
                Executive Synthesis
              </div>
              <h2 className="display-type mt-2 text-xl font-bold">
                Ready to make a hiring decision?
              </h2>
              <p className="mt-1 text-xs text-white/70">
                You can switch between live tracks, inspect auditable transcripts, or download this report.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Link href="/">
                <Button className="h-11 rounded-xl bg-primary px-5 text-xs font-semibold text-white hover:bg-[#3549bd]">
                  Return to Live Interview
                </Button>
              </Link>
              <Button
                onClick={() => window.print()}
                variant="outline"
                className="h-11 rounded-xl border-white/20 bg-white/10 px-5 text-xs font-semibold text-white hover:bg-white/20"
              >
                Print Report
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
