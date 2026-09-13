import React, { useState } from 'react';
import {
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock,
  Pill,
  Volume2,
  Phone,
  Bell,
  Sparkles,
  Info,
  Calendar,
  AlertCircle
} from 'lucide-react';
import { Reminder } from '../../types';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';
import { parseTimeToMinutes } from '../../utils/timeUtils';

interface MedicineRemindersProps {
  reminders: Reminder[];
  onToggleReminder: (id: string) => void;
  onBack: () => void;
  onCallFamily: () => void;
  caregiverName?: string;
  onTriggerTestAlert?: () => void;
}

export const MedicineReminders: React.FC<MedicineRemindersProps> = ({
  reminders,
  onToggleReminder,
  onBack,
  onCallFamily,
  caregiverName = 'Family Caregiver',
  onTriggerTestAlert,
}) => {
  const { tx, language } = useLanguage();
  const [filter, setFilter] = useState<'all' | 'pending' | 'taken'>('all');

  // Filter reminders: prioritize medicine type, or all reminders if no specific medicine tagged
  const medicineList = reminders.filter((r) => r.type === 'medicine');
  const displayList = medicineList.length > 0 ? medicineList : reminders;

  // Sort chronologically by time of day
  const sortedList = [...displayList].sort((a, b) => {
    const minA = a.minutes && a.minutes > 0 ? a.minutes : parseTimeToMinutes(a.time_label);
    const minB = b.minutes && b.minutes > 0 ? b.minutes : parseTimeToMinutes(b.time_label);
    return minA - minB;
  });

  const totalCount = sortedList.length;
  const completedCount = sortedList.filter((r) => r.completed).length;
  const pendingCount = totalCount - completedCount;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 100;

  // Filtered items based on active tab
  const filteredList = sortedList.filter((item) => {
    if (filter === 'pending') return !item.completed;
    if (filter === 'taken') return item.completed;
    return true;
  });

  const handleSpeakAll = () => {
    soundController.playClick();
    if (totalCount === 0) {
      const msgEn = 'You have no medicines scheduled for today.';
      const msgHi = 'आज के लिए कोई दवाई निर्धारित नहीं है।';
      const msgAs = 'আজিৰ বাবে কোনো দৰব নিৰ্ধাৰণ কৰা নাই।';
      soundController.speakBilingual(msgEn, msgHi, undefined, msgAs);
      return;
    }

    const pendingTitles = sortedList.filter((r) => !r.completed).map((r) => `${r.title} at ${r.time_label}`).join(', ');
    const msgEn = pendingCount > 0
      ? `You have ${pendingCount} medicines left today: ${pendingTitles}.`
      : 'Great job! You have taken all your medicines for today.';
    const msgHi = pendingCount > 0
      ? `आज आपकी ${pendingCount} दवाइयाँ बाकी हैं: ${pendingTitles}।`
      : 'बहुत बढ़िया! आपने आज की सभी दवाइयाँ ले ली हैं।';
    const msgAs = pendingCount > 0
      ? `আজি আপোনাৰ ${pendingCount} টা দৰব বাকী আছে: ${pendingTitles}।`
      : 'বৰ ভাল! আপুনি আজিৰ সকলো দৰব খাইছে।';

    soundController.speakBilingual(msgEn, msgHi, undefined, msgAs);
  };

  const handleSpeakSingle = (item: Reminder) => {
    soundController.playClick();
    const msgEn = `${item.title}. Scheduled for ${item.time_label}. ${item.note ? 'Guidance: ' + item.note : ''}`;
    const msgHi = `${item.title}। समय: ${item.time_label}। ${item.note ? 'निर्देश: ' + item.note : ''}`;
    const msgAs = `${item.title}। সময়: ${item.time_label}। ${item.note ? 'নিৰ্দেশনা: ' + item.note : ''}`;
    soundController.speakBilingual(msgEn, msgHi, undefined, msgAs);
  };

  return (
    <div className="p-4 pb-28 space-y-4 animate-fadeIn max-w-lg mx-auto">
      {/* Top Header Bar */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              soundController.playClick();
              onBack();
            }}
            className="p-3 rounded-2xl bg-white border border-[#E0DCD3] text-[#2D3A2F] hover:bg-[#EAF1E8] shadow-xs active:scale-95 transition-all"
            aria-label="Back to home"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1 rounded-lg bg-amber-100 text-[#D97706]">
                <Pill className="w-4 h-4" />
              </span>
              <h2 className="text-2xl font-black text-[#2D3A2F] leading-none">
                {tx('Medicine Reminder', 'दवाई रिमाइंडर', 'দৰবৰ সোঁৱৰণি')}
              </h2>
            </div>
            <p className="text-xs text-[#5A6E5D] font-medium mt-1">
              {tx('Prescribed daily doses & care reminders', 'दैनिक दवाइयाँ और समय', 'দৈনিক পালি আৰু যত্নৰ সোঁৱৰণি')}
            </p>
          </div>
        </div>

        {/* Listen Aloud Button */}
        <button
          onClick={handleSpeakAll}
          className="p-3 rounded-2xl bg-[#EAF1E8] hover:bg-[#d8e6d5] text-[#5B825B] border border-[#5B825B]/20 shadow-xs active:scale-95 transition-all"
          title={tx('Read today schedule', 'आज की अनुसूची सुनें', 'আজিৰ সূচী শুনক')}
          aria-label="Read schedule"
        >
          <Volume2 className="w-5 h-5" />
        </button>
      </div>

      {/* Progress & Summary Card */}
      <div className="bg-gradient-to-br from-[#FFF9EE] to-[#FEF3C7] rounded-3xl p-5 border-2 border-[#FDE68A] shadow-sm text-[#332610]">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[11px] font-black uppercase tracking-wider block text-[#B45309]">
              {tx("Today's Schedule", 'आज का विवरण', 'আজিৰ সূচী')}
            </span>
            <h3 className="text-2xl font-black text-[#78350F] mt-0.5">
              {completedCount} / {totalCount} {tx('Taken', 'पूर्ण', 'খোৱা হ’ল')}
            </h3>
            <p className="text-xs font-semibold text-[#92400E] mt-0.5">
              {pendingCount === 0
                ? tx('All medicines taken for today! 🎉', 'आज की सभी दवाइयाँ पूरी हो चुकी हैं! 🎉', 'আজিৰ সকলো দৰব খোৱা হ’ল! 🎉')
                : tx(`${pendingCount} dose(s) remaining today`, `आज ${pendingCount} खुराक बाकी हैं`, `আজি ${pendingCount} টা পালি বাকী আছে`)}
            </p>
          </div>

          {/* Progress Circular Badge */}
          <div className="w-14 h-14 rounded-2xl bg-white/90 border border-amber-200 flex flex-col items-center justify-center font-black text-[#B45309] shadow-xs">
            <span className="text-lg leading-none">{completionPercentage}%</span>
            <span className="text-[9px] uppercase font-bold text-amber-600 mt-0.5">done</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-white/80 h-3 rounded-full mt-4 overflow-hidden border border-amber-200/50">
          <div
            className="bg-[#5B825B] h-full rounded-full transition-all duration-500"
            style={{ width: `${completionPercentage}%` }}
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 bg-[#F0EBE1] p-1.5 rounded-2xl">
        <button
          onClick={() => setFilter('all')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all ${
            filter === 'all'
              ? 'bg-white text-[#2D3A2F] shadow-xs'
              : 'text-[#5A6E5D] hover:text-[#2D3A2F]'
          }`}
        >
          {tx('All', 'सभी', 'সকলো')} ({totalCount})
        </button>

        <button
          onClick={() => setFilter('pending')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all ${
            filter === 'pending'
              ? 'bg-white text-[#D97706] shadow-xs'
              : 'text-[#5A6E5D] hover:text-[#2D3A2F]'
          }`}
        >
          {tx('Pending', 'बाकी', 'বাকী')} ({pendingCount})
        </button>

        <button
          onClick={() => setFilter('taken')}
          className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-all ${
            filter === 'taken'
              ? 'bg-white text-[#5B825B] shadow-xs'
              : 'text-[#5A6E5D] hover:text-[#2D3A2F]'
          }`}
        >
          {tx('Taken', 'पूर्ण', 'খোৱা হ’ল')} ({completedCount})
        </button>
      </div>

      {/* Medicines List */}
      <div className="space-y-3">
        {filteredList.length === 0 ? (
          <div className="bg-white rounded-3xl p-8 text-center border border-[#E0DCD3] space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center mx-auto shadow-xs">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-black text-[#2D3A2F]">
              {filter === 'pending'
                ? tx('No pending medicines!', 'कोई दवाई बाकी नहीं है!', 'কোনো দৰব বাকী নাই!')
                : tx('No medicines found in this filter.', 'इस श्रेणी में कोई दवाई नहीं मिली।', 'এই তালিকাত কোনো দৰব পোৱা নগ’ল।')}
            </h4>
            <p className="text-xs text-[#5A6E5D] max-w-xs mx-auto">
              {tx(
                'Your caregiver can add more prescriptions in the Caregiver Portal anytime.',
                'आपके देखभालकर्ता परिवार पोर्टल में और दवाइयाँ जोड़ सकते हैं।',
                'আপোনাৰ পৰিচর্যাকাৰীয়ে পৰিয়াল প’ৰ্টেলত দৰব যোগ কৰিব পাৰে।'
              )}
            </p>
          </div>
        ) : (
          filteredList.map((item) => (
            <div
              key={item.id}
              className={`p-4 sm:p-5 rounded-3xl border-2 transition-all flex flex-col justify-between gap-4 ${
                item.completed
                  ? 'bg-[#F2F7F0] border-[#87A987]/60 shadow-xs opacity-90'
                  : 'bg-white border-[#E0DCD3] hover:border-[#D97706]/60 shadow-xs'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3.5">
                  {/* Left Pill Badge */}
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 transition-colors shadow-xs ${
                      item.completed
                        ? 'bg-[#5B825B] text-white'
                        : 'bg-amber-100 text-[#D97706]'
                    }`}
                  >
                    {item.completed ? (
                      <CheckCircle2 className="w-7 h-7" />
                    ) : (
                      <Pill className="w-7 h-7" />
                    )}
                  </div>

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1 text-xs font-black text-[#D97706] bg-amber-50 px-2.5 py-0.5 rounded-full border border-amber-200/60">
                        <Clock className="w-3.5 h-3.5" />
                        {item.time_label}
                      </span>
                      {item.completed ? (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-[#EAF1E8] text-[#5B825B] border border-[#5B825B]/30">
                          ✓ {tx('Taken', 'ले ली गई', 'খোৱা হ’ল')}
                        </span>
                      ) : (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded-full bg-amber-100 text-[#92400E]">
                          ⏳ {tx('Scheduled', 'निर्धारित', 'নিৰ্ধাৰিত')}
                        </span>
                      )}
                    </div>

                    <h4 className="text-xl font-black text-[#2D3A2F] mt-1.5 leading-snug">
                      {item.title}
                    </h4>

                    {item.note && (
                      <p className="text-xs text-[#5A6E5D] font-medium mt-1 leading-relaxed bg-[#F7F5F0] px-3 py-1.5 rounded-xl border border-[#E0DCD3]/70 inline-block">
                        💡 {item.note}
                      </p>
                    )}
                  </div>
                </div>

                {/* Speaker icon for individual audio instruction */}
                <button
                  onClick={() => handleSpeakSingle(item)}
                  className="p-2.5 rounded-xl bg-white hover:bg-amber-50 text-[#5A6E5D] hover:text-[#D97706] border border-[#E0DCD3] shadow-xs active:scale-95 transition-all shrink-0"
                  title={tx('Listen', 'सुनें', 'শুনক')}
                  aria-label="Listen aloud"
                >
                  <Volume2 className="w-4 h-4" />
                </button>
              </div>

              {/* Big Touch Action Button */}
              <button
                onClick={() => {
                  soundController.playSuccess();
                  onToggleReminder(item.id);
                }}
                className={`w-full py-3.5 px-5 rounded-2xl font-black text-sm flex items-center justify-center gap-2.5 transition-all shadow-xs active:scale-[0.98] cursor-pointer ${
                  item.completed
                    ? 'bg-white border-2 border-[#5B825B] text-[#5B825B] hover:bg-[#EAF1E8]'
                    : 'bg-[#5B825B] hover:bg-[#4d704d] text-white shadow-md'
                }`}
              >
                {item.completed ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 fill-[#5B825B] text-white" />
                    <span>{tx('Medicine Taken ✓ (Tap to Undo)', 'दवाई ले ली गई ✓ (वापस करें)', 'দৰব খোৱা হ’ল ✓ (পূৰ্বৱৰ্তী)')}</span>
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="w-5 h-5" />
                    <span>{tx('Mark as Taken', 'दवाई ले ली — दर्ज करें', 'দৰব খোৱা হ’ল — চিহ্নিত কৰক')}</span>
                  </>
                )}
              </button>
            </div>
          ))
        )}
      </div>

      {/* Test / Preview Notification Alert Feature */}
      <div className="bg-[#FFFDF7] rounded-3xl p-4 border border-[#E8DFC8] flex items-center justify-between gap-3 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-100 text-[#D97706] flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5" />
          </div>
          <div>
            <h5 className="font-extrabold text-xs text-[#2D3A2F]">
              {tx('Medicine Alert Simulation', 'दवाई सूचना परीक्षण', 'দৰবৰ জাননী পৰীক্ষণ')}
            </h5>
            <p className="text-[11px] text-[#5A6E5D]">
              {tx('Preview audio chime & reminder alert', 'सूचना ध्वनि और आवाज का पूर्वावलोकन करें', 'জাননীৰ শব্দ আৰু মাত পৰীক্ষা কৰক')}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundController.playClick();
            if (onTriggerTestAlert) {
              onTriggerTestAlert();
            }
          }}
          className="px-3 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-95 text-white font-extrabold text-xs shadow-xs transition-all whitespace-nowrap cursor-pointer"
        >
          {tx('Test Alert', 'परीक्षण करें', 'পৰীক্ষা কৰক')}
        </button>
      </div>

      {/* Need Help / Call Caregiver Card */}
      <div className="bg-[#EAF1E8] rounded-3xl p-5 border border-[#c3d9b4] flex items-center justify-between gap-4 shadow-xs">
        <div className="flex items-center gap-3.5">
          <div className="w-12 h-12 rounded-2xl bg-white text-[#5B825B] flex items-center justify-center shrink-0 shadow-xs">
            <Phone className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-sm text-[#2D3A2F]">
              {tx('Questions about your medicine?', 'दवाई को लेकर कोई सवाल?', 'দৰবৰ বিষয়ে কিবা জানিবলগীয়া আছেনে?')}
            </h4>
            <p className="text-xs text-[#5A6E5D] mt-0.5">
              {tx(
                `One tap to call ${caregiverName}`,
                `${caregiverName} को कॉल करने के लिए टैप करें`,
                `${caregiverName}ক ফোন কৰিবলৈ টিপক`
              )}
            </p>
          </div>
        </div>

        <button
          onClick={() => {
            soundController.playClick();
            onCallFamily();
          }}
          className="py-3 px-4 rounded-2xl bg-[#5B825B] hover:bg-[#4a6d4a] active:scale-95 text-white font-black text-xs shadow-md shrink-0 flex items-center gap-1.5 transition-all cursor-pointer"
        >
          <Phone className="w-4 h-4" />
          <span>{tx('Call Caregiver', 'कॉल करें', 'ফোন কৰক')}</span>
        </button>
      </div>
    </div>
  );
};
