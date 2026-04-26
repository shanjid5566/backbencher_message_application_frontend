"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Loader2, KeyRound } from "lucide-react";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      // Better Auth automatically grabs the token from the current window URL
      const { error } = await authClient.resetPassword({
        newPassword: password,
      });

      if (error) {
        setError(error.message || "Failed to reset password. The link might be expired.");
      } else {
        setSuccess(true);
        // Redirect the user to the login page after a short delay
        setTimeout(() => {
          router.push("/login");
        }, 3000);
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
        
        {success ? (
          <div className="text-center space-y-4">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-2">
              <KeyRound size={32} className="text-green-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Password Reset</h2>
            <p className="text-sm text-surface-400">
              Your password has been successfully reset. Redirecting to login...
            </p>
          </div>
        ) : (
          <>
            <div className="text-center mb-8">
              <div className="w-12 h-12 bg-surface-800 rounded-xl flex items-center justify-center mx-auto mb-4 border border-surface-700/50">
                <KeyRound size={20} className="text-surface-300" />
              </div>
              <h2 className="text-2xl font-bold text-white">Set new password</h2>
              <p className="text-sm text-surface-400 mt-2">
                Please enter your new password below.
              </p>
            </div>

            {error && (
              <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm text-red-400 text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-200">New Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-surface-950 border border-surface-700/50 rounded-xl text-sm text-white placeholder:text-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  required
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-medium text-surface-200">Confirm Password</label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full px-4 py-2.5 bg-surface-950 border border-surface-700/50 rounded-xl text-sm text-white placeholder:text-surface-600 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 mt-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-sm font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : null}
                Reset Password
              </button>
            </form>
          </>
        )}

      </div>
    </div>
  );
}