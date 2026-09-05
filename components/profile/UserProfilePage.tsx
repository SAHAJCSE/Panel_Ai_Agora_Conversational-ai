'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { 
  Trophy, 
  Flame, 
  Target, 
  Zap, 
  Rocket, 
  Lock, 
  Award, 
  Calendar, 
  CheckCircle2, 
  TrendingUp, 
  Layers, 
  ArrowLeft, 
  Play, 
  ChevronRight, 
  Sparkles, 
  User as UserIcon,
  Clock,
  BarChart3,
  BookOpen,
  Brain,
  MessageSquare,
  ShieldCheck,
  Star
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { LightModePattern } from '@/components/landing/LightModePattern';
import { DarkModePattern } from '@/components/landing/DarkModePattern';
import { AnimatedThemeToggler } from '@/registry/magicui/animated-theme-toggler';
import { InteractiveHoverButton } from '@/registry/magicui/interactive-hover-button';
import { cn } from '@/lib/utils';
import { InterviewIntakeModal, type CandidateBriefingData } from '@/components/landing/InterviewIntakeModal';
import { AvatarPickerModal } from './AvatarPickerModal';
import { getSavedAvatar, saveSelectedAvatar, AVATAR_OPTIONS } from '@/lib/avatars';
import { 
  getRecordedSessions, 
  computeRealProfileStats, 
  type RecordedInterviewRound 
} from '@/lib/interview/profile-db-service';

// --- DATA TYPES ---
export interface UserProfileData {
  name: string;
  email: string;
  avatar: string;
  role: string;
  joinedAt: string;
  interviewsCompleted: number;
  practiceDays: number;
  currentStreak: number;
  longestStreak: number;
  averageScore: number;
  totalInterviewsHeatmap: number;
  activeDaysHeatmap: number;
  categoryStats: {
    technical: number;
    product: number;
    hiring_manager: number;
  };
  badges: Array<{
    id: string;
    icon: string;
    title: string;
    description: string;
    unlocked: boolean;
    unlockedAt?: string;
  }>;
  nextBadgeProgress: {
    title: string;
    current: number;
    total: number;
  };
  recentInterviews: Array<{
    id: string;
    role: string;
    tags: string[];
    score: number;
    timestamp: string;
  }>;
  skillScores: Array<{
    name: string;
    percentage: number;
  }>;
  dailyInterviewActivity: Record<string, number>; // YYYY-MM-DD -> count
}

// --- DEFAULT / DEMO PROFILE DATA ---
// --- DEFAULT / ZERO PROFILE DATA ---
const DEFAULT_PROFILE: UserProfileData = {
  name: 'Candidate',
  email: '',
  avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
  role: 'Software Engineer',
  joinedAt: 'September 2026',
  interviewsCompleted: 0,
  practiceDays: 0,
  currentStreak: 0,
  longestStreak: 0,
  averageScore: 0,
  totalInterviewsHeatmap: 0,
  activeDaysHeatmap: 0,
  categoryStats: {
    technical: 0,
    product: 0,
    hiring_manager: 0,
  },
  badges: [
    {
      id: 'first_interview',
      icon: '🏆',
      title: 'First Interview',
      description: 'Completed your first AI interview',
      unlocked: false,
    },
    {
      id: 'streak_7',
      icon: '🔥',
      title: '7 Day Streak',
      description: 'Practiced for 7 consecutive days',
      unlocked: false,
    },
    {
      id: 'interviews_10',
      icon: '🎯',
      title: '10 Interviews',
      description: 'Completed 10 interviews',
      unlocked: false,
    },
    {
      id: 'consistent_candidate',
      icon: '⚡',
      title: 'Consistent Candidate',
      description: 'Practiced 20+ days',
      unlocked: false,
    },
    {
      id: 'panel_pro',
      icon: '🚀',
      title: 'Panel Pro',
      description: 'Completed interviews across all panel types',
      unlocked: false,
    },
    {
      id: 'deep_diver',
      icon: '💎',
      title: 'Deep Diver',
      description: 'Completed a 45-min full panel session',
      unlocked: false,
    },
  ],
  nextBadgeProgress: {
    title: 'First Interview',
    current: 0,
    total: 1,
  },
  recentInterviews: [],
  skillScores: [
    { name: 'Technical', percentage: 0 },
    { name: 'Problem Solving', percentage: 0 },
    { name: 'Communication', percentage: 0 },
    { name: 'Product Thinking', percentage: 0 },
    { name: 'Leadership', percentage: 0 },
  ],
  dailyInterviewActivity: {},
};

