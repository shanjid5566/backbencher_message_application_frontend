"use client";

import Link from "next/link";
import { LogIn } from "lucide-react";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
      {/* ── Background Elements ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-brand-600/10 blur-[120px]" />
        <div className="absolute -bottom-[25%] -right-[10%] w-[50%] h-[50%] rounded-full bg-brand-400/10 blur-[120px]" />
      </div>

      {/* ── Card ── */}
      <div className="relative w-full max-w-md p-8 rounded-3xl bg-surface-900 border border-surface-700/50 shadow-2xl animate-scale-in">
        <div className="flex justify-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-brand-600/20 flex items-center justify-center border border-brand-500/30">
            <LogIn className="text-brand-400" size={28} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
            Welcome back
          </h1>
          <p className="text-sm text-surface-400">
            Enter your credentials to access your account.
          </p>
        </div>

        <form className="space-y-5">
          <div className="space-y-1.5">
            <label
              htmlFor="email"
              className="block text-sm font-medium text-surface-200"
            >
              Email address
            </label>
            <input
              id="email"
              type="email"
              placeholder="you@example.com"
              className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-sm text-surface-200 placeholder:text-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>

          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label
                htmlFor="password"
                className="block text-sm font-medium text-surface-200"
              >
                Password
              </label>
              <Link
                href="#"
                className="text-xs text-brand-400 hover:text-brand-300 font-medium transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <input
              id="password"
              type="password"
              placeholder="••••••••"
              className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-sm text-surface-200 placeholder:text-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
            />
          </div>

          <button
            type="submit"
            className="w-full bg-brand-600 hover:bg-brand-500 text-white font-medium rounded-xl px-4 py-3 mt-2 shadow-lg shadow-brand-500/25 transition-all active:scale-[0.98]"
          >
            Sign in
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-surface-400">
          Don&apos;t have an account?{" "}
          <Link
            href="/signup"
            className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
