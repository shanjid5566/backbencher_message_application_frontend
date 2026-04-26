// import { useState, useEffect, useRef } from 'react';
// import Peer, { MediaConnection } from 'peerjs';

// export const useVideoCall = (
//   socket: any, 
//   currentUserId: string | undefined, 
//   currentUserName: string | undefined,
//   onLogCall?: (body: string) => void // callback to save call log to DB
// ) => {
//   const [peerInstance, setPeerInstance] = useState<Peer | null>(null);
//   const [myPeerId, setMyPeerId] = useState<string>('');
  
//   // UI & DB States
//   const [isReceivingCall, setIsReceivingCall] = useState(false);
//   const [isCallAccepted, setIsCallAccepted] = useState(false);
//   const [isDialing, setIsDialing] = useState(false);
//   const [callerInfo, setCallerInfo] = useState<{ id: string, name: string } | null>(null);
//   const [partnerId, setPartnerId] = useState<string | null>(null);
//   const [callType, setCallType] = useState<'VIDEO' | 'AUDIO'>('VIDEO');
//   const [activeCallId, setActiveCallId] = useState<string | null>(null);
//   const [isCaller, setIsCaller] = useState(false); // 👈 নতুন
//   const callStartTimeRef = useRef<number>(0);
  
//   // Media Control States
//   const [isAudioMuted, setIsAudioMuted] = useState(false);
//   const [isVideoOff, setIsVideoOff] = useState(false);
  
//   // Refs
//   const localVideoRef = useRef<HTMLVideoElement>(null);
//   const remoteVideoRef = useRef<HTMLVideoElement>(null);
//   const currentCallRef = useRef<MediaConnection | null>(null);
//   const localStreamRef = useRef<MediaStream | null>(null);

//   useEffect(() => {
//     if (typeof window === 'undefined') return;
//     const peer = new Peer();
//     peer.on('open', (id) => setMyPeerId(id));
//     peer.on('call', (call) => {
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
//     call.on('stream', (remoteStream) => {
//       if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
//     });
//     call.on('close', () => endCall(false));
//   };

//   useEffect(() => {
//     if (!socket) return;

//     socket.on('incoming_call', (data: { callId: string, fromId: string, fromName: string, callType: 'VIDEO'|'AUDIO' }) => {
//       if (data.fromId === currentUserId) return; 
//       setIsCaller(false); // 👈
//       setCallerInfo({ id: data.fromId, name: data.fromName });
//       setPartnerId(data.fromId);
//       setCallType(data.callType || 'VIDEO');
//       setActiveCallId(data.callId);
//       setIsReceivingCall(true);
//     });

//     socket.on('call_accepted', (data: { callId: string, peerId: string }) => {
//       setIsDialing(false);
//       setIsCallAccepted(true);
//       setActiveCallId(data.callId);
//       callStartTimeRef.current = Date.now();

//       if (peerInstance && localStreamRef.current) {
//         const call = peerInstance.call(data.peerId, localStreamRef.current);
//         setupCallEvents(call);
//       }
//     });

//     socket.on('call_rejected', () => {
//       // The person who called hears: the callee rejected (missed for them)
//       endCall(false, true); // isRejected=true
//     });

//     socket.on('call_missed', () => {
//       // The callee receives this after caller cancelled — log missed call on their side
//       if (!isCaller && onLogCall) {
//         onLogCall(`Missed ${callType === 'VIDEO' ? 'Video' : 'Audio'} call`);
//       }
//       endCall(false, false);
//     });

//     socket.on('call_ended', () => endCall(false));

//     return () => {
//       socket.off('incoming_call');
//       socket.off('call_accepted');
//       socket.off('call_rejected');
//       socket.off('call_missed');
//       socket.off('call_ended');
//     };
//   }, [socket, peerInstance]);

//   const getMediaStream = async (type: 'VIDEO' | 'AUDIO') => {
//     try {
//       const stream = await navigator.mediaDevices.getUserMedia({
//         video: type === 'VIDEO',
//         audio: true
//       });
//       localStreamRef.current = stream;
//       if (localVideoRef.current) localVideoRef.current.srcObject = stream;
//       return stream;
//     } catch (error) {
//       console.error("Permission denied", error);
//       alert("Please allow camera/microphone permissions.");
//     }
//   };

