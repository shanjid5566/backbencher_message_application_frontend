"use client";

import { Message } from "@/types/chat";
import { CheckCheck, Check } from "lucide-react";

interface MessageBubbleProps {
  message: Message;
  isOwn: boolean;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function StatusIcon({ status }: { status?: Message["status"] }) {
  if (status === "read")
    return <CheckCheck size={13} className="text-brand-400" />;
  if (status === "delivered")
    return <CheckCheck size={13} className="text-surface-400" />;
  if (status === "sent")
    return <Check size={13} className="text-surface-400" />;
  return null;
}

export default function MessageBubble({ message, isOwn }: MessageBubbleProps) {
  return (
    <div
      className={`flex w-full mb-2 ${isOwn ? "justify-end" : "justify-start"}`}
    >
      <div
        className={`
          group relative max-w-[72%] sm:max-w-[60%] px-4 py-2.5 
          text-sm leading-relaxed select-text
          ${
            isOwn
              ? "bg-brand-600 text-white rounded-t-2xl rounded-bl-2xl rounded-br-md"
              : "bg-surface-800 text-surface-200 rounded-t-2xl rounded-br-2xl rounded-bl-md"
          }
        `}
      >
        {/* Message text */}
        <p className="break-words">{message.text}</p>

        {/* Timestamp + status */}
        <div
          className={`flex items-center gap-1 mt-1 ${
            isOwn ? "justify-end" : "justify-start"
          }`}
        >
          <span
            className={`text-[10px] ${isOwn ? "text-brand-300" : "text-surface-500"}`}
          >
            {formatTime(message.timestamp)}
          </span>
          {isOwn && <StatusIcon status={message.status} />}
        </div>
      </div>
    </div>
  );
}
