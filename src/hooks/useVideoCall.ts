import { useState, useEffect, useRef } from 'react';
import Peer, { MediaConnection } from 'peerjs';

export const useVideoCall = (socket: any, currentUserId: string | undefined, currentUserName: string | undefined) => {
  const [peerInstance, setPeerInstance] = useState<Peer | null>(null);
  const [myPeerId, setMyPeerId] = useState<string>('');
  
  // States for UI
  const [isReceivingCall, setIsReceivingCall] = useState(false);
  const [isCallAccepted, setIsCallAccepted] = useState(false);
  const [callerInfo, setCallerInfo] = useState<{ id: string, name: string } | null>(null);
  const [partnerId, setPartnerId] = useState<string | null>(null);
  
  // Refs for Video Tags and Streams
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const currentCallRef = useRef<MediaConnection | null>(null);
  const localStreamRef = useRef<MediaStream | null>(null);

  // ১. PeerJS ইনিশিয়ালাইজ করা
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    // নতুন Peer তৈরি করা
    const peer = new Peer();
    peer.on('open', (id) => setMyPeerId(id));

    // যখন কেউ আমাকে PeerJS দিয়ে কল করবে
    peer.on('call', (call) => {
      // যদি আমার ক্যামেরা অন থাকে, তবে অটোমেটিক কল রিসিভ করবো (কারণ আমি আগেই UI তে Accept ক্লিক করেছি)
      if (localStreamRef.current) {
        call.answer(localStreamRef.current);
        setupCallEvents(call);
      }
    });

    setPeerInstance(peer);
    return () => {
      peer.destroy(); // কম্পোনেন্ট আনমাউন্ট হলে কানেকশন কেটে দেবে
    };
  }, []);

  // ভিডিও স্ট্রিম সেটআপ করা
  const setupCallEvents = (call: MediaConnection) => {
    currentCallRef.current = call;
    call.on('stream', (remoteStream) => {
      if (remoteVideoRef.current) {
        remoteVideoRef.current.srcObject = remoteStream;
      }
    });
    call.on('close', () => endCall(false));
  };

  // ২. Socket.IO ইভেন্ট লিসেনার (রিং বাজানো, রিসিভ করা)
  useEffect(() => {
    if (!socket) return;

    // কেউ আমাকে কল দিলে
    const handleIncomingCall = (data: { fromId: string, fromName: string }) => {
      setCallerInfo({ id: data.fromId, name: data.fromName });
      setPartnerId(data.fromId);
      setIsReceivingCall(true);
    };

    // আমি যাকে কল দিয়েছি, সে রিসিভ করলে
    const handleCallAccepted = (data: { peerId: string }) => {
      setIsCallAccepted(true);
      // সে রিসিভ করলে আমি PeerJS দিয়ে আসল ভিডিও কলটা শুরু করবো
      if (peerInstance && localStreamRef.current) {
        const call = peerInstance.call(data.peerId, localStreamRef.current);
        setupCallEvents(call);
      }
    };

    // কল কেটে দিলে
    const handleCallRejected = () => {
      alert('Call was declined.');
      endCall(false);
    };

    const handleCallEnded = () => {
      endCall(false);
    };

    socket.on('incoming_call', handleIncomingCall);
    socket.on('call_accepted', handleCallAccepted);
    socket.on('call_rejected', handleCallRejected);
    socket.on('call_ended', handleCallEnded);

    return () => {
      socket.off('incoming_call', handleIncomingCall);
      socket.off('call_accepted', handleCallAccepted);
      socket.off('call_rejected', handleCallRejected);
      socket.off('call_ended', handleCallEnded);
    };
  }, [socket, peerInstance]);

  // ক্যামেরা এবং মাইক্রোফোনের পারমিশন নেওয়া
  const getMediaStream = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      localStreamRef.current = stream;
      if (localVideoRef.current) localVideoRef.current.srcObject = stream;
      return stream;
    } catch (error) {
      console.error("Camera permission denied", error);
      alert("ক্যামেরা এবং মাইক্রোফোন পারমিশন দিন!");
    }
  };

  // ৩. কল শুরু করা (Initiate Call)
  const initiateCall = async (receiverId: string) => {
    setPartnerId(receiverId);
    await getMediaStream();
    setIsCallAccepted(true); // আমার স্ক্রিনে ভিডিও দেখানো শুরু করবে
    
    // সকেট দিয়ে রিং বাজাতে বলবো
    socket.emit('call_user', {
      receiverId,
      fromId: currentUserId,
      fromName: currentUserName
    });
  };

  // ৪. কল রিসিভ করা (Accept Call)
  const acceptCall = async () => {
    await getMediaStream();
    setIsReceivingCall(false);
    setIsCallAccepted(true);

    // অপর জনকে বলবো আমি কল রিসিভ করেছি এবং আমার Peer ID পাঠিয়ে দেব
    socket.emit('accept_call', {
      toId: partnerId,
      peerId: myPeerId
    });
  };

  // ৫. কল ডিক্লাইন করা
  const rejectCall = () => {
    setIsReceivingCall(false);
    socket.emit('reject_call', { toId: partnerId });
    setCallerInfo(null);
    setPartnerId(null);
  };

  // ৬. কল কেটে দেওয়া
  const endCall = (emitToSocket = true) => {
    if (emitToSocket && partnerId) {
      socket.emit('end_call', { toId: partnerId });
    }
    
    if (currentCallRef.current) currentCallRef.current.close();
    if (localStreamRef.current) {
      localStreamRef.current.getTracks().forEach(track => track.stop()); // ক্যামেরা বন্ধ করা
      localStreamRef.current = null;
    }
    if (remoteVideoRef.current) remoteVideoRef.current.srcObject = null;
    if (localVideoRef.current) localVideoRef.current.srcObject = null;
    
    setIsReceivingCall(false);
    setIsCallAccepted(false);
    setCallerInfo(null);
    setPartnerId(null);
  };

  return {
    isReceivingCall,
    isCallAccepted,
    callerInfo,
    localVideoRef,
    remoteVideoRef,
    initiateCall,
    acceptCall,
    rejectCall,
    endCall
  };
};
