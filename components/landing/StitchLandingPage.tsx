'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  Play, 
  ArrowRight, 
  Sparkles, 
  Cpu, 
  Radio, 
  Network, 
  Zap, 
  Layers,
  User as UserIcon,
  LogIn,
  LogOut,
  Trophy
} from 'lucide-react';
import { IconCloudDemo } from './IconCloudDemo';
import { MagicCardDemo } from './MagicCardDemo';
import { TeammatesSection } from './TeammatesSection';
import { CapabilityComparisonTable } from './CapabilityComparisonTable';
import { PanelAIFlow } from './PanelAIFlow';
import { UserProfilePage } from '@/components/profile/UserProfilePage';
import { getSavedAvatar } from '@/lib/avatars';
import { LightModePattern } from './LightModePattern';
import { DarkModePattern } from './DarkModePattern';
import { HexagonPattern } from '@/registry/magicui/hexagon-pattern';
import { GridPattern } from '@/registry/magicui/grid-pattern';
import { HexagonBackground } from '@/components/animate-ui/components/backgrounds/hexagon';
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler';
import { InteractiveHoverButton } from '@/registry/magicui/interactive-hover-button';
import { TextAnimate } from '@/registry/magicui/text-animate';
import { cn } from '@/lib/utils';
import { InterviewIntakeModal, type CandidateBriefingData } from './InterviewIntakeModal';
import { AuthModal } from './AuthModal';
import type { InterviewTrack } from '@/types/conversation';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';

interface StitchLandingPageProps {
  isLoading: boolean;
  error: string | null;
  selectedTrack: InterviewTrack;
  onSelectTrack: (track: InterviewTrack) => void;
  onStartConversation: (briefing?: CandidateBriefingData) => void;
}

