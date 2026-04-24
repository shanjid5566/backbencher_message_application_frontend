'use client';

import { useState, useRef, useEffect } from 'react';
import { useMessages } from '@/hooks/useMessages';
import { authClient } from '@/lib/auth-client';
import api from '@/lib/axios';
import { useQueryClient } from '@tanstack/react-query';

interface ChatWindowProps {
  conversationId: string | null;
  receiverId: string | null;
  socket: any;
  onStartVideoCall?: () => void;
  onStartAudioCall?: () => void;
}

export default function ChatWindow({ conversationId, receiverId, socket, onStartVideoCall, onStartAudioCall }: ChatWindowProps) {
  const { data: session } = authClient.useSession();
  const { data: messages, isLoading } = useMessages(conversationId);
  const queryClient = useQueryClient();
  
  const [newMessage, setNewMessage] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isTyping, setIsTyping] = useState(false);
  
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Auto-scroll
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping]);

  // Real-time Listeners
  useEffect(() => {
    if (!socket || !conversationId) return;

    const handleNewMessage = (newMessage: any) => {
      if (newMessage.conversationId === conversationId) {
        queryClient.setQueryData(['messages', conversationId], (oldMessages: any) => {
          if (!oldMessages) return [newMessage];
          return [newMessage, ...oldMessages]; 
        });
      }
    };

    const handleTyping = (data: any) => {
      if (data.conversationId === conversationId) setIsTyping(true);
    };

    const handleStopTyping = (data: any) => {
      if (data.conversationId === conversationId) setIsTyping(false);
    };

    socket.on('new_message', handleNewMessage);
    socket.on('user_typing', handleTyping);
    socket.on('user_stopped_typing', handleStopTyping);

    return () => {
      socket.off('new_message', handleNewMessage);
      socket.off('user_typing', handleTyping);
      socket.off('user_stopped_typing', handleStopTyping);
    };
  }, [socket, conversationId, queryClient]);

  // Input Change & Typing Emit
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);

    if (!socket || !receiverId) return;

    socket.emit("typing", { receiverId, conversationId });

    if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);

    typingTimeoutRef.current = setTimeout(() => {
      socket.emit("stop_typing", { receiverId, conversationId });
    }, 2000);
  };

  // Send Message Logic (Text + File)
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if ((!newMessage.trim() && !selectedFile) || !conversationId) return;

    setIsSending(true);
    try {
      if (selectedFile) {
        const formData = new FormData();
        formData.append('conversationId', conversationId);
        if (newMessage.trim()) formData.append('body', newMessage);
        formData.append('file', selectedFile);

        await api.post('/messages/send-file', formData);
      } else {
        await api.post('/messages/send-text', {
          conversationId,
          body: newMessage,
        });
      }

      setNewMessage('');
      setSelectedFile(null);
      socket.emit("stop_typing", { receiverId, conversationId });
      
    } catch (error) {
      console.error('Failed to send message:', error);
      alert('Message failed to send!');
    } finally {
      setIsSending(false);
    }
  };

  if (!conversationId) {
    return (
      <div className="flex-1 flex items-center justify-center bg-[#18191A] text-slate-400">
        <p className="text-xl">Select a conversation to start messaging</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-[#18191A] h-screen relative">
      
      {/* Header with Call Buttons */}
      <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center text-white z-10 shadow-sm">
        <h2 className="font-semibold text-lg flex items-center gap-2">
          Conversation
        </h2>
        
        <div className="flex gap-3">
          <button 
            onClick={onStartAudioCall}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition border border-slate-700 hover:border-blue-500"
            title="Audio Call"
          >
            📞
          </button>
          <button 
            onClick={onStartVideoCall}
            className="w-10 h-10 rounded-full bg-slate-800 hover:bg-slate-700 flex items-center justify-center transition border border-slate-700 hover:border-blue-500"
            title="Video Call"
          >
            📹
          </button>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 p-4 overflow-y-auto flex flex-col-reverse space-y-reverse space-y-4">
        {isLoading ? (
          <div className="text-center text-slate-400">Loading messages...</div>
        ) : (
          <>
            <div ref={messagesEndRef} />
            
            {isTyping && (
              <div className="flex justify-start w-full mt-2">
                <div className="bg-slate-800 px-4 py-2 rounded-2xl rounded-bl-none text-slate-400 text-sm italic animate-pulse">
                  typing...
                </div>
              </div>
            )}

            {messages?.map((msg: any) => {
              const isMe = msg.sender?.id === session?.user?.id;
              const fileUrl = msg.fileUrl ? msg.fileUrl.replace(/\\/g, '/') : null;
              const fullFileUrl = fileUrl ? `http://localhost:5000/${fileUrl}` : null;

              return (
                <div key={msg.id} className={`flex ${isMe ? 'justify-end' : 'justify-start'} w-full`}>
                  <div className={`max-w-[70%] p-3 rounded-2xl text-white shadow-sm ${
                    isMe ? 'bg-blue-600 rounded-br-none' : 'bg-slate-700 rounded-bl-none'
                  }`}>
                    
                    {fullFileUrl && (
                      <div className="mb-2">
                        {msg.fileType === 'IMAGE' ? (
                          <img 
                            src={fullFileUrl} 
                            alt="Attachment" 
                            className="max-w-[250px] md:max-w-[300px] rounded-lg border border-slate-500/30 object-cover"
                          />
                        ) : (
                          <a 
                            href={fullFileUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-2 bg-black/20 p-3 rounded-lg hover:bg-black/30 transition text-sm"
                          >
                            <span>📎</span>
                            <span className="underline truncate">Download File</span>
                          </a>
                        )}
                      </div>
                    )}

                    {msg.body && <p className="whitespace-pre-wrap leading-relaxed">{msg.body}</p>}
                    
                    <span className="text-[10px] text-slate-300/80 block mt-1.5 text-right font-medium">
                      {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                </div>
              );
            })}
          </>
        )}
      </div>

      {/* Input Area */}
      <div className="p-4 bg-slate-900 border-t border-slate-800 flex flex-col gap-2">
        {selectedFile && (
          <div className="flex items-center gap-2 p-2 bg-slate-800 rounded-lg w-max border border-slate-700">
            <span className="text-sm text-slate-300 truncate max-w-[200px] font-medium">
              {selectedFile.name}
            </span>
            <button 
              onClick={() => setSelectedFile(null)}
              className="text-red-400 hover:text-red-300 ml-2 font-bold"
            >
              ✕
            </button>
          </div>
        )}

        <form onSubmit={handleSendMessage} className="flex gap-2 items-center">
          <input 
            type="file" 
            ref={fileInputRef}
            onChange={(e) => setSelectedFile(e.target.files?.[0] || null)}
            className="hidden"
            accept="image/*,.pdf,.doc,.docx"
          />

          <button 
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-slate-400 hover:text-blue-400 p-2 transition rounded-full hover:bg-slate-800"
          >
            📎
          </button>

          <input
            type="text"
            value={newMessage}
            onChange={handleInputChange}
            placeholder="Type a message..."
            className="flex-1 bg-slate-800 text-white rounded-full px-5 py-2.5 outline-none border border-slate-700 focus:border-blue-500 transition-colors"
            disabled={isSending}
          />
          
          <button 
            type="submit" 
            disabled={isSending || (!newMessage.trim() && !selectedFile)}
            className="bg-blue-600 hover:bg-blue-700 text-white p-2.5 rounded-full w-11 h-11 flex items-center justify-center disabled:opacity-50 transition shadow-md"
          >
            ➤
          </button>
        </form>
      </div>
    </div>
  );
}
