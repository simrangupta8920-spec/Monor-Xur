import React from 'react';
import { WifiOff, ShieldCheck, RefreshCw } from 'lucide-react';
import { useOnlineStatus } from '../../hooks/useOnlineStatus';
import { getOfflineQueue } from '../../services/offlineStorage';

export const OfflineIndicator: React.FC = () => {
  const isOnline = useOnlineStatus();
  const queue = getOfflineQueue();

  if (isOnline) return null;

  return (
    <aside aria-label="Offline Mode Notification" className="sticky top-0 z-50 bg-[#8B5E3C] text-[#FFF9F2] px-4 py-2 text-xs font-semibold shadow-md flex items-center justify-between border-b border-[#734A2C] transition-all animate-fadeIn">
      <div className="flex items-center gap-2 max-w-md">
        <span className="p-1 rounded-md bg-white/20 text-white shrink-0">
          <WifiOff className="w-3.5 h-3.5" />
        </span>
        <div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold tracking-wide uppercase text-[10px] bg-white/20 px-1.5 py-0.5 rounded">
              Offline Mode
            </span>
            <span className="text-[11px] font-bold text-white/90">
              Core patient data & today's daily plan are available.
            </span>
          </div>
          {queue.length > 0 && (
            <p className="text-[10px] text-white/80 mt-0.5 flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#A8D5BA]" />
              <span>{queue.length} update{queue.length > 1 ? 's' : ''} saved locally. Will sync when online.</span>
            </p>
          )}
        </div>
      </div>

      <button
        onClick={() => {
          if (navigator.onLine) {
            window.location.reload();
          }
        }}
        className="px-2.5 py-1 rounded-lg bg-white/15 hover:bg-white/25 active:scale-95 text-[11px] font-bold text-white flex items-center gap-1 transition-colors shrink-0"
        title="Check internet connection"
      >
        <RefreshCw className="w-3 h-3" />
        <span className="hidden sm:inline">Check</span>
      </button>
    </aside>
  );
};
