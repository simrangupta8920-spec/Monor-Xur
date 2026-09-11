import React, { useMemo } from 'react';
import { Play, CheckCircle2, Puzzle, Brain, Sparkles, ArrowRight, Heart } from 'lucide-react';
import { PatientSubView, DDAMetric } from '../../types';
import { soundController } from '../../utils/audio';
import { useLanguage } from '../../context/LanguageContext';
import { SpeakButton } from '../common/SpeakButton';

interface GamesHubProps {
  onSelectGame: (game: PatientSubView) => void;
  currentLevel: number;
  ddaLogs?: DDAMetric[];
}

export const GamesHub: React.FC<GamesHubProps> = ({ onSelectGame, currentLevel, ddaLogs = [] }) => {
  const { t, tx, isHindi } = useLanguage();

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

    // Warm, non-clinical affirmations instead of levels and rounds logged
    const puzzleAffirmation = puzzlePlayedToday
      ? isHindi
        ? 'शानदार अभ्यास! आपने आज खेला है।'
        : 'Wonderful effort! You enjoyed this today.'
      : isHindi
      ? 'आराम से अपनी पसंद की तस्वीर जोड़ें।'
      : 'Take your time and enjoy putting pictures together.';

    const memoryAffirmation = memoryPlayedToday
      ? isHindi
        ? 'बहुत सुंदर! सभी जोड़े मन को शांति देते हैं।'
        : 'Well done! Finding pairs brings joy.'
      : isHindi
      ? 'अपनी गति से खेलें, कोई जल्दी नहीं।'
      : 'Play at your own gentle pace, no rush.';

    return {
      puzzlePlayedToday,
      memoryPlayedToday,
      puzzleAffirmation,
      memoryAffirmation,
    };
  }, [ddaLogs, isHindi]);

  const games = [
    {
      id: 'puzzle' as PatientSubView,
      title: t('photoPuzzleTitle'),
      desc: isHindi 
        ? 'तस्वीर के टुकड़ों को अपनी गति से जोड़ें। सुंदर पारिवारिक और प्रकृति के चित्र।'
        : 'Put photo pieces together gently. Beautiful family and nature pictures.',
      badge: isHindi ? 'सुखद चित्र पहेली' : 'Relaxed & Joyful Puzzle',
      playedToday: gamesStats.puzzlePlayedToday,
      affirmation: gamesStats.puzzleAffirmation,
      audioPromptEn: 'Photo puzzle. Tap to put photo pieces together gently without any rush.',
      audioPromptHi: 'चित्र पहेली। अपनी पसंद के टुकड़ों को आराम से जोड़ें। कोई जल्दी नहीं है।',
      accent: '#FDF0D5',
      textColor: '#332610',
      icon: Puzzle,
      iconBg: '#E8B25C',
      playable: true,
    },
    {
      id: 'memory_match' as PatientSubView,
      title: t('memoryMatchTitle'),
      desc: isHindi
        ? 'मिलते-जुलते सुंदर चित्रों के जोड़े ढूंढें। फूल, सूरज, चिड़िया और बिल्ली।'
        : 'Find matching pairs of friendly pictures. Flowers, sun, birds, and cats.',
      badge: isHindi ? 'शांत जोड़े मिलाना' : 'Gentle Pair Matching',
      playedToday: gamesStats.memoryPlayedToday,
      affirmation: gamesStats.memoryAffirmation,
      audioPromptEn: 'Memory matching game. Tap cards to find friendly matching pictures.',
      audioPromptHi: 'जोड़े मिलाने का खेल। कार्ड पलटें और एक जैसे सुंदर चित्र ढूंढें।',
      accent: '#EAF1E8',
      textColor: '#1E3B1E',
      icon: Brain,
      iconBg: '#5B825B',
      playable: true,
    },
  ];

  return (
    <div className="p-4 pb-24 space-y-4 animate-fadeIn">
      {/* Overview header - completely stripped of clinical/technical metrics */}
      <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-[#5B825B]">
            <Heart className="w-5 h-5 fill-[#5B825B]" />
            <span className="font-extrabold text-sm uppercase tracking-wide">
              {tx('Gentle Play & Joy', 'आनंदमय और शांत खेल')}
            </span>
          </div>
          <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#EAF1E8] text-[#5B825B] font-extrabold text-xs">
            <Sparkles className="w-3.5 h-3.5 text-[#E8B25C]" />
            {tx('Take Your Time', 'आराम से खेलें')}
          </span>
        </div>

        <div className="flex items-start justify-between gap-3">
          <div>
            <h2 className="text-2xl font-black text-[#2D3A2F]">{t('gamesHubTitle')}</h2>
            <p className="text-sm text-[#5A6E5D] mt-1 leading-relaxed">
              {tx(
                'Simple and calming pastimes to delight the senses and spark fond memories.',
                'मन को सुकून देने वाले सरल खेल। अपनी गति से खेलें और शांति का अनुभव करें।'
              )}
            </p>
          </div>
          <SpeakButton
            textEn="Games Zone. Simple and calming pastimes. Take your time, enjoy at your own gentle pace."
            textHi="खेल का कमरा। मन को सुकून देने वाले सरल खेल। अपनी गति से आराम से खेलें।"
            size="lg"
          />
        </div>
      </div>

      {/* Exclusively Puzzle Game and Memory Match Game */}
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
                          <CheckCircle2 className="w-3.5 h-3.5" /> {tx('Enjoyed Today', 'आज खेला गया')}
                        </span>
                      )}
                    </div>
                    <SpeakButton
                      textEn={game.audioPromptEn}
                      textHi={game.audioPromptHi}
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
