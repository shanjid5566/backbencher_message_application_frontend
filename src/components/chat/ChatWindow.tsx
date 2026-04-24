"use client";

import { useRef, useEffect, useState } from "react";
import { Conversation } from "@/types/chat";
import { CURRENT_USER } from "@/lib/mock-data";
import MessageBubble from "./MessageBubble";
import Avatar from "@/components/ui/Avatar";
import {
  ArrowLeft,
  Phone,
  Video,
  Info,
  Paperclip,
  Smile,
  Send,
  MoreHorizontal,
} from "lucide-react";

interface ChatWindowProps {
  conversation: Conversation;
  onBack: () => void;
}

export default function ChatWindow({ conversation, onBack }: ChatWindowProps) {
  const { participant, messages } = conversation;
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim()) return;
    // Future: dispatch to state / socket
    setInputValue("");
  };

  return (
    <div className="flex flex-col h-full bg-surface-950 animate-slide-right md:animate-none">
      {/* ── Chat Header ── */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-surface-700/50 bg-surface-900/80 backdrop-blur-sm flex-shrink-0">
        {/* Back button (mobile only) */}
        <button
          onClick={onBack}
          className="md:hidden w-8 h-8 rounded-full hover:bg-surface-700 flex items-center justify-center transition-colors flex-shrink-0"
          aria-label="Back to conversations"
        >
          <ArrowLeft size={18} className="text-surface-300" />
        </button>

        {/* Avatar + Info */}
        <Avatar user={participant} size="md" showStatus />
        <div className="flex-1 min-w-0">
          <h2 className="text-sm font-semibold text-white truncate">
            {participant.name}
          </h2>
          <p className="text-xs text-surface-400">
            {participant.isOnline ? (
              <span className="flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-online inline-block" />
                Active now
              </span>
            ) : (
              `Last seen ${participant.lastSeen ?? "a while ago"}`
            )}
          </p>
        </div>

        {/* Action Icons */}
        <div className="flex items-center gap-1">
          <ActionBtn icon={<Phone size={17} />} label="Voice call" />
          <ActionBtn icon={<Video size={17} />} label="Video call" />
          <ActionBtn icon={<Info size={17} />} label="Info" />
          <ActionBtn icon={<MoreHorizontal size={17} />} label="More" />
        </div>
      </header>

      {/* ── Message Area ── */}
      <main className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
        {/* Date label */}
        <div className="flex justify-center mb-4">
          <span className="text-[11px] text-surface-500 bg-surface-800 px-3 py-1 rounded-full">
            Today
          </span>
        </div>

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === CURRENT_USER.id}
          />
        ))}

        {/* Typing indicator */}
        <div className="flex items-end gap-2 mt-2">
          <Avatar user={participant} size="sm" />
          <div className="bg-surface-800 rounded-t-2xl rounded-br-2xl rounded-bl-md px-4 py-3 flex gap-1 items-center">
            {[0, 1, 2].map((i) => (
              <span
                key={i}
                className="w-1.5 h-1.5 rounded-full bg-surface-400"
                style={{
                  animation: "pulse-dot 1.2s ease-in-out infinite",
                  animationDelay: `${i * 0.2}s`,
                }}
              />
            ))}
          </div>
        </div>

        <div ref={messagesEndRef} />
      </main>

      {/* ── Input Area ── */}
      <footer className="flex-shrink-0 px-4 py-3 border-t border-surface-700/50 bg-surface-900/80 backdrop-blur-sm">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 bg-surface-800 rounded-2xl px-3 py-2 border border-surface-700/50 focus-within:border-brand-500/50 transition-all"
        >
          {/* Attachment */}
          <button
            type="button"
            className="w-8 h-8 rounded-full hover:bg-surface-700 flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Attach file"
          >
            <Paperclip size={17} className="text-surface-400" />
          </button>

          {/* Text Input */}
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-surface-200 placeholder:text-surface-500 outline-none py-1"
          />

          {/* Emoji */}
          <button
            type="button"
            className="w-8 h-8 rounded-full hover:bg-surface-700 flex items-center justify-center transition-colors flex-shrink-0"
            aria-label="Emoji"
          >
            <Smile size={17} className="text-surface-400" />
          </button>

          {/* Send */}
          <button
            type="submit"
            disabled={!inputValue.trim()}
            className="w-8 h-8 rounded-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0"
            aria-label="Send message"
          >
            <Send size={15} className="text-white translate-x-px" />
          </button>
        </form>
      </footer>
    </div>
  );
}

/* ── Small helper ── */
function ActionBtn({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button
      className="w-8 h-8 rounded-full hover:bg-surface-700 flex items-center justify-center transition-colors text-surface-400 hover:text-surface-200"
      aria-label={label}
    >
      {icon}
    </button>
  );
}
