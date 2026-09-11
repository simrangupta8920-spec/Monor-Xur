import React, { useMemo } from 'react';
import { Trophy, Play, CheckCircle2, Puzzle, Brain, Sparkles, ArrowRight } from 'lucide-react';
import { PatientSubView, DDAMetric } from '../../types';
import { soundController } from '../../utils/audio';

interface GamesHubProps {
  onSelectGame: (game: PatientSubView) => void;
  currentLevel: number;
  ddaLogs?: DDAMetric[];
}

export const GamesHub: React.FC<GamesHubProps> = ({ onSelectGame, currentLevel, ddaLogs = [] }) => {
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

    const latestPuzzle = puzzleLogs.sort((a, b) => b.timestamp - a.timestamp)[0];
    const latestMemory = memoryLogs.sort((a, b) => b.timestamp - a.timestamp)[0];

    const puzzleScore = latestPuzzle 
      ? `Level ${latestPuzzle.difficultyLevel} • ${puzzleLogs.length} Rounds Logged`
      : 'Gentle, Medium & Challenge';

    const memoryScore = latestMemory
      ? `Level ${latestMemory.difficultyLevel} • ${memoryLogs.length} Rounds Logged`
      : 'Personalized Speed Baseline';

    return {
      puzzlePlayedToday,
      memoryPlayedToday,
      puzzleScore,
      memoryScore,
      puzzleCount: puzzleLogs.length,
      memoryCount: memoryLogs.length,
    };
  }, [ddaLogs]);

  const games = [
    {
      id: 'puzzle' as PatientSubView,
      title: 'Photo Puzzle',
      desc: 'Assemble 4, 9, or 16 piece puzzles using personalized family memories and everyday treasures with AI difficulty adaptation.',
      badge: 'AI Adaptive • 2×2 to 4×4',
      playedToday: gamesStats.puzzlePlayedToday,
      score: gamesStats.puzzleScore,
      accent: '#FDF0D5',
      textColor: '#332610',
      icon: Puzzle,
      iconBg: '#E8B25C',
      playable: true,
    },
    {
      id: 'memory_match' as PatientSubView,
      title: 'Memory Match',
      desc: 'Flip and match pairs of familiar botanical, nature, and animal symbols with real-time AI cognitive difficulty scaling.',
      badge: 'AI Adaptive • Card Recall',
      playedToday: gamesStats.memoryPlayedToday,
      score: gamesStats.memoryScore,
      accent: '#EAF1E8',
      textColor: '#1E3B1E',
      icon: Brain,
      iconBg: '#5B825B',
      playable: true,
    },
  ];

  return (
    <div className="p-4 pb-24 space-y-4 animate-fadeIn">
      {/* Overview header */}
      <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-2 text-[#5B825B]">
            <Trophy className="w-5 h-5" />
            <span className="font-extrabold text-sm uppercase tracking-wide">Player Zone</span>
          </div>
          <span className="px-3 py-1 rounded-full bg-[#EAF1E8] text-[#5B825B] font-extrabold text-xs">
            Explorer Level {currentLevel}
          </span>
        </div>
        <h2 className="text-2xl font-black text-[#2D3A2F]">Mind Games & Quests</h2>
        <p className="text-sm text-[#5A6E5D] mt-1">
          Two thoughtfully crafted memory games with Gemini AI difficulty adaptation to support relaxed recall and joyful mental agility.
        </p>
      </div>

      {/* Exclusively Puzzle Game and Memory Match Game */}
      <div className="space-y-3.5">
        {games.map((game) => {
          const GameIcon = game.icon;
          return (
            <div
              key={game.id}
              className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs flex flex-col justify-between space-y-4 hover:border-[#5B825B]/40 transition-all"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className="w-12 h-12 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-xs mt-0.5"
                  style={{ backgroundColor: game.iconBg }}
                >
                  <GameIcon className="w-6 h-6" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span
                      className="px-2.5 py-0.5 rounded-full text-xs font-bold"
                      style={{ backgroundColor: game.accent, color: game.textColor }}
                    >
                      {game.badge}
                    </span>
                    {game.playedToday && (
                      <span className="flex items-center gap-1 text-[11px] font-bold text-[#5B825B]">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Played Today
                      </span>
                    )}
                  </div>
                  <h3 className="text-xl font-extrabold text-[#2D3A2F]">{game.title}</h3>
                  <p className="text-sm text-[#5A6E5D] mt-1 leading-relaxed">{game.desc}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-[#EAE6DF]">
                <span className="text-xs font-bold text-[#5A6E5D]">{game.score}</span>

                <button
                  onClick={() => {
                    soundController.playClick();
                    onSelectGame(game.id);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-[#5B825B] text-white font-extrabold text-sm flex items-center gap-2 shadow-xs hover:bg-[#4c704c] active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play {game.title}</span>
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

