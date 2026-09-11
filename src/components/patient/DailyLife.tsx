import React from 'react';
import { ArrowLeft, CheckCircle2, Circle, Clock, Sparkles } from 'lucide-react';
import { Reminder } from '../../types';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';

interface DailyLifeProps {
  reminders: Reminder[];
  onToggleReminder: (id: string) => void;
  onBack: () => void;
}

export const DailyLife: React.FC<DailyLifeProps> = ({ reminders, onToggleReminder, onBack }) => {
  const { t, isHindi } = useLanguage();
  const completedCount = reminders.filter((r) => r.completed).length;

  return (
    <div className="p-4 pb-24 space-y-4 animate-fadeIn">
      {/* Top bar */}
      <div className="flex items-center gap-2">
        <button
          onClick={onBack}
          className="p-2 rounded-2xl bg-white border border-[#E0DCD3] text-[#2D3A2F] hover:bg-[#EAF1E8]"
          aria-label={t('goBack')}
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h2 className="text-2xl font-black text-[#2D3A2F]">{t('dailyLifeTitle')}</h2>
          <p className="text-xs text-[#5A6E5D]">{t('dailyLifeSub')}</p>
        </div>
      </div>

      {/* Progress card */}
      <div className="bg-[#DCEAD2] text-[#28331F] rounded-3xl p-5 border border-[#c3d9b4] shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-xs font-black uppercase tracking-wider block text-[#5B825B]">
              {isHindi ? 'आज की दिनचर्या' : "Today's Routine"}
            </span>
            <h3 className="text-xl font-black">
              {isHindi
                ? `${completedCount} / ${reminders.length} कार्य पूर्ण`
                : `${completedCount} of ${reminders.length} Completed`}
            </h3>
          </div>
          <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center font-black text-[#5B825B] text-lg shadow-xs">
            {Math.round((completedCount / (reminders.length || 1)) * 100)}%
          </div>
        </div>

        {/* Progress bar */}
        <div className="w-full bg-white/60 h-2.5 rounded-full mt-3 overflow-hidden">
          <div
            className="bg-[#5B825B] h-full rounded-full transition-all duration-500"
            style={{ width: `${(completedCount / (reminders.length || 1)) * 100}%` }}
          />
        </div>
      </div>

      {/* List of Reminders */}
      <div className="space-y-3">
        {reminders.map((item) => (
          <div
            key={item.id}
            onClick={() => {
              soundController.playClick();
              onToggleReminder(item.id);
            }}
            className={`p-4 rounded-3xl border transition-all cursor-pointer flex items-start justify-between gap-3 ${
              item.completed
                ? 'bg-[#EAF1E8]/70 border-[#5B825B]/40 opacity-85'
                : 'bg-white border-[#E0DCD3] shadow-xs hover:border-[#87A987]'
            }`}
          >
            <div className="flex items-start gap-3">
              <button
                className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center transition-colors ${
                  item.completed ? 'text-[#5B825B]' : 'text-gray-300'
                }`}
                aria-label="Toggle completed"
              >
                {item.completed ? (
                  <CheckCircle2 className="w-7 h-7 fill-[#EAF1E8]" />
                ) : (
                  <Circle className="w-7 h-7" />
                )}
              </button>
              <div>
                <div className="flex items-center gap-2">
                  <span className="flex items-center gap-1 text-xs font-extrabold text-[#5B825B]">
                    <Clock className="w-3.5 h-3.5" />
                    {item.time_label}
                  </span>
                  <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded-full ${
                    item.type === 'medicine' ? 'bg-[#F0D8D6] text-[#C46A66]' : 'bg-[#FDF0D5] text-[#E8B25C]'
                  }`}>
                    {item.type === 'medicine' ? (isHindi ? 'दवा' : 'medicine') : (isHindi ? 'कार्य' : item.type)}
                  </span>
                </div>
                <h4 className={`font-extrabold text-base mt-0.5 leading-tight ${item.completed ? 'line-through text-gray-500' : 'text-[#2D3A2F]'}`}>
                  {item.title}
                </h4>
                {item.note && (
                  <p className="text-xs text-[#5A6E5D] mt-1">{item.note}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
