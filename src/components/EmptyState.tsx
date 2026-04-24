import React from "react";
import { MessageCircle } from "lucide-react";

export const EmptyState: React.FC<{
  title: string;
  description: string;
}> = ({ title, description }) => {
  return (
    <div className="flex items-center justify-center h-full w-full">
      <div className="text-center">
        <MessageCircle size={48} className="text-slate-600 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white">{title}</h3>
        <p className="text-sm text-slate-400 mt-2">{description}</p>
      </div>
    </div>
  );
};
