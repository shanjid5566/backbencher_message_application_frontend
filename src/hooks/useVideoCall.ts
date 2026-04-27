// import { useState, useEffect, useRef } from "react";
// import Peer, { MediaConnection } from "peerjs";

// export const useVideoCall = (
//   socket: any,
//   currentUserId: string | undefined,
//   currentUserName: string | undefined,
//   onLogCall?: (body: string, callData?: any) => void,
// ) => {
//   const [peerInstance, setPeerInstance] = useState<Peer | null>(null);
//   const [myPeerId, setMyPeerId] = useState<string>("");

//   const [isReceivingCall, setIsReceivingCall] = useState(false);
//   const [isCallAccepted, setIsCallAccepted] = useState(false);
//   const [isDialing, setIsDialing] = useState(false);
//   const [callerInfo, setCallerInfo] = useState<{
//     id: string;
//     name: string;
//   } | null>(null);

//   // State for UI rendering
//   const [callTypeState, setCallTypeState] = useState<"VIDEO" | "AUDIO">(
//     "VIDEO",
//   );

//   const [isAudioMuted, setIsAudioMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);

//   // Refs for logic (Stale Closure avoidance)
//   const partnerIdRef = useRef<string | null>(null);
//   const activeCallIdRef = useRef<string | null>(null);
//   const callTypeRef = useRef<"VIDEO" | "AUDIO">("VIDEO");
//   const isCallerRef = useRef<boolean>(false);
//   const onLogCallRef = useRef(onLogCall);
//   const callStartTimeRef = useRef<number>(0);

//   const localVideoRef = useRef<HTMLVideoElement>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement>(null);
//   const currentCallRef = useRef<MediaConnection | null>(null);
//   const localStreamRef = useRef<MediaStream | null>(null);

//   // Helper: Update both State and Ref simultaneously
//   const setCallType = (type: "VIDEO" | "AUDIO") => {
//     setCallTypeState(type);
//     callTypeRef.current = type;
//   };

//   useEffect(() => {
//     onLogCallRef.current = onLogCall;
//   }, [onLogCall]);

//   useEffect(() => {
//     if (typeof window === "undefined") return;
//     const peer = new Peer();
//     peer.on("open", (id) => setMyPeerId(id));
//     peer.on("call", (call) => {
//       if (localStreamRef.current) {
//         call.answer(localStreamRef.current);
//         setupCallEvents(call);
//       }
//     });
//     setPeerInstance(peer);
//     return () => peer.destroy();
//   }, []);

//   const setupCallEvents = (call: MediaConnection) => {
//     currentCallRef.current = call;
//     call.on("stream", (remoteStream) => {
//       if (remoteVideoRef.current)
//         remoteVideoRef.current.srcObject = remoteStream;
//     });
//     call.on("close", () => endCall(false));
//   };

//   useEffect(() => {
//     if (!socket) return;

//     socket.on(
//       "incoming_call",
//       (data: {
//         callId: string;
//         fromId: string;
//         fromName: string;
//         callType: "VIDEO" | "AUDIO";
//       }) => {
//         if (data.fromId === currentUserId) return;
//         isCallerRef.current = false;
//         partnerIdRef.current = data.fromId;
//         activeCallIdRef.current = data.callId;

//         setCallType(data.callType || "VIDEO"); // Updates both State and Ref simultaneously
//         setCallerInfo({ id: data.fromId, name: data.fromName });
//         setIsReceivingCall(true);
//       },
//     );

//     socket.on("call_accepted", (data: { callId: string; peerId: string }) => {
//       setIsDialing(false);
//       setIsCallAccepted(true);
//       activeCallIdRef.current = data.callId;
//       callStartTimeRef.current = Date.now();

//       if (peerInstance && localStreamRef.current) {
//         const call = peerInstance.call(data.peerId, localStreamRef.current);
//         setupCallEvents(call);
//       }
//     });

//     socket.on("call_rejected", () => {
//       endCall(false, true);
//     });
//     socket.on("call_missed", () => {
//       endCall(false, false);
//     });
//     socket.on("call_ended", () => endCall(false));

//     return () => {
//       socket.off("incoming_call");
//       socket.off("call_accepted");
//       socket.off("call_rejected");
//       socket.off("call_missed");
//       socket.off("call_ended");
//     };
//   }, [socket, peerInstance]);

