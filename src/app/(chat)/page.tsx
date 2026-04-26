// "use client";

// import { useState, useRef } from "react";
// import { useRouter } from "next/navigation";
// import ChatSidebar from "@/components/chat/ChatSidebar";
// import ChatWindow from "@/components/chat/ChatWindow";
// import EmptyChat from "@/components/chat/EmptyChat";
// import Avatar from "@/components/ui/Avatar";
// import { LogOut, History, Settings } from "lucide-react";
// import { authClient } from "@/lib/auth-client";
// import { useSocket } from "@/hooks/useSocket";
// import api from "@/lib/axios";
// import { useQueryClient } from "@tanstack/react-query";

// import CallWindow from "@/components/CallWindow";
// import CallHistoryModal from "@/components/chat/CallHistoryModal";
// import SettingsModal from "@/components/chat/SettingsModal";
// import { useVideoCall } from "@/hooks/useVideoCall";

// export default function ChatPage() {
//   const router = useRouter();
//   const { data: session } = authClient.useSession();
//   const socket = useSocket(session?.user?.id);
//   const queryClient = useQueryClient();

//   const [activeConvId, setActiveConvId] = useState<string | null>(null);
//   const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
//   const [mobileView, setMobileView] = useState<"sidebar" | "window">("sidebar");

//   // Keep a ref so socket callbacks always get the fresh value
//   const activeConvIdRef = useRef<string | null>(null);
//   const activePartnerIdRef = useRef<string | null>(null);

//   const [isCallHistoryOpen, setIsCallHistoryOpen] = useState(false);
//   const [isSettingsOpen, setIsSettingsOpen] = useState(false);

//   const handleSelectConversation = (id: string, partnerId?: string) => {
//     setActiveConvId(id);
//     activeConvIdRef.current = id;
//     if (partnerId) {
//       setActivePartnerId(partnerId);
//       activePartnerIdRef.current = partnerId;
//     }
//     setMobileView("window");
//   };

//   const handleBack = () => {
//     setMobileView("sidebar");
//   };

//   // Save a call-log message to the conversation.
//   // If the receiver is not inside the conversation, we look it up by partnerId.
//   const handleLogCall = async (body: string) => {
//     let convId = activeConvIdRef.current;

//     // Receiver side: convId may be null if they haven't opened the chat yet.
//     // Try to find (or create) the conversation via the partner.
//     if (!convId && activePartnerIdRef.current) {
//       try {
//         const convRes = await api.get(`/conversations/find/${activePartnerIdRef.current}`);
//         convId = convRes.data?.data?.id || null;
//       } catch {
//         // If no endpoint exists, skip silently
//       }
//     }

//     if (!convId) return;

//     try {
//       const res = await api.post("/messages/send-text", {
//         conversationId: convId,
//         body,
//         type: "CALL_LOG",
//       });
//       queryClient.setQueryData(["messages", convId], (old: any) => {
//         if (!old) return [res.data.data];
//         return [...old, res.data.data];
//       });
//       queryClient.invalidateQueries({ queryKey: ["conversations"] });
//     } catch (error) {
//       console.error("Failed to log call message", error);
//     }
//   };

//   const {
//     isReceivingCall,
//     isCallAccepted,
//     isDialing,
//     callerInfo,
//     localVideoRef,
//     remoteVideoRef,
//     callType,
//     initiateCall,
//     acceptCall,
//     rejectCall,
//     endCall,
//     toggleAudio,
//     toggleVideo,
//     isAudioMuted,
//     isVideoOff,
//   } = useVideoCall(socket, session?.user?.id, session?.user?.name, handleLogCall);

//   // When a call is incoming, store the caller as the active partner so we can
//   // log the missed call message even if the user hasn't opened that conversation.
//   // We listen to callerInfo changes via the hook.
//   const prevCallerRef = useRef<string | null>(null);
//   if (callerInfo && callerInfo.id !== prevCallerRef.current) {
//     prevCallerRef.current = callerInfo.id;
//     activePartnerIdRef.current = callerInfo.id;
//   }

//   return (
//     <div className="flex h-screen overflow-hidden bg-surface-950 relative">

//       <CallWindow
//         isReceivingCall={isReceivingCall}
//         isCallAccepted={isCallAccepted}
//         isDialing={isDialing}
//         callerName={callerInfo?.name}
//         localVideoRef={localVideoRef}
//         remoteVideoRef={remoteVideoRef}
//         callType={callType as any}
//         onAcceptCall={acceptCall}
//         onRejectCall={rejectCall}
//         onEndCall={endCall}
//         toggleAudio={toggleAudio}
//         toggleVideo={toggleVideo}
//         isAudioMuted={isAudioMuted}
//         isVideoOff={isVideoOff}
//       />

