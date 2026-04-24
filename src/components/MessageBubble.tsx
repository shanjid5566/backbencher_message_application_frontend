import React from "react";

interface MessageBubbleProps {
  message: string;
  isSender: boolean;
  timestamp?: string;
  senderName?: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isSender,
  timestamp,
  senderName,
}) => {
  return (
    <div className={`flex gap-2 ${isSender ? "justify-end" : "justify-start"}`}>
      <div
        className={`max-w-xs md:max-w-md lg:max-w-lg px-4 py-2 rounded-lg ${
          isSender
            ? "bg-blue-600 text-white rounded-br-none"
            : "bg-slate-700 text-slate-100 rounded-bl-none"
        }`}
      >
        {senderName && !isSender && (
          <p className="text-xs font-semibold text-slate-300 mb-1">
            {senderName}
          </p>
        )}
        <p className="break-words text-sm">{message}</p>
        {timestamp && (
          <p className="text-xs opacity-70 mt-1">{timestamp}</p>
        )}
      </div>
    </div>
  );
};