export function StitchLandingPage({
  isLoading,
  error,
  selectedTrack,
  onSelectTrack,
  onStartConversation,
}: StitchLandingPageProps) {
  const [showDemoModal, setShowDemoModal] = useState(false);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);

  useEffect(() => {
    // Fetch initial user session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen to real-time auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-300 selection:bg-pink-500/30 selection:text-pink-600 dark:selection:text-pink-300 overflow-x-hidden font-sans">
      {/* Ambient Background Glows & Dynamic Theme Patterns */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[950px] h-[550px] bg-gradient-to-b from-[#ec4899]/18 via-[#8b5cf6]/10 to-transparent blur-[140px] opacity-75"></div>
        <div className="absolute top-[35%] -right-48 w-[600px] h-[600px] bg-[#ec4899]/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-10 -left-36 w-[550px] h-[550px] bg-[#7c3aed]/12 blur-[140px] rounded-full"></div>
        
        {/* Light Mode: Linear Grid Pattern */}
        <div className="block dark:hidden">
          <LightModePattern />
        </div>

        {/* Dark Mode: Linear Grid Pattern */}
        <div className="hidden dark:block">
          <DarkModePattern />
        </div>
      </div>

      {/* Minimalist Top Navigation */}
      <header className="sticky top-0 z-50 w-full border-b border-zinc-200 dark:border-white/[0.07] bg-white/80 dark:bg-black/75 backdrop-blur-2xl transition-all duration-300">
        <div className="max-w-7xl mx-auto h-20 px-6 sm:px-8 lg:px-12 flex items-center justify-between">
          {/* Brand Logo */}
          <a className="flex items-center gap-3 group cursor-pointer" href="#">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/30 border border-pink-500/40 flex items-center justify-center text-pink-500 group-hover:border-pink-400 shadow-[0_0_20px_rgba(236,72,153,0.3)] transition-all">
              <Layers className="w-5 h-5 text-pink-500" />
            </div>
            <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
              PANEL<span className="text-[#ec4899]">.AI</span>
            </span>
          </a>

          {/* Right Action CTAs */}
          <div className="flex items-center gap-3 sm:gap-5">
            {/* Hexagon Theme Toggler */}
            <AnimatedThemeToggler variant="hexagon" />

            <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 dark:bg-zinc-900/80 border border-zinc-200 dark:border-white/10 text-xs font-mono text-zinc-600 dark:text-zinc-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ec4899] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ec4899]"></span>
              </span>
              <span className="text-pink-600 dark:text-pink-300/90 font-medium">RTC Mesh: Online</span>
            </div>

            {/* Profile Icon Button using Selected 3D Avatar */}
            <Link
              href="/profile"
              className="relative group p-0.5 rounded-full hover:scale-105 transition-all focus:outline-none"
              title={user ? `Profile: ${user.user_metadata?.full_name || user.email}` : "View Profile"}
            >
              <div className="absolute -inset-0.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 opacity-75 group-hover:opacity-100 blur-xs transition-all"></div>
              <img
                src={getSavedAvatar()}
                alt="User 3D Avatar"
                className="relative w-9 h-9 rounded-full object-cover border-2 border-white dark:border-zinc-950 shadow-md"
              />
            </Link>

            {user ? (
              <button
                onClick={handleSignOut}
                title="Sign Out"
                className="p-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/15 text-xs text-zinc-600 dark:text-zinc-300 hover:text-red-400 hover:border-red-500/40 transition-all shadow-sm"
                type="button"
              >
                <LogOut className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setShowAuthModal(true)}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-white/15 text-xs font-semibold text-zinc-700 dark:text-zinc-200 hover:text-slate-900 dark:hover:text-white hover:border-pink-500/50 shadow-sm transition-all"
                type="button"
              >
                <LogIn className="w-3.5 h-3.5 text-[#ec4899]" />
                <span>Sign In</span>
              </button>
            )}

            <InteractiveHoverButton
              onClick={() => setShowIntakeModal(true)}
              disabled={isLoading}
              className="min-w-[190px] py-2.5 text-xs font-bold shadow-md"
            >
              {isLoading ? 'Connecting...' : 'Start New Interview'}
            </InteractiveHoverButton>
          </div>
        </div>
      </header>

      {/* Main Hero & Architecture Panoramic Section */}
      <main className="relative z-10 w-full">
        {/* Error Alert if any */}
        {error && (
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-6">
            <div className="rounded-xl border border-red-500/30 bg-red-950/40 p-4 text-sm text-red-300 shadow-xl backdrop-blur-xl flex items-center justify-between">
              <span>{error}</span>
            </div>
          </div>
        )}

        {/* HERO SECTION */}
        <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-14 pb-16 lg:pt-20 lg:pb-24" id="product">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-start">
            {/* Left Hero Content */}
            <div className="lg:col-span-6 xl:col-span-7 flex flex-col items-start z-20">
              {/* Pill Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-black/60 border border-[#ec4899]/40 shadow-sm dark:shadow-[0_0_20px_-3px_rgba(236,72,153,0.4)] backdrop-blur-xl">
                <Sparkles className="w-3.5 h-3.5 text-[#ec4899] fill-[#ec4899]" />
                <span className="font-mono text-xs uppercase tracking-widest font-semibold text-pink-600 dark:text-pink-300">
                  Panel AI
                </span>
              </div>

              {/* Hero Headline */}
              <h1 className="mt-6 text-4xl sm:text-5xl xl:text-6xl font-extrabold tracking-tight text-slate-900 dark:text-white leading-[1.12]">
                <TextAnimate animation="blurIn" as="span">
                  Experience the interview.
                </TextAnimate>
                <br />
                <span className="inline-block bg-gradient-to-r from-slate-900 via-pink-600 to-[#ec4899] dark:from-white dark:via-[#f472b6] dark:to-[#ec4899] bg-clip-text text-transparent drop-shadow-sm dark:drop-shadow-[0_0_40px_rgba(236,72,153,0.45)]">
                  <TextAnimate animation="blurIn" delay={0.2} as="span">
                    Not just the questions.
                  </TextAnimate>
                </span>
              </h1>

              {/* Hero Description - Larger Font Size & TextAnimate */}
              <div className="mt-6 max-w-xl">
                <TextAnimate animation="blurIn" delay={0.4} as="p" className="text-lg sm:text-xl font-medium text-slate-800 dark:text-zinc-200 leading-relaxed">
                  A coordinated AI interview panel that adapts to your answers in real time.
                </TextAnimate>
              </div>

              {/* Key Product Message - Larger Font Size */}
              <div className="mt-6 w-full max-w-xl p-5 rounded-2xl bg-white/90 dark:bg-zinc-950/80 border border-zinc-200 dark:border-white/10 shadow-sm dark:shadow-none backdrop-blur-xl transition-colors">
                <div className="flex items-center gap-2 text-xs sm:text-sm font-mono uppercase tracking-wider text-[#ec4899] font-bold mb-2">
                  <Layers className="w-4 h-4" />
                  <span>Autonomous 3-Round System</span>
                </div>
                <TextAnimate animation="blurIn" delay={0.5} as="p" className="text-base sm:text-lg text-slate-900 dark:text-zinc-100 leading-relaxed font-semibold">
                  &ldquo;One continuous interview. Multiple perspectives. Shared context between rounds.&rdquo;
                </TextAnimate>
                <div className="mt-4 pt-3.5 border-t border-zinc-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs sm:text-sm font-mono font-medium text-zinc-600 dark:text-zinc-300">
                  <span>Round 1: Technical (3m)</span>
                  <span>•</span>
                  <span>Round 2: Product (3m)</span>
                  <span>•</span>
                  <span>Round 3: Hiring Manager (2m)</span>
                </div>
              </div>

              {/* Single Primary Action: START INTERVIEW */}
              <div className="mt-8 flex flex-col sm:flex-row items-center gap-5 w-full max-w-xl">
                <InteractiveHoverButton
                  variant="primary"
                  onClick={() => setShowIntakeModal(true)}
                  disabled={isLoading}
                  className="w-full sm:w-auto min-w-[210px] py-3.5 text-sm font-bold shadow-lg"
                >
                  {isLoading ? 'Initializing...' : 'Start Interview'}
                </InteractiveHoverButton>

                <InteractiveHoverButton
                  variant="secondary"
                  onClick={() => setShowDemoModal(true)}
                  className="w-full sm:w-auto min-w-[200px] py-3.5 text-sm font-medium"
                >
                  How Panel AI Works
                </InteractiveHoverButton>
              </div>

              {/* Secondary text & AI Disclosure */}
              <div className="mt-5 space-y-1.5 text-xs text-zinc-400 font-mono">
                <div className="flex items-center gap-2 text-zinc-300">
                  <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
                  <span>Voice-first • Real-time • AI-powered</span>
                </div>
                <div className="text-[11px] text-zinc-500">
                  You are interacting with AI interviewers.
                </div>
              </div>

              {/* Feature Highlights Mini Row */}
              <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm text-zinc-600 dark:text-zinc-400 pt-6 border-t border-zinc-200 dark:border-white/[0.08] w-full max-w-xl">
                <div className="flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#ec4899] opacity-85"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-[#ec4899]"></span>
                  </span>
                  <span className="font-medium text-slate-900 dark:text-white">Continuous Shared Context</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 dark:text-zinc-600">•</span>
                  <span>Autonomous Coordinator</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-zinc-400 dark:text-zinc-600">•</span>
                  <span>Multi-Round Synthesis</span>
                </div>
              </div>
            </div>

            {/* Right Hero Animated Icon Cloud Visual - Aligned Up inline with headline */}
            <div className="lg:col-span-6 xl:col-span-5 relative flex items-start justify-center pt-2 lg:pt-4">
              <div className="relative w-full max-w-[480px] aspect-square flex items-center justify-center">
                <div className="relative z-10 w-full h-full flex items-center justify-center overflow-hidden">
                  <IconCloudDemo />
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* WIDE PANORAMIC HORIZONTAL CARD SECTION */}
        <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-24" id="architecture">
          {/* Section Header */}
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <div className="inline-flex items-center gap-2 text-[#ec4899] font-mono text-xs uppercase tracking-wider font-semibold">
                <Network className="w-4 h-4" />
                <span>Adaptive Intelligence Architecture</span>
              </div>
              <h2 className="mt-2 text-2xl sm:text-3xl lg:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                Connected Autonomous Modules
              </h2>
            </div>
            <div className="flex items-center gap-2.5 text-xs font-mono text-zinc-700 dark:text-zinc-300 bg-white dark:bg-zinc-950 border border-pink-500/25 px-4 py-2 rounded-full self-start md:self-auto shadow-sm dark:shadow-[0_0_15px_rgba(236,72,153,0.15)]">
              <span className="w-2 h-2 rounded-full bg-[#ec4899] animate-pulse"></span>
              <span>Mesh Protocol v4.2 • Synchronized</span>
            </div>
          </div>

          {/* LONG SINGLE HORIZONTAL PANORAMIC CARD */}
          <div className="relative rounded-2xl bg-white dark:bg-gradient-to-b dark:from-[#0a0a0f] dark:via-[#050508] dark:to-black border border-zinc-200 dark:border-white/[0.12] hover:border-[#ec4899]/40 shadow-xl dark:shadow-[0_20px_50px_rgba(0,0,0,0.85)] backdrop-blur-2xl transition-all duration-300 overflow-hidden">
            {/* Top Accent Gradient Line */}
            <div className="h-[2px] w-full bg-gradient-to-r from-transparent via-[#ec4899] to-transparent opacity-80"></div>

            {/* Integrated Header Strip inside Horizontal Card */}
            <div className="px-6 sm:px-8 py-4 bg-white/[0.02] border-b border-white/[0.07] flex flex-wrap items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="flex h-2.5 w-2.5 rounded-full bg-[#ec4899] shadow-[0_0_8px_#ec4899]"></span>
                <span className="font-mono text-xs uppercase tracking-wider text-pink-300 font-semibold">
                  Integrated Multi-Agent Pipeline Execution Array
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono text-zinc-400">
                <span className="hidden sm:inline">Consensus Matrix: ACTIVE</span>
                <span className="text-zinc-600 hidden sm:inline">•</span>
                <span className="text-[#ec4899]">All 3 Subsystems Operating in Parallel</span>
              </div>
            </div>

            {/* 3-Column Horizontal Architecture Layout */}
            <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-white/[0.08]" id="evaluation">
              {/* Module 1: Dynamic Context Memory */}
              <div className="group relative p-8 sm:p-10 flex flex-col justify-between hover:bg-white/[0.015] transition-colors duration-200">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-[#ec4899] group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.35)] transition-all duration-300">
                      <Cpu className="w-6 h-6 text-[#ec4899]" />
                    </div>
                    <span className="font-mono text-xs sm:text-sm font-bold px-3 py-1 rounded bg-white/[0.04] text-zinc-300 border border-white/[0.08]">
                      NODE 01
                    </span>
                  </div>
                  <span className="font-mono text-xs sm:text-sm text-[#ec4899] uppercase tracking-wider font-bold">
                    Cognitive Engine
                  </span>
                  <h3 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Dynamic Context Memory
                  </h3>
                  <TextAnimate animation="blurIn" delay={0.1} as="p" className="mt-3 text-base sm:text-lg text-slate-700 dark:text-zinc-200 leading-relaxed font-medium">
                    Vectorized episodic recall tracks candidate responses, technical trade-offs, and design patterns over infinite conversation horizons without manual prompt context resets.
                  </TextAnimate>
                </div>
                <div className="mt-8 pt-5 border-t border-zinc-200 dark:border-white/[0.08] flex items-center justify-between text-xs sm:text-sm font-mono">
                  <span className="text-zinc-600 dark:text-zinc-300 font-medium">Semantic Recall</span>
                  <span className="text-[#ec4899] font-bold bg-pink-500/10 px-2.5 py-1 rounded border border-pink-500/20">
                    99.8% precision
                  </span>
                </div>
              </div>

              {/* Module 2: Real-Time Voice & RTC */}
              <div className="group relative p-8 sm:p-10 flex flex-col justify-between hover:bg-zinc-50 dark:hover:bg-white/[0.015] transition-colors duration-200">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-[#ec4899] group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.35)] transition-all duration-300">
                      <Radio className="w-6 h-6 text-[#ec4899]" />
                    </div>
                    <span className="font-mono text-xs sm:text-sm font-bold px-3 py-1 rounded bg-zinc-100 dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/[0.08]">
                      NODE 02
                    </span>
                  </div>
                  <span className="font-mono text-xs sm:text-sm text-[#ec4899] uppercase tracking-wider font-bold">
                    Zero Latency Audio
                  </span>
                  <h3 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Real-Time Voice &amp; RTC
                  </h3>
                  <TextAnimate animation="blurIn" delay={0.2} as="p" className="mt-3 text-base sm:text-lg text-slate-700 dark:text-zinc-200 leading-relaxed font-medium">
                    Bypasses text transcoding queues using full duplex Agora RTC audio ingestion with sub-200ms roundtrip response generation and natural interruptibility.
                  </TextAnimate>
                </div>
                <div className="mt-8 pt-5 border-t border-zinc-200 dark:border-white/[0.08] flex items-center justify-between text-xs sm:text-sm font-mono">
                  <span className="text-zinc-600 dark:text-zinc-300 font-medium">Median Glass-to-Glass</span>
                  <span className="text-[#ec4899] font-bold bg-pink-500/10 px-2.5 py-1 rounded border border-pink-500/20">
                    182ms RTC
                  </span>
                </div>
              </div>

              {/* Module 3: Agent Orchestration */}
              <div className="group relative p-8 sm:p-10 flex flex-col justify-between hover:bg-zinc-50 dark:hover:bg-white/[0.015] transition-colors duration-200">
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div className="w-12 h-12 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-[#ec4899] group-hover:scale-105 group-hover:shadow-[0_0_20px_rgba(236,72,153,0.35)] transition-all duration-300">
                      <Network className="w-6 h-6 text-[#ec4899]" />
                    </div>
                    <span className="font-mono text-xs sm:text-sm font-bold px-3 py-1 rounded bg-zinc-100 dark:bg-white/[0.04] text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-white/[0.08]">
                      NODE 03
                    </span>
                  </div>
                  <span className="font-mono text-xs sm:text-sm text-[#ec4899] uppercase tracking-wider font-bold">
                    Multi-Agent Deliberation
                  </span>
                  <h3 className="mt-2 text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
                    Agent Orchestration
                  </h3>
                  <TextAnimate animation="blurIn" delay={0.3} as="p" className="mt-3 text-base sm:text-lg text-slate-700 dark:text-zinc-200 leading-relaxed font-medium">
                    Specialized sub-agents handle technical decomposition, code audits, verification tests, and synthesize consensus scorecards transparently in real time.
                  </TextAnimate>
                </div>
                <div className="mt-8 pt-5 border-t border-zinc-200 dark:border-white/[0.08] flex items-center justify-between text-xs sm:text-sm font-mono">
                  <span className="text-zinc-600 dark:text-zinc-300 font-medium">Active Consensus</span>
                  <span className="text-[#ec4899] font-bold bg-pink-500/10 px-2.5 py-1 rounded border border-pink-500/20">
                    4 Core Nodes
                  </span>
                </div>
              </div>
            </div>

            {/* Horizontal Card Footer Telemetry Bar */}
            <div className="px-6 sm:px-8 py-4 bg-zinc-50 dark:bg-black/60 border-t border-zinc-200 dark:border-white/[0.07] flex flex-wrap items-center justify-between gap-3 text-xs sm:text-sm font-mono text-zinc-700 dark:text-zinc-200" id="telemetry">
              <div className="flex items-center gap-4">
                <span className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
                  <span className="font-semibold">Cluster Node 08: Nominal</span>
                </span>
                <span className="text-zinc-400 dark:text-zinc-600">|</span>
                <span className="font-medium">RTC Jitter: 0.8ms</span>
              </div>
              <div className="flex items-center gap-3 text-zinc-800 dark:text-zinc-200">
                <span>Evaluator Session: <span className="text-slate-900 dark:text-white font-bold">Sahaj</span> (Senior Frontend)</span>
              </div>
            </div>
          </div>
        </section>

        {/* Panel AI Multi-Agent Animated Beam Flow Section */}
        <PanelAIFlow />

        {/* Capability Comparison Benchmark Table */}
        <CapabilityComparisonTable />

        {/* Teammates Section with Animated Avatar Group */}
        <TeammatesSection />

        {/* GitHub MagicCard Showcase Section */}
        <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-20 flex flex-col items-center justify-center text-center">
          <div className="mb-8">
            <span className="font-mono text-xs uppercase tracking-widest text-[#ec4899] font-semibold">
              Open Source Community &amp; Codebase
            </span>
            <h2 className="mt-2 text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              Project Repository &amp; File Structure
            </h2>
          </div>

          <div className="w-full flex justify-center">
            <MagicCardDemo />
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="relative z-10 border-t border-white/[0.08] bg-black/80 py-8 px-6 text-center text-xs text-zinc-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <span className="font-bold text-zinc-300">
              PANEL<span className="text-[#ec4899]">.AI</span>
            </span>
            <span>— Autonomous Panel Assessment Intelligence Platform</span>
          </div>
          <div>© 2025 PANEL.AI Inc. Sub-millisecond Neural Telemetry.</div>
        </div>
      </footer>

      {/* Video / Demo Interactive Modal */}
      {showDemoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
          <div className="relative w-full max-w-2xl rounded-2xl border border-white/10 bg-zinc-950 p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2 text-white font-bold text-lg">
                <Zap className="w-5 h-5 text-[#ec4899]" />
                Interactive Experience Demo
              </div>
              <button
                type="button"
                onClick={() => setShowDemoModal(false)}
                className="text-zinc-400 hover:text-white text-sm"
              >
                ✕ Close
              </button>
            </div>
            <p className="text-sm text-zinc-300 leading-relaxed mb-6">
              PANEL.AI conducts live conversational engineering interviews using sub-200ms real-time audio. Click &ldquo;Start New Interview&rdquo; to speak directly with Alex Chen (Technical Lead) or Sarah Lin (Product Strategy).
            </p>
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDemoModal(false);
                  setShowIntakeModal(true);
                }}
                className="px-5 py-2.5 rounded-full bg-[#ec4899] text-white text-sm font-semibold hover:bg-[#f43f5e] transition-all"
              >
                Launch Interview Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Candidate Intake & Briefing Modal */}
      <InterviewIntakeModal
        isOpen={showIntakeModal}
        isLoading={isLoading}
        initialTrack={selectedTrack}
        onClose={() => setShowIntakeModal(false)}
        onConfirm={(briefing) => {
          setShowIntakeModal(false);
          onSelectTrack(briefing.track);
          onStartConversation(briefing);
        }}
      />

      {/* Supabase Auth Modal */}
      <AuthModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onSuccess={(email) => {
          console.log('Successfully authenticated:', email);
        }}
      />
    </div>
  );
}
