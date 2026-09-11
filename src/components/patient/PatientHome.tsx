import React from 'react';
import { Play, Image as ImageIcon, Puzzle, Wind, CalendarCheck, PhoneCall, Sparkles, Flame, Trophy } from 'lucide-react';
import { PatientTab, PatientSubView, Reminder } from '../../types';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';

interface PatientHomeProps {
  patientName: string;
  onSelectTab: (tab: PatientTab) => void;
  onSelectSubView: (view: PatientSubView) => void;
  reminders: Reminder[];
  onCallFamily: () => void;
  emergencyContactName?: string;
}

export const PatientHome: React.FC<PatientHomeProps> = ({
  patientName,
  onSelectTab,
  onSelectSubView,
  reminders,
  onCallFamily,
  emergencyContactName,
}) => {
  const { t, formatLocalizedDate } = useLanguage();
  const todayStr = formatLocalizedDate(new Date());
  const nextReminder = reminders.find((r) => !r.completed);

  return (
    <div className="p-4 pb-24 space-y-5 animate-fadeIn">
      {/* Monor Xur Official Logo Greeting Banner */}
      <div className="bg-white rounded-3xl p-4 border border-[#E0DCD3] shadow-xs flex items-center justify-between">
        <div className="flex items-center gap-3.5">
          <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-[#5B825B]/40 shadow-xs shrink-0 bg-[#FDFBF7]">
            <img 
              src="/logo.jpg" 
              alt="Monor Xur" 
              className="w-full h-full object-cover" 
              referrerPolicy="no-referrer" 
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#5B825B] bg-[#EAF1E8] px-2.5 py-0.5 rounded-full">
                {t('playerMode')}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#E8B25C] bg-[#FDF0D5] px-2 py-0.5 rounded-full">
                <Flame className="w-3 h-3 fill-current" /> {t('activeSession')}
              </span>
            </div>
            <h2 className="text-2xl font-black text-[#2D3A2F] leading-tight mt-0.5">
              {patientName ? t('hello', { name: patientName }) : t('helloWelcome')}
            </h2>
            <p className="text-xs font-semibold text-[#5A6E5D]">{todayStr}</p>
          </div>
        </div>
      </div>

      {/* Big Dementia-Friendly Play Button */}
      <div className="bg-gradient-to-br from-[#EAF1E8] to-[#DCEAD2] rounded-3xl p-4 sm:p-5 border-2 border-[#5B825B]/25 shadow-sm">
        <button
          onClick={() => {
            soundController.playClick();
            onSelectTab('play');
          }}
          className="w-full py-8 px-6 rounded-2xl bg-[#5B825B] hover:bg-[#4a6d4a] active:scale-[0.98] text-white shadow-md transition-all flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 group cursor-pointer"
          aria-label={t('playButtonText')}
        >
          <div className="w-20 h-20 rounded-full bg-white text-[#5B825B] flex items-center justify-center shadow-md group-hover:scale-105 transition-transform shrink-0">
            <Play className="w-11 h-11 fill-current translate-x-0.5" />
          </div>
          <div className="text-center sm:text-left">
            <span className="block text-3xl sm:text-4xl font-black tracking-wider leading-none">
              {t('playButtonText')}
            </span>
            <span className="block text-base font-bold text-white/90 mt-1.5">
              {t('playButtonSub')}
            </span>
          </div>
        </button>
      </div>

      {/* 4 Large Touch Target Tiles */}
      <div className="grid grid-cols-2 gap-3.5">
        {/* Memories Tile (Pastel Pink) */}
        <button
          onClick={() => {
            soundController.playClick();
            onSelectTab('memories');
          }}
          className="bg-[#F0D8D6] text-[#3D2423] p-5 rounded-3xl text-left border border-[#e0c3c0] shadow-xs hover:shadow-md transition-all active:scale-[0.97] flex flex-col justify-between min-h-[140px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/90 flex items-center justify-center text-[#C46A66] shadow-xs">
            <ImageIcon className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-extrabold text-xl leading-tight">{t('tileMemories')}</h4>
            <p className="text-xs font-medium text-[#3D2423]/70 mt-0.5">{t('tileMemoriesSub')}</p>
          </div>
        </button>

        {/* Games Tile (Pastel Yellow) */}
        <button
          onClick={() => {
            soundController.playClick();
            onSelectTab('play');
          }}
          className="bg-[#FDF0D5] text-[#332610] p-5 rounded-3xl text-left border border-[#eadbbf] shadow-xs hover:shadow-md transition-all active:scale-[0.97] flex flex-col justify-between min-h-[140px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/90 flex items-center justify-center text-[#E8B25C] shadow-xs">
            <Puzzle className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-extrabold text-xl leading-tight">{t('tileGames')}</h4>
            <p className="text-xs font-medium text-[#332610]/70 mt-0.5">{t('tileGamesSub')}</p>
          </div>
        </button>

        {/* Relaxation Tile (Pastel Blue) */}
        <button
          onClick={() => {
            soundController.playClick();
            onSelectSubView('relaxation');
          }}
          className="bg-[#D4E4E6] text-[#1C2A2D] p-5 rounded-3xl text-left border border-[#bdd3d6] shadow-xs hover:shadow-md transition-all active:scale-[0.97] flex flex-col justify-between min-h-[140px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/90 flex items-center justify-center text-[#7A9CA4] shadow-xs">
            <Wind className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-extrabold text-xl leading-tight">{t('tileRelaxation')}</h4>
            <p className="text-xs font-medium text-[#1C2A2D]/70 mt-0.5">{t('tileRelaxationSub')}</p>
          </div>
        </button>

        {/* Daily Life Tile (Pastel Light Green) */}
        <button
          onClick={() => {
            soundController.playClick();
            onSelectSubView('daily_life');
          }}
          className="bg-[#DCEAD2] text-[#28331F] p-5 rounded-3xl text-left border border-[#c3d9b4] shadow-xs hover:shadow-md transition-all active:scale-[0.97] flex flex-col justify-between min-h-[140px]"
        >
          <div className="w-12 h-12 rounded-2xl bg-white/90 flex items-center justify-center text-[#5B825B] shadow-xs">
            <CalendarCheck className="w-7 h-7" />
          </div>
          <div>
            <h4 className="font-extrabold text-xl leading-tight">{t('tileDailyLife')}</h4>
            <p className="text-xs font-medium text-[#28331F]/70 mt-0.5">{t('tileDailyLifeSub')}</p>
          </div>
        </button>
      </div>

      {/* Up Next Reminder Card */}
      {nextReminder && (
        <div className="bg-white rounded-3xl p-4 border border-[#E0DCD3] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FDF0D5] text-[#E8B25C] flex items-center justify-center">
              <CalendarCheck className="w-6 h-6" />
            </div>
            <div>
              <span className="text-xs font-extrabold text-[#E8B25C] uppercase tracking-wider block">
                {t('upNext')} • {nextReminder.time_label}
              </span>
              <h4 className="font-bold text-base text-[#2D3A2F]">{nextReminder.title}</h4>
              {nextReminder.note && <p className="text-xs text-[#5A6E5D]">{nextReminder.note}</p>}
            </div>
          </div>
          <button
            onClick={() => onSelectSubView('daily_life')}
            className="px-3 py-1.5 rounded-xl bg-[#EAF1E8] text-[#5B825B] font-bold text-xs hover:bg-[#d6e5d3]"
          >
            {t('view')}
          </button>
        </div>
      )}

      {/* Quick One-Touch Call Family */}
      <button
        onClick={onCallFamily}
        className="w-full p-4 rounded-3xl bg-white border border-[#E0DCD3] shadow-xs flex items-center justify-between hover:bg-[#FDFBF7] active:scale-[0.99] transition-all"
      >
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center">
            <PhoneCall className="w-6 h-6" />
          </div>
          <div className="text-left">
            <h4 className="font-extrabold text-base text-[#2D3A2F]">
              {emergencyContactName ? t('callFamilyPrompt', { name: emergencyContactName }) : t('callFamilyDefault')}
            </h4>
            <p className="text-xs text-[#5A6E5D]">{t('callFamilySub')}</p>
          </div>
        </div>
        <span className="px-3.5 py-1.5 rounded-xl bg-[#5B825B] text-white text-xs font-black">
          {t('callNow')}
        </span>
      </button>
    </div>
  );
};