//   const getMediaStream = async (type: "VIDEO" | "AUDIO") => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: type === "VIDEO",
//         audio: true,
//       });
//       localStreamRef.current = stream;
//       if (localVideoRef.current) localVideoRef.current.srcObject = stream;
//       return stream;
//     } catch (error) {
//       console.error("Permission denied", error);
//     }
//   };

//   const initiateCall = async (
//     receiverId: string,
//     type: "VIDEO" | "AUDIO" = "VIDEO",
//     partnerName?: string,
//   ) => {
//     isCallerRef.current = true;
//     partnerIdRef.current = receiverId;
//     setCallType(type); // Updates both State and Ref simultaneously

//     setIsDialing(true);
//     setIsCallAccepted(false);
//     if (partnerName) setCallerInfo({ id: receiverId, name: partnerName });

//     setTimeout(async () => {
//       await getMediaStream(type);
//       socket.emit("call_user", {
//         receiverId,
//         fromId: currentUserId,
//         fromName: currentUserName,
//         callType: type,
//       });
//     }, 100);
//   };

//   const acceptCall = async () => {
//     setIsReceivingCall(false);
//     setIsCallAccepted(true);
//     callStartTimeRef.current = Date.now();
//     setTimeout(async () => {
//       await getMediaStream(callTypeRef.current);
//       socket.emit("accept_call", {
//         callId: activeCallIdRef.current,
//         toId: partnerIdRef.current,
//         peerId: myPeerId,
//       });
//     }, 100);
//   };

//   const rejectCall = () => {
//     setIsReceivingCall(false);
//     socket.emit("reject_call", {
//       callId: activeCallIdRef.current,
//       toId: partnerIdRef.current,
//     });
//     if (onLogCallRef.current)
//       // Note: We remove the log from here because endCall will handle the caller side.
//       // And we want only one side to log.
//     setCallerInfo(null);
//     endCall(false, true);
//   };

//   const endCall = (emitToSocket = true, isRejected = false) => {
//     const duration = callStartTimeRef.current
//       ? Math.floor((Date.now() - callStartTimeRef.current) / 1000)
//       : 0;
//     const type = callTypeRef.current;
//     const pId = partnerIdRef.current;

//     // Send Call Data from the Caller side ONLY to avoid duplicates
//     if (isCallerRef.current && onLogCallRef.current) {
//       const status = isRejected || duration === 0 ? "MISSED" : "COMPLETED";
//       if (status === "MISSED") {
//         onLogCallRef.current(
//           `Missed ${type === "VIDEO" ? "Video" : "Audio"} call`,
//           { type, duration, status, partnerId: pId },
//         );
//       } else {
//         const m = Math.floor(duration / 60);
//         const s = duration % 60;
//         const timeStr = m > 0 ? `${m}m ${s}s` : `${s}s`;
//         onLogCallRef.current(
//           `${type === "VIDEO" ? "Video" : "Audio"} call \u2022 ${timeStr}`,
//           { type, duration, status, partnerId: pId },
//         );
//       }
//     } 
//     // Receiver side logging removed to prevent duplication in shared conversation

//     if (emitToSocket && partnerIdRef.current)
//       socket.emit("end_call", {
//         callId: activeCallIdRef.current,
//         toId: partnerIdRef.current,
//         duration: duration,
//       });

//     if (currentCallRef.current) currentCallRef.current.close();
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach((track) => track.stop());
//       localStreamRef.current = null;
//     }
//     if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
//     if (localVideoRef.current) localVideoRef.current.srcObject = null;

//     setIsReceivingCall(false);
//     setIsDialing(false);
//     setIsCallAccepted(false);
//     setCallerInfo(null);
//     callStartTimeRef.current = 0;
//     setIsAudioMuted(false);
//     setIsVideoOff(false);
//     isCallerRef.current = false;
//     partnerIdRef.current = null;
//     activeCallIdRef.current = null;
//   };

//   const toggleAudio = () => {
//     if (localStreamRef.current) {
//       const audioTrack = localStreamRef.current.getAudioTracks()[0];
//       if (audioTrack) {
//         audioTrack.enabled = !audioTrack.enabled;
//         setIsAudioMuted(!audioTrack.enabled);
//       }
//     }
//   };

//   const toggleVideo = () => {
//     if (localStreamRef.current) {
//       const videoTrack = localStreamRef.current.getVideoTracks()[0];
//       if (videoTrack) {
//         videoTrack.enabled = !videoTrack.enabled;
//         setIsVideoOff(!videoTrack.enabled);
//       }
//     }
//   };

