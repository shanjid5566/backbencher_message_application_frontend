"use client";

import { useEffect, useState } from "react";
import Avatar from "@/components/ui/Avatar";
import { Search, Loader2 } from "lucide-react";
import { useConversations } from "@/hooks/useConversations";
import { useSearchUsers } from "@/hooks/useSearchUsers";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";

interface ChatSidebarProps {
  activeId: string | null;
  onSelect: (id: string, partnerId?: string) => void;
  socket?: any;
}

export default function ChatSidebar({ activeId, onSelect, socket }: ChatSidebarProps) {
  const { data: conversations, isLoading, isError } = useConversations();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const { data: searchResults, isLoading: isSearching } = useSearchUsers(searchQuery);
  const [isCreatingChat, setIsCreatingChat] = useState(false);

  useEffect(() => {
    if (!socket) return;
    const handleUserStatusChange = ({ userId, isOnline, lastSeen }: any) => {
      queryClient.setQueryData(['conversations'], (oldConversations: any) => {
        if (!oldConversations) return oldConversations;
        return oldConversations.map((conv: any) => ({
          ...conv,
          users: conv.users.map((user: any) => 
            user.id === userId ? { ...user, isOnline, lastSeen } : user
          )
        }));
      });
    };
    socket.on("user_status_changed", handleUserStatusChange);
    return () => { socket.off("user_status_changed", handleUserStatusChange); };
  }, [socket, queryClient]);

  const handleSearchResultSelect = async (participantId: string) => {
    setIsCreatingChat(true);
    try {
      const response = await api.post("/conversations", { participantId });
      const newConversationId = response.data.data.id;
      onSelect(newConversationId, participantId);
      setSearchQuery("");
    } catch (error) {
      console.error("Failed to start conversation", error);
    } finally {
      setIsCreatingChat(false);
    }
  };

  const activeUsers = conversations
    ?.flatMap((c) => c.users)
    ?.filter((u) => u.isOnline)
    ?.filter((v, i, a) => a.findIndex((t) => t.id === v.id) === i) || [];

  // 💡 Helper function to format image URL correctly
  const getImageUrl = (imagePath?: string | null, fallbackName?: string) => {
    if (!imagePath) return `https://ui-avatars.com/api/?name=${fallbackName || "User"}&background=random`;
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:5000/${imagePath.replace(/\\/g, "/")}`;
  };

  return (
    <aside className="flex flex-col h-full bg-surface-900 border-r border-surface-700/50">
      <div className="flex items-center justify-between px-5 pt-6 pb-4">
        <h1 className="text-xl font-bold text-white tracking-tight">Messages</h1>
      </div>

      <div className="px-4 pb-4">
        <div className="flex items-center gap-2.5 bg-surface-800 rounded-xl px-3.5 py-2.5 border border-surface-700/50 focus-within:border-brand-500/50 focus-within:bg-surface-700/60 transition-all">
          <Search size={15} className="text-surface-500 flex-shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search users..."
            className="flex-1 bg-transparent text-sm text-surface-200 placeholder:text-surface-500 outline-none"
          />
        </div>
      </div>

      {!searchQuery && (
        <>
          <div className="px-4 pb-3">
            <p className="text-[11px] font-semibold text-surface-500 uppercase tracking-widest mb-3">
              Active Now ({activeUsers.length})
            </p>
            <div className="flex gap-4 overflow-x-auto scrollbar-hidden pb-1">
              {activeUsers.length === 0 ? (
                <p className="text-xs text-surface-500">No active users</p>
              ) : (
                activeUsers.map((user) => (
                  <button
                    key={user.id}
                    onClick={() => {
                      const conv = conversations?.find(c => c.users.some(u => u.id === user.id));
                      if (conv) onSelect(conv.id, user.id);
                    }}
                    className="flex flex-col items-center gap-1.5 shrink-0 group"
                  >
                    {/* 🔴 Fixed Image URL for Active Users */}
                    <Avatar user={{...user, avatarUrl: getImageUrl(user.image, user.name)} as any} size="lg" showStatus />
                    <span className="text-[11px] text-surface-400 group-hover:text-surface-200 transition-colors max-w-[52px] truncate">
                      {user.name.split(" ")[0]}
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>
          <div className="mx-4 border-t border-surface-700/50 mb-2" />
        </>
      )}

      <div className="px-5 pb-2 flex justify-between items-center text-[11px] font-semibold text-surface-500 uppercase tracking-widest">
        <span>{searchQuery ? "Search Results" : "Recent"}</span>
        {isCreatingChat && <Loader2 size={12} className="animate-spin text-brand-500" />}
      </div>
      
      <ul className="flex-1 overflow-y-auto px-2 pb-4 space-y-0.5">
        {searchQuery && (
          <>
            {isSearching && <div className="p-4 text-center text-sm text-surface-500 flex justify-center"><Loader2 size={16} className="animate-spin" /></div>}
            {!isSearching && searchResults?.length === 0 && <div className="p-4 text-center text-sm text-surface-500">No users found.</div>}
            {!isSearching && searchResults?.map((user: any) => (
              <li key={user.id} className="animate-fade-in-up">
                <button onClick={() => handleSearchResultSelect(user.id)} disabled={isCreatingChat} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left hover:bg-surface-800 disabled:opacity-50">
                  <div className="relative shrink-0">
                    {/* 🔴 Fixed Image URL for Search Results */}
                    <img src={getImageUrl(user.image, user.name)} alt={user.name} className="w-10 h-10 rounded-full object-cover bg-slate-700" />
                    {user.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface-900 rounded-full"></span>}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-semibold text-surface-200 truncate">{user.name}</div>
                  </div>
                </button>
              </li>
            ))}
          </>
        )}

        {!searchQuery && (
          <>
            {isLoading && Array.from({ length: 5 }).map((_, i) => (
              <li key={i} className="px-3 py-3 animate-pulse flex items-center gap-3">
                <div className="w-12 h-12 bg-surface-700 rounded-full shrink-0"></div>
                <div className="flex-1 space-y-2"><div className="h-4 bg-surface-700 rounded w-1/2"></div><div className="h-3 bg-surface-700 rounded w-3/4"></div></div>
              </li>
            ))}
            {isError && <div className="p-4 text-center text-sm text-red-500">Failed to load chats!</div>}
            {!isLoading && !isError && conversations?.length === 0 && <div className="p-4 text-center text-sm text-surface-500">No conversations yet.</div>}
            
            {!isLoading && !isError && conversations?.map((conv, idx) => {
              const isActive = conv.id === activeId;
              const partner = conv.users[0];
              
              let lastMessageBody = conv.messages[0]?.body || "Started a conversation";
              if (conv.messages[0]?.type === "CALL_LOG") lastMessageBody = "📞 " + lastMessageBody;
              else if (conv.messages[0]?.fileUrl) lastMessageBody = "📎 Attachment";

              if (!partner) return null;

              return (
                <li key={conv.id} style={{ animationDelay: `${idx * 40}ms` }} className="animate-fade-in-up">
                  <button onClick={() => onSelect(conv.id, partner.id)} className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all text-left group ${isActive ? "bg-brand-600/20 border border-brand-500/30" : "hover:bg-surface-800 border border-transparent"}`}>
                    <div className="relative shrink-0">
                      {/* 🔴 Fixed Image URL for Conversations List */}
                      <img src={getImageUrl(partner.image, partner.name)} alt={partner.name} className="w-10 h-10 rounded-full object-cover bg-slate-700" />
                      {partner.isOnline && <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-surface-900 rounded-full"></span>}
                    </div>
                    <div className="flex-1 min-w-0">
                      <span className={`text-sm font-semibold truncate ${isActive ? "text-white" : "text-surface-200"}`}>{partner.name}</span>
                      <p className="text-xs truncate text-surface-500 mt-0.5">{lastMessageBody}</p>
                    </div>
                  </button>
                </li>
              );
            })}
          </>
        )}
      </ul>
    </aside>
  );
}