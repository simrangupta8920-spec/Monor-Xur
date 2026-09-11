import React from 'react';
import { Sparkles, Trophy, Play, CheckCircle2 } from 'lucide-react';
import { PatientSubView } from '../../types';
import { soundController } from '../../utils/audio';

interface GamesHubProps {
  onSelectGame: (game: PatientSubView) => void;
  currentLevel: number;
}

export const GamesHub: React.FC<GamesHubProps> = ({ onSelectGame, currentLevel }) => {
  const games = [
    {
      id: 'puzzle' as PatientSubView,
      title: 'Puzzle',
      desc: 'Arrange the 4 pieces to assemble whole pictures of family memories and everyday treasures like mangoes.',
      badge: 'Personalized & Default Modes',
      playedToday: false,
      score: '4-Piece Reassembly',
      accent: '#FDF0D5',
      textColor: '#332610',
      playable: true,
    },
    {
      id: 'memory_match' as PatientSubView,
      title: 'Memory Match',
      desc: 'Flip and match pairs of familiar botanical and animal symbols.',
      badge: 'Interactive & Adaptive',
      playedToday: true,
      score: '8/10 Today',
      accent: '#FDF0D5',
      textColor: '#332610',
      playable: true,
    },
    {
      id: 'picture_pairs' as PatientSubView,
      title: 'Picture Pairs',
      desc: 'Find matching everyday household items and cherished memories.',
      badge: 'Visual Focus',
      playedToday: true,
      score: '7/10 Yesterday',
      accent: '#EAF1E8',
      textColor: '#28331F',
      playable: true,
    },
    {
      id: 'word_recall' as PatientSubView,
      title: 'Word Recall',
      desc: 'Warm recall exercise with familiar everyday words and family names.',
      badge: 'Verbal Memory',
      playedToday: false,
      score: 'Best: 6/10',
      accent: '#D4E4E6',
      textColor: '#1C2A2D',
      playable: true,
    },
    {
      id: 'number_fun' as unknown as PatientSubView,
      title: 'Number Fun',
      desc: 'Gentle counting and sequence sorting to stimulate mental agility.',
      badge: 'Gentle Math',
      playedToday: false,
      score: 'Best: 9/10',
      accent: '#F0D8D6',
      textColor: '#3D2423',
      playable: false,
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
          Enjoyable, rewarding games to exercise memory, attention, and cognitive agility in Player Mode.
        </p>
      </div>

      {/* List of games */}
      <div className="space-y-3.5">
        {games.map((game) => (
          <div
            key={game.title}
            className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs flex flex-col justify-between space-y-4"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <div className="flex items-center gap-2 mb-1">
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
                <p className="text-sm text-[#5A6E5D] mt-1">{game.desc}</p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#EAE6DF]">
              <span className="text-xs font-bold text-[#5A6E5D]">{game.score}</span>

              {game.playable ? (
                <button
                  onClick={() => {
                    soundController.playClick();
                    onSelectGame(game.id);
                  }}
                  className="px-5 py-2.5 rounded-2xl bg-[#5B825B] text-white font-extrabold text-sm flex items-center gap-1.5 shadow-xs hover:bg-[#4c704c] active:scale-95 transition-all"
                >
                  <Play className="w-4 h-4 fill-current" />
                  <span>Play</span>
                </button>
              ) : (
                <button
                  onClick={() => {
                    soundController.playClick();
                    onSelectGame('memory_match');
                  }}
                  className="px-4 py-2 rounded-2xl bg-[#EAF1E8] text-[#5B825B] font-bold text-xs hover:bg-[#d5e6d3]"
                >
                  Play Memory Match
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
