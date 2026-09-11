import React, { useState } from 'react';
import { Download, Share, PlusSquare, X, Smartphone } from 'lucide-react';
import { usePWAInstall } from '../../hooks/usePWAInstall';

interface PWAInstallButtonProps {
  className?: string;
  compact?: boolean;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({ className = '', compact = false }) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // If already running as an installed standalone PWA, hide
  if (isInstalled) {
    return null;
  }

  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        onClick={install}
        className={`flex items-center gap-1.5 rounded-xl bg-[#5B825B] text-white font-bold text-xs shadow-xs hover:bg-[#4a6b4a] transition-colors ${
          compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5'
        } ${className}`}
        title="Install Monor Xur for offline access on home screen"
      >
        <Download className="w-3.5 h-3.5" />
        <span>{compact ? 'Install' : 'Install App'}</span>
      </button>
    );
  }

  // iOS Safari flow
  if (isIOS) {
    return (
      <>
        <button
          onClick={() => setShowIOSGuide(true)}
          className={`flex items-center gap-1.5 rounded-xl border border-[#D5CFBF] bg-white text-[#2D3A2F] font-bold text-xs hover:bg-[#F4EFE6] transition-colors ${
            compact ? 'px-2.5 py-1 text-[11px]' : 'px-3 py-1.5'
          } ${className}`}
          title="Add to Home Screen on iPhone or iPad"
        >
          <Smartphone className="w-3.5 h-3.5 text-[#5B825B]" />
          <span>{compact ? 'Add to Home' : 'Install on iOS'}</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-xs">
            <div className="w-full max-w-sm rounded-3xl bg-[#FDFBF7] p-6 shadow-2xl border border-[#E2DDD2] text-[#2D3A2F]">
              <div className="flex items-center justify-between pb-3 border-b border-[#E2DDD2]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#5B825B]/15 text-[#5B825B] flex items-center justify-center">
                    <Smartphone className="w-4 h-4" />
                  </div>
                  <h3 className="text-base font-black">Install Monor Xur</h3>
                </div>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="p-1 rounded-full hover:bg-[#EAE4D6] text-[#5A6E5D]"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="mt-4 space-y-3 text-xs text-[#5A6E5D] leading-relaxed">
                <p className="font-bold text-[#2D3A2F]">
                  Install to use the patient daily plan, soothing music, and memories without internet:
                </p>
                <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-[#E2DDD2]">
                  <Share className="w-4 h-4 text-[#5B825B] shrink-0 mt-0.5" />
                  <span>
                    1. Tap the <strong>Share</strong> icon in the bottom Safari toolbar.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 bg-white p-2.5 rounded-xl border border-[#E2DDD2]">
                  <PlusSquare className="w-4 h-4 text-[#5B825B] shrink-0 mt-0.5" />
                  <span>
                    2. Scroll down and tap <strong>Add to Home Screen</strong>.
                  </span>
                </div>
              </div>

              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-5 w-full rounded-xl bg-[#5B825B] py-2.5 text-xs font-black text-white hover:bg-[#4a6b4a] transition-colors"
              >
                Got It
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
