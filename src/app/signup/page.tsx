"use client";

import Link from "next/link";
import { UserPlus, Eye, EyeOff, Loader2, AlertCircle, CheckCircle2 } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const router = useRouter();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);
    setIsLoading(true);
    
    const { data, error } = await authClient.signUp.email({
        email,
        password,
        name,
    });

    setIsLoading(false);

    if (error) {
        console.error("Signup Failed:", error.message);
        setErrorMsg(error.message);
    } else {
        console.log("Signup Success:", data);
        setSuccessMsg("Account created successfully! Redirecting to login...");
        setTimeout(() => {
          router.push("/login");
        }, 1500);
    }
  };

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
            <UserPlus className="text-brand-400" size={28} />
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
            Create an account
          </h1>
          <p className="text-sm text-surface-400">
            Join us to start messaging in real-time.
          </p>
        </div>

        {errorMsg && (
          <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-start gap-3 animate-scale-in">
            <AlertCircle className="text-red-400 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-red-400 leading-tight">
              {errorMsg}
            </p>
          </div>
        )}

        {successMsg && (
          <div className="mb-6 p-4 rounded-xl bg-green-500/10 border border-green-500/20 flex items-start gap-3 animate-scale-in">
            <CheckCircle2 className="text-green-400 shrink-0 mt-0.5" size={18} />
            <p className="text-sm text-green-400 leading-tight">
              {successMsg}
            </p>
          </div>
        )}

        <form className="space-y-5" onSubmit={handleSignUp}>
          <div className="space-y-1.5">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-surface-200"
            >
              Full name
            </label>
            <input
              id="name"
              type="text"
              placeholder="John Doe"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-sm text-surface-200 placeholder:text-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              required
            />
          </div>

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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-sm text-surface-200 placeholder:text-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all"
              required
            />
          </div>

          <div className="space-y-1.5">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-surface-200"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-surface-800 border border-surface-700 rounded-xl px-4 py-3 text-sm text-surface-200 placeholder:text-surface-500 focus:outline-none focus:border-brand-500 focus:ring-1 focus:ring-brand-500 transition-all pr-12"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-300 transition-colors"
                aria-label="Toggle password visibility"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium rounded-xl px-4 py-3 mt-2 shadow-lg shadow-brand-500/25 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <Loader2 className="animate-spin" size={20} />
                Signing up...
              </>
            ) : (
              "Sign up"
            )}
          </button>
        </form>

        <p className="mt-8 text-center text-sm text-surface-400">
          Already have an account?{" "}
          <Link
            href="/login"
            className="text-brand-400 hover:text-brand-300 font-medium transition-colors"
          >
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}
