"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CONVERSATIONS, CURRENT_USER } from "@/lib/mock-data";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import EmptyChat from "@/components/chat/EmptyChat";
import Avatar from "@/components/ui/Avatar";
import { LogOut } from "lucide-react";

export default function ChatPage() {
  const router = useRouter();
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  // mobile: "sidebar" | "window"
  const [mobileView, setMobileView] = useState<"sidebar" | "window">(
    "sidebar"
  );

  const activeConversation = CONVERSATIONS.find((c) => c.id === activeConvId);

  const handleSelectConversation = (id: string) => {
    setActiveConvId(id);
    setMobileView("window");
  };

  const handleBack = () => {
    setMobileView("sidebar");
  };

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950">
      {/* ══════════════════════════════════════════
          LEFT SIDEBAR
          ══════════════════════════════════════════ */}
      <div
        className={`
          flex flex-col
          w-full md:w-80 lg:w-96
          flex-shrink-0
          ${mobileView === "window" ? "hidden" : "flex"} md:flex
        `}
      >
        {/* Sidebar content */}
        <div className="flex-1 overflow-hidden">
          <ChatSidebar
            activeId={activeConvId}
            onSelect={handleSelectConversation}
          />
        </div>

        {/* ── User Profile Footer ── */}
        <div className="flex items-center gap-3 px-4 py-3 bg-surface-900 border-t border-r border-surface-700/50">
          <Avatar user={CURRENT_USER} size="sm" showStatus />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">
              {CURRENT_USER.name}
            </p>
            <p className="text-[11px] text-online">Online</p>
          </div>
          <button
            onClick={() => router.push("/login")}
            className="w-7 h-7 rounded-full hover:bg-surface-700 flex items-center justify-center transition-colors"
            aria-label="Log out"
          >
            <LogOut size={14} className="text-surface-400" />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT PANE – CHAT WINDOW or EMPTY STATE
          ══════════════════════════════════════════ */}
      <div
        className={`
          flex-1 overflow-hidden
          ${mobileView === "sidebar" ? "hidden" : "flex"} md:flex
        `}
      >
        {activeConversation ? (
          <ChatWindow
            conversation={activeConversation}
            onBack={handleBack}
          />
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
}