//       <CallHistoryModal isOpen={isCallHistoryOpen} onClose={() => setIsCallHistoryOpen(false)} />
//       <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={session?.user} />

//       {/* LEFT SIDEBAR */}
//       <div className={`flex flex-col w-full md:w-80 lg:w-96 flex-shrink-0 ${mobileView === "window" ? "hidden" : "flex"} md:flex`}>
//         <div className="flex-1 overflow-hidden">
//           <ChatSidebar activeId={activeConvId} onSelect={handleSelectConversation} socket={socket} />
//         </div>

//         <div className="flex items-center gap-3 px-4 py-3 bg-surface-900 border-t border-r border-surface-700/50">
//           <Avatar
//             user={{ ...session?.user, avatarUrl: session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name}&background=random` } as any}
//             size="sm"
//             showStatus
//           />
//           <div className="flex-1 min-w-0">
//             <p className="text-sm font-semibold text-white truncate">{session?.user?.name}</p>
//             <p className="text-[11px] text-online">Online</p>
//           </div>

//           <button onClick={() => setIsSettingsOpen(true)} className="w-7 h-7 rounded-full hover:bg-surface-700 flex items-center justify-center transition-colors text-surface-400 hover:text-white" title="Settings">
//             <Settings size={15} />
//           </button>

//           <button onClick={() => setIsCallHistoryOpen(true)} className="w-7 h-7 rounded-full hover:bg-surface-700 flex items-center justify-center transition-colors text-brand-400 hover:text-brand-300" title="Call History">
//             <History size={15} />
//           </button>

//           <button onClick={() => router.push("/login")} className="w-7 h-7 rounded-full hover:bg-surface-700 flex items-center justify-center transition-colors text-surface-400 hover:text-red-400" aria-label="Log out">
//             <LogOut size={14} />
//           </button>
//         </div>
//       </div>

//       {/* RIGHT PANE - CHAT WINDOW */}
//       <div className={`flex-1 overflow-hidden ${mobileView === "sidebar" ? "hidden" : "flex"} md:flex`}>
//         {activeConvId ? (
//           <ChatWindow
//             conversationId={activeConvId}
//             receiverId={activePartnerId}
//             onBack={handleBack}
//             socket={socket}
//             onStartVideoCall={(partnerName) => activePartnerId && initiateCall(activePartnerId, 'VIDEO', partnerName)}
//             onStartAudioCall={(partnerName) => activePartnerId && initiateCall(activePartnerId, 'AUDIO', partnerName)}
//           />
//         ) : (
//           <EmptyChat />
//         )}
//       </div>
//     </div>
//   );
// }







"use client";

import { useState, useRef } from "react";
import { useRouter } from "next/navigation";
import ChatSidebar from "@/components/chat/ChatSidebar";
import ChatWindow from "@/components/chat/ChatWindow";
import EmptyChat from "@/components/chat/EmptyChat";
import Avatar from "@/components/ui/Avatar";
import { LogOut, History, Settings } from "lucide-react";
import { authClient } from "@/lib/auth-client";
import { useSocket } from "@/hooks/useSocket";
import api from "@/lib/axios";
import { useQueryClient } from "@tanstack/react-query";

import CallWindow from "@/components/CallWindow";
import CallHistoryModal from "@/components/chat/CallHistoryModal";
import SettingsModal from "@/components/chat/SettingsModal";
import { useVideoCall } from "@/hooks/useVideoCall";

