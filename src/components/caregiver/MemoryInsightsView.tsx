import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, Activity, Brain, Clock, ShieldCheck, Sparkles, 
  AlertTriangle, ArrowUpRight, ArrowDownRight, Minus, RefreshCw, 
  HelpCircle, Calendar, Play, Download, FileText, Puzzle, ArrowLeft
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts';
import { DDAMetric } from '../../types';
import { soundController } from '../../utils/audio';
import { filterLogsByGame, GameFilterType, computeGameStats, getGameBreakdown } from '../../utils/gameAnalytics';
import { useLanguage } from '../../context/LanguageContext';

interface MemoryInsightsViewProps {
  ddaLogs: DDAMetric[];
  patientName: string;
  onBack?: () => void;
  onNavigateToGames?: () => void;
  onAddSampleSession?: (metric: DDAMetric) => void;
  onOpenPdfExport?: () => void;
  onExportDoctorSummary?: () => void;
}

export const MemoryInsightsView: React.FC<MemoryInsightsViewProps> = ({
  ddaLogs,
  patientName,
  onBack,
  onNavigateToGames,
  onAddSampleSession,
  onOpenPdfExport,
  onExportDoctorSummary,
}) => {
  const { tx } = useLanguage();
  const [filter, setFilter] = useState<GameFilterType>('all');

  const filteredLogs = useMemo(() => {
    return filterLogsByGame(ddaLogs || [], filter);
  }, [ddaLogs, filter]);

  const stats = useMemo(() => {
    return computeGameStats(filteredLogs);
  }, [filteredLogs]);

  const breakdown = useMemo(() => {
    return getGameBreakdown(ddaLogs || []);
  }, [ddaLogs]);

  // Transform logs for Recharts
  const chartData = useMemo(() => {
    if (filteredLogs.length === 0) {
      // Baseline illustration data if no rounds played yet
      return [
        { round: 'R1', latency: 4.2, mistakes: 4, accuracy: 75, tier: 1 },
        { round: 'R2', latency: 3.8, mistakes: 3, accuracy: 82, tier: 1 },
        { round: 'R3', latency: 3.5, mistakes: 2, accuracy: 88, tier: 1 },
        { round: 'R4', latency: 3.1, mistakes: 1, accuracy: 94, tier: 2 },
        { round: 'R5', latency: 2.9, mistakes: 0, accuracy: 100, tier: 2 },
      ];
    }

    return filteredLogs.slice(-12).map((l, idx) => {
      const moves = l.moves || (l.mistakes + 4);
      const acc = moves > 0 ? Math.max(50, Math.min(100, Math.round(((moves - l.mistakes) / moves) * 100))) : 90;
      return {
        round: `R${l.roundNumber || idx + 1}`,
        latency: Number(((l.latencyMs || 3000) / 1000).toFixed(1)),
        mistakes: l.mistakes || 0,
        accuracy: acc,
        tier: l.difficultyLevel || 1,
      };
    });
  }, [filteredLogs]);

  const handleSimulateTestSession = () => {
    if (!onAddSampleSession) return;
    soundController.playSuccess();
    const roundNumber = (ddaLogs?.length || 0) + 1;
    const isPuzzle = Math.random() > 0.5;
    const mockMetric: DDAMetric = {
      timestamp: Date.now(),
      roundNumber,
      difficultyLevel: 1,
      latencyMs: Math.round(2400 + Math.random() * 1200),
      mistakes: Math.floor(Math.random() * 2),
      moves: 8,
      hintsUsed: 0,
      adaptiveAction: 'maintained',
      aiReasoning: 'Consistent engagement maintained within optimal cognitive flow.',
      aiModel: 'gemini-3.8-flash',
      fatigueRisk: 'LOW',
      gameType: isPuzzle ? 'puzzle' : 'memory_match',
      gameTitle: isPuzzle ? 'Photo Puzzle' : 'Memory Match',
    };
    onAddSampleSession(mockMetric);
  };

  return (
    <div className="space-y-5 animate-fadeIn pb-12">
      {/* Top Header Bar */}
      <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          {onBack && (
            <button
              onClick={() => {
                soundController.playClick();
                onBack();
              }}
              className="p-2 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] text-[#5A6E5D] hover:text-[#2D3A2F]"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-black uppercase tracking-wider text-[#5B825B] bg-[#EAF1E8] px-2.5 py-0.5 rounded-full">
                {tx('Clinical Analytics', 'नैदानिक विश्लेषण', 'বৌদ্ধিক বিশ্লেষণ')}
              </span>
              <span className="text-xs text-[#5A6E5D]">
                {filteredLogs.length} {tx('Sessions Recorded', 'सत्र दर्ज', 'সত্ৰ পঞ্জীয়ন কৰা হৈছে')}
              </span>
            </div>
            <h2 className="text-2xl font-black text-[#2D3A2F] mt-0.5">
              {tx('Cognitive Performance & Memory Insights', 'संज्ञानात्मक प्रदर्शन और यादें', 'বৌদ্ধিক প্ৰদৰ্শন আৰু স্মৃতি পৰ্যবেক্ষণ')}
            </h2>
            <p className="text-xs text-[#5A6E5D]">
              {tx(
                `Tracking reaction latency, decision accuracy & adaptive tier progression for ${patientName}`,
                `${patientName} के लिए प्रतिक्रिया समय, सटीकता और अनुकूली स्तर की निगरानी`,
                `${patientName}ৰ বাবে সিদ্ধান্ত গ্ৰহণৰ গতি, শুদ্ধতা আৰু স্তৰৰ তথ্য`
              )}
            </p>
          </div>
        </div>

        {/* Quick Action Export Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          {onExportDoctorSummary && (
            <button
              onClick={onExportDoctorSummary}
              className="px-3.5 py-2 rounded-2xl bg-[#EAF1E8] text-[#5B825B] border border-[#5B825B]/30 text-xs font-black flex items-center gap-1.5 hover:bg-[#d8e6d5] transition-all cursor-pointer"
            >
              <FileText className="w-4 h-4" />
              <span>{tx('Doctor 1-Pager', 'डॉक्टर सारांश', 'চিকিৎসকৰ সংক্ষেপ')}</span>
            </button>
          )}

          {onOpenPdfExport && (
            <button
              onClick={onOpenPdfExport}
              className="px-3.5 py-2 rounded-2xl bg-[#2D3A2F] text-white text-xs font-black flex items-center gap-1.5 hover:bg-[#1a231c] transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4" />
              <span>{tx('Full Clinical Dossier', 'पूर्ण रिपोर्ट', 'সম্পূৰ্ণ ৰিপ’ৰ্ট')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Game Filter Selector */}
      <div className="flex items-center justify-between gap-2 flex-wrap">
        <div className="flex items-center gap-2 bg-[#F8F6F0] p-1.5 rounded-2xl border border-[#EAE6DF]">
          <button
            onClick={() => {
              soundController.playClick();
              setFilter('all');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all cursor-pointer ${
              filter === 'all'
                ? 'bg-white text-[#2D3A2F] shadow-xs'
                : 'text-[#5A6E5D] hover:text-[#2D3A2F]'
            }`}
          >
            {tx('All Activities', 'सभी खेल', 'সকলো খেল')} ({ddaLogs?.length || 0})
          </button>
          <button
            onClick={() => {
              soundController.playClick();
              setFilter('memory_match');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              filter === 'memory_match'
                ? 'bg-white text-[#5B825B] shadow-xs'
                : 'text-[#5A6E5D] hover:text-[#5B825B]'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>{tx('Memory Match', 'मेमोरी मैच', 'মেম’ৰি মেচ')} ({breakdown.memoryMatch.sessions})</span>
          </button>
          <button
            onClick={() => {
              soundController.playClick();
              setFilter('puzzle');
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all cursor-pointer ${
              filter === 'puzzle'
                ? 'bg-white text-[#E8B25C] shadow-xs'
                : 'text-[#5A6E5D] hover:text-[#E8B25C]'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5" />
            <span>{tx('Photo Puzzle', 'फ़ोटो पहेली', 'ফটো সাঁথৰ')} ({breakdown.puzzle.sessions})</span>
          </button>
        </div>

        <button
          onClick={handleSimulateTestSession}
          className="px-3 py-1.5 rounded-xl bg-white border border-[#E0DCD3] text-[#5A6E5D] hover:text-[#2D3A2F] text-xs font-extrabold flex items-center gap-1 cursor-pointer"
          title="Simulate sample telemetry round for validation"
        >
          <Sparkles className="w-3.5 h-3.5 text-[#E8B25C]" />
          <span>{tx('+ Sample Round', '+ नमूना सत्र', '+ নমুনা খেল')}</span>
        </button>
      </div>

      {/* KPI Highlight Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="bg-white p-4 rounded-3xl border border-[#E0DCD3] shadow-xs">
          <span className="text-xs font-bold text-[#5A6E5D] block">{tx('Mean Accuracy', 'औसत सटीकता', 'শুদ্ধতাৰ হাৰ')}</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-[#5B825B]">{stats.avgAccuracy}%</span>
            <span className="text-[10px] text-[#5A6E5D] font-extrabold">{tx('Steady', 'स्थिर', 'স্থিৰ')}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-[#E0DCD3] shadow-xs">
          <span className="text-xs font-bold text-[#5A6E5D] block">{tx('Motor Latency', 'प्रतिक्रिया समय', 'প্ৰতিক্ৰিয়াৰ সময়')}</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-[#2D3A2F]">{stats.avgLatencySec}s</span>
            <span className="text-[10px] text-[#5A6E5D] font-extrabold">{tx('Per Choice', 'प्रति चयन', 'প্ৰতি নিৰ্বাচন')}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-[#E0DCD3] shadow-xs">
          <span className="text-xs font-bold text-[#5A6E5D] block">{tx('Sessions Tracked', 'कुल सत्र', 'মুঠ খেল')}</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-[#E8B25C]">{stats.totalSessions}</span>
            <span className="text-[10px] text-[#8C651E] font-extrabold">{stats.activeDays} {tx('Days', 'दिन', 'দিন')}</span>
          </div>
        </div>

        <div className="bg-white p-4 rounded-3xl border border-[#E0DCD3] shadow-xs">
          <span className="text-xs font-bold text-[#5A6E5D] block">{tx('Current Tier', 'वर्तमान स्तर', 'বৰ্তমান স্তৰ')}</span>
          <div className="flex items-baseline gap-1.5 mt-1">
            <span className="text-2xl font-black text-[#2D3A2F]">Lvl {stats.currentLevel}</span>
            <span className="text-[10px] text-[#5B825B] font-extrabold">{tx('Adaptive', 'अनुकूली', 'অনুকূলী')}</span>
          </div>
        </div>
      </div>

      {/* Chart 1: Accuracy Progression (%) */}
      <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-base font-black text-[#2D3A2F]">
              {tx('Accuracy & Focus Stability (%)', 'सटीकता और एकाग्रता स्थिरता (%)', 'শুদ্ধতা আৰু মনোযোগ স্থিৰতা (%)')}
            </h3>
            <p className="text-xs text-[#5A6E5D]">
              {tx('Progression of correct matches without frustration over recent rounds', 'हाल के सत्रों में बिना तनाव के सही मिलान की प्रगति', 'বিগত খেলসমূহৰ শুদ্ধতাৰ ধাৰাবাহিকতা')}
            </p>
          </div>
          <span className="text-xs font-bold text-[#5B825B] bg-[#EAF1E8] px-2.5 py-1 rounded-full">
            Target: &gt;80%
          </span>
        </div>

        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="accGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#5B825B" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#5B825B" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#EAE6DF" />
              <XAxis dataKey="round" tick={{ fontSize: 11, fill: '#5A6E5D' }} />
              <YAxis domain={[40, 100]} tick={{ fontSize: 11, fill: '#5A6E5D' }} />
              <Tooltip 
                contentStyle={{ backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E0DCD3', fontSize: '12px' }} 
              />
              <ReferenceLine y={80} stroke="#5B825B" strokeDasharray="3 3" />
              <Area type="monotone" dataKey="accuracy" stroke="#5B825B" strokeWidth={3} fillOpacity={1} fill="url(#accGrad)" name="Accuracy (%)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Chart 2: Reaction Latency & Mistakes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Latency Chart */}
        <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
          <div>
            <h3 className="text-base font-black text-[#2D3A2F]">
              {tx('Motor Reaction Latency (Seconds)', 'प्रतिक्रिया समय (सेकंड)', 'প্ৰতিক্ৰিয়াৰ সময় (ছেকেণ্ড)')}
            </h3>
            <p className="text-xs text-[#5A6E5D]">
              {tx('Time taken between card taps or puzzle piece selections', 'कार्ड चुनने या पहेली टुकड़ा रखने में लगा समय', 'টুকুৰা বা কাৰ্ড নিৰ্বাচনৰ গতি')}
            </p>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE6DF" />
                <XAxis dataKey="round" tick={{ fontSize: 11, fill: '#5A6E5D' }} />
                <YAxis domain={[0, 8]} tick={{ fontSize: 11, fill: '#5A6E5D' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E0DCD3', fontSize: '12px' }} 
                />
                <Line type="monotone" dataKey="latency" stroke="#D97706" strokeWidth={3} dot={{ r: 4, fill: '#D97706' }} name="Latency (s)" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Mistakes per Round */}
        <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
          <div>
            <h3 className="text-base font-black text-[#2D3A2F]">
              {tx('Mismatches per Round', 'प्रति दौर गलतियां', 'প্ৰতি খেলত হোৱা ভুল')}
            </h3>
            <p className="text-xs text-[#5A6E5D]">
              {tx('Monitors cognitive fatigue; auto-eases if mistakes exceed threshold', 'थकान की निगरानी करता है; गलतियां बढ़ने पर स्तर आसान कर दिया जाता है', 'ক্লান্তি নিৰীক্ষণ; ভুল বাঢ়িলে আপোনা-আপুনি সহজ স্তৰলৈ যায়')}
            </p>
          </div>

          <div className="h-56 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#EAE6DF" />
                <XAxis dataKey="round" tick={{ fontSize: 11, fill: '#5A6E5D' }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: '#5A6E5D' }} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#FFF', borderRadius: '16px', border: '1px solid #E0DCD3', fontSize: '12px' }} 
                />
                <Bar dataKey="mistakes" fill="#E11D48" radius={[8, 8, 0, 0]} name="Mismatches" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
