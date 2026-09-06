'use client';

import React from 'react';
import {
  AvatarGroup,
  AvatarGroupTooltip,
} from '@/components/animate-ui/components/animate/avatar-group';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@/components/ui/avatar';
import { Github, ExternalLink, Users } from 'lucide-react';

const TEAMMATES = [
  {
    name: 'Ekjyot Kaur Malhotra',
    fallback: 'EK',
    role: 'Full Stack Engineer',
    commudleUrl: 'https://www.commudle.com/users/ekjyot_45',
    githubUrl: 'https://github.com/Ekjyotkaur07',
    avatarUrl: 'https://github.com/Ekjyotkaur07.png',
  },
  {
    name: 'Rajeev Ranjan',
    fallback: 'RR',
    role: 'Full Stack Engineer',
    commudleUrl: 'https://www.commudle.com/users/8ea1b8372745e6d8a62cb47b406be0fb',
    githubUrl: 'https://github.com/rajeevranjan4812-star',
    avatarUrl: 'https://github.com/rajeevranjan4812-star.png',
  },
  {
    name: 'Yashika Sanan',
    fallback: 'YS',
    role: 'AI & UI Engineer',
    commudleUrl: 'https://www.commudle.com/users/9514b81d320efb13ecc13cb0',
    githubUrl: 'https://github.com/yashikasanan',
    avatarUrl: 'https://github.com/yashikasanan.png',
  },
  {
    name: 'Sahaj',
    fallback: 'S',
    role: 'AI Lead',
    commudleUrl: 'https://www.commudle.com/users/c12b926c80f58213d77b59e6',
    githubUrl: 'https://github.com/SAHAJCSE',
    avatarUrl: 'https://github.com/SAHAJCSE.png',
  },
];

export function TeammatesSection() {
  return (
    <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pb-24" id="team">
      <div className="flex flex-col items-center text-center mb-12">
        <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#ec4899]/10 border border-[#ec4899]/30 text-xs font-mono text-pink-600 dark:text-pink-300 font-semibold mb-3">
          <Users className="w-3.5 h-3.5 text-[#ec4899]" />
          <span>Collaborators &amp; Team</span>
        </div>
        <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Meet the Teammates
        </h2>
        <p className="mt-3 text-sm sm:text-base text-zinc-600 dark:text-zinc-400 max-w-xl">
          The engineering team behind PanelAI autonomous multi-interviewer platform.
        </p>

        {/* Animated Avatar Group Showcase */}
        <div className="mt-8 flex justify-center">
          <AvatarGroup>
            {TEAMMATES.map((member, index) => (
              <div key={index} className="group relative">
                <Avatar className="size-14 border-3 border-white dark:border-zinc-900 shadow-lg cursor-pointer transition-transform duration-300 hover:scale-110">
                  <AvatarImage src={member.avatarUrl} alt={member.name} />
                  <AvatarFallback>{member.fallback}</AvatarFallback>
                  <AvatarGroupTooltip>{member.name}</AvatarGroupTooltip>
                </Avatar>
              </div>
            ))}
          </AvatarGroup>
        </div>
      </div>

      {/* Teammate Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {TEAMMATES.map((member, idx) => (
          <div
            key={idx}
            className="group relative rounded-2xl bg-white dark:bg-zinc-950/80 border border-zinc-200 dark:border-zinc-800 p-6 flex flex-col items-center text-center shadow-md dark:shadow-none hover:border-[#ec4899]/50 hover:shadow-[0_0_30px_rgba(236,72,153,0.2)] transition-all duration-300"
          >
            <Avatar className="size-16 mb-4 border-2 border-pink-500/40">
              <AvatarImage src={member.avatarUrl} alt={member.name} />
              <AvatarFallback className="text-base">{member.fallback}</AvatarFallback>
            </Avatar>

            <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-[#ec4899] transition-colors">
              {member.name}
            </h3>
            <p className="text-xs font-mono text-zinc-500 dark:text-zinc-400 mt-1 mb-4">
              {member.role}
            </p>

            <div className="mt-auto flex items-center justify-center gap-3 pt-3 border-t border-zinc-100 dark:border-zinc-900 w-full">
              {member.githubUrl && (
                <a
                  href={member.githubUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-[#ec4899] hover:bg-pink-500/10 transition-all"
                  title="GitHub Profile"
                >
                  <Github className="w-4 h-4" />
                </a>
              )}

              {member.commudleUrl && (
                <a
                  href={member.commudleUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-700 dark:text-zinc-300 hover:text-[#ec4899] hover:bg-pink-500/10 transition-all flex items-center gap-1 text-xs font-mono font-medium px-3"
                  title="Commudle Profile"
                >
                  <span>Commudle</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
