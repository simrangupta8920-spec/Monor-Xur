import React, { useState, useEffect } from 'react';
import { 
  Play, Image as ImageIcon, Puzzle, Wind, CalendarCheck, PhoneCall, 
  Sparkles, Heart, Sun, Music, Eye, ChevronDown, ChevronUp 
} from 'lucide-react';
import { PatientTab, PatientSubView, Reminder, CaregiverAccount } from '../../types';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';
import { SpeakButton } from '../common/SpeakButton';

interface PatientHomeProps {
  patientName: string;
  onSelectTab: (tab: PatientTab) => void;
  onSelectSubView: (view: PatientSubView) => void;
  reminders: Reminder[];
  onCallFamily: () => void;
  emergencyContactName?: string;
  caregiver?: CaregiverAccount;
}

export const PatientHome: React.FC<PatientHomeProps> = ({
  patientName,
  onSelectTab,
  onSelectSubView,
  reminders,
  onCallFamily,
  emergencyContactName,
  caregiver,
}) => {
  const { t, tx, isHindi, formatLocalizedDate } = useLanguage();
  const todayStr = formatLocalizedDate(new Date());
  const nextReminder = reminders.find((r) => !r.completed);

  // Caregiver toggle for Single-Focus Mode
  const [isSingleFocus, setIsSingleFocus] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('monor_single_focus_mode');
      return saved === 'true';
    } catch {
      return false;
    }
  });

  const [showAllTiles, setShowAllTiles] = useState(false);

  // Time of Day recommendation
  const hour = new Date().getHours();
  const timeOfDay: 'morning' | 'afternoon' | 'evening' = 
    hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';

  const singleFocusConfig = {
    morning: {
      periodEn: 'Morning Suggestion',
      periodHi: 'सुबह का सुझाव',
      titleEn: 'Morning Bhajan & Gentle Tunes',
      titleHi: 'सुबह के भजन और शांत संगीत',
      subEn: 'Peaceful melodies to welcome a tranquil, uplifting day.',
      subHi: 'शांत संगीत और भजनों के साथ दिन की सुखद और शांत शुरुआत करें।',
      actionEn: 'Listen & Relax',
      actionHi: 'सुनें और आनंद लें',
      icon: Sun,
      iconBg: '#E8B25C',
      bgGradient: 'from-[#FDF0D5] via-[#FFF9ED] to-[#FAF3E0]',
      borderColor: 'border-[#E8B25C]/40',
      action: () => onSelectSubView('music'),
    },
    afternoon: {
      periodEn: 'Afternoon Suggestion',
      periodHi: 'दोपहर का सुझाव',
      titleEn: 'Look at Family Memories',
      titleHi: 'पारिवारिक यादें और तस्वीरें देखें',
      subEn: 'Sweet photographs and warm voices of family and loved ones.',
      subHi: 'परिवार के अपनों की प्यारी तस्वीरें और मीठी आवाज़ों का आनंद लें।',
      actionEn: 'Open Family Album',
      actionHi: 'यादों की झलक देखें',
      icon: Heart,
      iconBg: '#C46A66',
      bgGradient: 'from-[#FCECEB] via-[#FFF5F5] to-[#F8E7E5]',
      borderColor: 'border-[#C46A66]/40',
      action: () => onSelectTab('memories'),
    },
    evening: {
      periodEn: 'Evening Suggestion',
      periodHi: 'शाम का सुझाव',
      titleEn: 'Gentle Breathing & Quiet Rest',
      titleHi: 'शाम का शांत प्राणायाम और आराम',
      subEn: 'Slow, peaceful guided breathing to unwind peacefully before sleep.',
      subHi: 'आराम से गहरी सांस लें और मन को शांत विश्राम दें।',
      actionEn: 'Start Gentle Breathing',
      actionHi: 'आरामदायक सांस लें',
      icon: Wind,
      iconBg: '#5B825B',
      bgGradient: 'from-[#EAF1E8] via-[#F4FAF2] to-[#E3EFE0]',
      borderColor: 'border-[#5B825B]/40',
      action: () => onSelectSubView('breathing'),
    },
  }[timeOfDay];

  const caregiverName = caregiver?.name || emergencyContactName || 'Priya Sharma';
  const caregiverRel = caregiver?.relationship || (isHindi ? 'बेटी' : 'Daughter');
  const caregiverPhoto = caregiver?.avatar || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=300&q=80';

  const toggleSingleFocus = () => {
    soundController.playClick();
    const next = !isSingleFocus;
    setIsSingleFocus(next);
    try {
      localStorage.setItem('monor_single_focus_mode', String(next));
    } catch {
      // ignore
    }
  };

  const FocusIcon = singleFocusConfig.icon;

  return (
    <div className="p-4 pb-24 space-y-5 animate-fadeIn">
      {/* Monor Xur Official Logo Greeting Banner */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E0DCD3] shadow-xs flex items-center justify-between">
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
              <span className="inline-flex items-center gap-1 text-[11px] font-extrabold text-[#5B825B] bg-[#EAF1E8] px-2.5 py-0.5 rounded-full">
                <Sparkles className="w-3 h-3 text-[#E8B25C]" />
                {tx('Peaceful Day', 'सुखद दिन')}
              </span>
            </div>
            <h2 className="text-2xl font-black text-[#2D3A2F] leading-tight mt-0.5">
              {patientName ? t('hello', { name: patientName }) : t('helloWelcome')}
            </h2>
            <p className="text-xs font-semibold text-[#5A6E5D]">{todayStr}</p>
          </div>
        </div>

        {/* Speak button for gentle greeting */}
        <SpeakButton
          textEn={`Hello ${patientName || 'Friend'}. Welcome to Monor Xur. Take your time and enjoy your day.`}
          textHi={`नमस्ते ${patientName || 'जी'}। आपका स्वागत है। आराम से खेलें और शांति का आनंद लें।`}
          size="lg"
        />
      </div>

      {/* SINGLE-FOCUS (ULTRA-SIMPLE) HOME MODE */}
      {isSingleFocus && !showAllTiles ? (
        <div className="space-y-4">
          {/* Giant Single Recommendation Card */}
          <div className={`bg-gradient-to-br ${singleFocusConfig.bgGradient} rounded-3xl p-5 sm:p-6 border-2 ${singleFocusConfig.borderColor} shadow-sm space-y-4`}>
            <div className="flex items-center justify-between">
              <span className="px-3 py-1 rounded-full bg-white/90 text-xs font-black uppercase tracking-wider text-[#2D3A2F] shadow-2xs">
                {tx(singleFocusConfig.periodEn, singleFocusConfig.periodHi)}
              </span>
              <SpeakButton
                textEn={`${singleFocusConfig.titleEn}. ${singleFocusConfig.subEn}`}
                textHi={`${singleFocusConfig.titleHi}। ${singleFocusConfig.subHi}`}
                size="md"
              />
            </div>

            <div className="flex items-center gap-4">
              <div 
                className="w-16 h-16 rounded-2xl flex items-center justify-center text-white shadow-md shrink-0"
                style={{ backgroundColor: singleFocusConfig.iconBg }}
              >
                <FocusIcon className="w-9 h-9" />
              </div>
              <div>
                <h3 className="text-2xl sm:text-3xl font-black text-[#2D3A2F] leading-tight">
                  {tx(singleFocusConfig.titleEn, singleFocusConfig.titleHi)}
                </h3>
                <p className="text-xs sm:text-sm text-[#5A6E5D] font-medium mt-1 leading-relaxed">
                  {tx(singleFocusConfig.subEn, singleFocusConfig.subHi)}
                </p>
              </div>
            </div>

            {/* Giant Big Touch Button */}
            <button
              onClick={() => {
                soundController.playClick();
                singleFocusConfig.action();
              }}
              className="w-full py-4 px-6 rounded-2xl bg-[#5B825B] hover:bg-[#4a6d4a] active:scale-[0.98] text-white font-black text-lg sm:text-xl shadow-md transition-all flex items-center justify-center gap-3 cursor-pointer"
            >
              <Play className="w-6 h-6 fill-current" />
              <span>{tx(singleFocusConfig.actionEn, singleFocusConfig.actionHi)}</span>
            </button>
          </div>

          {/* Quick Option to Switch between Single Focus and All Activities */}
          <div className="flex items-center justify-center gap-3 pt-1">
            <button
              onClick={() => {
                soundController.playClick();
                setShowAllTiles(true);
              }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white border border-[#E0DCD3] text-xs font-bold text-[#5A6E5D] hover:text-[#2D3A2F] shadow-xs active:scale-95"
            >
              <Eye className="w-4 h-4 text-[#5B825B]" />
              <span>{tx('Show All Activities', 'अन्य सभी गतिविधियाँ देखें')}</span>
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      ) : (
        <>
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
              className="bg-[#F0D8D6] text-[#3D2423] p-5 rounded-3xl text-left border-2 border-[#e0c3c0] shadow-xs hover:shadow-md transition-all active:scale-[0.97] flex flex-col justify-between min-h-[140px]"
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
              className="bg-[#FDF0D5] text-[#332610] p-5 rounded-3xl text-left border-2 border-[#eadbbf] shadow-xs hover:shadow-md transition-all active:scale-[0.97] flex flex-col justify-between min-h-[140px]"
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
              className="bg-[#D4E4E6] text-[#1C2A2D] p-5 rounded-3xl text-left border-2 border-[#bdd3d6] shadow-xs hover:shadow-md transition-all active:scale-[0.97] flex flex-col justify-between min-h-[140px]"
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
              className="bg-[#DCEAD2] text-[#28331F] p-5 rounded-3xl text-left border-2 border-[#c3d9b4] shadow-xs hover:shadow-md transition-all active:scale-[0.97] flex flex-col justify-between min-h-[140px]"
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

          {/* Toggle back to Single Focus if previously enabled */}
          {isSingleFocus && showAllTiles && (
            <div className="text-center">
              <button
                onClick={() => {
                  soundController.playClick();
                  setShowAllTiles(false);
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-[#E0DCD3] text-xs font-bold text-[#5A6E5D] hover:text-[#2D3A2F]"
              >
                <ChevronUp className="w-3.5 h-3.5 text-[#5B825B]" />
                <span>{tx('Back to Single-Focus View', 'सरल एकल दृश्य पर वापस जाएं')}</span>
              </button>
            </div>
          )}
        </>
      )}

      {/* Up Next Reminder Card with Audio Prompt */}
      {nextReminder && (
        <div className="bg-white rounded-3xl p-4 border border-[#E0DCD3] shadow-xs flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-[#FDF0D5] text-[#E8B25C] flex items-center justify-center shrink-0">
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
          <div className="flex items-center gap-2 shrink-0">
            <SpeakButton
              textEn={`Upcoming reminder for ${nextReminder.time_label}: ${nextReminder.title}. ${nextReminder.note || ''}`}
              textHi={`${nextReminder.time_label} का अगला कार्य: ${nextReminder.title}। ${nextReminder.note || ''}`}
              size="sm"
            />
            <button
              onClick={() => onSelectSubView('daily_life')}
              className="px-3 py-1.5 rounded-xl bg-[#EAF1E8] text-[#5B825B] font-bold text-xs hover:bg-[#d6e5d3]"
            >
              {t('view')}
            </button>
          </div>
        </div>
      )}

      {/* ITEM E: HIGH-VISIBILITY CAREGIVER FACE & NAME CALL BUTTON */}
      <div className="bg-gradient-to-br from-[#FAF8F3] to-[#F2EFE8] p-1.5 rounded-3xl border-2 border-[#5B825B]/30 shadow-xs">
        <button
          onClick={onCallFamily}
          className="w-full p-4 rounded-2xl bg-white border border-[#E0DCD3] shadow-xs flex items-center justify-between hover:bg-[#FDFBF7] active:scale-[0.99] transition-all cursor-pointer group"
          aria-label={tx(`Call ${caregiverName}`, `${caregiverName} को फोन करें`)}
        >
          <div className="flex items-center gap-3.5">
            {/* Familiar Smiling Face Portrait */}
            <div className="relative w-14 h-14 rounded-full overflow-hidden border-2 border-[#5B825B] shadow-sm shrink-0 bg-[#EAF1E8]">
              <img 
                src={caregiverPhoto} 
                alt={caregiverName}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                referrerPolicy="no-referrer"
              />
              <div className="absolute bottom-0 right-0 w-4 h-4 rounded-full bg-[#5B825B] border-2 border-white flex items-center justify-center text-white">
                <PhoneCall className="w-2.5 h-2.5" />
              </div>
            </div>

            <div className="text-left">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#5B825B] bg-[#EAF1E8] px-2 py-0.5 rounded-full inline-block mb-0.5">
                {tx(`Family Caregiver (${caregiverRel})`, `परिवार की देखभालकर्ता (${caregiverRel})`)}
              </span>
              <h4 className="font-black text-base sm:text-lg text-[#2D3A2F] leading-tight">
                {tx(`Call ${caregiverName}`, `${caregiverName} को फोन करें`)}
              </h4>
              <p className="text-xs text-[#5A6E5D] font-semibold mt-0.5">
                {tx('Tap here to speak together immediately', 'एक स्पर्श से तुरंत बात करें')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <SpeakButton
              textEn={`Tap here to call your caregiver, ${caregiverName} (${caregiverRel}).`}
              textHi={`देखभालकर्ता ${caregiverName} से बात करने के लिए यहाँ टैप करें।`}
              size="md"
            />
            <span className="px-4 py-2.5 rounded-xl bg-[#5B825B] text-white text-xs font-black shadow-xs group-hover:bg-[#4a6b4a] transition-colors flex items-center gap-1.5">
              <PhoneCall className="w-3.5 h-3.5" />
              <span>{t('callNow')}</span>
            </span>
          </div>
        </button>
      </div>

      {/* Subtle Caregiver Mode / Single-Focus Switch Bar at very bottom */}
      <div className="pt-1 flex items-center justify-between text-xs text-[#8A8070] px-2">
        <button
          onClick={toggleSingleFocus}
          className="hover:text-[#2D3A2F] underline decoration-dotted text-[11px] font-semibold transition-colors"
        >
          {isSingleFocus
            ? tx('Mode: Single-Focus (Ultra-Simple)', 'मोड: एकल-ध्यान (अति-सरल)')
            : tx('Switch to Ultra-Simple Home Mode', 'अति-सरल एकल-ध्यान मोड सक्रिय करें')}
        </button>
        <span className="text-[11px] text-[#A0988A]">
          Monor Xur • {tx('Elderly-Friendly Safe Play', 'वरिष्ठों हेतु सुरक्षित मंच')}
        </span>
      </div>
    </div>
  );
};
