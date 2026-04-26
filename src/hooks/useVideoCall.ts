import { useState, useEffect, useRef } from 'react';
import Peer, { MediaConnection } from 'peerjs';

export const useVideoCall = (
  socket: any, 
  currentUserId: string | undefined, 
  currentUserName: string | undefined,
  onLogCall?: (body: string) => void // callback to save call log to DB
) => {
  const [peerInstance, setPeerInstance] = useState<Peer | null>(null);
  const [myPeerId, setMyPeerId] = useState<string>('');
  
  // UI & DB States
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [isDialing, setIsDialing] = useState(false);
  const [callerInfo, setCallerInfo] = useState<{ id: string, name: string } | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [callType, setCallType] = useState<'VIDEO' | 'AUDIO'>('VIDEO');
  const [activeCallId, setActiveCallId] = useState<string | null>(null);
  const [isCaller, setIsCaller] = useState(false); // 👈 নতুন
  const callStartTimeRef = useRef<number>(0);
  
  // Media Control States
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const currentCallRef = useRef<MediaConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

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
      setIsCaller(false); // 👈
      setCallerInfo({ id: data.fromId, name: data.fromName });
      setPartnerId(data.fromId);
      setCallType(data.callType || 'VIDEO');
      setActiveCallId(data.callId);
      setIsReceivingCall(true);
    });

    socket.on('call_accepted', (data: { callId: string, peerId: string }) => {
      setIsDialing(false);
      setIsCallAccepted(true);
      setActiveCallId(data.callId);
      callStartTimeRef.current = Date.now();

      if (peerInstance && localStreamRef.current) {
        const call = peerInstance.call(data.peerId, localStreamRef.current);
        setupCallEvents(call);
      }
    });

    socket.on('call_rejected', () => {
      // The person who called hears: the callee rejected (missed for them)
      endCall(false, true); // isRejected=true
    });

    socket.on('call_missed', () => {
      // The callee receives this after caller cancelled — log missed call on their side
      if (!isCaller && onLogCall) {
        onLogCall(`Missed ${callType === 'VIDEO' ? 'Video' : 'Audio'} call`);
      }
      endCall(false, false);
    });

    socket.on('call_ended', () => endCall(false));

    return () => {
      socket.off('incoming_call');
      socket.off('call_accepted');
      socket.off('call_rejected');
      socket.off('call_missed');
      socket.off('call_ended');
    };
  }, [socket, peerInstance]);

  const getMediaStream = async (type: 'VIDEO' | 'AUDIO') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: type === 'VIDEO',
        audio: true
      });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (error) {
      console.error("Permission denied", error);
      alert("Please allow camera/microphone permissions.");
    }
  };

  const initiateCall = async (receiverId: string, type: 'VIDEO' | 'AUDIO' = 'VIDEO', partnerName?: string) => {
    setIsCaller(true); // 👈 আমি কল দিচ্ছি
    setPartnerId(receiverId);
    setCallType(type);
    setIsDialing(true);
    setIsCallAccepted(false);
    if (partnerName) {
      setCallerInfo({ id: receiverId, name: partnerName });
    }

    setTimeout(async () => {
      await getMediaStream(type);
      socket.emit('call_user', {
        receiverId,
        fromId: currentUserId,
        fromName: currentUserName,
        callType: type
      });
    }, 100);
  };

  const acceptCall = async () => {
    setIsReceivingCall(false);
    setIsCallAccepted(true);
    callStartTimeRef.current = Date.now();

    setTimeout(async () => {
      await getMediaStream(callType);
      socket.emit('accept_call', {
        callId: activeCallId,
        toId: partnerId,
        peerId: myPeerId
      });
    }, 100);
  };

  const rejectCall = () => {
    setIsReceivingCall(false);
    socket.emit('reject_call', { callId: activeCallId, toId: partnerId });
    // Log missed call on the RECEIVER's side too
    if (onLogCall) {
      onLogCall(`Missed ${callType === 'VIDEO' ? 'Video' : 'Audio'} call`);
    }
    setCallerInfo(null);
    setPartnerId(null);
    setActiveCallId(null);
    endCall(false, true);
  };

  const endCall = (emitToSocket = true, isRejected = false) => {
    const duration = callStartTimeRef.current ? Math.floor((Date.now() - callStartTimeRef.current) / 1000) : 0;

    // 🔴 কল লগ মেসেজ তৈরি করা — শুধু caller-এর পক্ষ থেকে (receiver side is handled in rejectCall/call_missed)
    if (isCaller && onLogCall) {
      if (isRejected || duration === 0) {
        onLogCall(`Missed ${callType === 'VIDEO' ? 'Video' : 'Audio'} call`);
      } else {
        const m = Math.floor(duration / 60);
        const s = duration % 60;
        const timeStr = m > 0 ? `${m}m ${s}s` : `${s}s`;
        onLogCall(`${callType === 'VIDEO' ? 'Video' : 'Audio'} call \u2022 ${timeStr}`);
      }
    } else if (!isCaller && !isRejected && duration > 0 && onLogCall) {
      // Receiver side — completed call log
      const m = Math.floor(duration / 60);
      const s = duration % 60;
      const timeStr = m > 0 ? `${m}m ${s}s` : `${s}s`;
      onLogCall(`${callType === 'VIDEO' ? 'Video' : 'Audio'} call \u2022 ${timeStr}`);
    }

    if (emitToSocket && partnerId) {
      socket.emit('end_call', { callId: activeCallId, toId: partnerId, duration: duration });
    }
    
    if (currentCallRef.current) currentCallRef.current.close();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
      localStreamRef.current = null;
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    
    setIsReceivingCall(false);
    setIsDialing(false);
    setIsCallAccepted(false);
    setCallerInfo(null);
    setPartnerId(null);
    setActiveCallId(null);
    callStartTimeRef.current = 0;
    setIsAudioMuted(false);
    setIsVideoOff(false);
    setIsCaller(false);
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
    isReceivingCall, isCallAccepted, isDialing, callerInfo, localVideoRef, remoteVideoRef,
    callType, initiateCall, acceptCall, rejectCall, endCall, toggleAudio, toggleVideo, isAudioMuted, isVideoOff
  };
};