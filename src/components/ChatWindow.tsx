"use client";

import React, { useState, useRef, useEffect } from "react";
import { Phone, Video, Info, Send, Paperclip, ArrowLeft } from "lucide-react";
import { MessageBubble } from "./MessageBubble";

interface Message {
  id: string;
  text: string;
  isSender: boolean;
  timestamp: string;
  senderName?: string;
}

interface ChatWindowProps {
  conversationName: string;
  conversationAvatar: string;
  conversationOnline: boolean;
  messages: Message[];
  onBack?: () => void;
  showBackButton?: boolean;
}

export const ChatWindow: React.FC<ChatWindowProps> = ({
  conversationName,
  conversationAvatar,
  conversationOnline,
  messages,
  onBack,
  showBackButton = false,
}) => {
  const [inputValue, setInputValue] = useState("");
  const [messagesToShow, setMessagesToShow] = useState(messages);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messagesToShow]);

  const handleSendMessage = () => {
    if (inputValue.trim()) {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: inputValue,
        isSender: true,
        timestamp: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
      setMessagesToShow([...messagesToShow, newMessage]);
      setInputValue("");

      // Simulate reply after 1 second
      setTimeout(() => {
        const reply: Message = {
          id: (Date.now() + 1).toString(),
          text: "Thanks for the message! I'm just a demo bot 🤖",
          isSender: false,
          timestamp: new Date().toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          }),
        };
        setMessagesToShow((prev) => [...prev, reply]);
      }, 1000);
    }
  };

  return (
    <div className="flex flex-col h-full w-full bg-slate-900">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-slate-800 bg-slate-800/50 backdrop-blur-sm">
        <div className="flex items-center gap-3">
          {showBackButton && (
            <button
              onClick={onBack}
              className="md:hidden p-2 hover:bg-slate-700 rounded-full transition-colors"
            >
              <ArrowLeft size={20} className="text-white" />
            </button>
          )}
          <div className="relative">
            <img
              src={conversationAvatar}
              alt={conversationName}
              className="w-10 h-10 rounded-full object-cover"
            />
            {conversationOnline && (
              <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 rounded-full border-2 border-slate-800" />
            )}
          </div>
          <div>
            <h2 className="text-sm font-semibold text-white">
              {conversationName}
            </h2>
            <p className="text-xs text-slate-400">
              {conversationOnline ? "Active now" : "Active 2h ago"}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="hidden md:flex items-center gap-2">
          <button className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
            <Phone size={18} />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
            <Video size={18} />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
            <Info size={18} />
          </button>
        </div>

        {/* Mobile Action Buttons */}
        <div className="md:hidden flex items-center gap-1">
          <button className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
            <Phone size={18} />
          </button>
          <button className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white">
            <Video size={18} />
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messagesToShow.length === 0 ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="text-center">
              <img
                src={conversationAvatar}
                alt={conversationName}
                className="w-16 h-16 rounded-full mx-auto mb-4 object-cover"
              />
              <p className="text-sm font-semibold text-white">
                {conversationName}
              </p>
              <p className="text-xs text-slate-400 mt-1">
                This is the beginning of your conversation
              </p>
            </div>
          </div>
        ) : (
          messagesToShow.map((message) => (
            <MessageBubble
              key={message.id}
              message={message.text}
              isSender={message.isSender}
              timestamp={message.timestamp}
              senderName={message.senderName}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 border-t border-slate-800 bg-slate-800/30">
        <div className="flex items-center gap-2">
          <button className="p-2 hover:bg-slate-700 rounded-full transition-colors text-slate-400 hover:text-white flex-shrink-0">
            <Paperclip size={18} />
          </button>
          <input
            type="text"
            placeholder="Write a message..."
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSendMessage();
              }
            }}
            className="flex-1 bg-slate-800 text-white placeholder-slate-500 rounded-full px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
          />
          <button
            onClick={handleSendMessage}
            className="p-2 bg-blue-600 hover:bg-blue-700 rounded-full transition-colors text-white flex-shrink-0"
          >
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};
