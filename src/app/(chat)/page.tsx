"use client";



import { useState } from "react";

import { useRouter } from "next/navigation";

import { CURRENT_USER } from "@/lib/mock-data";

import ChatSidebar from "@/components/chat/ChatSidebar";

import ChatWindow from "@/components/chat/ChatWindow";

import EmptyChat from "@/components/chat/EmptyChat";

import Avatar from "@/components/ui/Avatar";

import { LogOut, History } from "lucide-react";

import { authClient } from "@/lib/auth-client";

import { useSocket } from "@/hooks/useSocket";



import CallWindow from "@/components/CallWindow";

import CallHistoryModal from "@/components/chat/CallHistoryModal";

import { useVideoCall } from "@/hooks/useVideoCall";



export default function ChatPage() {

  const router = useRouter();

  const { data: session } = authClient.useSession();

  const socket = useSocket(session?.user?.id);



  const [activeConvId, setActiveConvId] = useState<string | null>(null);

  const [activePartnerId, setActivePartnerId] = useState<string | null>(null);

  const [mobileView, setMobileView] = useState<"sidebar" | "window">("sidebar");

 

  const [isCallHistoryOpen, setIsCallHistoryOpen] = useState(false);



  const handleSelectConversation = (id: string, partnerId?: string) => {

    setActiveConvId(id);

    if (partnerId) setActivePartnerId(partnerId);

    setMobileView("window");

  };



  const handleBack = () => {

    setMobileView("sidebar");

  };



  // 👇 ভিডিও কল হুক থেকে সব স্টেট এবং ফাংশন বের করা হলো
  const {
    isReceivingCall, isCallAccepted, isDialing, callerInfo, localVideoRef, remoteVideoRef,
    callType, initiateCall, acceptCall, rejectCall, endCall,
    toggleAudio, toggleVideo, isAudioMuted, isVideoOff
  } = useVideoCall(socket, session?.user?.id, session?.user?.name);



  return (

    <div className="flex h-screen overflow-hidden bg-surface-950 relative">

     

      {/* 🔴 Call Window: এখানে callType এবং অন্যান্য কন্ট্রোল পাস করা হলো */}
      <CallWindow
        isReceivingCall={isReceivingCall}
        isCallAccepted={isCallAccepted}
        isDialing={isDialing}
        callerName={callerInfo?.name}
        localVideoRef={localVideoRef}
        remoteVideoRef={remoteVideoRef}
        callType={callType as any} // 👈 এই লাইনটাই মিসিং ছিল!

        onAcceptCall={acceptCall}

        onRejectCall={rejectCall}

        onEndCall={endCall}

        toggleAudio={toggleAudio}

        toggleVideo={toggleVideo}

        isAudioMuted={isAudioMuted}

        isVideoOff={isVideoOff}

      />

     

      <CallHistoryModal isOpen={isCallHistoryOpen} onClose={() => setIsCallHistoryOpen(false)} />



      {/* ══════════════════════════════════════════

          LEFT SIDEBAR

          ══════════════════════════════════════════ */}

      <div className={`flex flex-col w-full md:w-80 lg:w-96 flex-shrink-0 ${mobileView === "window" ? "hidden" : "flex"} md:flex`}>

       

        <div className="flex-1 overflow-hidden">

          <ChatSidebar activeId={activeConvId} onSelect={handleSelectConversation} socket={socket} />

        </div>



        {/* ── User Profile Footer ── */}

        <div className="flex items-center gap-3 px-4 py-3 bg-surface-900 border-t border-r border-surface-700/50">

          <Avatar user={CURRENT_USER} size="sm" showStatus />

          <div className="flex-1 min-w-0">

            <p className="text-sm font-semibold text-white truncate">{CURRENT_USER.name}</p>

            <p className="text-[11px] text-online">Online</p>

          </div>

         

          <button

            onClick={() => setIsCallHistoryOpen(true)}

            className="w-7 h-7 rounded-full hover:bg-surface-700 flex items-center justify-center transition-colors text-brand-400 hover:text-brand-300"

            title="Call History"

          >

            <History size={15} />

          </button>



          <button onClick={() => router.push("/login")} className="w-7 h-7 rounded-full hover:bg-surface-700 flex items-center justify-center transition-colors" aria-label="Log out">

            <LogOut size={14} className="text-surface-400" />

          </button>

        </div>

      </div>



      {/* ══════════════════════════════════════════

          RIGHT PANE – CHAT WINDOW

          ══════════════════════════════════════════ */}

      <div className={`flex-1 overflow-hidden ${mobileView === "sidebar" ? "hidden" : "flex"} md:flex`}>

        {activeConvId ? (

          <ChatWindow

            conversationId={activeConvId}

            receiverId={activePartnerId}

            onBack={handleBack}

            socket={socket}

            onStartVideoCall={() => activePartnerId && initiateCall(activePartnerId, 'VIDEO')}

            onStartAudioCall={() => activePartnerId && initiateCall(activePartnerId, 'AUDIO')}

          />

        ) : (

          <EmptyChat />

        )}

      </div>

    </div>

  );

}