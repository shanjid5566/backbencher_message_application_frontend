"use client";

import Avatar from "@/components/ui/Avatar";
import { ONLINE_USERS } from "@/lib/mock-data";
import { Search } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";

interface ChatSidebarProps {
  activeId: string | null;
  onSelect: (id: string) => void;
}

export default function ChatSidebar({
  activeId,
  onSelect,
}: ChatSidebarProps) {
  const { data: conversations, isLoading, isError } = useConversations();

  return (
    <aside className="flex flex-col h-full bg-surface-900 border-r border-surface-700/50">
      {/* ── Header ── */}
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">Messages</h1>
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
        <div 
          className="flex gap-4 overflow-x-auto scrollbar-hidden pb-1"
          onWheel={(e) => {
            if (e.deltaY !== 0) {
              e.currentTarget.scrollLeft += e.deltaY;
            }
          }}
        >
          {ONLINE_USERS.map((user) => (
            <button
              key={user.id}
              onClick={() => {
                // If you want clicking an online mock user to select a chat:
                // const conv = conversations?.find((c) => c.users[0]?.id === user.id);
                // if (conv) onSelect(conv.id);
              }}
              className="flex flex-col items-center gap-1.5 shrink-0 group"
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
        {isLoading && Array.from({ length: 5 }).map((_, i) => (
          <li key={i} className="px-3 py-3 animate-pulse flex items-center gap-3">
            <div className="w-12 h-12 bg-surface-700 rounded-full shrink-0"></div>
            <div className="flex-1 min-w-0 space-y-2">
              <div className="h-4 bg-surface-700 rounded w-1/2"></div>
              <div className="h-3 bg-surface-700 rounded w-3/4"></div>
            </div>
          </li>
        ))}

        {isError && (
          <div className="p-4 text-center text-sm text-red-500">
            Failed to load chats!
          </div>
        )}

        {!isLoading && !isError && conversations?.length === 0 && (
          <div className="p-4 text-center text-sm text-surface-500">
            No conversations yet.
          </div>
        )}

        {!isLoading && !isError && conversations?.map((conv, idx) => {
          const isActive = conv.id === activeId;
          const partner = conv.users[0];
          const lastMessageBody = conv.messages[0]?.body || "Started a conversation";
          
          if (!partner) return null;

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
                <div className="relative shrink-0">
                  <img src={partner.image || "https://avatar.iran.liara.run/public"} alt={partner.name} className="w-10 h-10 rounded-full object-cover" />
                  {partner.isOnline && (
                    <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface-900 rounded-full"></span>
                  )}
                </div>

                {/* Text */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-sm font-semibold truncate ${
                        isActive ? "text-white" : "text-surface-200"
                      }`}
                    >
                      {partner.name}
                    </span>
                  </div>
                  <div className="flex items-center justify-between mt-0.5">
                    <p
                      className={`text-xs truncate text-surface-500`}
                    >
                      {lastMessageBody}
                    </p>
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
