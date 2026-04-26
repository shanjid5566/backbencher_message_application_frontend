'use client';

import { useState, useEffect } from 'react';
import { authClient } from '@/lib/auth-client';
import { X, PhoneMissed, PhoneIncoming, PhoneOutgoing, Video, Phone } from 'lucide-react';
import api from '@/lib/axios';

interface CallHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// Skeleton row component
function CallSkeletonRow() {
  return (
    <div className="flex items-center p-3 rounded-xl gap-3 animate-pulse">
      {/* Avatar skeleton */}
      <div className="w-12 h-12 rounded-full bg-surface-700 flex-shrink-0" />
      {/* Text skeleton */}
      <div className="flex-1 space-y-2">
        <div className="h-3.5 bg-surface-700 rounded-full w-32" />
        <div className="h-2.5 bg-surface-800 rounded-full w-20" />
      </div>
      {/* Date skeleton */}
      <div className="space-y-1.5 flex flex-col items-end">
        <div className="h-2.5 bg-surface-700 rounded-full w-12" />
        <div className="h-2.5 bg-surface-800 rounded-full w-10" />
      </div>
    </div>
  );
}

export default function CallHistoryModal({ isOpen, onClose }: CallHistoryModalProps) {
  const { data: session } = authClient.useSession();
  const [calls, setCalls] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsLoading(true);
      api.get('/calls/history')
         .then(res => setCalls(res.data.data || []))
         .catch(err => console.error("Failed to load calls", err))
         .finally(() => setIsLoading(false));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-surface-900 border border-surface-700/50 w-full max-w-md rounded-2xl shadow-2xl flex flex-col h-[75vh] animate-scale-in overflow-hidden">

        {/* Header */}
        <div className="px-5 py-4 border-b border-surface-700/50 flex justify-between items-center flex-shrink-0">
          <h2 className="text-lg font-bold text-white tracking-tight">Call History</h2>
          <button
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-800 hover:bg-surface-700 text-surface-400 hover:text-white transition"
          >
            <X size={16} />
          </button>
        </div>

        {/* Call List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1">
          {isLoading ? (
            // Skeleton rows
            <>
              {[...Array(6)].map((_, i) => <CallSkeletonRow key={i} />)}
            </>
          ) : calls?.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center py-10 gap-3">
              <div className="w-16 h-16 rounded-full bg-surface-800 flex items-center justify-center">
                <Phone size={28} className="text-surface-500" />
              </div>
              <p className="text-surface-400 text-sm font-medium">No recent calls found.</p>
            </div>
          ) : (
            calls?.map((call: any) => {
              const isOutgoing = call.callerId === session?.user?.id;
              const partner = isOutgoing ? call.receiver : call.caller;

              const isMissed = call.status === 'MISSED';
              const isRejected = call.status === 'REJECTED';
              const isCompleted = !isMissed && !isRejected;

              const StatusIcon = isMissed
                ? PhoneMissed
                : isOutgoing
                  ? PhoneOutgoing
                  : PhoneIncoming;

              const statusColor = (isMissed || isRejected) ? 'text-red-400' : 'text-green-400';
              const nameColor = (isMissed || isRejected) ? 'text-red-400' : 'text-white';

              const durationStr = call.duration
                ? (Math.floor(call.duration / 60) > 0 ? `${Math.floor(call.duration / 60)}m ` : '') + `${call.duration % 60}s`
                : null;

              const callDate = new Date(call.createdAt);
              const isToday = new Date().toDateString() === callDate.toDateString();
              const dateStr = isToday
                ? callDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : callDate.toLocaleDateString([], { month: 'short', day: 'numeric' });

              return (
                <div key={call.id} className="flex items-center p-3 rounded-xl hover:bg-surface-800/60 transition-colors gap-3 group cursor-pointer">
                  {/* Avatar */}
                  <div className="relative flex-shrink-0">
                    <img
                      src={partner?.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(partner?.name || 'User')}&background=random`}
                      alt={partner?.name || 'Unknown'}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                    {/* Call type badge */}
                    <div className={`absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full flex items-center justify-center border-2 border-surface-900 ${(isMissed || isRejected) ? 'bg-red-500/20' : 'bg-surface-700'}`}>
                      {call.callType === 'VIDEO'
                        ? <Video size={10} className={(isMissed || isRejected) ? 'text-red-400' : 'text-surface-300'} />
                        : <Phone size={10} className={(isMissed || isRejected) ? 'text-red-400' : 'text-surface-300'} />
                      }
                    </div>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold text-sm truncate ${nameColor}`}>
                      {partner?.name || 'Unknown User'}
                    </h3>
                    <div className={`flex items-center gap-1.5 text-xs mt-0.5 ${statusColor}`}>
                      <StatusIcon size={12} />
                      <span className="truncate">
                        {isMissed
                          ? 'Missed Call'
                          : isRejected
                            ? 'Declined'
                            : isCompleted && durationStr
                              ? durationStr
                              : 'Completed'}
                      </span>
                    </div>
                  </div>

                  {/* Date */}
                  <div className="text-xs text-surface-500 text-right flex-shrink-0">
                    {dateStr}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
