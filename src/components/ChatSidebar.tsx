"use client";

import React, { useState } from "react";
import { Search, Plus } from "lucide-react";

interface OnlineUser {
  id: string;
  name: string;
  avatar: string;
  online: boolean;
}

interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  timestamp: string;
  unread: number;
  online: boolean;
}

interface ChatSidebarProps {
  conversations: Conversation[];
  onlineUsers: OnlineUser[];
  selectedConversationId?: string | null;
  onSelectConversation: (id: string) => void;
  onHideSidebar?: () => void;
}

export const ChatSidebar: React.FC<ChatSidebarProps> = ({
  conversations,
  onlineUsers,
  selectedConversationId,
  onSelectConversation,
  onHideSidebar,
}) => {
  const [searchQuery, setSearchQuery] = useState("");

  const filteredConversations = conversations.filter((conv) =>
    conv.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col h-full w-full bg-slate-900 border-r border-slate-800">
      {/* Header */}
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-2xl font-bold text-white">Messages</h1>
          <button className="p-2 hover:bg-slate-800 rounded-full transition-colors">
            <Plus size={20} className="text-slate-400" />
          </button>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search
            size={18}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
          />
          <input
            type="text"
            placeholder="Search conversations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-slate-800 text-white placeholder-slate-500 rounded-lg pl-10 pr-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
        </div>
      </div>

      {/* Online Users (Horizontal Scroll) */}
      {onlineUsers.length > 0 && (
        <div className="px-4 py-3 border-b border-slate-800">
          <p className="text-xs font-semibold text-slate-400 mb-3 uppercase">
            Active Now
          </p>
          <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
            {onlineUsers.map((user) => (
              <div
                key={user.id}
                className="flex flex-col items-center gap-1 flex-shrink-0 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <div className="relative">
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                </div>
                <p className="text-xs text-slate-300 text-center max-w-[50px] truncate">
                  {user.name.split(" ")[0]}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Conversations List */}
      <div className="flex-1 overflow-y-auto">
        {filteredConversations.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <p className="text-sm">No conversations found</p>
          </div>
        ) : (
          filteredConversations.map((conversation) => (
            <div
              key={conversation.id}
              onClick={() => {
                onSelectConversation(conversation.id);
                onHideSidebar?.();
              }}
              className={`p-3 border-b border-slate-800 cursor-pointer transition-all hover:bg-slate-800 ${
                selectedConversationId === conversation.id
                  ? "bg-slate-800"
                  : "hover:bg-slate-800/50"
              }`}
            >
              <div className="flex gap-3 items-start">
                {/* Avatar with Online Indicator */}
                <div className="relative flex-shrink-0">
                  <img
                    src={conversation.avatar}
                    alt={conversation.name}
                    className="w-12 h-12 rounded-full object-cover"
                  />
                  {conversation.online && (
                    <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-slate-900" />
                  )}
                </div>

                {/* Conversation Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="text-sm font-semibold text-white truncate">
                      {conversation.name}
                    </h3>
                    <span className="text-xs text-slate-400 flex-shrink-0">
                      {conversation.timestamp}
                    </span>
                  </div>
                  <div className="flex items-center justify-between gap-2 mt-1">
                    <p className="text-xs text-slate-400 truncate">
                      {conversation.lastMessage}
                    </p>
                    {conversation.unread > 0 && (
                      <span className="flex-shrink-0 bg-blue-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
                        {conversation.unread}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
