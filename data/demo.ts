// Panel AI — Demo data and interviewer profiles for the interview platform.
// This file is the single source of truth for the demo role, candidate, and scripted answers.

import type { InterviewTrack, InterviewerProfile } from '@/types/conversation';

/** Interviewer display profiles keyed by track. */
export const INTERVIEWER_PROFILES: Record<InterviewTrack, InterviewerProfile> = {
  technical: {
    track: 'technical',
    name: 'Alex Chen',
    role: 'Technical Lead • Architecture',
    color: '#ec4899',
  },
  product: {
    track: 'product',
    name: 'Sarah Lin',
    role: 'Product Director • Strategy',
    color: '#a855f7',
  },
  hiring_manager: {
    track: 'hiring_manager',
    name: 'Elena Rostova',
    role: 'HR Manager • Culture & Growth',
    color: '#10b981',
  },
};

export const PANEL_ROUNDS: Array<{
  roundNumber: number;
  track: InterviewTrack;
  title: string;
  interviewerName: string;
  interviewerRole: string;
  durationSeconds: number;
  focus: string[];
  description: string;
  nextRoundPreview?: {
    track: InterviewTrack;
    title: string;
    interviewerName: string;
    previewQuote: string;
  };
}> = [
  {
    roundNumber: 1,
    track: 'technical',
    title: 'Round 1 — Technical Architecture',
    interviewerName: 'Alex Chen',
    interviewerRole: 'Technical Lead',
    durationSeconds: 180, // 3 minutes
    focus: [
      'Technical knowledge',
      'Problem solving',
      'APIs & State',
      'Architecture',
      'Performance',
      'Engineering trade-offs',
    ],
    description: 'System engineering, component decomposition, state management, and algorithmic complexity.',
    nextRoundPreview: {
      track: 'product',
      title: 'Product Round',
      interviewerName: 'Sarah Lin',
      previewQuote:
        'Your technical discussion has been reviewed. The next round will focus on customer impact, business thinking and trade-offs.',
    },
  },
  {
    roundNumber: 2,
    track: 'product',
    title: 'Round 2 — Product Strategy',
    interviewerName: 'Sarah Lin',
    interviewerRole: 'Product Director',
    durationSeconds: 180, // 3 minutes
    focus: [
      'Customer impact',
      'Business value',
      'Product thinking',
      'North-star metrics',
      'Prioritization',
      'User workflows',
    ],
    description: 'Connecting technical decisions to user workflows, customer conversion, and business impact.',
    nextRoundPreview: {
      track: 'hiring_manager',
      title: 'Hiring Manager Round',
      interviewerName: 'Elena Rostova',
      previewQuote:
        'Your technical architecture and product trade-offs have been synthesized. The final round will focus on leadership, ownership, decision-making and team alignment.',
    },
  },
  {
    roundNumber: 3,
    track: 'hiring_manager',
    title: 'Round 3 — Hiring Manager & Leadership',
    interviewerName: 'Elena Rostova',
    interviewerRole: 'HR & Hiring Manager',
    durationSeconds: 120, // 2 minutes
    focus: [
      'Overall role fit',
      'Ownership & accountability',
      'Decision-making under pressure',
      'Cross-functional leadership',
      'Consistency & career vision',
    ],
    description: 'Comprehensive evaluation of leadership mindset, culture fit, and long-term trajectory.',
  },
];

export const demoRole = {
  title: "Frontend Developer",
  company: "NovaCart",
  requiredSkills: [
    "React",
    "JavaScript",
    "Performance",
    "Problem Solving",
    "Communication",
  ] as const,
  summary:
    "Build reliable, responsive commerce experiences and diagnose frontend issues.",
} as const;

export const demoTracks = {
  technical: {
    id: "technical" as const,
    name: "Technical Interview",
    role: "Frontend Developer",
    company: "NovaCart",
    summary: "Build reliable, responsive commerce experiences and diagnose frontend issues.",
    interviewerTitle: "Technical Interviewer",
    requiredSkills: [
      "React",
      "JavaScript",
      "Performance",
      "Problem Solving",
      "Communication",
    ],
    openingQuestion:
      "You mentioned improving ShopFlow's React performance. What was slow, what did you change, and how did you prove it improved?",
  },
  product: {
    id: "product" as const,
    name: "Product Interview",
    role: "Product Engineer",
    company: "NovaCart",
    summary: "Evaluate customer impact, business value, user experience, metrics, and trade-offs.",
    interviewerTitle: "Product Interviewer",
    requiredSkills: [
      "Customer Impact",
      "Business Value",
      "User Experience",
      "Prioritization & Metrics",
      "Trade-offs",
    ],
    openingQuestion:
      "Hi, I'm the Product Interviewer. I'll explore how you connect technical decisions to users, business outcomes, and product value. Looking at your ShopFlow optimization, how did reducing render time directly impact customer checkout conversion and user retention?",
  },
  hiring_manager: {
    id: "hiring_manager" as const,
    name: "HR Manager & Culture Round",
    role: "Culture, Collaboration & Growth",
    company: "NovaCart",
    summary: "Evaluate long-term culture fit, team leadership, conflict resolution, and career ambitions.",
    interviewerTitle: "HR Manager",
    requiredSkills: [
      "Culture Fit",
      "Career Vision",
      "Collaboration",
      "Conflict Resolution",
      "Growth Mindset",
    ],
    openingQuestion:
      "Hi, I'm Elena, HR Manager for NovaCart. We've heard great insights from your technical and product sessions. To start, how do you approach disagreements with engineering and product partners when shipping under tight deadlines?",
  },
} as const;

export const demoCandidate = {
  name: "Abhishek Singh",
  experience: "Final-year engineering student",
  resumeSummary:
    "Built ShopFlow in React and claims a 35% performance improvement using profiling and memoization. Also built a JavaScript search interface with API integration.",
} as const;

export const fixedOpeningQuestion =
  "You mentioned improving ShopFlow's React performance. What was slow, what did you change, and how did you prove it improved?";

/**
 * Scripted demo answers used by the mock replay engine.
 * Each entry corresponds to one candidate turn in the three-question interview.
 */
export const scriptedDemoAnswers = [
  "The product list rerendered on every filter change. I used React DevTools Profiler, memoized ItemCard, and reduced render time from about 180 milliseconds to 70.",
  "Memoization adds comparison and memory overhead, so I would profile first and avoid it when renders are already cheap or props change constantly.",
  "I would debounce input, cancel the previous request with AbortController, and only render the result belonging to the latest query.",
] as const;