//   const initiateCall = async (receiverId: string, type: 'VIDEO' | 'AUDIO' = 'VIDEO', partnerName?: string) => {
//     setIsCaller(true); // 👈 আমি কল দিচ্ছি
//     setPartnerId(receiverId);
//     setCallType(type);
//     setIsDialing(true);
//     setIsCallAccepted(false);
//     if (partnerName) {
//       setCallerInfo({ id: receiverId, name: partnerName });
//     }

//     setTimeout(async () => {
//       await getMediaStream(type);
//       socket.emit('call_user', {
//         receiverId,
//         fromId: currentUserId,
//         fromName: currentUserName,
//         callType: type
//       });
//     }, 100);
//   };

//   const acceptCall = async () => {
//     setIsReceivingCall(false);
//     setIsCallAccepted(true);
//     callStartTimeRef.current = Date.now();

//     setTimeout(async () => {
//       await getMediaStream(callType);
//       socket.emit('accept_call', {
//         callId: activeCallId,
//         toId: partnerId,
//         peerId: myPeerId
//       });
//     }, 100);
//   };

//   const rejectCall = () => {
//     setIsReceivingCall(false);
//     socket.emit('reject_call', { callId: activeCallId, toId: partnerId });
//     // Log missed call on the RECEIVER's side too
//     if (onLogCall) {
//       onLogCall(`Missed ${callType === 'VIDEO' ? 'Video' : 'Audio'} call`);
//     }
//     setCallerInfo(null);
//     setPartnerId(null);
//     setActiveCallId(null);
//     endCall(false, true);
//   };

//   const endCall = (emitToSocket = true, isRejected = false) => {
//     const duration = callStartTimeRef.current ? Math.floor((Date.now() - callStartTimeRef.current) / 1000) : 0;

//     // 🔴 কল লগ মেসেজ তৈরি করা — শুধু caller-এর পক্ষ থেকে (receiver side is handled in rejectCall/call_missed)
//     if (isCaller && onLogCall) {
//       if (isRejected || duration === 0) {
//         onLogCall(`Missed ${callType === 'VIDEO' ? 'Video' : 'Audio'} call`);
//       } else {
//         const m = Math.floor(duration / 60);
//         const s = duration % 60;
//         const timeStr = m > 0 ? `${m}m ${s}s` : `${s}s`;
//         onLogCall(`${callType === 'VIDEO' ? 'Video' : 'Audio'} call \u2022 ${timeStr}`);
//       }
//     } else if (!isCaller && !isRejected && duration > 0 && onLogCall) {
//       // Receiver side — completed call log
//       const m = Math.floor(duration / 60);
//       const s = duration % 60;
//       const timeStr = m > 0 ? `${m}m ${s}s` : `${s}s`;
//       onLogCall(`${callType === 'VIDEO' ? 'Video' : 'Audio'} call \u2022 ${timeStr}`);
//     }

//     if (emitToSocket && partnerId) {
//       socket.emit('end_call', { callId: activeCallId, toId: partnerId, duration: duration });
//     }
    
//     if (currentCallRef.current) currentCallRef.current.close();
//     if (localStreamRef.current) {
//       localStreamRef.current.getTracks().forEach(track => track.stop());
//       localStreamRef.current = null;
//     }
//     if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
//     if (localVideoRef.current) localVideoRef.current.srcObject = null;
    
//     setIsReceivingCall(false);
//     setIsDialing(false);
//     setIsCallAccepted(false);
//     setCallerInfo(null);
//     setPartnerId(null);
//     setActiveCallId(null);
//     callStartTimeRef.current = 0;
//     setIsAudioMuted(false);
//     setIsVideoOff(false);
//     setIsCaller(false);
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
//     isReceivingCall, isCallAccepted, isDialing, callerInfo, localVideoRef, remoteVideoRef,
//     callType, initiateCall, acceptCall, rejectCall, endCall, toggleAudio, toggleVideo, isAudioMuted, isVideoOff
//   };
// };




import { useState, useEffect, useRef } from 'react';
import Peer, { MediaConnection } from 'peerjs';

