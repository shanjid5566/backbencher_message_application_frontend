'use client';

import { useCallHistory } from '@/hooks/useCallHistory';
import { authClient } from '@/lib/auth-client';

interface CallHistoryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CallHistoryModal({ isOpen, onClose }: CallHistoryModalProps) {
  const { data: session } = authClient.useSession();
  const { data: calls, isLoading } = useCallHistory();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="bg-surface-900 border border-surface-700/50 w-full max-w-md rounded-2xl shadow-2xl flex flex-col h-[80vh] animate-scale-in">
        
        {/* Header */}
        <div className="p-4 border-b border-surface-700/50 flex justify-between items-center">
          <h2 className="text-xl font-bold text-white">Call History</h2>
          <button 
            onClick={onClose}
            className="w-8 h-8 flex items-center justify-center rounded-full bg-surface-800 hover:bg-surface-700 text-surface-300 transition"
          >
            ✕
          </button>
        </div>

        {/* Call List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {isLoading ? (
            <div className="flex justify-center mt-10">
              <p className="text-surface-400">Loading calls...</p>
            </div>
          ) : calls?.length === 0 ? (
            <div className="text-center text-surface-400 mt-10">
              <p>No recent calls found.</p>
            </div>
          ) : (
            calls?.map((call: any) => {
              const isOutgoing = call.callerId === session?.user?.id;
              const partner = isOutgoing ? call.receiver : call.caller;
              
              const isMissed = call.status === 'MISSED';
              const isRejected = call.status === 'REJECTED';
              const statusColor = (isMissed || isRejected) ? 'text-red-500' : 'text-surface-400';

              return (
                <div key={call.id} className="flex items-center p-3 rounded-xl hover:bg-surface-800 transition">
                  <img 
                    src={partner.image || `https://avatar.iran.liara.run/public`} 
                    alt={partner.name} 
                    className="w-12 h-12 rounded-full object-cover bg-slate-700 mr-3"
                  />
                  
                  <div className="flex-1 min-w-0">
                    <h3 className={`font-semibold truncate ${isMissed ? 'text-red-400' : 'text-white'}`}>
                      {partner.name}
                    </h3>
                    
                    <div className={`flex items-center text-sm ${statusColor} gap-1 mt-0.5`}>
                      <span>{isOutgoing ? '↗' : '↙'}</span>
                      <span>{call.callType === 'VIDEO' ? '📹' : '📞'}</span>
                      <span className="truncate ml-1">
                        {isMissed ? 'Missed Call' : isRejected ? 'Declined' : 
                          `${call.duration ? Math.floor(call.duration / 60) + 'm ' + (call.duration % 60) + 's' : 'Completed'}`
                        }
                      </span>
                    </div>
                  </div>

                  <div className="text-xs text-surface-500 text-right">
                    {new Date(call.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    <br />
                    {new Date(call.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
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