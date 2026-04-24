"use client";

import React, { useState } from "react";
import { ChatSidebar } from "@/components/ChatSidebar";
import { ChatWindow } from "@/components/ChatWindow";

// Mock data
const MOCK_ONLINE_USERS = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    online: true,
  },
  {
    id: "2",
    name: "Alex Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    online: true,
  },
  {
    id: "3",
    name: "Emma Wilson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    online: true,
  },
  {
    id: "4",
    name: "Michael Brown",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Michael",
    online: true,
  },
  {
    id: "5",
    name: "Jessica Davis",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Jessica",
    online: true,
  },
];

const MOCK_CONVERSATIONS = [
  {
    id: "1",
    name: "Sarah Chen",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah",
    lastMessage: "That sounds perfect! Let's meet tomorrow at 10am",
    timestamp: "10:30 AM",
    unread: 0,
    online: true,
  },
  {
    id: "2",
    name: "Tech Team",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=TechTeam",
    lastMessage: "You: The presentation looks great!",
    timestamp: "9:15 AM",
    unread: 3,
    online: false,
  },
  {
    id: "3",
    name: "Alex Johnson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alex",
    lastMessage: "Hey! How's the project going?",
    timestamp: "Yesterday",
    unread: 0,
    online: true,
  },
  {
    id: "4",
    name: "Project Alpha",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Alpha",
    lastMessage: "Design files are ready for review",
    timestamp: "2 days ago",
    unread: 2,
    online: false,
  },
  {
    id: "5",
    name: "Emma Wilson",
    avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Emma",
    lastMessage: "Thanks for the update!",
    timestamp: "3 days ago",
    unread: 0,
    online: false,
  },
];

const MOCK_MESSAGES = [
  {
    id: "1",
    text: "Hey! How are you doing?",
    isSender: false,
    timestamp: "10:15 AM",
    senderName: "Sarah Chen",
  },
  {
    id: "2",
    text: "I'm doing great! Just finished the project",
    isSender: true,
    timestamp: "10:20 AM",
  },
  {
    id: "3",
    text: "That's awesome! I'd love to see it",
    isSender: false,
    timestamp: "10:22 AM",
    senderName: "Sarah Chen",
  },
  {
    id: "4",
    text: "Sure! I'll send you the link shortly",
    isSender: true,
    timestamp: "10:23 AM",
  },
  {
    id: "5",
    text: "That sounds perfect! Let's meet tomorrow at 10am",
    isSender: false,
    timestamp: "10:30 AM",
    senderName: "Sarah Chen",
  },
];

export default function ChatLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [selectedConversationId, setSelectedConversationId] = useState<
    string | null
  >("1");
  const [showSidebarOnMobile, setShowSidebarOnMobile] = useState(true);

  const selectedConversation =
    MOCK_CONVERSATIONS.find((c) => c.id === selectedConversationId) ||
    MOCK_CONVERSATIONS[0];

  const handleSelectConversation = (id: string) => {
    setSelectedConversationId(id);
    // Hide sidebar on mobile when conversation is selected
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setShowSidebarOnMobile(false);
    }
  };

  const handleBack = () => {
    setShowSidebarOnMobile(true);
    setSelectedConversationId(null);
  };

  return (
    <div className="h-screen flex flex-col md:flex-row bg-slate-900 overflow-hidden">
      {/* Sidebar - Desktop: Always visible, Mobile: Conditionally visible */}
      <div
        className={`w-full md:w-80 h-full md:h-screen border-r border-slate-800 flex-shrink-0 ${
          showSidebarOnMobile ? "flex" : "hidden md:flex"
        }`}
      >
        <ChatSidebar
          conversations={MOCK_CONVERSATIONS}
          onlineUsers={MOCK_ONLINE_USERS}
          selectedConversationId={selectedConversationId}
          onSelectConversation={handleSelectConversation}
          onHideSidebar={() => setShowSidebarOnMobile(false)}
        />
      </div>

      {/* Chat Window - Desktop: Always visible, Mobile: Only when conversation selected */}
      <div
        className={`flex-1 h-full ${
          showSidebarOnMobile ? "hidden md:flex" : "flex"
        }`}
      >
        {selectedConversationId || !showSidebarOnMobile ? (
          <ChatWindow
            key={selectedConversationId}
            conversationName={selectedConversation.name}
            conversationAvatar={selectedConversation.avatar}
            conversationOnline={selectedConversation.online}
            messages={MOCK_MESSAGES}
            onBack={handleBack}
            showBackButton={true}
          />
        ) : (
          <div className="hidden md:flex items-center justify-center w-full h-full bg-slate-900">
            <div className="text-center">
              <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center mx-auto mb-4">
                <span className="text-white font-bold text-2xl">M</span>
              </div>
              <h2 className="text-xl font-semibold text-white">
                Welcome to Messenger
              </h2>
              <p className="text-slate-400 text-sm mt-2">
                Select a conversation to start chatting
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