export const useVideoCall = (
  socket: any, 
  currentUserId: string | undefined, 
  currentUserName: string | undefined,
  onLogCall?: (body: string, callData?: any) => void
) => {
  const [peerInstance, setPeerInstance] = useState<Peer | null>(null);
  const [myPeerId, setMyPeerId] = useState<string>('');
  
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [isDialing, setIsDialing] = useState(false);
  const [callerInfo, setCallerInfo] = useState<{ id: string, name: string } | null>(null);
  
  // 🔴 UI তে দেখানোর জন্য State
  const [callTypeState, setCallTypeState] = useState<'VIDEO' | 'AUDIO'>('VIDEO'); 
  
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // 🔴 লজিকের (Stale Closure) জন্য Refs
  const partnerIdRef = useRef<string | null>(null);
  const activeCallIdRef = useRef<string | null>(null);
  const callTypeRef = useRef<'VIDEO' | 'AUDIO'>('VIDEO');
  const isCallerRef = useRef<boolean>(false);
  const onLogCallRef = useRef(onLogCall);
  const callStartTimeRef = useRef<number>(0);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const currentCallRef = useRef<MediaConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // 🔴 ম্যাজিক: State এবং Ref দুটোই একসাথে আপডেট করার ফাংশন
  const setCallType = (type: 'VIDEO' | 'AUDIO') => {
    setCallTypeState(type);
    callTypeRef.current = type;
  };

  useEffect(() => {
    onLogCallRef.current = onLogCall;
  }, [onLogCall]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const peer = new Peer();
    peer.on('open', (id) => setMyPeerId(id));
    peer.on('call', (call) => {
      if (localStreamRef.current) {
        call.answer(localStreamRef.current);
        setupCallEvents(call);
      }
    });
    setPeerInstance(peer);
    return () => peer.destroy();
  }, []);

  const setupCallEvents = (call: MediaConnection) => {
    currentCallRef.current = call;
    call.on('stream', (remoteStream) => {
      if (remoteVideoRef.current) remoteVideoRef.current.srcObject = remoteStream;
    });
    call.on('close', () => endCall(false));
  };

  useEffect(() => {
    if (!socket) return;

    socket.on('incoming_call', (data: { callId: string, fromId: string, fromName: string, callType: 'VIDEO'|'AUDIO' }) => {
      if (data.fromId === currentUserId) return; 
      isCallerRef.current = false;
      partnerIdRef.current = data.fromId;
      activeCallIdRef.current = data.callId;
      
      setCallType(data.callType || 'VIDEO'); // 👈 State ও Ref একসাথে আপডেট
      setCallerInfo({ id: data.fromId, name: data.fromName });
      setIsReceivingCall(true);
    });

    socket.on('call_accepted', (data: { callId: string, peerId: string }) => {
      setIsDialing(false);
      setIsCallAccepted(true);
      activeCallIdRef.current = data.callId;
      callStartTimeRef.current = Date.now();

      if (peerInstance && localStreamRef.current) {
        const call = peerInstance.call(data.peerId, localStreamRef.current);
        setupCallEvents(call);
      }
    });

    socket.on('call_rejected', () => { endCall(false, true); });
    socket.on('call_missed', () => {
      if (!isCallerRef.current && onLogCallRef.current) {
        onLogCallRef.current(`Missed ${callTypeRef.current === 'VIDEO' ? 'Video' : 'Audio'} call`);
      }
      endCall(false, false);
    });
    socket.on('call_ended', () => endCall(false));

    return () => {
      socket.off('incoming_call'); socket.off('call_accepted');
      socket.off('call_rejected'); socket.off('call_missed'); socket.off('call_ended');
    };
  }, [socket, peerInstance]);

  const getMediaStream = async (type: 'VIDEO' | 'AUDIO') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: type === 'VIDEO', audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (error) {
      console.error("Permission denied", error);
    }
  };

  const initiateCall = async (receiverId: string, type: 'VIDEO' | 'AUDIO' = 'VIDEO', partnerName?: string) => {
    isCallerRef.current = true;
    partnerIdRef.current = receiverId;
    setCallType(type); // 👈 State ও Ref একসাথে আপডেট
    
    setIsDialing(true); setIsCallAccepted(false);
    if (partnerName) setCallerInfo({ id: receiverId, name: partnerName });

    setTimeout(async () => {
      await getMediaStream(type);
      socket.emit('call_user', { receiverId, fromId: currentUserId, fromName: currentUserName, callType: type });
    }, 100);
  };

  const acceptCall = async () => {
    setIsReceivingCall(false); setIsCallAccepted(true); callStartTimeRef.current = Date.now();
    setTimeout(async () => {
      await getMediaStream(callTypeRef.current);
      socket.emit('accept_call', { callId: activeCallIdRef.current, toId: partnerIdRef.current, peerId: myPeerId });
    }, 100);
  };

  const rejectCall = () => {
    setIsReceivingCall(false);
    socket.emit('reject_call', { callId: activeCallIdRef.current, toId: partnerIdRef.current });
    if (onLogCallRef.current) onLogCallRef.current(`Missed ${callTypeRef.current === 'VIDEO' ? 'Video' : 'Audio'} call`);
    setCallerInfo(null); endCall(false, true);
  };

  const endCall = (emitToSocket = true, isRejected = false) => {
    const duration = callStartTimeRef.current ? Math.floor((Date.now() - callStartTimeRef.current) / 1000) : 0;
    const type = callTypeRef.current;
    const pId = partnerIdRef.current;

    // 🔴 Caller এর সাইড থেকে Call Data পাঠানো
    if (isCallerRef.current && onLogCallRef.current) {
      const status = (isRejected || duration === 0) ? 'MISSED' : 'COMPLETED';
      if (status === 'MISSED') {
        onLogCallRef.current(`Missed ${type === 'VIDEO' ? 'Video' : 'Audio'} call`, { type, duration, status, partnerId: pId });
      } else {
        const m = Math.floor(duration / 60); const s = duration % 60;
        const timeStr = m > 0 ? `${m}m ${s}s` : `${s}s`;
        onLogCallRef.current(`${type === 'VIDEO' ? 'Video' : 'Audio'} call \u2022 ${timeStr}`, { type, duration, status, partnerId: pId });
      }
    } else if (!isCallerRef.current && !isRejected && duration > 0 && onLogCallRef.current) {
      const m = Math.floor(duration / 60); const s = duration % 60;
      const timeStr = m > 0 ? `${m}m ${s}s` : `${s}s`;
      onLogCallRef.current(`${type === 'VIDEO' ? 'Video' : 'Audio'} call \u2022 ${timeStr}`);
    }

    if (emitToSocket && partnerIdRef.current) socket.emit('end_call', { callId: activeCallIdRef.current, toId: partnerIdRef.current, duration: duration });
    
    if (currentCallRef.current) currentCallRef.current.close();
    if (localStreamRef.current) { localStreamRef.current.getTracks().forEach(track => track.stop()); localStreamRef.current = null; }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    
    setIsReceivingCall(false); setIsDialing(false); setIsCallAccepted(false);
    setCallerInfo(null); callStartTimeRef.current = 0; setIsAudioMuted(false); setIsVideoOff(false);
    isCallerRef.current = false; partnerIdRef.current = null; activeCallIdRef.current = null;
  };

  const toggleAudio = () => {
    if (localStreamRef.current) {
      const audioTrack = localStreamRef.current.getAudioTracks()[0];
      if (audioTrack) { audioTrack.enabled = !audioTrack.enabled; setIsAudioMuted(!audioTrack.enabled); }
    }
  };

  const toggleVideo = () => {
    if (localStreamRef.current) {
      const videoTrack = localStreamRef.current.getVideoTracks()[0];
      if (videoTrack) { videoTrack.enabled = !videoTrack.enabled; setIsVideoOff(!videoTrack.enabled); }
    }
  };

  return { 
    isReceivingCall, isCallAccepted, isDialing, callerInfo, localVideoRef, remoteVideoRef, 
    callType: callTypeState, // 👈 এখন আর Ref.current নয়, সরাসরি State পাঠানো হলো
    initiateCall, acceptCall, rejectCall, endCall, toggleAudio, toggleVideo, isAudioMuted, isVideoOff 
  };
};