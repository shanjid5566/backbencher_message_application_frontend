"use client";

import { useState, useEffect } from "react";
import { X, Ban, Image as ImageIcon, FileText, Loader2, CheckCircle } from "lucide-react";
import api from "@/lib/axios";
import Avatar from "@/components/ui/Avatar";

interface ChatDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  partner: any;
  conversationId: string;
}

export default function ChatDetailsModal({ isOpen, onClose, partner, conversationId }: ChatDetailsModalProps) {
  const [activeTab, setActiveTab] = useState<"media" | "options">("media");
  const [mediaFiles, setMediaFiles] = useState<any[]>([]);
  const [isLoadingMedia, setIsLoadingMedia] = useState(false);
  
  // Block/Unblock State
  const [isBlocked, setIsBlocked] = useState(false); // (বাস্তবে এটা ব্যাকএন্ড থেকে ইনিশিয়াল স্ট্যাটাস হিসেবে আসবে)
  const [isBlocking, setIsBlocking] = useState(false);

  useEffect(() => {
    if (isOpen && activeTab === "media") {
      fetchSharedMedia();
    }
  }, [isOpen, activeTab, conversationId]);

  const fetchSharedMedia = async () => {
    setIsLoadingMedia(true);
    try {
      const res = await api.get(`/messages/${conversationId}/media`);
      setMediaFiles(res.data.data);
    } catch (error) {
      console.error("Failed to fetch media", error);
    } finally {
      setIsLoadingMedia(false);
    }
  };

  const handleBlockToggle = async () => {
    setIsBlocking(true);
    try {
      if (isBlocked) {
        await api.post("/users/unblock", { targetUserId: partner.id });
        setIsBlocked(false);
      } else {
        await api.post("/users/block", { targetUserId: partner.id });
        setIsBlocked(true);
      }
    } catch (error) {
      console.error("Failed to toggle block status", error);
      alert("Something went wrong!");
    } finally {
      setIsBlocking(false);
    }
  };

  const getImageUrl = (imagePath?: string | null, fallbackName?: string) => {
    if (!imagePath) return `https://ui-avatars.com/api/?name=${fallbackName || "User"}&background=random`;
    if (imagePath.startsWith("http")) return imagePath;
    return `http://localhost:5000/${imagePath.replace(/\\/g, "/")}`;
  };

  if (!isOpen || !partner) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-900 border border-surface-700/50 w-full max-w-sm rounded-3xl shadow-2xl flex flex-col animate-scale-in overflow-hidden h-[600px] max-h-full">
        
        {/* Header & Profile Summary */}
        <div className="p-6 border-b border-surface-700/50 flex flex-col items-center relative bg-surface-800/30">
          <button onClick={onClose} className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full hover:bg-surface-700 text-surface-400 transition">
            <X size={18} />
          </button>
          
          <Avatar user={{...partner, avatarUrl: getImageUrl(partner.image, partner.name)} as any} size="xl" showStatus className="mb-3" />
          <h2 className="text-xl font-bold text-white">{partner.name}</h2>
          <p className="text-sm text-surface-400">{partner.isOnline ? "Active Now" : "Offline"}</p>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-surface-700/50 flex-shrink-0">
          <button 
            onClick={() => setActiveTab("media")}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === "media" ? "text-brand-400 border-b-2 border-brand-400" : "text-surface-400 hover:text-surface-200"}`}
          >
            <ImageIcon size={16} /> Shared Media
          </button>
          <button 
            onClick={() => setActiveTab("options")}
            className={`flex-1 py-3 text-sm font-semibold flex items-center justify-center gap-2 transition-colors ${activeTab === "options" ? "text-brand-400 border-b-2 border-brand-400" : "text-surface-400 hover:text-surface-200"}`}
          >
            <Ban size={16} /> Options
          </button>
        </div>

        {/* Body content (Scrollable) */}
        <div className="flex-1 overflow-y-auto p-4">
          
          {/* MEDIA TAB */}
          {activeTab === "media" && (
            <div className="space-y-4">
              {isLoadingMedia ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-surface-500" /></div>
              ) : mediaFiles.length === 0 ? (
                <div className="text-center py-10 text-surface-500 text-sm">No shared media found.</div>
              ) : (
                <div className="grid grid-cols-3 gap-2">
                  {mediaFiles.map((file) => (
                    <div key={file.id} className="aspect-square rounded-lg overflow-hidden bg-surface-800 border border-surface-700 group relative">
                      {(file.fileType === "IMAGE" || file.fileType?.includes("image")) ? (
                        <a href={getImageUrl(file.fileUrl)} target="_blank" rel="noopener noreferrer">
                          <img src={getImageUrl(file.fileUrl)} alt="Shared" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                        </a>
                      ) : (
                        <a href={getImageUrl(file.fileUrl)} target="_blank" rel="noopener noreferrer" className="w-full h-full flex flex-col items-center justify-center text-surface-400 hover:text-brand-400 transition-colors">
                          <FileText size={24} className="mb-1" />
                          <span className="text-[10px] font-medium">DOCUMENT</span>
                        </a>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* OPTIONS TAB */}
          {activeTab === "options" && (
            <div className="space-y-4 pt-2">
              <div className="bg-surface-800 rounded-2xl p-4 border border-surface-700/50">
                <h3 className="text-sm font-semibold text-white mb-2">Privacy & Support</h3>
                <p className="text-xs text-surface-400 mb-4">
                  {isBlocked 
                    ? "You have blocked this user. They cannot send you messages or call you." 
                    : "Blocking a user prevents them from sending you messages or calling you."}
                </p>
                <button 
                  onClick={handleBlockToggle}
                  disabled={isBlocking}
                  className={`w-full py-2.5 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 transition disabled:opacity-50 ${isBlocked ? "bg-surface-700 text-white hover:bg-surface-600" : "bg-red-500/10 text-red-500 hover:bg-red-500/20"}`}
                >
                  {isBlocking ? <Loader2 size={16} className="animate-spin" /> : isBlocked ? <CheckCircle size={16} /> : <Ban size={16} />}
                  {isBlocked ? "Unblock User" : "Block User"}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}