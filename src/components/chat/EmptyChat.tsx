"use client";

import { MessageCircle } from "lucide-react";

export default function EmptyChat() {
  return (
    <div className="flex-1 w-full h-full hidden md:flex flex-col items-center justify-center gap-5 bg-surface-950">
      {/* Icon */}
      <div className="w-20 h-20 rounded-3xl bg-surface-800 border border-surface-700/50 flex items-center justify-center shadow-xl">
        <MessageCircle size={36} className="text-brand-400" strokeWidth={1.5} />
      </div>

      <div className="text-center space-y-2">
        <h3 className="text-xl font-semibold text-surface-200">
          Select a conversation
        </h3>
        <p className="text-sm text-surface-500 max-w-xs leading-relaxed">
          Choose a chat from the left panel to start messaging, or search for
          someone new.
        </p>
      </div>

      {/* Decorative dots */}
      <div className="flex gap-2 mt-2">
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 rounded-full bg-brand-600/40"
            style={{
              animation: "pulse-dot 1.8s ease-in-out infinite",
              animationDelay: `${i * 0.3}s`,
            }}
          />
        ))}
      </div>
    </div>
  );
}
