'use client';

import React, { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { 
  Sparkles, 
  Clock, 
  FileText, 
  ArrowRight, 
  ArrowLeft,
  X,
  User,
  Briefcase,
  ChevronDown,
  CheckCircle2,
  Lock,
  Check,
  Shield,
  Layers
} from 'lucide-react';
import type { InterviewTrack } from '@/types/conversation';
import { demoCandidate } from '@/data/demo';
import { InteractiveHoverButton } from '@/registry/magicui/interactive-hover-button';
import { MorphingSpinner } from '@/components/ui/morphing-spinner';
import { Loader } from '@/components/ui/loader';
import { LightModePattern } from './LightModePattern';
import { DarkModePattern } from './DarkModePattern';
import { HexagonPattern } from '@/registry/magicui/hexagon-pattern';
import { GridPattern } from '@/registry/magicui/grid-pattern';
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler';
import { cn } from '@/lib/utils';

export interface CandidateBriefingData {
  candidateName: string;
  roleTitle: string;
  track: InterviewTrack;
  durationMinutes: number;
  contextNotes: string;
}

interface InterviewIntakeModalProps {
  isOpen: boolean;
  isLoading: boolean;
  initialTrack?: InterviewTrack;
  onClose: () => void;
  onConfirm: (data: CandidateBriefingData) => void;
}

const PRESET_ROLES = [
  'Senior Frontend Developer',
  'Full Stack Engineer',
  'Staff Systems Architect',
  'Product Engineer',
];

const DURATION_OPTIONS = [
  { minutes: 5, label: '5 Mins', tag: 'Fast Screen', description: 'Quick technical triage & screening' },
  { minutes: 15, label: '15 Mins', tag: 'Standard', description: 'Recommended 3-round panel assessment' },
  { minutes: 30, label: '30 Mins', tag: 'Deep Dive', description: 'Comprehensive system design & architecture' },
  { minutes: 45, label: '45 Mins', tag: 'Full Panel', description: 'In-depth multi-interviewer interview loop' },
];

export function InterviewIntakeModal({
  isOpen,
  isLoading,
  initialTrack = 'technical',
  onClose,
  onConfirm,
}: InterviewIntakeModalProps) {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  const [candidateName, setCandidateName] = useState<string>('');
  const [roleTitle, setRoleTitle] = useState('Senior Frontend Developer');
  const [track, setTrack] = useState<InterviewTrack>(initialTrack);
  const [durationMinutes, setDurationMinutes] = useState(15);
  const [contextNotes, setContextNotes] = useState<string>('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        const u = session?.user;
        if (u) {
          const name = u.user_metadata?.full_name || u.user_metadata?.name || u.email?.split('@')[0] || u.email || 'Candidate';
          setCandidateName(name);
        } else if (!candidateName || candidateName === demoCandidate.name) {
          setCandidateName('Candidate');
        }
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleFinalSubmit = () => {
    if (!candidateName.trim()) return;

    onConfirm({
      candidateName: candidateName.trim(),
      roleTitle: roleTitle.trim() || 'Software Engineer',
      track,
      durationMinutes,
      contextNotes: contextNotes.trim(),
    });
  };

  const stepsList = [
    { num: 1, title: 'Identity & Role' },
    { num: 2, title: 'Time Budget' },
    { num: 3, title: 'Context & Experience' },
    { num: 4, title: 'Confirm & Launch' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex flex-col min-h-screen w-full bg-slate-50 dark:bg-black text-slate-900 dark:text-white transition-colors duration-300 overflow-y-auto selection:bg-pink-500/30 selection:text-pink-600 dark:selection:text-pink-300 font-sans">
      {isLoading && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md">
          <Loader
            size="lg"
            title="Initializing AI Panel Mesh..."
            subtitle="Connecting Agora RTC audio channels and establishing round memory"
          />
        </div>
      )}
      {/* Background Patterns */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[950px] h-[550px] bg-gradient-to-b from-[#ec4899]/18 via-[#8b5cf6]/10 to-transparent blur-[140px] opacity-75"></div>
        {/* Light Mode: Linear Grid Pattern */}
        <div className="block dark:hidden">
          <LightModePattern />
        </div>
        <div className="hidden dark:block">
          <DarkModePattern />
        </div>
      </div>

      {/* Top Header */}
      <header className="relative z-10 w-full border-b border-zinc-200 dark:border-white/[0.07] bg-white/80 dark:bg-black/80 backdrop-blur-2xl px-6 sm:px-12 py-5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-pink-500/20 to-purple-600/30 border border-pink-500/40 flex items-center justify-center text-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
            <Layers className="w-5 h-5 text-pink-500" />
          </div>
          <div>
            <span className="text-lg font-extrabold text-slate-900 dark:text-white tracking-tight">
              PANEL<span className="text-[#ec4899]">.AI</span>
            </span>
            <span className="hidden sm:inline-block ml-3 px-2.5 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-mono font-medium text-pink-600 dark:text-pink-300">
              Interactive Setup Wizard
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <AnimatedThemeToggler variant="hexagon" />
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-2.5 rounded-full bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white hover:border-pink-500/50 shadow-sm transition-all"
            aria-label="Exit wizard"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Progress Indicator Bar */}
      <div className="relative z-10 w-full max-w-4xl mx-auto px-6 pt-8 pb-4">
        <div className="flex items-center justify-between mb-4">
          {stepsList.map((s) => {
            const isActive = step === s.num;
            const isCompleted = step > s.num;
            return (
              <div
                key={s.num}
                onClick={() => {
                  if (isCompleted) setStep(s.num as any);
                }}
                className={`flex items-center gap-2 cursor-pointer transition-all ${
                  isActive
                    ? 'text-[#ec4899] font-bold'
                    : isCompleted
                    ? 'text-emerald-500 dark:text-emerald-400 font-semibold'
                    : 'text-zinc-400 dark:text-zinc-600'
                }`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono transition-all ${
                    isActive
                      ? 'bg-[#ec4899] text-white shadow-[0_0_20px_rgba(236,72,153,0.5)]'
                      : isCompleted
                      ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-500'
                      : 'bg-zinc-200 dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-800 text-zinc-500'
                  }`}
                >
                  {isCompleted ? <Check className="w-4 h-4" /> : s.num}
                </div>
                <span className="hidden md:inline text-xs font-mono uppercase tracking-wider">
                  {s.title}
                </span>
              </div>
            );
          })}
        </div>

        {/* Dynamic Progress Line */}
        <div className="w-full h-1.5 rounded-full bg-zinc-200 dark:bg-zinc-900 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-[#ec4899] via-pink-500 to-purple-600 transition-all duration-500"
            style={{ width: `${(step / 4) * 100}%` }}
          />
        </div>
      </div>

      {/* Main Wizard Step Content */}
      <main className="relative z-10 flex-1 flex flex-col items-center justify-center p-6 max-w-4xl mx-auto w-full">
        {/* STEP 1: CANDIDATE IDENTITY & TARGET ROLE */}
        {step === 1 && (
          <div className="w-full rounded-3xl bg-white/90 dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 shadow-xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-[#ec4899]">
                <User className="w-5 h-5 text-[#ec4899]" />
              </div>
              <div>
                <span className="font-mono text-xs text-[#ec4899] uppercase tracking-wider font-semibold">
                  Step 1 of 4
                </span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Candidate Identity &amp; Target Role
                </h2>
              </div>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8">
              Enter the candidate's full name and target position. AI panelists customize questions based on this role profile.
            </p>

            <div className="space-y-6">
              {/* Candidate Full Name */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-900 dark:text-zinc-300 uppercase tracking-wide">
                  Candidate Full Name <span className="text-[#ec4899]">*</span>
                </label>
                <div className="relative flex items-center">
                  <User className="absolute left-4 h-5 w-5 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    value={candidateName}
                    onChange={(e) => setCandidateName(e.target.value)}
                    placeholder="e.g. Abhishek Singh"
                    required
                    className="w-full h-14 pl-12 pr-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-zinc-400 text-base font-medium focus:outline-none focus:border-[#ec4899] focus:ring-1 focus:ring-[#ec4899] transition-all"
                  />
                </div>
              </div>

              {/* Target Role Dropdown & Input */}
              <div className="space-y-2 relative">
                <label className="block text-xs font-semibold text-slate-900 dark:text-zinc-300 uppercase tracking-wide">
                  Target Position / Role
                </label>
                <div className="relative flex items-center">
                  <Briefcase className="absolute left-4 h-5 w-5 text-zinc-400 pointer-events-none" />
                  <input
                    type="text"
                    value={roleTitle}
                    onChange={(e) => setRoleTitle(e.target.value)}
                    onFocus={() => setIsDropdownOpen(true)}
                    onBlur={() => setTimeout(() => setIsDropdownOpen(false), 200)}
                    placeholder="e.g. Senior Frontend Developer"
                    className="w-full h-14 pl-12 pr-12 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-800 text-slate-900 dark:text-white placeholder-zinc-400 text-base font-medium focus:outline-none focus:border-[#ec4899] focus:ring-1 focus:ring-[#ec4899] transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="absolute right-4 text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 transition-colors"
                  >
                    <ChevronDown className="h-5 w-5" />
                  </button>
                </div>

                {/* Dropdown Options */}
                {isDropdownOpen && (
                  <div className="absolute z-30 top-full left-0 right-0 mt-2 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-2xl py-2 overflow-hidden">
                    {PRESET_ROLES.map((role) => (
                      <button
                        key={role}
                        type="button"
                        onMouseDown={() => {
                          setRoleTitle(role);
                          setIsDropdownOpen(false);
                        }}
                        className="w-full px-5 py-3 text-left text-sm font-medium text-slate-800 dark:text-zinc-200 hover:bg-pink-500/10 hover:text-[#ec4899] transition-colors flex items-center justify-between"
                      >
                        <span>{role}</span>
                        {roleTitle === role && <Check className="h-4 w-4 text-[#ec4899]" />}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              {/* Quick Presets */}
              <div className="pt-2">
                <span className="block text-xs font-mono uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-3">
                  Select Quick Role Presets:
                </span>
                <div className="flex flex-wrap gap-2.5">
                  {PRESET_ROLES.map((role) => {
                    const isSelected = roleTitle === role;
                    return (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setRoleTitle(role)}
                        className={`text-xs px-4 py-2.5 rounded-xl border font-medium transition-all ${
                          isSelected
                            ? 'border-[#ec4899] bg-[#ec4899]/15 text-[#ec4899] shadow-sm'
                            : 'border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 text-zinc-700 dark:text-zinc-300 hover:border-pink-500/40'
                        }`}
                      >
                        {role}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={onClose}
                className="px-6 py-3 rounded-full text-xs font-mono text-zinc-500 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                Cancel
              </button>

              <InteractiveHoverButton
                variant="primary"
                onClick={() => {
                  if (candidateName.trim()) setStep(2);
                }}
                disabled={!candidateName.trim()}
                className="min-w-[200px]"
              >
                Next: Time Budget
              </InteractiveHoverButton>
            </div>
          </div>
        )}

        {/* STEP 2: INTERVIEW TIME BUDGET */}
        {step === 2 && (
          <div className="w-full rounded-3xl bg-white/90 dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 shadow-xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-[#ec4899]">
                <Clock className="w-5 h-5 text-[#ec4899]" />
              </div>
              <div>
                <span className="font-mono text-xs text-[#ec4899] uppercase tracking-wider font-semibold">
                  Step 2 of 4
                </span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Interview Time Budget
                </h2>
              </div>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-8">
              Select the interview pace and total time limit. Active limit: <strong className="text-[#ec4899]">{durationMinutes} minutes</strong>.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {DURATION_OPTIONS.map((opt) => {
                const isSelected = durationMinutes === opt.minutes;
                return (
                  <div
                    key={opt.minutes}
                    onClick={() => setDurationMinutes(opt.minutes)}
                    className={cn(
                      "cursor-pointer p-6 rounded-2xl border transition-all duration-300 flex flex-col justify-between relative overflow-hidden",
                      isSelected
                        ? "border-[#ec4899] bg-[#ec4899]/10 shadow-[0_0_30px_rgba(236,72,153,0.2)]"
                        : "border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900/60 hover:border-pink-500/40"
                    )}
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-xl font-extrabold text-slate-900 dark:text-white">
                        {opt.label}
                      </span>
                      <span className="text-xs font-mono font-semibold px-3 py-1 rounded-full bg-[#ec4899]/20 text-[#ec4899]">
                        {opt.tag}
                      </span>
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {opt.description}
                    </p>
                    {isSelected && (
                      <div className="absolute top-3 right-3 text-[#ec4899]">
                        <CheckCircle2 className="w-5 h-5" />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>

            {/* Navigation Buttons */}
            <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <InteractiveHoverButton
                variant="primary"
                onClick={() => setStep(3)}
                className="min-w-[200px]"
              >
                Next: Experience &amp; Context
              </InteractiveHoverButton>
            </div>
          </div>
        )}

        {/* STEP 3: CANDIDATE EXPERIENCE & CONTEXT */}
        {step === 3 && (
          <div className="w-full rounded-3xl bg-white/90 dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 shadow-xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-[#ec4899]">
                <FileText className="w-5 h-5 text-[#ec4899]" />
              </div>
              <div>
                <span className="font-mono text-xs text-[#ec4899] uppercase tracking-wider font-semibold">
                  Step 3 of 4
                </span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Experience &amp; Candidate Context
                </h2>
              </div>
            </div>

            <p className="text-sm text-zinc-600 dark:text-zinc-400 mb-6">
              Provide background notes, resume summary, or engineering focus areas for the AI interview panelists.
            </p>

            <div className="space-y-4">
              <textarea
                rows={5}
                value={contextNotes}
                onChange={(e) => setContextNotes(e.target.value)}
                placeholder="Detail candidate background, previous projects, stack familiarity, or specific focus areas..."
                className="w-full p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/90 border border-zinc-300 dark:border-zinc-800 text-slate-900 dark:text-zinc-200 placeholder-zinc-400 text-sm leading-relaxed focus:outline-none focus:border-[#ec4899] focus:ring-1 focus:ring-[#ec4899] transition-all resize-none font-sans"
              />

              {/* Memory Status Banner */}
              <div className="flex items-center justify-between gap-3 px-5 py-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-xs text-emerald-700 dark:text-emerald-300">
                <div className="flex items-center gap-3">
                  <span className="relative flex h-2.5 w-2.5">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-400"></span>
                  </span>
                  <span>
                    <strong className="font-semibold text-emerald-800 dark:text-white">Local Memory Database:</strong> Cross-round candidate quotes &amp; metrics synchronized automatically.
                  </span>
                </div>
                <span className="shrink-0 rounded-md bg-emerald-500/20 px-2.5 py-1 text-xs font-mono font-bold text-emerald-600 dark:text-emerald-300">
                  Active
                </span>
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="mt-10 pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <InteractiveHoverButton
                variant="primary"
                onClick={() => setStep(4)}
                className="min-w-[200px]"
              >
                Next: Review &amp; Launch
              </InteractiveHoverButton>
            </div>
          </div>
        )}

        {/* STEP 4: REVIEW & CONFIRM LAUNCH */}
        {step === 4 && (
          <div className="w-full rounded-3xl bg-white/90 dark:bg-zinc-950/90 border border-zinc-200 dark:border-zinc-800 p-8 sm:p-10 shadow-xl backdrop-blur-2xl animate-in fade-in zoom-in-95 duration-300">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-[#ec4899]">
                <Sparkles className="w-5 h-5 text-[#ec4899]" />
              </div>
              <div>
                <span className="font-mono text-xs text-[#ec4899] uppercase tracking-wider font-semibold">
                  Step 4 of 4
                </span>
                <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                  Confirm &amp; Launch Interview
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {/* Summary Card 1 */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Candidate &amp; Role</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">{candidateName}</h4>
                <p className="text-xs text-[#ec4899] font-medium mt-0.5">{roleTitle}</p>
              </div>

              {/* Summary Card 2 */}
              <div className="p-5 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800">
                <span className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Time Limit</span>
                <h4 className="text-base font-bold text-slate-900 dark:text-white mt-1">{durationMinutes} Minutes</h4>
                <p className="text-xs text-emerald-500 font-medium mt-0.5">3-Round Autonomous Panel</p>
              </div>
            </div>

            {/* What happens next checklist */}
            <div className="p-5 rounded-2xl bg-pink-500/5 dark:bg-pink-500/10 border border-pink-500/20 mb-8">
              <h4 className="text-xs font-semibold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                What happens next?
              </h4>
              <ul className="space-y-2 text-xs text-zinc-600 dark:text-zinc-300">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#ec4899] shrink-0" />
                  <span>AI agents use candidate experience for tailored questions.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#ec4899] shrink-0" />
                  <span>Candidate responses are stored and synchronized across rounds.</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-[#ec4899] shrink-0" />
                  <span>The interview can be paused or extended anytime.</span>
                </li>
              </ul>
            </div>

            {/* Navigation Buttons */}
            <div className="pt-6 border-t border-zinc-200 dark:border-zinc-800 flex items-center justify-between">
              <button
                type="button"
                onClick={() => setStep(3)}
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-xs font-mono text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Back</span>
              </button>

              <InteractiveHoverButton
                variant="primary"
                onClick={handleFinalSubmit}
                disabled={isLoading}
                className="min-w-[240px] py-4 text-sm font-bold shadow-xl"
              >
                {isLoading ? 'Connecting AI Mesh...' : 'Confirm & Launch Interview'}
              </InteractiveHoverButton>
            </div>
          </div>
        )}
      </main>

      {/* Footer Disclaimer */}
      <footer className="relative z-10 py-4 px-6 text-center text-xs font-mono text-zinc-400 dark:text-zinc-500 flex items-center justify-center gap-2">
        <Lock className="w-3.5 h-3.5" />
        <span>Your data is secure &amp; private. Powered by Agora Conversational AI.</span>
      </footer>
    </div>
  );
}
