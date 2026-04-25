"use client";

import React, { useEffect, useState } from "react";
import { Phone, PhoneOff, Video, Mic, MicOff, VideoOff } from "lucide-react";

interface CallWindowProps {
  isReceivingCall: boolean;
  isCallAccepted: boolean;
  isDialing?: boolean;
  callerName?: string;
  localVideoRef: React.RefObject<HTMLVideoElement | null>;
  remoteVideoRef: React.RefObject<HTMLVideoElement | null>;
  callType?: 'VIDEO' | 'AUDIO';
  onAcceptCall: () => void;
  onRejectCall: () => void;
  onEndCall: () => void;
  toggleAudio?: () => void;
  toggleVideo?: () => void;
  isAudioMuted?: boolean;
  isVideoOff?: boolean;
}

export default function CallWindow({
  isReceivingCall,
  isCallAccepted,
  isDialing = false,
  callerName,
  localVideoRef,
  remoteVideoRef,
  callType = 'VIDEO',
  onAcceptCall,
  onRejectCall,
  onEndCall,
  toggleAudio,
  toggleVideo,
  isAudioMuted = false,
  isVideoOff = false,
}: CallWindowProps) {
  const [duration, setDuration] = useState(0);

  // Timer for active call
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isCallAccepted) {
      interval = setInterval(() => {
        setDuration((prev) => prev + 1);
      }, 1000);
    } else {
      setDuration(0);
    }
    return () => clearInterval(interval);
  }, [isCallAccepted]);

  const formatDuration = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  // If there is no incoming call and call is not accepted, hide component
  if (!isReceivingCall && !isCallAccepted && !isDialing) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md">
      
      {/* 🟡 OUTGOING CALL (DIALING) MODAL */}
      {isDialing && !isCallAccepted && (
        <div className="bg-surface-900 border border-surface-700/50 p-8 rounded-[2rem] shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)] flex flex-col items-center animate-scale-in max-w-sm w-full mx-4 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-brand-500/20 blur-3xl rounded-full" />
          
          <div className="relative w-24 h-24 bg-surface-800 rounded-full flex items-center justify-center mb-6 border-4 border-surface-900 shadow-xl">
             <div className="absolute inset-0 rounded-full border-2 border-brand-500 animate-ping opacity-20"></div>
             {callType === 'AUDIO' ? <Phone size={36} className="text-white animate-pulse" /> : <Video size={36} className="text-white animate-pulse" />}
          </div>
          <h2 className="text-2xl text-white font-bold mb-2 tracking-tight text-center relative z-10 w-full truncate">
            {callerName || "Someone"}
          </h2>
          <p className="text-surface-400 mb-8 animate-pulse text-sm font-medium relative z-10">
            {callType === 'AUDIO' ? "Calling..." : "Calling (Video)..."}
          </p>
          
          <div className="flex w-full justify-center gap-6 relative z-10">
            <button 
              onClick={onEndCall}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 bg-red-500 hover:bg-red-400 text-white rounded-full flex items-center justify-center transition-all shadow-[0_0_20px_rgba(239,68,68,0.4)] cursor-pointer">
                <PhoneOff size={24} />
              </div>
            </button>
          </div>
        </div>
      )}
      
      {/* 🔴 INCOMING CALL MODAL */}
      {isReceivingCall && !isCallAccepted && (
        <div className="bg-surface-900 border border-surface-700/50 p-8 rounded-[2rem] shadow-[0_0_40px_-10px_rgba(99,102,241,0.3)] flex flex-col items-center animate-scale-in max-w-sm w-full mx-4 relative overflow-hidden">
          {/* Background glow */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-32 bg-brand-500/20 blur-3xl rounded-full" />
          
          <div className="relative w-24 h-24 bg-surface-800 rounded-full flex items-center justify-center mb-6 border-4 border-surface-900 shadow-xl">
             <div className="absolute inset-0 rounded-full border-2 border-brand-500 animate-ping opacity-20"></div>
             {callType === 'AUDIO' ? <Phone size={36} className="text-white animate-pulse" /> : <Video size={36} className="text-white animate-pulse" />}
          </div>
          <h2 className="text-2xl text-white font-bold mb-2 tracking-tight text-center relative z-10 w-full truncate">
            {callerName || "Someone"}
          </h2>
          <p className="text-surface-400 mb-8 animate-pulse text-sm font-medium relative z-10">
            {callType === 'AUDIO' ? "Incoming audio call..." : "Incoming video call..."}
          </p>
          
          <div className="flex w-full justify-center gap-6 relative z-10">
            <button 
              onClick={onRejectCall}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="w-14 h-14 bg-red-500/10 group-hover:bg-red-500/20 text-red-500 rounded-full flex items-center justify-center transition-all animate-slide-left">
                <PhoneOff size={24} />
              </div>
            </button>
            <button 
              onClick={onAcceptCall}
              className="flex flex-col items-center gap-2 group"
            >
              <div className="relative w-14 h-14 bg-green-500 hover:bg-green-400 text-white rounded-full flex items-center justify-center transition-all shadow-[0_0_20px_rgba(34,197,94,0.4)] animate-slide-right cursor-pointer">
                <div className="absolute inset-0 rounded-full border-2 border-green-400 animate-ping opacity-50"></div>
                {callType === 'AUDIO' ? <Phone size={24} /> : <Video size={24} />}
              </div>
            </button>
          </div>
        </div>
      )}

      {/* 🟢 ACTIVE CALL WINDOW */}
      {isCallAccepted && (
        <div className={`relative w-full h-full sm:w-[90vw] sm:max-w-5xl sm:h-[80vh] sm:rounded-3xl bg-black overflow-hidden shadow-2xl border-0 sm:border sm:border-surface-700/50 flex animate-scale-in ${callType === 'AUDIO' ? 'items-center justify-center' : ''}`}>
          
          {/* Remote Media Element (Hidden for Audio Call) */}
          <video 
            ref={remoteVideoRef} 
            autoPlay 
            playsInline 
            className={callType === 'AUDIO' ? "hidden" : "w-full h-full object-cover"}
          />

          {/* Audio Call UI Elements */}
          {callType === 'AUDIO' && (
             <div className="flex flex-col items-center justify-center space-y-8 z-10 w-full animate-fade-in-up">
                <div className="w-40 h-40 bg-surface-800 rounded-full flex items-center justify-center border-4 border-surface-700 shadow-[0_0_60px_-10px_rgba(99,102,241,0.3)] relative">
                   <div className="absolute inset-0 rounded-full border-2 border-brand-500 animate-ping opacity-30"></div>
                   <Phone size={56} className="text-white" />
                </div>
                <div className="text-center">
                  <h2 className="text-4xl text-white font-bold tracking-tight mb-3">{callerName || "Someone"}</h2>
                  <p className="text-brand-400 text-lg font-medium tracking-wide animate-pulse">
                    {formatDuration(duration)} • In Call
                  </p>
                </div>
             </div>
          )}

          {/* Local Video (Only for Video Call) */}
          {callType === 'VIDEO' && !isVideoOff && (
            <div className="absolute top-6 right-6 w-32 sm:w-48 aspect-[3/4] bg-surface-900 rounded-2xl overflow-hidden border border-surface-700/50 shadow-2xl z-20">
              <video 
                ref={localVideoRef} 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover transform scale-x-[-1]"
              />
            </div>
          )}

          {/* Local placeholder when video is off (Only for Video Call) */}
          {callType === 'VIDEO' && isVideoOff && (
            <div className="absolute top-6 right-6 w-32 sm:w-48 aspect-[3/4] bg-surface-900 rounded-2xl overflow-hidden border border-surface-700/50 shadow-2xl z-20 flex items-center justify-center">
              <div className="w-12 h-12 rounded-full bg-surface-800 flex items-center justify-center text-surface-500">
                <VideoOff size={20} />
              </div>
            </div>
          )}

          {/* Call Controls Overlay */}
          <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-4 bg-surface-900/80 px-6 py-4 rounded-full backdrop-blur-xl border border-white/10 shadow-2xl z-20">
            <button 
              onClick={toggleAudio}
              className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                isAudioMuted ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-surface-700 hover:bg-surface-600 text-white"
              }`}
              aria-label="Toggle mute"
            >
              {isAudioMuted ? <MicOff size={20} /> : <Mic size={20} />}
            </button>
            
            {callType === 'VIDEO' && (
              <button 
                onClick={toggleVideo}
                className={`w-12 h-12 rounded-full flex items-center justify-center transition-colors ${
                  isVideoOff ? "bg-red-500/20 text-red-500 hover:bg-red-500/30" : "bg-surface-700 hover:bg-surface-600 text-white"
                }`}
                aria-label="Toggle video"
              >
                {isVideoOff ? <VideoOff size={20} /> : <Video size={20} />}
              </button>
            )}

            <button 
              onClick={onEndCall}
              className="w-14 h-14 rounded-full bg-red-600 hover:bg-red-500 flex items-center justify-center text-white transition-colors shadow-[0_0_20px_rgba(239,68,68,0.4)] ml-2"
              aria-label="End call"
            >
              <PhoneOff size={24} />
            </button>
          </div>
        </div>
      )}

    </div>
  );
}
