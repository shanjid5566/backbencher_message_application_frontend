"use client";

import { useState } from "react";
import { CheckCheck, Check, Trash2, MoreVertical, PhoneMissed, PhoneCall } from "lucide-react";

interface MessageBubbleProps {
  message: {
    id: string;
    senderId: string;
    text: string;
    timestamp: string;
    status: "SENT" | "DELIVERED" | "SEEN" | string;
    fileUrl?: string | null;
    fileType?: string | null;
    type?: "TEXT" | "FILE" | "CALL_LOG" | string;
  };
  isOwn: boolean;
  onDeleteForMe?: (id: string) => void;
  onDeleteForEveryone?: (id: string) => void;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusIcon({ status }: { status?: string }) {
  if (status === "SEEN") return <CheckCheck size={14} className="text-blue-400" />;
  if (status === "DELIVERED") return <CheckCheck size={14} className="text-surface-400" />;
  return <Check size={14} className="text-surface-400" />;
}

export default function MessageBubble({ message, isOwn, onDeleteForMe, onDeleteForEveryone }: MessageBubbleProps) {
  const [showMenu, setShowMenu] = useState(false);

  // System Message (Call Log)
  if (message.type === "CALL_LOG") {
    const isMissed = message.text.includes("Missed");
    return (
      <div className="flex w-full mb-3 justify-center">
        <div className="bg-surface-800/80 border border-surface-700/50 px-4 py-2 rounded-full flex items-center gap-3 text-sm animate-fade-in-up">
          {isMissed ? <PhoneMissed size={16} className="text-red-400" /> : <PhoneCall size={16} className="text-green-400" />}
          <span className="text-surface-300">{message.text}</span>
          <span className="text-[10px] text-surface-500 ml-2">{formatTime(message.timestamp)}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`flex w-full mb-2 ${isOwn ? "justify-end" : "justify-start"} group`}>
      
      {/* Tight container, relative position goes here */}
      <div className="relative max-w-[72%] sm:max-w-[60%] flex">

        {/* Delete Menu (Three Dot) - now positioned right next to the bubble */}
        <div className={`absolute top-1 ${isOwn ? "-left-10" : "-right-10"} opacity-0 group-hover:opacity-100 transition-opacity z-20`}>
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="w-8 h-8 rounded-full hover:bg-surface-800 flex items-center justify-center text-surface-400 transition"
            >
              <MoreVertical size={16} />
            </button>
            
            {showMenu && (
              <div className={`absolute top-8 ${isOwn ? "right-0" : "left-0"} w-48 bg-surface-800 border border-surface-700 rounded-xl shadow-2xl py-1 animate-scale-in`}>
                <button 
                  onClick={() => { onDeleteForMe?.(message.id); setShowMenu(false); }}
                  className="w-full text-left px-4 py-2 text-sm text-surface-200 hover:bg-surface-700 flex items-center gap-2"
                >
                  <Trash2 size={14} className="text-surface-400" /> Delete for me
                </button>
                {isOwn && (
                  <button 
                    onClick={() => { onDeleteForEveryone?.(message.id); setShowMenu(false); }}
                    className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-surface-700 flex items-center gap-2"
                  >
                    <Trash2 size={14} className="text-red-400" /> Delete for everyone
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* 💬 Main Message Bubble */}
        <div className={`px-4 py-2.5 text-sm leading-relaxed select-text shadow-sm w-full ${
            isOwn ? "bg-brand-600 text-white rounded-t-2xl rounded-bl-2xl rounded-br-sm"
                  : "bg-surface-800 text-surface-200 rounded-t-2xl rounded-br-2xl rounded-bl-sm"
          }`}
        >
          {/* Attachment (Image/File) */}
          {message.fileUrl && (
            <div className="mb-2 overflow-hidden rounded-md">
              {message.fileType === "IMAGE" || message.fileType?.includes("image") ? (
                <img src={message.fileUrl} alt="Attachment" className="max-w-full sm:max-w-[300px] rounded-lg object-cover" />
              ) : (
                <a href={message.fileUrl} target="_blank" rel="noopener noreferrer" className={`flex items-center gap-2 p-3 rounded-lg hover:bg-black/20 transition text-sm ${isOwn ? "bg-black/10" : "bg-black/20"}`}>
                  <span>📎</span> <span className="underline truncate">Download File</span>
                </a>
              )}
            </div>
          )}

          {/* Text */}
          {message.text && <p className="break-words whitespace-pre-wrap">{message.text}</p>}

          {/* Timestamp & Status (Blue Ticks) */}
          <div className={`flex items-center gap-1.5 mt-1 ${isOwn ? "justify-end" : "justify-start"}`}>
            <span className={`text-[10px] ${isOwn ? "text-brand-200" : "text-surface-500"}`}>
              {formatTime(message.timestamp)}
            </span>
            {isOwn && <StatusIcon status={message.status} />}
          </div>
        </div>

      </div>

      {/* Close menu when clicking outside (invisible overlay) */}
      {showMenu && <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />}
    </div>
  );
}