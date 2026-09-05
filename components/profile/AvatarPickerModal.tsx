'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Sparkles, UserCheck } from 'lucide-react';
import { AVATAR_OPTIONS, saveSelectedAvatar, type AvatarOption } from '@/lib/avatars';
import { cn } from '@/lib/utils';

export interface AvatarPickerModalProps {
  isOpen: boolean;
  currentAvatarUrl: string;
  onClose: () => void;
  onSelectAvatar: (url: string) => void;
}

export function AvatarPickerModal({
  isOpen,
  currentAvatarUrl,
  onClose,
  onSelectAvatar,
}: AvatarPickerModalProps) {
  const [selectedUrl, setSelectedUrl] = useState<string>(currentAvatarUrl || AVATAR_OPTIONS[0].url);

  if (!isOpen) return null;

  const handleConfirm = () => {
    saveSelectedAvatar(selectedUrl);
    onSelectAvatar(selectedUrl);
    onClose();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 dark:bg-black/85 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 0.99, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }}
          className="relative w-full max-w-2xl rounded-3xl bg-white dark:bg-[#0b0c10] border border-zinc-200 dark:border-white/10 p-6 sm:p-8 shadow-2xl overflow-hidden font-sans text-slate-900 dark:text-white"
        >
          {/* Header */}
          <div className="flex items-center justify-between pb-5 border-b border-zinc-100 dark:border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-pink-500/10 border border-pink-500/30 flex items-center justify-center text-[#ec4899] shadow-[0_0_20px_rgba(236,72,153,0.3)]">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-xl font-extrabold text-slate-900 dark:text-white tracking-tight">
                  Choose Your 3D Avatar
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                  Select a 3D avatar to represent your Panel AI profile
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 rounded-full bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-zinc-500 hover:text-slate-900 dark:hover:text-white transition-colors"
              title="Close"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 8 3D Avatars Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 max-h-[60vh] overflow-y-auto pr-1 scrollbar-thin">
            {AVATAR_OPTIONS.map((avatar) => {
              const isSelected = selectedUrl === avatar.url;

              return (
                <div
                  key={avatar.id}
                  onClick={() => setSelectedUrl(avatar.url)}
                  className={cn(
                    'group relative rounded-2xl p-3 border cursor-pointer transition-all duration-200 flex flex-col items-center text-center space-y-2',
                    isSelected
                      ? 'bg-pink-500/10 dark:bg-pink-500/15 border-pink-500 shadow-[0_0_25px_rgba(236,72,153,0.35)] scale-[1.03]'
                      : 'bg-zinc-50 dark:bg-zinc-900/50 border-zinc-200 dark:border-white/10 hover:border-pink-500/40 hover:scale-[1.02]'
                  )}
                >
                  <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-white dark:border-zinc-900 shadow-md">
                    <img
                      src={avatar.url}
                      alt={avatar.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    />
                    {isSelected && (
                      <div className="absolute inset-0 bg-pink-500/30 backdrop-blur-[1px] flex items-center justify-center">
                        <div className="w-7 h-7 rounded-full bg-[#ec4899] text-white flex items-center justify-center shadow-lg">
                          <Check className="w-4 h-4 stroke-[3]" />
                        </div>
                      </div>
                    )}
                  </div>

                  <span className={cn(
                    'text-xs font-semibold font-mono tracking-tight line-clamp-1',
                    isSelected ? 'text-pink-600 dark:text-pink-300 font-bold' : 'text-zinc-600 dark:text-zinc-400'
                  )}>
                    {avatar.name}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Footer CTAs */}
          <div className="pt-4 border-t border-zinc-100 dark:border-white/10 flex items-center justify-between gap-4">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-full text-xs font-mono font-medium text-zinc-600 dark:text-zinc-400 hover:text-slate-900 dark:hover:text-white transition-colors"
            >
              Cancel
            </button>

            <button
              onClick={handleConfirm}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white font-bold text-xs shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] transition-all active:scale-[0.98]"
            >
              <UserCheck className="w-4 h-4" />
              <span>Apply Selected Avatar</span>
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

export default AvatarPickerModal;