//   return {
//     isReceivingCall,
//     isCallAccepted,
//     isDialing,
//     callerInfo,
//     localVideoRef,
//     remoteVideoRef,
//     callType: callTypeState, // Return state directly instead of Ref.current
//     initiateCall,
//     acceptCall,
//     rejectCall,
//     endCall,
//     toggleAudio,
//     toggleVideo,
//     isAudioMuted,
//     isVideoOff,
//   };
// };








import { useState, useEffect, useRef } from "react";
import Peer, { MediaConnection } from "peerjs";

export const useVideoCall = (
  socket: any,
  currentUserId: string | undefined,
  currentUserName: string | undefined,
  onLogCall?: (body: string, callData?: any) => void,
) => {
  const [peerInstance, setPeerInstance] = useState<Peer | null>(null);
  const [myPeerId, setMyPeerId] = useState<string>("");

  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [isDialing, setIsDialing] = useState(false);
  const [callerInfo, setCallerInfo] = useState<{
    id: string;
    name: string;
  } | null>(null);

  // State for UI rendering
  const [callTypeState, setCallTypeState] = useState<"VIDEO" | "AUDIO">(
    "VIDEO",
  );

  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Refs for logic (Stale Closure avoidance)
  const partnerIdRef = useRef<string | null>(null);
  const activeCallIdRef = useRef<string | null>(null);
  const callTypeRef = useRef<"VIDEO" | "AUDIO">("VIDEO");
  const isCallerRef = useRef<boolean>(false);
  const onLogCallRef = useRef(onLogCall);
  const callStartTimeRef = useRef<number>(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const currentCallRef = useRef<MediaConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // Reference for the incoming call ringtone audio
  const ringtoneRef = useRef<HTMLAudioElement | null>(null);

  // Helper: Update both State and Ref simultaneously
  const setCallType = (type: "VIDEO" | "AUDIO") => {
    setCallTypeState(type);
    callTypeRef.current = type;
  };

  useEffect(() => {
    onLogCallRef.current = onLogCall;
  }, [onLogCall]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    
    // Initialize Peer
    const peer = new Peer();
    peer.on("open", (id) => setMyPeerId(id));
    peer.on("call", (call) => {
      if (localStreamRef.current) {
        call.answer(localStreamRef.current);
        setupCallEvents(call);
      }
    });
    setPeerInstance(peer);

    // Initialize Ringtone Audio (pointing to your specific file in the public folder)
    ringtoneRef.current = new Audio("/iphone_original.mp3");
    ringtoneRef.current.loop = true;

    return () => {
      peer.destroy();
      // Cleanup ringtone on unmount
      if (ringtoneRef.current) {
        ringtoneRef.current.pause();
        ringtoneRef.current = null;
      }
    };
  }, []);

  // Helper functions to control the ringtone
  const playRingtone = () => {
    ringtoneRef.current?.play().catch((e) => console.error("Ringtone autoplay blocked by browser:", e));
  };

  const stopRingtone = () => {
    if (ringtoneRef.current) {
      ringtoneRef.current.pause();
      ringtoneRef.current.currentTime = 0;
    }
  };

  const setupCallEvents = (call: MediaConnection) => {
    currentCallRef.current = call;
    call.on("stream", (remoteStream) => {
      if (remoteVideoRef.current)
        remoteVideoRef.current.srcObject = remoteStream;
    });
    call.on("close", () => endCall(false));
  };

  useEffect(() => {
    if (!socket) return;

    socket.on(
      "incoming_call",
      (data: {
        callId: string;
        fromId: string;
        fromName: string;
        callType: "VIDEO" | "AUDIO";
      }) => {
        if (data.fromId === currentUserId) return;
        isCallerRef.current = false;
        partnerIdRef.current = data.fromId;
        activeCallIdRef.current = data.callId;

        setCallType(data.callType || "VIDEO"); 
        setCallerInfo({ id: data.fromId, name: data.fromName });
        setIsReceivingCall(true);

        // Play the ringtone when a call comes in
        playRingtone();
      },
    );

    socket.on("call_accepted", (data: { callId: string; peerId: string }) => {
      stopRingtone(); // Stop ringtone if the caller side accepts
      setIsDialing(false);
      setIsCallAccepted(true);
      activeCallIdRef.current = data.callId;
      callStartTimeRef.current = Date.now();

      if (peerInstance && localStreamRef.current) {
        const call = peerInstance.call(data.peerId, localStreamRef.current);
        setupCallEvents(call);
      }
    });

    socket.on("call_rejected", () => {
      endCall(false, true);
    });
    socket.on("call_missed", () => {
      endCall(false, false);
    });
    socket.on("call_ended", () => endCall(false));

    return () => {
      socket.off("incoming_call");
      socket.off("call_accepted");
      socket.off("call_rejected");
      socket.off("call_missed");
      socket.off("call_ended");
    };
  }, [socket, peerInstance]);

  const getMediaStream = async (type: "VIDEO" | "AUDIO") => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === "VIDEO",
        audio: true,
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (error) {
      console.error("Permission denied", error);
    }
  };

  const initiateCall = async (
    receiverId: string,
    type: "VIDEO" | "AUDIO" = "VIDEO",
    partnerName?: string,
  ) => {
    isCallerRef.current = true;
    partnerIdRef.current = receiverId;
    setCallType(type);

    setIsDialing(true);
    setIsCallAccepted(false);
    if (partnerName) setCallerInfo({ id: receiverId, name: partnerName });

    setTimeout(async () => {
      await getMediaStream(type);
      socket.emit("call_user", {
        receiverId,
        fromId: currentUserId,
        fromName: currentUserName,
        callType: type,
      });
    }, 100);
  };

  const acceptCall = async () => {
    stopRingtone(); // Stop ringtone when accepting the call
    setIsReceivingCall(false);
    setIsCallAccepted(true);
    callStartTimeRef.current = Date.now();
    
    setTimeout(async () => {
      await getMediaStream(callTypeRef.current);
      socket.emit("accept_call", {
        callId: activeCallIdRef.current,
        toId: partnerIdRef.current,
        peerId: myPeerId,
      });
    }, 100);
  };

  const rejectCall = () => {
    stopRingtone(); // Stop ringtone when rejecting the call
    setIsReceivingCall(false);
    socket.emit("reject_call", {
      callId: activeCallIdRef.current,
      toId: partnerIdRef.current,
    });
    setCallerInfo(null);
    endCall(false, true);
  };

  const endCall = (emitToSocket = true, isRejected = false) => {
    stopRingtone(); // Ensure ringtone stops immediately upon ending the call for any reason

    const duration = callStartTimeRef.current
      ? Math.floor((Date.now() - callStartTimeRef.current) / 1000)
      : 0;
    const type = callTypeRef.current;
    const pId = partnerIdRef.current;

    // Send Call Data from the Caller side ONLY to avoid duplicates
    if (isCallerRef.current && onLogCallRef.current) {
      const status = isRejected || duration === 0 ? "MISSED" : "COMPLETED";
      if (status === "MISSED") {
        onLogCallRef.current(
          `Missed ${type === "VIDEO" ? "Video" : "Audio"} call`,
          { type, duration, status, partnerId: pId },
        );
      } else {
        const m = Math.floor(duration / 60);
        const s = duration % 60;
        const timeStr = m > 0 ? `${m}m ${s}s` : `${s}s`;
        onLogCallRef.current(
          `${type === "VIDEO" ? "Video" : "Audio"} call \u2022 ${timeStr}`,
          { type, duration, status, partnerId: pId },
        );
      }
    }

    if (emitToSocket && partnerIdRef.current)
      socket.emit("end_call", {
        callId: activeCallIdRef.current,
        toId: partnerIdRef.current,
        duration: duration,
      });

    if (currentCallRef.current) currentCallRef.current.close();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach((track) => track.stop());
      localStreamRef.current = null;
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;

    setIsReceivingCall(false);
    setIsDialing(false);
    setIsCallAccepted(false);
    setCallerInfo(null);
    callStartTimeRef.current = 0;
    setIsAudioMuted(false);
    setIsVideoOff(false);
    isCallerRef.current = false;
    partnerIdRef.current = null;
    activeCallIdRef.current = null;
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled;
        setIsAudioMuted(!audioTrack.enabled);
      }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled;
        setIsVideoOff(!videoTrack.enabled);
      }
    }
  };

  return {
    isReceivingCall,
    isCallAccepted,
    isDialing,
    callerInfo,
    localVideoRef,
    remoteVideoRef,
    callType: callTypeState,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall,
    toggleAudio,
    toggleVideo,
    isAudioMuted,
    isVideoOff,
  };
};