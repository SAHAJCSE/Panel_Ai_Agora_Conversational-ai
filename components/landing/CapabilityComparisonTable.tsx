'use client';

import React from 'react';
import { Check, Minus, Sparkles, Trophy } from 'lucide-react';

interface ComparisonRow {
  capability: string;
  selectWise: boolean;
  paraakh: boolean;
  huru: boolean;
  roundpass: boolean;
  panelAI: boolean;
  highlighted?: boolean;
}

const COMPARISON_DATA: ComparisonRow[] = [
  {
    capability: 'Voice interview',
    selectWise: true,
    paraakh: true,
    huru: true,
    roundpass: true,
    panelAI: true,
  },
  {
    capability: 'Adaptive follow-ups',
    selectWise: true,
    paraakh: true,
    huru: true,
    roundpass: true,
    panelAI: true,
  },
  {
    capability: 'Role-specific interviews',
    selectWise: true,
    paraakh: true,
    huru: true,
    roundpass: true,
    panelAI: true,
  },
  {
    capability: 'Multiple AI interviewers',
    selectWise: false,
    paraakh: false,
    huru: false,
    roundpass: false,
    panelAI: true,
    highlighted: true,
  },
  {
    capability: 'Dynamic agent handoff',
    selectWise: false,
    paraakh: false,
    huru: false,
    roundpass: false,
    panelAI: true,
    highlighted: true,
  },
  {
    capability: 'Shared context across interviewers',
    selectWise: false,
    paraakh: false,
    huru: false,
    roundpass: false,
    panelAI: true,
    highlighted: true,
  },
  {
    capability: 'Cross-perspective probing',
    selectWise: false,
    paraakh: false,
    huru: false,
    roundpass: false,
    panelAI: true,
    highlighted: true,
  },
  {
    capability: 'Evidence-based scoring/report',
    selectWise: true,
    paraakh: true,
    huru: true,
    roundpass: true,
    panelAI: true,
  },
];

export function CapabilityComparisonTable() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-24" id="capabilities">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ec4899]/10 border border-[#ec4899]/30 text-xs font-mono text-pink-600 dark:text-pink-300 font-semibold mb-3">
          <Trophy className="w-3.5 h-3.5 text-[#ec4899]" />
          <span>Capability Benchmark</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          How PanelAI Compares
        </h2>
        <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-2xl">
          Single-agent prep tools ask static questions. PanelAI is the only platform that orchestrates an autonomous multi-interviewer hiring loop.
        </p>
      </div>

      {/* Comparison Table Container */}
      <div className="overflow-x-auto rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white/90 dark:bg-zinc-950/90 shadow-xl backdrop-blur-xl">
        <table className="w-full text-left border-collapse min-w-[700px]">
          <thead>
            <tr className="border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-900/60">
              <th className="p-5 sm:p-6 text-sm font-bold text-slate-900 dark:text-white w-1/3">
                Capability
              </th>
              <th className="p-4 sm:p-5 text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 text-center">
                SelectWise
              </th>
              <th className="p-4 sm:p-5 text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 text-center">
                Paraakh
              </th>
              <th className="p-4 sm:p-5 text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 text-center">
                <a
                  href="https://appv2.huru.ai/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-500 transition-colors underline decoration-dotted"
                >
                  Huru
                </a>
              </th>
              <th className="p-4 sm:p-5 text-xs font-mono font-medium text-zinc-500 dark:text-zinc-400 text-center">
                <a
                  href="http://roundpass.ai/compare/ai-interview-prep-tools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-pink-500 transition-colors underline decoration-dotted"
                >
                  Roundpass
                </a>
              </th>
              {/* Highlighted PANEL AI Column Header */}
              <th className="p-5 sm:p-6 text-sm font-extrabold text-white text-center bg-gradient-to-b from-[#ec4899] to-[#d926aa] relative shadow-lg rounded-t-2xl">
                <div className="flex items-center justify-center gap-1.5">
                  <Sparkles className="w-4 h-4 fill-white text-white" />
                  <a
                    href="https://panelai-conversationalagent.vercel.app/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline tracking-tight"
                  >
                    PANEL AI
                  </a>
                </div>
                <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-white/20 text-[10px] font-mono uppercase tracking-widest">
                  Leader
                </span>
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800/80">
            {COMPARISON_DATA.map((row, index) => (
              <tr
                key={index}
                className={
                  row.highlighted
                    ? 'bg-pink-500/5 dark:bg-pink-500/10 transition-colors'
                    : 'hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30 transition-colors'
                }
              >
                <td className="p-5 sm:p-6 text-sm font-semibold text-slate-900 dark:text-white flex items-center gap-2">
                  {row.highlighted && (
                    <span className="w-2 h-2 rounded-full bg-[#ec4899] animate-pulse shrink-0" />
                  )}
                  <span>{row.capability}</span>
                </td>

                <td className="p-4 text-center">
                  {row.selectWise ? (
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  ) : (
                    <Minus className="w-4 h-4 text-zinc-400 dark:text-zinc-600 mx-auto" />
                  )}
                </td>

                <td className="p-4 text-center">
                  {row.paraakh ? (
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  ) : (
                    <Minus className="w-4 h-4 text-zinc-400 dark:text-zinc-600 mx-auto" />
                  )}
                </td>

                <td className="p-4 text-center">
                  {row.huru ? (
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  ) : (
                    <Minus className="w-4 h-4 text-zinc-400 dark:text-zinc-600 mx-auto" />
                  )}
                </td>

                <td className="p-4 text-center">
                  {row.roundpass ? (
                    <Check className="w-5 h-5 text-emerald-500 mx-auto" />
                  ) : (
                    <Minus className="w-4 h-4 text-zinc-400 dark:text-zinc-600 mx-auto" />
                  )}
                </td>

                {/* Highlighted PANEL AI Column Cell */}
                <td className="p-5 sm:p-6 text-center bg-pink-500/10 dark:bg-pink-500/20 font-bold border-x border-[#ec4899]/30">
                  {row.panelAI && (
                    <div className="w-7 h-7 rounded-full bg-[#ec4899] text-white flex items-center justify-center mx-auto shadow-[0_0_15px_rgba(236,72,153,0.5)]">
                      <Check className="w-4 h-4 stroke-[3]" />
                    </div>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