export interface UserProfilePageProps {
  onStartInterview?: () => void;
}

export function UserProfilePage({ onStartInterview }: UserProfilePageProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showIntakeModal, setShowIntakeModal] = useState(false);
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);
  const [customAvatarUrl, setCustomAvatarUrl] = useState<string>('');
  const [selectedActivity, setSelectedActivity] = useState<{ date: string; count: number } | null>(null);

  useEffect(() => {
    setCustomAvatarUrl(getSavedAvatar());
  }, []);

  const [realSessions, setRealSessions] = useState<RecordedInterviewRound[]>([]);

  useEffect(() => {
    // Fetch real interview sessions from database (Supabase + local DB)
    getRecordedSessions(user?.email || undefined).then((sessions) => {
      setRealSessions(sessions);
    });
  }, [user]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  // Compute profile data using real database sessions and authenticated Google credentials
  const profile = useMemo<UserProfileData>(() => {
    const selected3DAvatar = customAvatarUrl || getSavedAvatar() || AVATAR_OPTIONS[0].url;
    const candidateName = user?.user_metadata?.full_name || user?.user_metadata?.name || user?.email?.split('@')[0] || 'Candidate';
    const email = user?.email || '';

    let memberSince = 'September 2026';
    if (user?.created_at) {
      const d = new Date(user.created_at);
      memberSince = `${d.toLocaleString('default', { month: 'long' })} ${d.getFullYear()}`;
    }

    const userInfo = {
      name: candidateName,
      email: email,
      avatar: selected3DAvatar,
      joinedAt: memberSince,
      role: user?.user_metadata?.role || 'Software Engineer',
    };

    return computeRealProfileStats(realSessions, userInfo);
  }, [user, realSessions, customAvatarUrl]);

  // Generate 52-week calendar grid for heatmap
  const heatmapGrid = useMemo(() => {
    const weeks: Array<Array<{ dateStr: string; count: number; dayOfWeek: number }>> = [];
    const today = new Date();
    
    // Find previous Sunday or Monday to start calendar
    const totalDays = 52 * 7;
    const startDate = new Date(today);
    startDate.setDate(startDate.getDate() - (totalDays - 1));

    let currentWeek: Array<{ dateStr: string; count: number; dayOfWeek: number }> = [];

    for (let i = 0; i < totalDays; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const dateStr = d.toISOString().split('T')[0];
      const count = profile.dailyInterviewActivity[dateStr] || 0;
      const dayOfWeek = d.getDay(); // 0 = Sun, 1 = Mon ...

      currentWeek.push({ dateStr, count, dayOfWeek });

      if (currentWeek.length === 7) {
        weeks.push(currentWeek);
        currentWeek = [];
      }
    }

    return weeks;
  }, [profile]);

  const monthLabels = ['Sep', 'Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug'];

  const handleStartInterviewAction = () => {
    if (onStartInterview) {
      onStartInterview();
    } else {
      setShowIntakeModal(true);
    }
  };

  return (
    <div className="relative min-h-screen w-full bg-slate-50 dark:bg-[#08080a] text-slate-900 dark:text-white transition-colors duration-300 selection:bg-pink-500/30 selection:text-pink-600 dark:selection:text-pink-300 font-sans pb-20 overflow-x-hidden">
      {/* Background Ambient Glows & Grid Patterns */}
      <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden">
        <div className="absolute -top-48 left-1/2 -translate-x-1/2 w-[950px] h-[550px] bg-gradient-to-b from-[#ec4899]/18 via-[#8b5cf6]/10 to-transparent blur-[140px] opacity-75"></div>
        <div className="absolute top-[40%] -right-48 w-[600px] h-[600px] bg-[#ec4899]/10 blur-[150px] rounded-full"></div>
        <div className="absolute bottom-10 -left-36 w-[550px] h-[550px] bg-[#7c3aed]/12 blur-[140px] rounded-full"></div>
        
        {/* Light Mode Pattern */}
        <div className="block dark:hidden">
          <LightModePattern />
        </div>
        {/* Dark Mode Pattern */}
        <div className="hidden dark:block">
          <DarkModePattern />
        </div>
      </div>

      {/* Top Header / Navigation */}
      <header className="sticky top-0 z-40 w-full border-b border-zinc-200 dark:border-white/[0.07] bg-white/80 dark:bg-[#08080a]/80 backdrop-blur-2xl transition-all duration-300">
        <div className="max-w-7xl mx-auto h-20 px-6 sm:px-8 lg:px-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              href="/"
              className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-600 dark:text-zinc-300 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Return to Home"
            >
              <ArrowLeft className="w-5 h-5" />
            </Link>
            <Link className="flex items-center gap-3 group cursor-pointer" href="/">
              <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-pink-500/20 to-purple-600/30 border border-pink-500/40 flex items-center justify-center text-pink-500 shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                <Layers className="w-5 h-5 text-pink-500" />
              </div>
              <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                PANEL<span className="text-[#ec4899]">.AI</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <AnimatedThemeToggler variant="hexagon" />
            
            <button
              type="button"
              onClick={handleStartInterviewAction}
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-semibold text-sm shadow-[0_0_25px_rgba(236,72,153,0.4)] hover:shadow-[0_0_35px_rgba(236,72,153,0.6)] transition-all active:scale-[0.98]"
            >
              <Play className="w-4 h-4 fill-white" />
              <span>Start New Interview</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Profile Shell */}
      <main className="relative z-10 max-w-7xl mx-auto px-4 sm:px-8 lg:px-12 pt-8 sm:pt-10 space-y-8">
        
        {/* HERO INTRO SECTION */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-2 border-b border-zinc-200 dark:border-white/[0.08]">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-pink-500/10 border border-pink-500/20 text-xs font-mono font-medium text-pink-600 dark:text-pink-300 mb-2">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Candidate Analytics & Insights</span>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Your Interview Journey
            </h1>
            <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-400 mt-1">
              Track your practice, performance, and progress over time.
            </p>
          </div>

          {/* Primary Action Button */}
          <div>
            <InteractiveHoverButton 
              onClick={handleStartInterviewAction}
              variant="primary"
              className="w-full sm:w-auto px-6 py-3"
            >
              Start New Interview
            </InteractiveHoverButton>
          </div>
        </div>

        {/* 3-COLUMN DESKTOP LAYOUT (20% / 55% / 25%) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* ================================================== */}
          {/* LEFT PROFILE COLUMN (~20% / 3 cols in 12-col grid) */}
          {/* ================================================== */}
          <div className="lg:col-span-3 space-y-6">
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-zinc-900/70 border border-zinc-200 dark:border-white/10 shadow-lg backdrop-blur-xl transition-all space-y-6">
              
              {/* Profile Avatar & Identity */}
              <div className="text-center flex flex-col items-center space-y-3">
                <div 
                  onClick={() => setShowAvatarPicker(true)}
                  className="relative group cursor-pointer"
                  title="Click to change your 3D avatar"
                >
                  <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 opacity-75 blur-sm group-hover:opacity-100 transition-opacity"></div>
                  {profile.avatar ? (
                    <img
                      src={profile.avatar}
                      alt={profile.name}
                      className="relative w-24 h-24 rounded-full object-cover border-2 border-white dark:border-zinc-900 shadow-md group-hover:scale-105 transition-transform"
                    />
                  ) : null}
                  <span className="absolute bottom-0 right-0 p-1.5 rounded-full bg-[#ec4899] text-white border-2 border-white dark:border-zinc-900 shadow-md group-hover:scale-110 transition-transform">
                    <Sparkles className="w-3.5 h-3.5" />
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setShowAvatarPicker(true)}
                  className="px-3 py-1 rounded-full bg-pink-500/10 hover:bg-pink-500/20 border border-pink-500/30 text-[11px] font-mono font-bold text-pink-600 dark:text-pink-300 transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Choose 3D Avatar</span>
                </button>

                <div className="space-y-1">
                  <h2 className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">
                    {profile.name}
                  </h2>
                  <p className="text-xs font-semibold text-pink-600 dark:text-pink-400 bg-pink-500/10 dark:bg-pink-500/15 px-3 py-0.5 rounded-full inline-block">
                    {profile.role}
                  </p>
                  {profile.email && (
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 truncate max-w-[200px] pt-0.5">
                      {profile.email}
                    </p>
                  )}
                </div>

                <div className="pt-2 flex items-center gap-1.5 text-xs text-zinc-500 dark:text-zinc-400 border-t border-zinc-100 dark:border-white/5 w-full justify-center">
                  <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                  <span>Member since: <strong className="text-slate-800 dark:text-zinc-200">{profile.joinedAt}</strong></span>
                </div>
              </div>

              {/* Quick Stat Summary Pills */}
              <div className="space-y-3 pt-2 border-t border-zinc-200 dark:border-white/10">
                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-white/5">
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    <CheckCircle2 className="w-4 h-4 text-pink-500" />
                    <span>Completed</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    {profile.interviewsCompleted}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-white/5">
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    <Calendar className="w-4 h-4 text-purple-400" />
                    <span>Practice Days</span>
                  </div>
                  <span className="text-sm font-bold text-slate-900 dark:text-white font-mono">
                    {profile.practiceDays}
                  </span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200/80 dark:border-white/5">
                  <div className="flex items-center gap-2 text-xs font-medium text-zinc-600 dark:text-zinc-300">
                    <Flame className="w-4 h-4 text-amber-500 animate-pulse" />
                    <span>Current Streak</span>
                  </div>
                  <span className="text-sm font-bold text-amber-500 font-mono">
                    {profile.currentStreak} days
                  </span>
                </div>
              </div>

            </div>
          </div>


          {/* ================================================== */}
          {/* CENTER COLUMN (~55% / 6 cols in 12-col grid)       */}
          {/* ================================================== */}
          <div className="lg:col-span-6 space-y-6">

            {/* MAIN PERFORMANCE CARD */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white/80 dark:bg-zinc-900/70 border border-zinc-200 dark:border-white/10 shadow-lg backdrop-blur-xl space-y-6">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-pink-500" />
                    Interview Performance
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Overall session volume and interview track breakdown
                  </p>
                </div>
                <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-600 dark:text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                  <TrendingUp className="w-3.5 h-3.5" />
                  <span>{profile.interviewsCompleted > 0 ? 'Top Candidate' : 'Real-time Tracking'}</span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
                
                {/* Left Metric: Total Completed */}
                <div className="space-y-4">
                  <div className="p-5 rounded-2xl bg-gradient-to-br from-pink-500/10 via-purple-500/5 to-transparent border border-pink-500/20">
                    <span className="text-xs font-semibold font-mono uppercase tracking-wider text-pink-600 dark:text-pink-400">
                      Total Practice Sessions
                    </span>
                    <div className="text-4xl sm:text-5xl font-black text-slate-900 dark:text-white font-mono mt-1">
                      {profile.interviewsCompleted}
                    </div>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1">
                      Interviews Completed Across Panel
                    </p>
                  </div>

                  {/* Secondary Category Stats Breakdown */}
                  <div className="grid grid-cols-3 gap-2">
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-white/5 text-center">
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">Technical</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                        {profile.categoryStats.technical}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-white/5 text-center">
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">Product</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                        {profile.categoryStats.product}
                      </div>
                    </div>
                    <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-white/5 text-center">
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">Hiring Mgr</div>
                      <div className="text-base font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                        {profile.categoryStats.hiring_manager}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Right Metric: Clean Radial Score Gauge */}
                <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-800/30 border border-zinc-200 dark:border-white/5 space-y-2 text-center">
                  <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                    Average Score
                  </span>
                  
                  {/* Radial Score Gauge */}
                  <div className="relative w-36 h-36 flex items-center justify-center">
                    <svg className="w-full h-full -rotate-90" viewBox="0 0 100 100">
                      {/* Outer track */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-zinc-200 dark:stroke-zinc-800"
                        strokeWidth="8"
                        fill="none"
                      />
                      {/* Animated score arc */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        className="stroke-pink-500 transition-all duration-1000 ease-out"
                        strokeWidth="8"
                        strokeDasharray={251.2}
                        strokeDashoffset={251.2 - (251.2 * ((profile.interviewsCompleted > 0 ? profile.averageScore : 0) / 10))}
                        strokeLinecap="round"
                        fill="none"
                      />
                    </svg>
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                      <span className="text-3xl font-extrabold text-slate-900 dark:text-white font-mono">
                        {profile.interviewsCompleted > 0 ? profile.averageScore : '--'}
                      </span>
                      <span className="text-[10px] font-mono text-zinc-500 dark:text-zinc-400 uppercase tracking-widest">
                        Out of 10
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-emerald-600 dark:text-emerald-400 font-medium">
                    {profile.interviewsCompleted > 0 ? '+0.4 increase this week' : 'Recorded from completed sessions'}
                  </p>
                </div>

              </div>
            </div>

            {/* CONTRIBUTION / INTERVIEW PRACTICE HEATMAP */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white/80 dark:bg-zinc-900/70 border border-zinc-200 dark:border-white/10 shadow-lg backdrop-blur-xl space-y-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-zinc-100 dark:border-white/5 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Calendar className="w-5 h-5 text-purple-400" />
                    Interview Practice
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Your daily interview activity across the past year
                  </p>
                </div>

                {/* Heatmap Legend */}
                <div className="flex items-center gap-2 text-xs text-zinc-500 dark:text-zinc-400">
                  <span>Less</span>
                  <div className="flex gap-1">
                    <span className="w-3 h-3 rounded-sm bg-zinc-200/80 dark:bg-zinc-800/80 border border-zinc-300/40 dark:border-white/5"></span>
                    <span className="w-3 h-3 rounded-sm bg-pink-500/35 border border-pink-500/40"></span>
                    <span className="w-3 h-3 rounded-sm bg-purple-500/60 border border-purple-400/60"></span>
                    <span className="w-3 h-3 rounded-sm bg-[#ec4899] shadow-[0_0_8px_rgba(236,72,153,0.5)]"></span>
                  </div>
                  <span>More</span>
                </div>
              </div>

              {/* Top Heatmap Stats Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-white/5">
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase font-mono">Total Interviews</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    {profile.totalInterviewsHeatmap}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-white/5">
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase font-mono">Active Days</span>
                  <div className="text-xl font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                    {profile.activeDaysHeatmap}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-white/5">
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase font-mono">Current Streak</span>
                  <div className="text-xl font-bold text-amber-500 font-mono mt-0.5 flex items-center gap-1">
                    <Flame className="w-4 h-4 fill-amber-500" />
                    {profile.currentStreak}
                  </div>
                </div>
                <div className="p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 border border-zinc-200 dark:border-white/5">
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400 uppercase font-mono">Longest Streak</span>
                  <div className="text-xl font-bold text-purple-400 font-mono mt-0.5">
                    {profile.longestStreak}
                  </div>
                </div>
              </div>

              {/* Heatmap Grid Calendar */}
              <div className="overflow-x-auto pb-2 pt-1 scrollbar-thin">
                <div className="min-w-[680px] space-y-2">
                  {/* Month Headers */}
                  <div className="grid grid-cols-12 text-[11px] font-mono text-zinc-400 px-1">
                    {monthLabels.map((m, idx) => (
                      <span key={idx} className="text-center">{m}</span>
                    ))}
                  </div>

                  {/* 52-Week Square Grid */}
                  <div className="flex gap-[3px]">
                    {heatmapGrid.map((week, wIdx) => (
                      <div key={wIdx} className="flex flex-col gap-[3px]">
                        {week.map((cell, cIdx) => {
                          let colorClass = "bg-zinc-200/50 dark:bg-zinc-800/40 border border-zinc-300/30 dark:border-white/5 hover:border-pink-400";
                          if (cell.count === 1) {
                            colorClass = "bg-pink-500/35 border border-pink-500/50 text-pink-300 hover:scale-125 transition-transform";
                          } else if (cell.count === 2) {
                            colorClass = "bg-purple-500/70 border border-purple-400/80 text-white hover:scale-125 transition-transform";
                          } else if (cell.count >= 3) {
                            colorClass = "bg-[#ec4899] border border-pink-300 shadow-[0_0_10px_rgba(236,72,153,0.6)] hover:scale-125 transition-transform";
                          }

                          return (
                            <div
                              key={cIdx}
                              onClick={() => setSelectedActivity({ date: cell.dateStr, count: cell.count })}
                              className={cn(
                                "w-3 h-3 rounded-[3px] cursor-pointer transition-all duration-200",
                                colorClass
                              )}
                              title={`${cell.dateStr}: ${cell.count} interview${cell.count === 1 ? '' : 's'} given`}
                            />
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Selected Cell Activity Banner */}
              {selectedActivity && (
                <div className="p-3 rounded-xl bg-pink-500/10 border border-pink-500/20 text-xs text-pink-600 dark:text-pink-300 flex items-center justify-between">
                  <span>📅 <strong>{selectedActivity.date}</strong>: {selectedActivity.count} interview practice sessions completed.</span>
                  <button 
                    onClick={() => setSelectedActivity(null)}
                    className="text-zinc-400 hover:text-white font-bold text-sm"
                  >
                    ×
                  </button>
                </div>
              )}
            </div>

            {/* RECENT INTERVIEW ACTIVITY */}
            <div className="p-6 sm:p-7 rounded-2xl bg-white/80 dark:bg-zinc-900/70 border border-zinc-200 dark:border-white/10 shadow-lg backdrop-blur-xl space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Clock className="w-5 h-5 text-pink-500" />
                    Recent Interviews
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    Click any session to view complete evidence & scorecard trace
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {profile.recentInterviews.length > 0 ? (
                  profile.recentInterviews.map((item) => (
                    <div
                      key={item.id}
                      className="group p-4 rounded-xl bg-zinc-50 dark:bg-zinc-800/40 hover:bg-pink-500/5 dark:hover:bg-zinc-800/80 border border-zinc-200 dark:border-white/5 hover:border-pink-500/30 transition-all cursor-pointer flex items-center justify-between gap-4"
                    >
                      <div className="space-y-1.5 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-bold text-slate-900 dark:text-white text-sm group-hover:text-pink-500 transition-colors">
                            {item.role}
                          </span>
                          <div className="flex items-center gap-1.5">
                            {item.tags.map((t, idx) => (
                              <span
                                key={idx}
                                className="px-2 py-0.5 rounded-md bg-zinc-200/70 dark:bg-zinc-900 border border-zinc-300/60 dark:border-white/10 text-[10px] font-mono text-zinc-700 dark:text-zinc-300"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                        <div className="text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-2">
                          <Clock className="w-3 h-3 text-zinc-400" />
                          <span>{item.timestamp}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="text-right">
                          <div className="text-sm font-extrabold font-mono text-slate-900 dark:text-white group-hover:text-pink-400">
                            {item.score} <span className="text-xs font-normal text-zinc-500 dark:text-zinc-400">/ 10</span>
                          </div>
                          <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-medium">Passed</span>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-400 group-hover:text-pink-500 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-8 rounded-xl border border-dashed border-zinc-200 dark:border-white/10 text-center space-y-3">
                    <Clock className="w-8 h-8 text-zinc-400 mx-auto opacity-50" />
                    <div className="space-y-1">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">No Interviews Completed Yet</h4>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
                        Your practice sessions, panel ratings, and scorecard history will automatically record here after your first AI interview.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleStartInterviewAction}
                      className="px-4 py-2 rounded-full bg-pink-500/10 hover:bg-pink-500/20 text-pink-600 dark:text-pink-300 border border-pink-500/30 text-xs font-semibold transition-all inline-flex items-center gap-1.5"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Start Your First Interview</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

          </div>


          {/* ================================================== */}
          {/* RIGHT COLUMN (~25% / 3 cols in 12-col grid)        */}
          {/* ================================================== */}
          <div className="lg:col-span-3 space-y-6">

            {/* ACHIEVEMENTS / BADGES CARD */}
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-zinc-900/70 border border-zinc-200 dark:border-white/10 shadow-lg backdrop-blur-xl space-y-5">
              <div className="flex items-center justify-between border-b border-zinc-100 dark:border-white/5 pb-3">
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-amber-400" />
                    Achievements
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                    {profile.badges.filter(b => b.unlocked).length} Badges Earned
                  </p>
                </div>
              </div>

              {/* Next Achievement Progress Card */}
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-pink-500/10 to-transparent border border-amber-500/20 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-amber-300">
                    Next: {profile.nextBadgeProgress.title}
                  </span>
                  <span className="font-mono text-zinc-500 dark:text-zinc-400">
                    {profile.nextBadgeProgress.current}/{profile.nextBadgeProgress.total} days
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                  <div 
                    className="h-full rounded-full bg-gradient-to-r from-amber-400 to-pink-500 transition-all duration-500"
                    style={{ width: `${(profile.nextBadgeProgress.current / profile.nextBadgeProgress.total) * 100}%` }}
                  />
                </div>
              </div>

              {/* Badges List */}
              <div className="space-y-3">
                {profile.badges.map((badge) => (
                  <div
                    key={badge.id}
                    className={cn(
                      "p-3 rounded-xl border transition-all flex items-start gap-3",
                      badge.unlocked
                        ? "bg-zinc-50 dark:bg-zinc-800/40 border-zinc-200 dark:border-white/10 hover:border-pink-500/40"
                        : "bg-zinc-100/50 dark:bg-zinc-900/40 border-zinc-200/50 dark:border-white/5 opacity-60"
                    )}
                  >
                    <div className="relative text-2xl flex-shrink-0">
                      {badge.icon}
                      {!badge.unlocked && (
                        <div className="absolute inset-0 bg-slate-900/60 rounded-full flex items-center justify-center">
                          <Lock className="w-3.5 h-3.5 text-zinc-300" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0 flex-1 space-y-0.5">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">
                          {badge.title}
                        </span>
                        {badge.unlocked && (
                          <span className="text-[10px] font-mono text-emerald-600 dark:text-emerald-400">
                            ✓ Unlocked
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-zinc-500 dark:text-zinc-400 leading-snug">
                        {badge.description}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* SKILLS OVERVIEW */}
            <div className="p-6 rounded-2xl bg-white/80 dark:bg-zinc-900/70 border border-zinc-200 dark:border-white/10 shadow-lg backdrop-blur-xl space-y-5">
              <div className="border-b border-zinc-100 dark:border-white/5 pb-3">
                <h3 className="text-base font-bold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
                  <Brain className="w-4 h-4 text-pink-500" />
                  Skills Overview
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  AI panel competency rating across rounds
                </p>
              </div>

              <div className="space-y-4">
                {profile.skillScores.map((skill, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-semibold text-slate-800 dark:text-zinc-200">
                        {skill.name}
                      </span>
                      <span className="font-mono font-bold text-pink-600 dark:text-pink-400">
                        {skill.percentage}%
                      </span>
                    </div>
                    <div className="w-full h-2 rounded-full bg-zinc-200 dark:bg-zinc-800 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-pink-500 to-purple-600 transition-all duration-700 ease-out"
                        style={{ width: `${skill.percentage}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

        {/* BOTTOM CTA CARD */}
        <div className="p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-pink-500/15 via-purple-600/10 to-transparent border border-pink-500/30 text-center space-y-4 shadow-2xl relative overflow-hidden">
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-pink-500/20 blur-[90px] rounded-full pointer-events-none"></div>
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Ready to push your streak further?
          </h2>
          <p className="text-sm sm:text-base text-zinc-600 dark:text-zinc-300 max-w-xl mx-auto">
            Practice real technical, product, and architectural questions with an adaptive multi-agent AI panel.
          </p>

          <div className="pt-2 flex justify-center">
            <InteractiveHoverButton
              onClick={handleStartInterviewAction}
              variant="primary"
              className="px-8 py-3.5 text-base"
            >
              Start New Interview
            </InteractiveHoverButton>
          </div>
        </div>

      </main>

      {/* Candidate Briefing Setup Wizard Modal */}
      {showIntakeModal && (
        <InterviewIntakeModal
          isOpen={showIntakeModal}
          onClose={() => setShowIntakeModal(false)}
          onConfirm={(briefing) => {
            setShowIntakeModal(false);
            if (onStartInterview) {
              onStartInterview();
            }
          }}
          isLoading={false}
          initialTrack="technical"
        />
      )}

      {/* 3D Avatar Picker Modal */}
      {showAvatarPicker && (
        <AvatarPickerModal
          isOpen={showAvatarPicker}
          currentAvatarUrl={profile.avatar}
          onClose={() => setShowAvatarPicker(false)}
          onSelectAvatar={(url) => setCustomAvatarUrl(url)}
        />
      )}
    </div>
  );
}

export default UserProfilePage;
