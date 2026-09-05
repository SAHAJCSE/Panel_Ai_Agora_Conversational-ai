'use client';

import React, { useState } from 'react';
import { X, Mail, Lock, User, LogIn, UserPlus, AlertCircle, CheckCircle2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (userEmail: string) => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'signup') {
        const { data, error: signUpError } = await supabase.auth.signUp({
          email,
          password,
          options: {
            data: { full_name: fullName },
          },
        });

        if (signUpError) throw signUpError;

        if (data?.user) {
          setMessage('Account created successfully! Check your email for confirmation.');
          if (onSuccess) onSuccess(email);
          setTimeout(() => {
            onClose();
          }, 2000);
        }
      } else {
        const { data, error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) throw signInError;

        if (data?.user) {
          setMessage('Signed in successfully!');
          if (onSuccess) onSuccess(email);
          setTimeout(() => {
            onClose();
          }, 1000);
        }
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Authentication failed';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-zinc-950 p-6 sm:p-8 shadow-2xl transition-all">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-zinc-400 hover:text-white transition-colors"
          type="button"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold tracking-tight text-white">
            {mode === 'signin' ? 'Welcome Back' : 'Create Account'}
          </h2>
          <p className="mt-2 text-sm text-zinc-400">
            {mode === 'signin'
              ? 'Sign in to access your interview history and scorecards'
              : 'Sign up to track your interview practice and panel scores'}
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="mt-6 flex rounded-xl bg-zinc-900/80 p-1 border border-white/5">
          <button
            onClick={() => {
              setMode('signin');
              setError(null);
              setMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signin'
                ? 'bg-[#ec4899] text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
            type="button"
          >
            Sign In
          </button>
          <button
            onClick={() => {
              setMode('signup');
              setError(null);
              setMessage(null);
            }}
            className={`flex-1 py-2 text-xs font-semibold rounded-lg transition-all ${
              mode === 'signup'
                ? 'bg-[#ec4899] text-white shadow-[0_0_15px_rgba(236,72,153,0.4)]'
                : 'text-zinc-400 hover:text-white'
            }`}
            type="button"
          >
            Sign Up
          </button>
        </div>

        {/* Alerts */}
        {error && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-950/40 p-3 text-xs text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {message && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-950/40 p-3 text-xs text-emerald-300">
            <CheckCircle2 className="w-4 h-4 shrink-0" />
            <span>{message}</span>
          </div>
        )}

        {/* Auth Form */}
        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          {mode === 'signup' && (
            <div>
              <label className="block text-xs font-medium text-zinc-300 mb-1">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Abhishek Singh"
                  className="w-full rounded-xl bg-zinc-900 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#ec4899] focus:outline-none transition-colors"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="candidate@example.com"
                className="w-full rounded-xl bg-zinc-900 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#ec4899] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-zinc-300 mb-1">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <input
                type="password"
                required
                minLength={6}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full rounded-xl bg-zinc-900 border border-white/10 pl-10 pr-4 py-2.5 text-sm text-white placeholder-zinc-500 focus:border-[#ec4899] focus:outline-none transition-colors"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-[#ec4899] to-[#d926aa] text-white text-sm font-semibold shadow-[0_0_20px_rgba(236,72,153,0.4)] hover:shadow-[0_0_30px_rgba(236,72,153,0.6)] hover:scale-[1.01] active:scale-[0.99] transition-all disabled:opacity-50"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
            ) : mode === 'signin' ? (
              <>
                <LogIn className="w-4 h-4" />
                <span>Sign In</span>
              </>
            ) : (
              <>
                <UserPlus className="w-4 h-4" />
                <span>Create Account</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
}
