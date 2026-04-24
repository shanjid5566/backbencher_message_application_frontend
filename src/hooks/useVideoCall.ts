import { useState, useEffect, useRef } from 'react';
import Peer, { MediaConnection } from 'peerjs';

export const useVideoCall = (socket: any, currentUserId: string | undefined, currentUserName: string | undefined) => {
  const [peerInstance, setPeerInstance] = useState<Peer | null>(null);
  const [myPeerId, setMyPeerId] = useState<string>('');
  
  // UI States
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [callerInfo, setCallerInfo] = useState<{ id: string, name: string } | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  const [callType, setCallType] = useState<'video' | 'audio'>('video');
  
  // Media Control States
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  
  // Refs
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const currentCallRef = useRef<MediaConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // ১. PeerJS ইনিশিয়ালাইজ করা
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
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });
    call.on('close', () => endCall(false));
  };

  // ২. Socket.IO ইভেন্ট লিসেনার
  useEffect(() => {
    if (!socket) return;

    socket.on('incoming_call', (data: { fromId: string, fromName: string, callType: 'video' | 'audio' }) => {
      setCallerInfo({ id: data.fromId, name: data.fromName });
      setPartnerId(data.fromId);
      setCallType(data.callType || 'video');
      setIsReceivingCall(true);
    });

    socket.on('call_accepted', (data: { peerId: string }) => {
      setIsCallAccepted(true);
      if (peerInstance && localStreamRef.current) {
        const call = peerInstance.call(data.peerId, localStreamRef.current);
        setupCallEvents(call);
      }
    });

    socket.on('call_rejected', () => {
      alert('Call was declined.');
      endCall(false);
    });

    socket.on('call_ended', () => endCall(false));

    return () => {
      socket.off('incoming_call');
      socket.off('call_accepted');
      socket.off('call_rejected');
      socket.off('call_ended');
    };
  }, [socket, peerInstance]);

  // ৩. মিডিয়া পারমিশন নেওয়া
  const getMediaStream = async (type: 'video' | 'audio') => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: type === 'video', 
        audio: true 
      });
      localStreamRef.current = stream;
      
      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }
      return stream;
    } catch (error) {
      console.error("Camera/Mic permission denied", error);
      alert("Please allow Camera and Microphone permissions!");
    }
  };

  // ৪. কল কন্ট্রোল ফাংশন
  const initiateCall = async (receiverId: string, type: 'video' | 'audio' = 'video') => {
    setPartnerId(receiverId);
    setCallType(type);
    setIsCallAccepted(true); 

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

    setTimeout(async () => {
      await getMediaStream(callType);
      socket.emit('accept_call', {
        toId: partnerId,
        peerId: myPeerId
      });
    }, 100);
  };

  const rejectCall = () => {
    setIsReceivingCall(false);
    socket.emit('reject_call', { toId: partnerId });
    setCallerInfo(null);
    setPartnerId(null);
  };

  const endCall = (emitToSocket = true) => {
    if (emitToSocket && partnerId) {
      socket.emit('end_call', { toId: partnerId });
    }
    
    if (currentCallRef.current) currentCallRef.current.close();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop());
    }
    
    setIsReceivingCall(false);
    setIsCallAccepted(false);
    setCallerInfo(null);
    setPartnerId(null);
    setIsAudioMuted(false);
    setIsVideoOff(false);
  };

  // ৫. মিডিয়া টগল ফাংশন
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
    isVideoOff
  };
};