export default function ChatPage() {
  const router = useRouter();
  const { data: session } = authClient.useSession();
  const socket = useSocket(session?.user?.id);
  const queryClient = useQueryClient();

  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);
  const [mobileView, setMobileView] = useState<"sidebar" | "window">("sidebar");

  // Keep a ref so socket callbacks always get the fresh value
  const activeConvIdRef = useRef<string | null>(null);
  const activePartnerIdRef = useRef<string | null>(null);

  const [isCallHistoryOpen, setIsCallHistoryOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const handleSelectConversation = (id: string, partnerId?: string) => {
    setActiveConvId(id);
    activeConvIdRef.current = id;
    if (partnerId) {
      setActivePartnerId(partnerId);
      activePartnerIdRef.current = partnerId;
    }
    setMobileView("window");
  };

  const handleBack = () => {
    setMobileView("sidebar");
  };

  // 🔴 Save a call-log message to the conversation and CallHistory DB
  const handleLogCall = async (body: string, callData?: any) => {
    let convId = activeConvIdRef.current;

    // Receiver side: convId may be null if they haven't opened the chat yet.
    // Try to find (or create) the conversation via the partner.
    if (!convId && activePartnerIdRef.current) {
      try {
        const convRes = await api.get(`/conversations/find/${activePartnerIdRef.current}`);
        convId = convRes.data?.data?.id || null;
      } catch {
        // If no endpoint exists, skip silently
      }
    }

    if (!convId) return;

    try {
      // ১. চ্যাটের ভেতরে মেসেজ হিসেবে কল লগ সেভ করা
      const res = await api.post("/messages/send-text", {
        conversationId: convId,
        body: `📞 ${body}`,
        type: "TEXT",
      });
      
      queryClient.setQueryData(["messages", convId], (old: any) => {
        if (!old) return [res.data.data];
        return [...old, res.data.data];
      });
      queryClient.invalidateQueries({ queryKey: ["conversations"] });

      // ২. কল হিস্ট্রির জন্য CallLog ডাটাবেসে সেভ করা (শুধু Caller এর দিক থেকে)
      if (callData && callData.partnerId) {
        await api.post("/calls", {
          receiverId: callData.partnerId,
          conversationId: convId,
          callType: callData.type,
          duration: callData.duration,
          status: callData.status
        });
      }

    } catch (error) {
      console.error("Failed to log call message", error);
    }
  };

  const {
    isReceivingCall,
    isCallAccepted,
    isDialing,
    callerInfo,
    localVideoRef,
    remoteVideoRef,
    callType,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    isAudioMuted,
    isVideoOff,
  } = useVideoCall(socket, session?.user?.id, session?.user?.name, handleLogCall);

  // When a call is incoming, store the caller as the active partner so we can
  // log the missed call message even if the user hasn't opened that conversation.
  const prevCallerRef = useRef<string | null>(null);
  if (callerInfo && callerInfo.id !== prevCallerRef.current) {
    prevCallerRef.current = callerInfo.id;
    activePartnerIdRef.current = callerInfo.id;
  }

  return (
    <div className="flex h-screen overflow-hidden bg-surface-950 relative">

      <CallWindow
        isReceivingCall={isReceivingCall}
        isCallAccepted={isCallAccepted}
        isDialing={isDialing}
        callerName={callerInfo?.name}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        callType={callType as any}
        onAcceptCall={acceptCall}
        onRejectCall={rejectCall}
        onEndCall={endCall}
        toggleAudio={toggleAudio}
        toggleVideo={toggleVideo}
        isAudioMuted={isAudioMuted}
        isVideoOff={isVideoOff}
      />

      <CallHistoryModal isOpen={isCallHistoryOpen} onClose={() => setIsCallHistoryOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} user={session?.user} />

      {/* ══════════════════════════════════════════
          LEFT SIDEBAR
          ══════════════════════════════════════════ */}
      <div className={`flex flex-col w-full md:w-80 lg:w-96 flex-shrink-0 ${mobileView === "window" ? "hidden" : "flex"} md:flex`}>
        <div className="flex-1 overflow-hidden">
          <ChatSidebar activeId={activeConvId} onSelect={handleSelectConversation} socket={socket} />
        </div>

        <div className="flex items-center gap-3 px-4 py-3 bg-surface-900 border-t border-r border-surface-700/50">
          <Avatar
            user={{ ...session?.user, avatarUrl: session?.user?.image || `https://ui-avatars.com/api/?name=${session?.user?.name}&background=random` } as any}
            size="sm"
            showStatus
          />
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white truncate">{session?.user?.name}</p>
            <p className="text-[11px] text-online">Online</p>
          </div>

          <button onClick={() => setIsSettingsOpen(true)} className="w-7 h-7 rounded-full hover:bg-surface-700 flex items-center justify-center transition-colors text-surface-400 hover:text-white" title="Settings">
            <Settings size={15} />
          </button>

          <button onClick={() => setIsCallHistoryOpen(true)} className="w-7 h-7 rounded-full hover:bg-surface-700 flex items-center justify-center transition-colors text-brand-400 hover:text-brand-300" title="Call History">
            <History size={15} />
          </button>

          <button onClick={() => router.push("/login")} className="w-7 h-7 rounded-full hover:bg-surface-700 flex items-center justify-center transition-colors text-surface-400 hover:text-red-400" aria-label="Log out">
            <LogOut size={14} />
          </button>
        </div>
      </div>

      {/* ══════════════════════════════════════════
          RIGHT PANE - CHAT WINDOW
          ══════════════════════════════════════════ */}
      <div className={`flex-1 overflow-hidden ${mobileView === "sidebar" ? "hidden" : "flex"} md:flex`}>
        {activeConvId ? (
          <ChatWindow
            conversationId={activeConvId}
            receiverId={activePartnerId}
            onBack={handleBack}
            socket={socket}
            onStartVideoCall={(partnerName) => activePartnerId && initiateCall(activePartnerId, 'VIDEO', partnerName)}
            onStartAudioCall={(partnerName) => activePartnerId && initiateCall(activePartnerId, 'AUDIO', partnerName)}
          />
        ) : (
          <EmptyChat />
        )}
      </div>
    </div>
  );
}