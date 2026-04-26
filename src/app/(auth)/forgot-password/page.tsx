"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError("Please enter your email address");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Better Auth will send an email with a token attached to this redirect URL
      const { error } = await authClient.forgetPassword({
        email,
        redirectTo: "/reset-password", 
      });

      if (error) {
        setError(error.message || "Failed to send reset link");
      } else {
        setIsSent(true);
      }
    } catch (err: any) {
      setError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-950 p-4">
      <div className="w-full max-w-md bg-surface-900 border border-surface-700/50 rounded-2xl shadow-2xl p-8 animate-scale-in">
        
        {isSent ? (
          <div className="flex flex-col items-center text-center space-y-4">
            <div className="w-16 h-16 bg-brand-500/20 rounded-full flex items-center justify-center mb-2">
              <MailCheck size={32} className="text-brand-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Check your email</h2>
            <p className="text-sm text-surface-400">
              We've sent a password reset link to <br/> <span className="font-semibold text-surface-200">{email}</span>
            </p>
            <Link href="/login" className="w-full mt-6 py-2.5 bg-surface-800 hover:bg-surface-700 text-white rounded-xl text-sm font-semibold transition-colors block text-center">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-surface-800 rounded-xl flex items-center justify-center mx-auto mb-4 border border-surface-700/50">
                <ArrowLeft size={20} className="text-surface-300" />
              </div>
              <h2 className="text-2xl font-bold text-white">Forgot Password?</h2>
              <p className="text-sm text-surface-400 mt-2">
                No worries, we'll send you reset instructions.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label htmlFor="email" className="text-sm font-medium text-surface-200">Email address</label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full px-4 py-2.5 bg-surface-950 border border-surface-700/50 rounded-xl text-sm text-white placeholder:text-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                Reset Password
              </button>
            </form>

            <div className="mt-8 text-center text-sm text-surface-400">
              <Link href="/login" className="flex items-center justify-center gap-1.5 hover:text-brand-400 transition-colors">
                <ArrowLeft size={14} /> Back to log in
              </Link>
            </div>
          </>
        )}

      </div>
    </div>
  );
}