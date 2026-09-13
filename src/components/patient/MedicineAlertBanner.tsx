import React, { useState, useEffect, useRef } from 'react';
import { Pill, Clock, CheckCircle2, Bell, Volume2, X } from 'lucide-react';
import { Reminder } from '../../types';
import { parseTimeToMinutes, getCurrentMinutesOfDay } from '../../utils/timeUtils';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';

interface MedicineAlertBannerProps {
  reminders: Reminder[];
  onToggleReminder: (id: string) => void;
  onOpenMedicineList: () => void;
  simulationTrigger?: number; // counter to force test alert
}

export const MedicineAlertBanner: React.FC<MedicineAlertBannerProps> = ({
  reminders,
  onToggleReminder,
  onOpenMedicineList,
  simulationTrigger = 0,
}) => {
  const { tx, language } = useLanguage();
  const [activeReminder, setActiveReminder] = useState<Reminder | null>(null);
  const [snoozedUntil, setSnoozedUntil] = useState<Record<string, number>>({});
  const [dismissedMap, setDismissedMap] = useState<Record<string, boolean>>({});
  const lastChimeTime = useRef<number>(0);
  const lastSpokenReminderId = useRef<string | null>(null);

  // Request browser notification permission once gently on interaction
  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window) {
      if (Notification.permission === 'default') {
        Notification.requestPermission().catch(() => {});
      }
    }
  }, []);

  // Periodic check every 10 seconds for active due medicine
  useEffect(() => {
    const checkDueMedicines = () => {
      const nowMs = Date.now();
      const currentMinutes = getCurrentMinutesOfDay();

      // Find pending medicine reminders
      const pendingMeds = reminders.filter(
        (r) => !r.completed && (r.type === 'medicine' || r.type === 'routine')
      );

      if (pendingMeds.length === 0) {
        setActiveReminder(null);
        return;
      }

      // Check for any medicine that matches current time window (within 45 mins of scheduled time or currently due)
      for (const med of pendingMeds) {
        // If snoozed, check if snooze expired
        if (snoozedUntil[med.id] && nowMs < snoozedUntil[med.id]) {
          continue;
        }
        // If manually dismissed this session
        if (dismissedMap[med.id]) {
          continue;
        }

        const medMinutes = med.minutes && med.minutes > 0 ? med.minutes : parseTimeToMinutes(med.time_label);
        const diff = currentMinutes - medMinutes;

        // Active if within 15 minutes before or up to 60 minutes after scheduled time
        if (diff >= -15 && diff <= 90) {
          setActiveReminder(med);

          // Play chime and announce if not done recently
          if (nowMs - lastChimeTime.current > 30000 && lastSpokenReminderId.current !== med.id) {
            lastChimeTime.current = nowMs;
            lastSpokenReminderId.current = med.id;

            soundController.playChime(520, 0.8);

            const title = med.title;
            const textEn = `Friendly reminder: It is time to take your medicine, ${title}.`;
            const textHi = `ध्यान दें: आपकी दवाई लेने का समय हो गया है, ${title}।`;
            const textAs = `মন কৰক: আপোনাৰ দৰব খোৱাৰ সময় হৈছে, ${title}।`;

            soundController.speakBilingual(textEn, textHi, undefined, textAs);

            // Native notification if supported
            if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
              try {
                new Notification('Monor Xur • Medicine Time', {
                  body: `${title} (${med.time_label}) - ${med.note || 'Scheduled dose'}`,
                  icon: '/icon.svg',
                });
              } catch (_) {}
            }
          }
          return;
        }
      }

      // If no medicine matches the immediate active window, check if activeReminder was completed
      if (activeReminder && activeReminder.completed) {
        setActiveReminder(null);
      }
    };

    checkDueMedicines();
    const interval = setInterval(checkDueMedicines, 10000);
    return () => clearInterval(interval);
  }, [reminders, snoozedUntil, dismissedMap, activeReminder]);

  // Handle manual simulation trigger (e.g., when user clicks "Test Medicine Alert")
  useEffect(() => {
    if (simulationTrigger > 0) {
      const target = reminders.find((r) => !r.completed && r.type === 'medicine') || reminders[0];
      if (target) {
        setActiveReminder(target);
        soundController.playChime(520, 0.8);
        const textEn = `Friendly reminder: It is time to take your medicine, ${target.title}.`;
        const textHi = `ध्यान दें: आपकी दवाई लेने का समय हो गया है, ${target.title}।`;
        const textAs = `মন কৰক: আপোনাৰ দৰব খোৱাৰ সময় হৈছে, ${target.title}।`;
        soundController.speakBilingual(textEn, textHi, undefined, textAs);
      }
    }
  }, [simulationTrigger, reminders]);

  if (!activeReminder) return null;

  const handleMarkTaken = () => {
    soundController.playSuccess();
    onToggleReminder(activeReminder.id);
    setActiveReminder(null);
  };

  const handleSnooze = () => {
    soundController.playClick();
    const tenMinutesLater = Date.now() + 10 * 60 * 1000;
    setSnoozedUntil((prev) => ({ ...prev, [activeReminder.id]: tenMinutesLater }));
    setActiveReminder(null);
  };

  const handleDismiss = () => {
    soundController.playClick();
    setDismissedMap((prev) => ({ ...prev, [activeReminder.id]: true }));
    setActiveReminder(null);
  };

  const handleSpeakAloud = () => {
    const textEn = `Medicine reminder: Please take ${activeReminder.title}. Scheduled for ${activeReminder.time_label}. ${activeReminder.note || ''}`;
    const textHi = `दवाई स्मरण: कृपया ${activeReminder.title} लें। समय: ${activeReminder.time_label}। ${activeReminder.note || ''}`;
    const textAs = `দৰবৰ সোঁৱৰণি: অনুগ্ৰহ কৰি ${activeReminder.title} খাওক। সময়: ${activeReminder.time_label}। ${activeReminder.note || ''}`;
    soundController.speakBilingual(textEn, textHi, undefined, textAs);
  };

  return (
    <div
      id="medicine-alert-banner"
      className="fixed top-16 sm:top-20 left-4 right-4 max-w-lg mx-auto z-40 animate-slideDown"
    >
      <div className="bg-[#FFF9EE] border-2 border-[#D97706] rounded-3xl p-4 sm:p-5 shadow-2xl backdrop-blur-md relative overflow-hidden">
        {/* Subtle decorative pulsing glow bar */}
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#D97706] via-[#E8B25C] to-[#5B825B] animate-pulse" />

        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-12 h-12 rounded-2xl bg-[#D97706] text-white flex items-center justify-center shrink-0 shadow-md">
              <Pill className="w-6 h-6 animate-bounce" />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#D97706]/15 text-[#92400E] font-black text-xs uppercase tracking-wider">
                  <Bell className="w-3 h-3" />
                  {tx('Medicine Time', 'दवाई का समय', 'দৰব খোৱাৰ সময়')}
                </span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-[#5A6E5D]">
                  <Clock className="w-3.5 h-3.5" />
                  {activeReminder.time_label}
                </span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-[#2D3A2F] mt-1 leading-tight">
                {activeReminder.title}
              </h3>

              {activeReminder.note && (
                <p className="text-xs sm:text-sm text-[#78350F] font-semibold mt-1 bg-amber-100/60 px-2.5 py-1 rounded-xl inline-block">
                  💡 {activeReminder.note}
                </p>
              )}
            </div>
          </div>

          {/* Dismiss button & Speak button */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              onClick={handleSpeakAloud}
              className="p-2 rounded-xl bg-white/80 hover:bg-white text-[#5A6E5D] hover:text-[#2D3A2F] shadow-xs"
              title={tx('Listen aloud', 'सुनें', 'শুনিব')}
              aria-label="Listen aloud"
            >
              <Volume2 className="w-4 h-4 text-[#D97706]" />
            </button>
            <button
              onClick={handleDismiss}
              className="p-2 rounded-xl bg-white/80 hover:bg-white text-gray-400 hover:text-gray-600 shadow-xs"
              title={tx('Close', 'बंद करें', 'বন্ধ কৰক')}
              aria-label="Close notification"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-4 pt-3 border-t border-amber-200/80 flex flex-wrap items-center gap-2">
          <button
            id="medicine-alert-mark-taken"
            onClick={handleMarkTaken}
            className="flex-1 min-w-[140px] py-3 px-4 rounded-2xl bg-[#5B825B] hover:bg-[#4a6d4a] active:scale-[0.98] text-white font-black text-sm shadow-md flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <CheckCircle2 className="w-5 h-5" />
            <span>{tx('I Took This Medicine', 'मैंने दवाई ले ली', 'মই দৰব খালোঁ')}</span>
          </button>

          <button
            onClick={handleSnooze}
            className="py-3 px-3 rounded-2xl bg-white border border-[#E0DCD3] hover:bg-amber-100/50 text-[#92400E] font-bold text-xs shadow-xs active:scale-95 transition-all"
          >
            {tx('Snooze 10m', '10 मिनट बाद', '১০ মিনিট পিছত')}
          </button>

          <button
            onClick={() => {
              setActiveReminder(null);
              onOpenMedicineList();
            }}
            className="py-3 px-3 rounded-2xl bg-amber-100/80 hover:bg-amber-200 text-[#78350F] font-bold text-xs shadow-xs active:scale-95 transition-all"
          >
            {tx('All Medicines', 'सभी दवाइयाँ', 'সকলো দৰব')}
          </button>
        </div>
      </div>
    </div>
  );
};
