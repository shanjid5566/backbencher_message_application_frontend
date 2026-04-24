"use client";

import { Conversation } from "@/types/chat";
import Avatar from "@/components/ui/Avatar";
import { ONLINE_USERS } from "@/lib/mock-data";
import { Search } from "lucide-react";

interface ChatSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
}

export default function ChatSidebar({
  conversations,
  activeId,
  onSelect,
}: ChatSidebarProps) {
  return (
    <aside className="flex flex-col h-full bg-surface-900 border-r border-surface-700/50">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">Messages</h1>
        <button
          className="w-8 h-8 rounded-full bg-surface-700 hover:bg-surface-600 flex items-center justify-center transition-colors"
          aria-label="New message"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="text-surface-300"
          >
            <line x1="12" y1="5" x2="12" y2="19" />
            <line x1="5" y1="12" x2="19" y2="12" />
          </svg>
        </button>
      </div>

      {/* ── Search ── */}
      <div className="px-4 pb-4">
        <div className="flex items-center gap-2.5 bg-surface-800 rounded-xl px-3.5 py-2.5 border border-surface-700/50 focus-within:border-brand-500/50 focus-within:bg-surface-700/60 transition-all">
          <Search size={15} className="text-surface-500 flex-shrink-0" />
          <input
            type="text"
            placeholder="Search conversations..."
            className="flex-1 bg-transparent text-sm text-surface-200 placeholder:text-surface-500 outline-none"
          />
        </div>
      </div>

      {/* ── Online / Active Users Strip ── */}
      <div className="px-4 pb-3">
        <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-widest mb-3">
          Active Now
        </p>
        <div className="flex gap-4 overflow-x-auto scrollbar-hidden pb-1">
          {ONLINE_USERS.map((user) => (
            <button
              key={user.id}
              className="flex flex-col items-center gap-1.5 flex-shrink-0 group"
              aria-label={user.name}
            >
              <Avatar user={user} size="lg" showStatus />
              <span className="text-[11px] text-surface-400 group-hover:text-surface-200 transition-colors max-w-[52px] truncate">
                {user.name.split(" ")[0]}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ── Divider ── */}
      <div className="mx-4 border-t border-surface-700/50 mb-2" />

      {/* ── Conversation List ── */}
      <p className="px-5 pb-2 text-[11px] font-semibold text-surface-500 uppercase tracking-widest">
        Recent
      </p>
      <ul className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {conversations.map((conv, idx) => {
          const isActive = conv.id === activeId;
          return (
            <li key={conv.id} style={{ animationDelay: `${idx * 40}ms` }} className="animate-fade-in-up">
              <button
                onClick={() => onSelect(conv.id)}
                className={`
                  w-full flex items-center gap-3 px-3 py-3 rounded-xl 
                  transition-all duration-150 text-left group
                  ${
                    isActive
                      ? "bg-brand-600/20 border border-brand-500/30"
                      : "hover:bg-surface-800 border border-transparent"
                  }
                `}
              >
                {/* Avatar */}
                <Avatar user={conv.participant} size="md" showStatus />

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold truncate ${
                        isActive ? "text-white" : "text-surface-200"
                      }`}
                    >
                      {conv.participant.name}
                    </span>
                    <span className="text-[10px] text-surface-500 flex-shrink-0 ml-1">
                      {conv.lastMessageTime}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p
                      className={`text-xs truncate ${
                        conv.unreadCount > 0
                          ? "text-surface-200 font-medium"
                          : "text-surface-500"
                      }`}
                    >
                      {conv.lastMessage}
                    </p>
                    {conv.unreadCount > 0 && (
                      <span className="ml-2 flex-shrink-0 min-w-[18px] h-[18px] bg-brand-500 rounded-full text-[10px] font-bold text-white flex items-center justify-center px-1">
                        {conv.unreadCount > 9 ? "9+" : conv.unreadCount}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            </li>
          );
        })}
      </ul>
    </aside>
  );
}
