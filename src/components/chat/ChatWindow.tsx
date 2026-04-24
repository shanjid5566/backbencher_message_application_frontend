"use client";

import { useRef, useEffect, useState } from "react";
import MessageBubble from "./MessageBubble";
import Avatar from "@/components/ui/Avatar";
import {
  ArrowLeft,
  Phone,
  Video,
  Paperclip,
  Smile,
  Send,
  MoreHorizontal,
  Loader2,
} from "lucide-react";
import EmojiPicker, { Theme } from "emoji-picker-react";
import { useMessages } from "@/hooks/useMessages";
import { authClient } from "@/lib/auth-client";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";
import { useConversations } from "@/hooks/useConversations";
import EmptyChat from "./EmptyChat";

interface ChatWindowProps {
  conversationId: string | null;
  receiverId: string | null;
  onBack: () => void;
  socket: any;
}

export default function ChatWindow({ conversationId, receiverId, onBack, socket }: ChatWindowProps) {
  const { data: session } = authClient.useSession();
  const { data: messages, isLoading } = useMessages(conversationId);
  const { data: conversations } = useConversations();
  const queryClient = useQueryClient();

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState("");
  const [showEmoji, setShowEmoji] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const formatLastSeen = (dateString: string | null | undefined) => {
    if (!dateString) return "a while ago";
    try {
      const date = new Date(dateString);
      const isToday = new Date().toDateString() === date.toDateString();
      if (isToday) {
        return `today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
      }
      return `${date.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
    } catch (e) {
      return "a while ago";
    }
  };

  // Close emoji picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(event.target as Node)) {
        setShowEmoji(false);
      }
    };

    if (showEmoji) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showEmoji]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Listen to new messages and typing status
  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleNewMessage = (newMessage: any) => {
      if (newMessage.conversationId === conversationId) {
        queryClient.setQueryData(["messages", conversationId], (oldMessages: any) => {
          if (!oldMessages) return [newMessage];
          return [...oldMessages, newMessage]; 
        });
      }
    };

    const handleTyping = (data: any) => {
      if (data.conversationId === conversationId) setIsTyping(true);
    };

    const handleStopTyping = (data: any) => {
      if (data.conversationId === conversationId) setIsTyping(false);
    };

    socket.on("new_message", handleNewMessage);
    socket.on("user_typing", handleTyping);
    socket.on("user_stopped_typing", handleStopTyping);

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("user_typing", handleTyping);
      socket.off("user_stopped_typing", handleStopTyping);
    };
  }, [socket, conversationId, queryClient]);

  if (!conversationId) {
    return <EmptyChat />;
  }

  const conversation = conversations?.find((c) => c.id === conversationId);
  const partner = conversation?.users[0];

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputValue.trim() || !conversationId) return;

    setIsSending(true);
    try {
      await api.post("/messages/send-text", {
        conversationId,
        body: inputValue,
      });

      setInputValue("");
      
      if (socket && receiverId) {
        socket.emit("stop_typing", { receiverId, conversationId });
      }

      queryClient.invalidateQueries({ queryKey: ["messages", conversationId] });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    } catch (error) {
      console.error("Failed to send message:", error);
      alert("Failed to send message!");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="flex flex-col flex-1 w-full h-full bg-surface-950 animate-slide-right md:animate-none">
      {/* ── Chat Header ── */}
      <header className="flex items-center gap-3 px-4 py-3 border-b border-surface-700/50 bg-surface-900/80 backdrop-blur-sm flex-shrink-0">
        <button
          onClick={onBack}
          className="md:hidden w-8 h-8 rounded-full hover:bg-surface-700 flex items-center justify-center transition-colors flex-shrink-0"
          aria-label="Back to conversations"
        >
          <ArrowLeft size={18} className="text-surface-300" />
        </button>

        {partner ? (
          <>
            <Avatar 
               user={{
                 id: partner.id, 
                 name: partner.name, 
                 avatarUrl: partner.image || "https://avatar.iran.liara.run/public", 
                 isOnline: partner.isOnline, 
                 lastSeen: partner.lastSeen 
               } as any} 
               size="md" 
               showStatus 
            />
            <div className="flex-1 min-w-0">
              <h2 className="text-sm font-semibold text-white truncate">
                {partner.name}
              </h2>
              <p className="text-xs text-surface-400">
                {partner.isOnline ? (
                  <span className="flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-online inline-block" />
                    Active now
                  </span>
                ) : (
                  `Last seen ${formatLastSeen(partner.lastSeen)}`
                )}
              </p>
            </div>
          </>
        ) : (
           <div className="flex-1"></div>
        )}

        <div className="flex items-center gap-1">
          <ActionBtn icon={<Phone size={17} />} label="Voice call" />
          <ActionBtn icon={<Video size={17} />} label="Video call" />
          <ActionBtn icon={<MoreHorizontal size={17} />} label="More" />
        </div>
      </header>

      {/* ── Message Area ── */}
      <main className="flex-1 overflow-y-auto px-4 py-5 space-y-1">
        <div className="flex justify-center mb-4">
          <span className="text-[11px] text-surface-500 bg-surface-800 px-3 py-1 rounded-full">
            Today
          </span>
        </div>

        {isLoading ? (
          <div className="flex flex-col gap-4 mt-4 px-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div 
                key={i} 
                className={`flex w-full ${i % 2 === 0 ? "justify-start" : "justify-end"}`}
              >
                <div 
                  className={`h-12 w-2/3 sm:w-1/2 rounded-2xl animate-pulse ${
                    i % 2 === 0 
                      ? "bg-surface-800 rounded-bl-none" 
                      : "bg-surface-700/50 rounded-br-none"
                  }`} 
                />
              </div>
            ))}
          </div>
        ) : (
          messages?.map((msg: any) => {
             const isMe = msg.sender?.id === session?.user?.id;
             return (
               <MessageBubble
                 key={msg.id}
                 message={{
                   id: msg.id,
                   senderId: msg.sender?.id,
                   text: msg.body || "",
                   timestamp: msg.createdAt,
                   status: "read",
                 }}
                 isOwn={isMe}
               />
             );
          })
        )}

        {isTyping && partner && (
          <div className="flex items-end gap-2 mt-2 animate-fade-in-up">
            <Avatar 
              user={{...partner} as any} 
              size="sm" 
            />
            <div className="bg-surface-800 rounded-t-2xl rounded-br-2xl rounded-bl-md px-4 py-3 flex gap-1 items-center">
              {[0, 1, 2].map((i) => (
                <span
                  key={i}
                  className="w-1.5 h-1.5 rounded-full bg-surface-500"
                  style={{
                    animation: "pulse-dot 1.2s ease-in-out infinite",
                    animationDelay: `${i * 0.2}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </main>

      {/* ── Input Area ── */}
      <footer className="flex-shrink-0 px-4 py-3 border-t border-surface-700/50 bg-surface-900/80 backdrop-blur-sm">
        <form
          onSubmit={handleSend}
          className="flex items-center gap-2 bg-surface-800 rounded-2xl px-3 py-2 border border-surface-700/50 focus-within:border-brand-500/50 transition-all"
        >
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-8 h-8 rounded-full hover:bg-surface-700 flex items-center justify-center transition-colors shrink-0"
            aria-label="Attach file"
          >
            <Paperclip size={17} className="text-surface-400" />
          </button>
          <input 
            type="file" 
            ref={fileInputRef} 
            accept="image/*,video/*" 
            className="hidden" 
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                console.log("File selected:", e.target.files[0].name);
              }
            }}
          />

          <input
            type="text"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              if (!socket || !receiverId) return;
              socket.emit("typing", { receiverId, conversationId });
              if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
              typingTimeoutRef.current = setTimeout(() => {
                socket.emit("stop_typing", { receiverId, conversationId });
              }, 2000);
            }}
            disabled={isSending}
            placeholder="Type a message..."
            className="flex-1 bg-transparent text-sm text-surface-200 placeholder:text-surface-500 outline-none py-1"
          />

          <div className="relative flex items-center justify-center" ref={emojiRef}>
            <button
              type="button"
              onClick={() => setShowEmoji((prev) => !prev)}
              className="w-8 h-8 rounded-full hover:bg-surface-700 flex items-center justify-center transition-colors shrink-0"
              aria-label="Emoji"
            >
              <Smile size={17} className="text-surface-400" />
            </button>
            
            {showEmoji && (
              <div className="absolute bottom-12 right-[-20px] sm:right-0 z-50 animate-scale-in origin-bottom-right w-[300px] sm:w-[350px]">
                <EmojiPicker 
                  theme={Theme.DARK} 
                  width="100%"
                  onEmojiClick={(emojiObj) => {
                    setInputValue((prev) => prev + emojiObj.emoji);
                  }}
                />
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={!inputValue.trim() || isSending}
            className="w-8 h-8 rounded-full bg-brand-600 hover:bg-brand-500 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center transition-all flex-shrink-0"
            aria-label="Send message"
          >
            {isSending ? (
              <Loader2 size={15} className="text-white animate-spin" />
            ) : (
              <Send size={15} className="text-white translate-x-px" />
            )}
          </button>
        </form>
      </footer>
    </div>
  );
}

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
