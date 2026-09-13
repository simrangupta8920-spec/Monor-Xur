import React, { useState, useMemo } from 'react';
import { 
  Play, CheckCircle2, Puzzle, Brain, Sparkles, ArrowRight, 
  Heart, Image as ImageIcon, Layers, Users, Info
} from 'lucide-react';
import { PatientSubView, DDAMetric, Memory, PlayMode } from '../../types';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';
import { SpeakButton } from '../common/SpeakButton';

interface GamesHubProps {
  onSelectGame: (game: PatientSubView) => void;
  currentLevel: number;
  ddaLogs?: DDAMetric[];
  memories?: Memory[];
  playMode?: PlayMode;
  onSelectPlayMode?: (mode: PlayMode) => void;
}

export const GamesHub: React.FC<GamesHubProps> = ({ 
  onSelectGame, 
  currentLevel, 
  ddaLogs = [],
  memories = [],
  playMode: externalPlayMode,
  onSelectPlayMode
}) => {
  const { t, tx, language } = useLanguage();

  // Filter photo memories uploaded by caregivers
  const photoMemories = useMemo(() => {
    return memories.filter(
      (m) => (!m.mediaType || m.mediaType === 'photo') && m.image && m.image.trim().length > 0
    );
  }, [memories]);

  const hasPhotos = photoMemories.length > 0;

  // Active play mode: 'default' vs 'personalized'
  const [internalMode, setInternalMode] = useState<PlayMode>(() => {
    if (externalPlayMode) return externalPlayMode;
    try {
      const saved = localStorage.getItem('monor_xur_play_mode');
      if (saved === 'default' || saved === 'personalized') {
        return saved;
      }
    } catch {
      // ignore
    }
    return hasPhotos ? 'personalized' : 'default';
  });

  const activeMode: PlayMode = externalPlayMode || internalMode;

  const handleModeChange = (mode: PlayMode) => {
    soundController.playClick();
    setInternalMode(mode);
    onSelectPlayMode?.(mode);
    try {
      localStorage.setItem('monor_xur_play_mode', mode);
    } catch {
      // ignore
    }

    // Spoken feedback for seniors upon switching modes
    if (mode === 'default') {
      soundController.speakBilingual(
        'Default Mode selected. Enjoy classic cultural treasures and nature puzzles.',
        'डिफ़ॉल्ट मोड चुना गया। क्लासिक चित्रों और प्रकृति की पहेलियों का आनंद लें।',
        undefined,
        'ডিফল্ট মোড বাছনি কৰা হ’ল। পৰম্পৰাগত ছবি আৰু প্ৰকৃতিৰ ধাঁধা খেলক।'
      );
    } else {
      if (hasPhotos) {
        soundController.speakBilingual(
          `Personalized Mode selected with ${photoMemories.length} family memories.`,
          `पर्सनलाइज्ड मोड चुना गया। आपकी ${photoMemories.length} पारिवारिक यादों के साथ।`,
          undefined,
          `ব্যক্তিগত মোড বাছনি কৰা হ’ল। আপোনাৰ ${photoMemories.length}টা পৰিয়ালৰ স্মৃতিৰ সৈতে।`
        );
      } else {
        soundController.speakBilingual(
          'Personalized Mode selected. No family photos uploaded yet. You can play Default Mode anytime or ask your caregiver to add photos.',
          'पर्सनलाइज्ड मोड चुना गया। अभी कोई फोटो नहीं है। आप डिफ़ॉल्ट मोड खेल सकते हैं।',
          undefined,
          'ব্যক্তিগত মোড বাছনি কৰা হ’ল। এতিয়ালৈ কোনো ফটো আপলোড হোৱা নাই। আপুনি ডিফল্ট মোড খেলিব পাৰে।'
        );
      }
    }
  };

  const gamesStats = useMemo(() => {
    const isToday = (timestamp: number) => {
      const d = new Date(timestamp);
      const now = new Date();
      return (
        d.getDate() === now.getDate() &&
        d.getMonth() === now.getMonth() &&
        d.getFullYear() === now.getFullYear()
      );
    };

    const puzzleLogs = ddaLogs.filter(
      (l) => l.gameType === 'puzzle' || (l.gameTitle && l.gameTitle.toLowerCase().includes('puzzle'))
    );
    const memoryLogs = ddaLogs.filter(
      (l) => !l.gameType || l.gameType === 'memory_match' || (l.gameTitle && l.gameTitle.toLowerCase().includes('memory'))
    );

    const puzzlePlayedToday = puzzleLogs.some((l) => isToday(l.timestamp));
    const memoryPlayedToday = memoryLogs.some((l) => isToday(l.timestamp));

    const puzzleAffirmation = puzzlePlayedToday
      ? tx('Wonderful effort! You enjoyed this today.', 'शानदार अभ्यास! आपने आज खेला है।', 'সুন্দৰ প্ৰচেষ্টা! আপুনি আজি এইটো খেলিলে।')
      : tx('Take your time and enjoy putting pictures together.', 'आराम से अपनी पसंद की तस्वीर जोड़ें।', 'আৰামেৰে নিজৰ পছন্দৰ ছবিখন জোৰা লগাওক।');

    const memoryAffirmation = memoryPlayedToday
      ? tx('Well done! Finding pairs brings joy.', 'बहुत सुंदर! सभी जोड़े मन को शांति देते हैं।', 'বৰ ভাল হ’ল! জোৰা বিচাৰি পালে আনন্দ লাগে।')
      : tx('Play at your own gentle pace, no rush.', 'अपनी गति से खेलें, कोई जल्दी नहीं।', 'নিজৰ শান্ত গতিত খেলক, কোনো খৰখেদা নাই।');

    return {
      puzzlePlayedToday,
      memoryPlayedToday,
      puzzleAffirmation,
      memoryAffirmation,
    };
  }, [ddaLogs, language]);

  // Dynamic game content tailored to the selected mode
  const games = useMemo(() => {
    if (activeMode === 'personalized') {
      return [
        {
          id: 'puzzle' as PatientSubView,
          title: tx('Family Photo Puzzle', 'पारिवारिक फोटो पहेली', 'পৰিয়ালৰ স্মৃতি ধাঁধা'),
          desc: tx(
            'Put familiar family moments, loved ones, and personal memory photos together peacefully.',
            'अपनी पारिवारिक तस्वीरों और अपनों के सुंदर पलों को आराम से जोड़ें।',
            'আপোনাৰ পৰিয়ালৰ ফটো আৰু মৰমৰ মানুহবোৰৰ ছবি আৰামেৰে জোৰা লগাওক।'
          ),
          badge: hasPhotos
            ? `${photoMemories.length} ${tx('Family Photos Loaded', 'पारिवारिक यादें', 'পৰিয়ালৰ ছবি')}`
            : tx('Personalized Memory Puzzle', 'पारिवारिक पहेली', 'ব্যক্তিগত স্মৃতি ধাঁধা'),
          playedToday: gamesStats.puzzlePlayedToday,
          affirmation: gamesStats.puzzleAffirmation,
          audioPromptEn: 'Family photo puzzle. Tap Play Now to assemble pictures of loved ones and hear the memory story.',
          audioPromptHi: 'पारिवारिक चित्र पहेली। अपनों की तस्वीरें जोड़ने और यादों की कहानी सुनने के लिए प्ले दबाएं।',
          audioPromptAs: 'পৰিয়ালৰ ছবিৰ ধাঁধা। আপোন মানুহৰ ছবি জোৰা লগাবলৈ আৰু কাহিনী শুনিবলৈ খেলক টিপক।',
          accent: '#FDF0D5',
          textColor: '#332610',
          icon: Puzzle,
          iconBg: '#E8B25C',
          playable: true,
        },
        {
          id: 'memory_match' as PatientSubView,
          title: tx('Family Memory Match', 'पारिवारिक मेमोरी मैच', 'পৰিয়ালৰ কাৰ্ড মিলোৱা'),
          desc: tx(
            'Turn cards and match pairs of your family members, familiar places, and beloved items.',
            'कार्ड पलटें और अपने परिवार के सदस्यों व पसंदीदा तस्वीरों के जोड़े मिलाएं।',
            'কাৰ্ড লুটিয়াই নিজৰ পৰিয়ালৰ সদস্য আৰু চিনা-জনা ছবিবোৰৰ জোৰা মিলাওক।'
          ),
          badge: tx('Loved Ones & Familiar Moments', 'अपनों की तस्वीरें', 'মৰমৰ মানুহৰ ছবি'),
          playedToday: gamesStats.memoryPlayedToday,
          affirmation: gamesStats.memoryAffirmation,
          audioPromptEn: 'Family memory matching game. Turn cards to find matching pairs of your loved ones.',
          audioPromptHi: 'पारिवारिक जोड़े मिलाने का खेल। कार्ड पलटें और अपनों की तस्वीरें मिलाएं।',
          audioPromptAs: 'পৰিয়ালৰ জোৰা মিলোৱা খেল। কাৰ্ড লুটিয়াই পৰিয়ালৰ সদস্যৰ জোৰা বিচাৰি উলিয়াওক।',
          accent: '#EAF1E8',
          textColor: '#1E3B1E',
          icon: Brain,
          iconBg: '#5B825B',
          playable: true,
        },
      ];
    }

    // Default Mode Games
    return [
      {
        id: 'puzzle' as PatientSubView,
        title: tx('Classic Photo Puzzle', 'क्लासिक चित्र पहेली', 'পৰম্পৰাগত ছবিৰ ধাঁধা'),
        desc: tx(
          'Put photo pieces together gently. Golden Alphonso mangoes, Assamese Khar & Pitha, and nature.',
          'तस्वीर के टुकड़ों को अपनी गति से जोड़ें। रसीले आम, असमिया व्यंजन और सुंदर प्रकृति।',
          'ছবিৰ টুকুৰাবোৰ লাহে লাহে জোৰা লগাওক। পকা আম, অসমীয়া খাৰ-পিঠা আৰু প্ৰকৃতিৰ দৃশ্য।'
        ),
        badge: tx('Default Mode • Traditional Treasures', 'डिफ़ॉल्ट मोड • क्लासिक चित्र', 'ডিফল্ট মোড • পৰম্পৰাগত ছবি'),
        playedToday: gamesStats.puzzlePlayedToday,
        affirmation: gamesStats.puzzleAffirmation,
        audioPromptEn: 'Classic photo puzzle with delicious mangoes and cultural dishes. Tap Play Now to begin.',
        audioPromptHi: 'क्लासिक चित्र पहेली। आम और पारंपरिक व्यंजनों के चित्र जोड़ने के लिए प्ले दबाएं।',
        audioPromptAs: 'পৰম্পৰাগত ছবিৰ ধাঁধা। আম আৰু অসমীয়া ব্যঞ্জনৰ ছবি জোৰা লগাবলৈ খেলক টিপক।',
        accent: '#FDF0D5',
        textColor: '#332610',
        icon: Puzzle,
        iconBg: '#E8B25C',
        playable: true,
      },
      {
        id: 'memory_match' as PatientSubView,
        title: tx('Nature Memory Match', 'प्रकृति जोड़े मिलाना', 'প্ৰকৃতিৰ জোৰা মিলোৱা'),
        desc: tx(
          'Find matching pairs of friendly pictures. Cheerful flowers, warm sunshine, singing birds, and cats.',
          'मिलते-जुलते सुंदर चित्रों के जोड़े ढूंढें। फूल, सूरज, चिड़िया और बिल्ली।',
          'মিলা ছবিৰ জোৰা বিচাৰক। ফুল, সূৰ্য, চৰাই আৰু মেকুৰী।'
        ),
        badge: tx('Default Mode • Calming Symbols', 'डिफ़ॉल्ट मोड • शांत प्रतीक', 'ডিফল্ট মোড • শান্ত প্ৰতীক'),
        playedToday: gamesStats.memoryPlayedToday,
        affirmation: gamesStats.memoryAffirmation,
        audioPromptEn: 'Nature memory matching game. Tap Play Now to find friendly pairs of flowers and sunshine.',
        audioPromptHi: 'प्रकृति जोड़े मिलाने का खेल। फूल, सूरज और चिड़ियों के जोड़े ढूंढने के लिए प्ले दबाएं।',
        audioPromptAs: 'প্ৰকৃতিৰ জোৰা মিলোৱা খেল। ফুল আৰু চৰাইৰ জোৰা বিচাৰিবলৈ খেলক টিপক।',
        accent: '#EAF1E8',
        textColor: '#1E3B1E',
        icon: Brain,
        iconBg: '#5B825B',
        playable: true,
      },
    ];
  }, [activeMode, hasPhotos, photoMemories.length, gamesStats, tx]);

  return (
    <div className="p-4 pb-24 space-y-4 animate-fadeIn">
      {/* 1. Play Tab Header */}
      <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-[#5B825B]">
            <Heart className="w-5 h-5 fill-[#5B825B]" />
            <span className="font-extrabold text-sm uppercase tracking-wide">
              {tx('Gentle Play & Joy', 'आनंदमय और शांत खेल', 'আনন্দময় আৰু শান্ত খেল')}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EAF1E8] text-[#5B825B] font-extrabold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E8B25C]" />
            {tx('Take Your Time', 'आराम से खेलें', 'ধীৰে-সুস্থে খেলক')}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-[#2D3A2F]">{t('gamesHubTitle')}</h2>
            <p className="text-sm text-[#5A6E5D] mt-1 leading-relaxed">
              {tx(
                'Simple and calming pastimes to delight the senses and spark fond memories.',
                'मन को सुकून देने वाले सरल खेल। अपनी गति से खेलें और शांति का अनुभव करें।',
                'মন শান্ত কৰা সৰল খেল। নিজৰ গতিত খেলি স্মৃতি সজীৱ কৰক।'
              )}
            </p>
          </div>
          <SpeakButton
            textEn="Games Room. Select Default Mode for classic pictures, or Personalized Mode for your family photos."
            textHi="खेल का कमरा। क्लासिक चित्रों के लिए डिफ़ॉल्ट मोड चुनें, या अपनी पारिवारिक यादों के लिए पर्सनलाइज्ड मोड चुनें।"
            textAs="খেলৰ কোঠা। সাধাৰণ ছবিৰ বাবে ডিফল্ট মোড বাছক, বা পৰিয়ালৰ স্মৃতিৰ বাবে ব্যক্তিগত মোড বাছক।"
            size="lg"
          />
        </div>
      </div>

      {/* 2. THE TWO MODES IN PLAY TAB: DEFAULT & PERSONALISED */}
      <div className="bg-white rounded-3xl p-5 border-2 border-[#E0DCD3] shadow-xs space-y-3.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#EAF1E8] flex items-center justify-center text-[#5B825B]">
              <Layers className="w-4 h-4 stroke-[2.5]" />
            </div>
            <div>
              <h3 className="font-black text-sm sm:text-base text-[#2D3A2F]">
                {tx('Choose Play Mode', 'खेलने का मोड चुनें', 'খেলৰ ধৰণ বাছক')}
              </h3>
              <p className="text-xs text-[#5A6E5D] font-medium">
                {tx(
                  'Switch between classic everyday pictures or your own family photos',
                  'क्लासिक चित्रों या अपनी पारिवारिक यादों के बीच चुनें',
                  'পৰম্পৰাগত ছবি বা নিজৰ পৰিয়ালৰ ফটোৰ মাজত বাছক'
                )}
              </p>
            </div>
          </div>
          <SpeakButton
            textEn="Choose your play mode. Tap Default for classic pictures of mangoes and nature. Tap Personalized for your family photos and memories."
            textHi="खेलने का मोड चुनें। आम और प्रकृति के चित्रों के लिए डिफ़ॉल्ट टैप करें। पारिवारिक यादों के लिए पर्सनलाइज्ड टैप करें।"
            textAs="খেলৰ ধৰণ বাছক। আম আৰু প্ৰকৃতিৰ ছবিৰ বাবে ডিফল্ট টিপক। পৰিয়ালৰ স্মৃতিৰ বাবে ব্যক্তিগত টিপক।"
            size="sm"
          />
        </div>

        {/* The 2 Mode Toggle Buttons */}
        <div className="grid grid-cols-2 gap-2.5 p-1.5 bg-[#F8F6F0] rounded-2xl border border-[#EAE6DF]">
          {/* Mode 1: Default Mode Button */}
          <button
            onClick={() => handleModeChange('default')}
            className={`py-3.5 px-3 rounded-xl font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
              activeMode === 'default'
                ? 'bg-[#5B825B] text-white shadow-md ring-2 ring-[#5B825B]/40 scale-[1.01]'
                : 'text-[#5A6E5D] hover:text-[#2D3A2F] bg-white/70 border border-[#E0DCD3]/60 hover:bg-white'
            }`}
            aria-pressed={activeMode === 'default'}
          >
            <div className="flex items-center gap-2">
              <Sparkles className={`w-4 h-4 ${activeMode === 'default' ? 'text-[#E8B25C]' : 'text-[#8C8474]'}`} />
              <span className="whitespace-nowrap">{tx('Default Mode', 'डिफ़ॉल्ट मोड', 'ডিফল্ট মোড')}</span>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                activeMode === 'default' ? 'bg-white/20 text-white' : 'text-[#7D8F80]'
              }`}
            >
              {tx('Classic Treasures', 'क्लासिक चित्र', 'পৰম্পৰাগত ছবি')}
            </span>
          </button>

          {/* Mode 2: Personalised Mode Button */}
          <button
            onClick={() => handleModeChange('personalized')}
            className={`py-3.5 px-3 rounded-xl font-black text-xs sm:text-sm flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer select-none ${
              activeMode === 'personalized'
                ? 'bg-[#5B825B] text-white shadow-md ring-2 ring-[#5B825B]/40 scale-[1.01]'
                : 'text-[#5A6E5D] hover:text-[#2D3A2F] bg-white/70 border border-[#E0DCD3]/60 hover:bg-white'
            }`}
            aria-pressed={activeMode === 'personalized'}
          >
            <div className="flex items-center gap-2">
              <Heart
                className={`w-4 h-4 ${
                  activeMode === 'personalized' ? 'fill-current text-white' : 'text-[#C46A66]'
                }`}
              />
              <span className="whitespace-nowrap">{tx('Personalised Mode', 'पर्सनलाइज्ड मोड', 'ব্যক্তিগত মোড')}</span>
            </div>
            <span
              className={`text-[11px] font-bold px-2 py-0.5 rounded-md ${
                activeMode === 'personalized' ? 'bg-white/20 text-white' : 'text-[#7D8F80]'
              }`}
            >
              {hasPhotos
                ? `${photoMemories.length} ${tx('Family Photos', 'यादें', 'পৰিয়ালৰ ছবি')}`
                : tx('Family Photos', 'पारिवारिक यादें', 'পৰিয়ালৰ ফটো')}
            </span>
          </button>
        </div>

        {/* Contextual Mode Information & Previews */}
        {activeMode === 'default' ? (
          <div className="bg-[#FAF8F3] rounded-2xl p-3.5 border border-[#EAE6DF] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#5B825B] animate-pulse" />
                <span className="text-xs font-black text-[#2D3A2F] uppercase tracking-wider">
                  {tx('Default Mode Active', 'डिफ़ॉल्ट मोड सक्रिय', 'ডিফল্ট মোড সক্ৰিয়')}
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#5B825B] bg-[#EAF1E8] px-2.5 py-0.5 rounded-full">
                {tx('Ready to Play', 'खेलने के लिए तैयार', 'খেলিবলৈ প্ৰস্তুত')}
              </span>
            </div>
            <p className="text-xs text-[#5A6E5D] leading-relaxed">
              {tx(
                'Carefully curated with uplifting everyday themes: ripe Alphonso mangoes, traditional Assamese Khar & Pitha, and tranquil blooming gardens.',
                'शांतिदायक क्लासिक चित्रों से सुसज्जित: रसीले पके आम, असमिया स्वादिष्ट व्यंजन और सुंदर प्रकृति।',
                'সুন্দৰ পৰম্পৰাগত ছবিৰে সজোৱা: পকা আম, অসমীয়া খাৰ-পিঠা আৰু ফুলনি বাগিচা।'
              )}
            </p>
            {/* Quick theme tags */}
            <div className="flex flex-wrap gap-1.5 pt-0.5">
              <span className="px-2.5 py-1 rounded-xl bg-white border border-[#E0DCD3] text-[11px] font-black text-[#8C4E0B]">
                🥭 {tx('Juicy Mangoes', 'रसीले आम', 'ৰসাল পকা আম')}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white border border-[#E0DCD3] text-[11px] font-black text-[#5B825B]">
                🍲 {tx('Assamese Khar & Pitha', 'असमिया व्यंजन', 'অসমীয়া খাৰ আৰু পিঠা')}
              </span>
              <span className="px-2.5 py-1 rounded-xl bg-white border border-[#E0DCD3] text-[11px] font-black text-[#0284C7]">
                🌺 {tx('Nature & Birds', 'प्रकृति और चिड़िया', 'প্ৰকৃতি আৰু চৰাই')}
              </span>
            </div>
          </div>
        ) : (
          <div className="bg-[#FAF8F3] rounded-2xl p-3.5 border border-[#EAE6DF] space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-[#E11D48] animate-pulse" />
                <span className="text-xs font-black text-[#2D3A2F] uppercase tracking-wider">
                  {tx('Personalised Mode Active', 'पर्सनलाइज्ड मोड सक्रिय', 'ব্যক্তিগত মোড সক্ৰিয়')}
                </span>
              </div>
              <span className="text-[11px] font-bold text-[#E11D48] bg-[#FFE4E6] px-2.5 py-0.5 rounded-full flex items-center gap-1">
                <Heart className="w-3 h-3 fill-current" />
                {hasPhotos
                  ? `${photoMemories.length} ${tx('Memories Loaded', 'यादें', 'স্মৃতি')}`
                  : tx('Awaiting Photos', 'फोटो बाकी है', 'ফটো বাকী')}
              </span>
            </div>

            {hasPhotos ? (
              <div className="space-y-2">
                <p className="text-xs text-[#5A6E5D] leading-relaxed">
                  {tx(
                    'Featuring photos uploaded by your family caregivers. Solve the puzzle to hear the voice story of that cherished memory!',
                    'आपकी पारिवारिक तस्वीरों के साथ। पहेली हल करने पर उस सुंदर याद की कहानी आवाज़ में सुनाई देगी!',
                    'আপোনাৰ পৰিয়ালৰ ফটোৰে সজোৱা। ধাঁধা সম্পূৰ্ণ কৰিলে সেই স্মৃতিৰ কাহিনী শুনিবলৈ পাব!'
                  )}
                </p>

                {/* Horizontal strip of personal photos */}
                <div className="flex gap-2 overflow-x-auto pb-1 pt-1 scrollbar-none">
                  {photoMemories.slice(0, 5).map((mem) => (
                    <div
                      key={mem.id}
                      className="shrink-0 flex items-center gap-2 bg-white px-2.5 py-1.5 rounded-xl border border-[#E0DCD3] shadow-2xs"
                    >
                      <div className="w-7 h-7 rounded-lg overflow-hidden shrink-0 bg-[#F4EDE2]">
                        <img
                          src={mem.image}
                          alt={mem.title}
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      </div>
                      <div className="text-left">
                        <span className="block text-[11px] font-black text-[#2D3A2F] line-clamp-1 max-w-[100px]">
                          {mem.title}
                        </span>
                        {mem.person && (
                          <span className="block text-[10px] font-bold text-[#5B825B] line-clamp-1">
                            {mem.person}
                          </span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="space-y-2 bg-white p-3 rounded-xl border border-[#E0DCD3]">
                <div className="flex items-start gap-2 text-xs text-[#5A6E5D]">
                  <Info className="w-4 h-4 text-[#E8B25C] shrink-0 mt-0.5" />
                  <p>
                    {tx(
                      'No personal family photos uploaded yet. Your family caregiver can upload memories anytime in Caregiver Mode. You can also enjoy Default Mode right now!',
                      'अभी कोई व्यक्तिगत फोटो अपलोड नहीं हुई है। आपके परिवार के सदस्य केयरगिवर पोर्टल में तस्वीरें जोड़ सकते हैं। आप डिफ़ॉल्ट मोड खेल सकते हैं!',
                      'এতিয়ালৈ কোনো ব্যক্তিগত ফটো নাই। পৰিয়ালৰ সদস্যই কেয়াৰগিভাৰ পৰ্টেলত ছবি যোগ কৰিব পাৰে। আপুনি এতিয়াই ডিফল্ট মোড খেলিব পাৰে!'
                    )}
                  </p>
                </div>
                <button
                  onClick={() => handleModeChange('default')}
                  className="w-full py-2 rounded-xl bg-[#5B825B] text-white text-xs font-black hover:bg-[#4a6d4a] transition-all cursor-pointer flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-[#E8B25C]" />
                  <span>{tx('Switch to Default Mode', 'डिफ़ॉल्ट मोड पर जाएं', 'ডিফল্ট মোডলৈ যাওক')}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* 3. The 2 Games: Photo Puzzle & Memory Match */}
      <div className="space-y-3.5">
        {games.map((game) => {
          const GameIcon = game.icon;
          return (
            <div
              key={game.id}
              className="bg-white rounded-3xl p-5 border-2 border-[#E0DCD3] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#5B825B]/40 transition-all"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className="w-13 h-13 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5"
                  style={{ backgroundColor: game.iconBg }}
                >
                  <GameIcon className="w-7 h-7" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-1 flex-wrap">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span
                        className="px-3 py-0.5 rounded-full text-xs font-black uppercase tracking-wider"
                        style={{ backgroundColor: game.accent, color: game.textColor }}
                      >
                        {game.badge}
                      </span>
                      {game.playedToday && (
                        <span className="flex items-center gap-1 text-[11px] font-bold text-[#5B825B]">
                          <CheckCircle2 className="w-3.5 h-3.5" /> {tx('Enjoyed Today', 'आज खेला गया', 'আজি খেলা হ’ল')}
                        </span>
                      )}
                    </div>
                    <SpeakButton
                      textEn={game.audioPromptEn}
                      textHi={game.audioPromptHi}
                      textAs={game.audioPromptAs}
                      size="sm"
                    />
                  </div>
                  <h3 className="text-xl font-extrabold text-[#2D3A2F]">{game.title}</h3>
                  <p className="text-sm text-[#5A6E5D] mt-1 leading-relaxed">{game.desc}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#EAE6DF] gap-3">
                <span className="text-xs font-bold text-[#5B825B] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#E8B25C] shrink-0" />
                  <span className="line-clamp-1">{game.affirmation}</span>
                </span>

                <button
                  onClick={() => {
                    soundController.playClick();
                    onSelectGame(game.id);
                  }}
                  className="px-6 py-3 rounded-2xl bg-[#5B825B] text-white font-black text-sm flex items-center gap-2 shadow-xs hover:bg-[#4c704c] active:scale-95 transition-all shrink-0 cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>{t('playNow')}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
