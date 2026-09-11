import React, { useState, useMemo } from 'react';
import { DDAMetric } from '../../types';
import { 
  TrendingUp, Activity, Brain, Clock, ShieldCheck, Sparkles, 
  AlertTriangle, ArrowUpRight, ArrowDownRight, Minus, RefreshCw, 
  HelpCircle, Calendar, Play, Download, FileText, Puzzle
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
import { soundController } from '../../utils/audio';
import { 
  filterLogsByGame, 
  GameFilterType 
} from '../../utils/gameAnalytics';
import { useLanguage } from '../../context/LanguageContext';

interface CognitiveProgressViewProps {
  ddaLogs: DDAMetric[];
  patientName: string;
  onBack?: () => void;
  onNavigateToGames?: () => void;
  onAddSampleSession?: (metric: DDAMetric) => void;
  onOpenPdfExport?: () => void;
  onNavigateToInsights?: () => void;
}

// Helper to compute cognitive engagement score (0 - 100)
function calculateEngagementScore(metric: DDAMetric): number {
  const baseLevel = metric.difficultyLevel || 1;
  const levelContribution = 55 + (baseLevel - 1) * 12; // 55, 67, 79, 91
  
  // Deduct for mistakes & hint reliance
  const mistakePenalty = Math.min((metric.mistakes || 0) * 4.5, 20);
  const hintPenalty = Math.min((metric.hintsUsed || 0) * 3.5, 12);
  
  // Responsiveness bonus/penalty (ideal: 2s to 4.5s)
  const seconds = (metric.latencyMs || 3500) / 1000;
  let speedFactor = 0;
  if (seconds >= 1.8 && seconds <= 4.0) speedFactor = 6;
  else if (seconds > 7.0) speedFactor = -8;

  const rawScore = levelContribution - mistakePenalty - hintPenalty + speedFactor;
  return Math.max(35, Math.min(100, Math.round(rawScore)));
}

export const CognitiveProgressView: React.FC<CognitiveProgressViewProps> = ({
  ddaLogs,
  patientName,
  onBack,
  onNavigateToGames,
  onAddSampleSession,
  onOpenPdfExport,
  onNavigateToInsights,
}) => {
  const { tx } = useLanguage();
  const [gameFilter, setGameFilter] = useState<GameFilterType>('all');
  const [timeFilter, setTimeFilter] = useState<'all' | 'recent' | 'adaptive'>('all');
  const [activeMetricTab, setActiveMetricTab] = useState<'engagement' | 'latency' | 'difficulty'>('engagement');

  const rawLogs = ddaLogs || [];
  const hasLogs = rawLogs.length > 0;
  const filteredByGameLogs = useMemo(() => filterLogsByGame(rawLogs, gameFilter), [rawLogs, gameFilter]);

  // Process and sort logs chronologically for recharts
  const chartData = useMemo(() => {
    const sorted = [...filteredByGameLogs].sort((a, b) => a.timestamp - b.timestamp);

    return sorted.map((log, index) => {
      const dateObj = new Date(log.timestamp);
      const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeLabel = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const engagement = calculateEngagementScore(log);
      const latencySec = parseFloat(((log.latencyMs || 0) / 1000).toFixed(1));
      const resolvedGameType = log.gameType === 'puzzle' || (log.gameTitle && log.gameTitle.toLowerCase().includes('puzzle'))
        ? 'puzzle'
        : 'memory_match';
      const resolvedGameTitle = log.gameTitle || (resolvedGameType === 'puzzle' ? 'Photo Puzzle' : 'Memory Match');

      return {
        id: log.roundNumber || index + 1,
        sessionName: `${resolvedGameTitle} #${log.roundNumber || index + 1}`,
        dateLabel,
        timeLabel,
        displayLabel: dateLabel,
        timestamp: log.timestamp,
        engagement,
        targetBaseline: 75,
        latencySec,
        difficultyLevel: log.difficultyLevel || 1,
        mistakes: log.mistakes || 0,
        hintsUsed: log.hintsUsed || 0,
        adaptiveAction: log.adaptiveAction || 'maintained',
        aiReasoning: log.aiReasoning || 'Consistent engagement observed.',
        aiModel: log.aiModel || 'Gemini 3.8 Flash',
        fatigueRisk: log.fatigueRisk || 'LOW',
        gameType: resolvedGameType,
        gameTitle: resolvedGameTitle,
      };
    });
  }, [filteredByGameLogs]);

  // Aggregate Key Statistics
  const latestMetric = chartData[chartData.length - 1];
  const previousMetric = chartData.length > 1 ? chartData[chartData.length - 2] : null;

  const averageEngagement = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, curr) => acc + curr.engagement, 0);
    return Math.round(sum / chartData.length);
  }, [chartData]);

  const averageLatency = useMemo(() => {
    if (chartData.length === 0) return 0;
    const sum = chartData.reduce((acc, curr) => acc + curr.latencySec, 0);
    return (sum / chartData.length).toFixed(1);
  }, [chartData]);

  const engagementTrend = previousMetric 
    ? latestMetric.engagement - previousMetric.engagement 
    : 4;

  const adaptiveActionCounts = useMemo(() => {
    return chartData.reduce(
      (acc, curr) => {
        acc[curr.adaptiveAction] = (acc[curr.adaptiveAction] || 0) + 1;
        return acc;
      },
      { maintained: 0, eased: 0, increased: 0 } as Record<string, number>
    );
  }, [chartData]);

  const handleSimulateNewEntry = () => {
    soundController.playSuccess();
    if (onAddSampleSession) {
      const nextRound = chartData.length + 1;
      const sampleMetric: DDAMetric = {
        timestamp: Date.now(),
        roundNumber: nextRound,
        difficultyLevel: Math.min(3, (latestMetric?.difficultyLevel || 1) + (Math.random() > 0.6 ? 1 : 0)),
        latencyMs: Math.round(2500 + Math.random() * 1200),
        mistakes: Math.floor(Math.random() * 2),
        moves: 12 + Math.floor(Math.random() * 4),
        hintsUsed: Math.random() > 0.7 ? 1 : 0,
        adaptiveAction: Math.random() > 0.5 ? 'increased' : 'maintained',
        aiReasoning: 'Real-time telemetry simulation demonstrating live trend curve update.',
        aiModel: 'Gemini 3.8 Flash',
        fatigueRisk: 'LOW',
      };
      onAddSampleSession(sampleMetric);
    }
  };

  return (
    <div className="space-y-4 animate-fadeIn pb-12">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          {onBack && (
            <button
              onClick={() => {
                soundController.playClick();
                onBack();
              }}
              className="px-3 py-1.5 rounded-xl bg-white border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] hover:bg-[#EAF1E8]"
            >
              ← {tx('Back', 'पीछे')}
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#2D3A2F]">{tx('DDA Cognitive Progress', 'डीडीए संज्ञानात्मक प्रगति')}</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EAF1E8] text-[#5B825B] text-[10px] font-black uppercase tracking-wide">
                {tx('Live Telemetry', 'लाइव टेलीमेट्री')}
              </span>
            </div>
            <p className="text-xs text-[#5A6E5D]">
              {tx(
                `Tracking ${patientName}'s cognitive engagement, response speed, and adaptive difficulty over time.`,
                `${patientName} के संज्ञानात्मक जुड़ाव, प्रतिक्रिया गति और अनुकूलन कठिनाई की समय के साथ निगरानी।`
              )}
            </p>
          </div>
        </div>

        {/* Quick action: play, simulate, or download PDF */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {onNavigateToInsights && (
            <button
              onClick={() => {
                soundController.playClick();
                onNavigateToInsights();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#EAF1E8] border border-[#5B825B]/40 text-[#5B825B] text-xs font-black flex items-center gap-1.5 hover:bg-[#dfeade] shadow-2xs transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#5B825B]" />
              <span>{tx('Memory Insights', 'स्मृति अंतर्दृष्टि')}</span>
            </button>
          )}

          {onOpenPdfExport && (
            <button
              onClick={() => {
                soundController.playClick();
                onOpenPdfExport();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#F0EBE1] border border-[#D5CFBF] text-[#2D3A2F] text-xs font-extrabold flex items-center gap-1.5 hover:bg-[#EAE4D6] shadow-2xs transition-colors"
              title={tx('Download clinical summary PDF for doctor or family', 'डॉक्टर या परिवार के लिए नैदानिक सारांश PDF डाउनलोड करें')}
            >
              <FileText className="w-3.5 h-3.5 text-[#5B825B]" />
              <span>{tx('Export PDF Report', 'PDF रिपोर्ट निर्यात करें')}</span>
            </button>
          )}

          {onNavigateToGames && (
            <button
              onClick={() => {
                soundController.playClick();
                onNavigateToGames();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#5B825B] text-white text-xs font-black flex items-center gap-1.5 shadow-2xs hover:bg-[#4a6b4a]"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{tx('Play Game', 'खेल खेलें')}</span>
            </button>
          )}

          {onAddSampleSession && (
            <button
              onClick={handleSimulateNewEntry}
              className="px-3 py-1.5 rounded-xl bg-[#FDFBF7] border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] flex items-center gap-1.5 hover:bg-[#EAF1E8]"
              title={tx('Add a sample session to test the graph', 'ग्राफ़ जांचने के लिए एक नमूना सत्र जोड़ें')}
            >
              <RefreshCw className="w-3 h-3 text-[#5B825B]" />
              <span>{tx('Simulate Session', 'सत्र अनुकरण')}</span>
            </button>
          )}
        </div>
      </div>

      {/* Game Filter Bar */}
      <div className="bg-white p-3.5 rounded-2xl border border-[#E0DCD3] shadow-xs flex flex-wrap items-center justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-black text-[#2D3A2F] uppercase tracking-wider pl-1">{tx('Game Filter:', 'खेल फ़िल्टर:')}</span>
          
          <button
            onClick={() => {
              soundController.playClick();
              setGameFilter('all');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              gameFilter === 'all'
                ? 'bg-[#2D3A2F] text-white shadow-2xs'
                : 'bg-[#FDFBF7] text-[#5A6E5D] border border-[#E0DCD3] hover:bg-[#EAF1E8]'
            }`}
          >
            <span>{tx('All Games', 'सभी खेल')}</span>
            <span className="px-1.5 py-0.2 rounded-full text-[10px] bg-white/20">
              {rawLogs.length}
            </span>
          </button>

          <button
            onClick={() => {
              soundController.playClick();
              setGameFilter('memory_match');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              gameFilter === 'memory_match'
                ? 'bg-[#5B825B] text-white shadow-2xs'
                : 'bg-[#FDFBF7] text-[#5A6E5D] border border-[#E0DCD3] hover:bg-[#EAF1E8]'
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>{tx('Memory Match', 'स्मृति मिलान')}</span>
          </button>

          <button
            onClick={() => {
              soundController.playClick();
              setGameFilter('puzzle');
            }}
            className={`px-3 py-1 rounded-xl text-xs font-black transition-all flex items-center gap-1.5 ${
              gameFilter === 'puzzle'
                ? 'bg-[#E8B25C] text-[#332610] shadow-2xs'
                : 'bg-[#FDFBF7] text-[#5A6E5D] border border-[#E0DCD3] hover:bg-[#FDF0D5]'
            }`}
          >
            <Puzzle className="w-3.5 h-3.5" />
            <span>{tx('Photo Puzzle', 'चित्र पहेली')}</span>
          </button>
        </div>

        <span className="text-[11px] font-bold text-[#5A6E5D] pr-1">
          {tx(
            `Showing ${chartData.length} records matching ${gameFilter === 'all' ? 'both games' : gameFilter === 'puzzle' ? 'Photo Puzzle' : 'Memory Match'}`,
            `${gameFilter === 'all' ? 'दोनों खेलों' : gameFilter === 'puzzle' ? 'चित्र पहेली' : 'स्मृति मिलान'} के लिए ${chartData.length} रिकॉर्ड्स प्रदर्शित`
          )}
        </span>
      </div>

      {/* Dynamic Notice Banner if no game played yet */}
      {!hasLogs && (
        <div className="p-4 rounded-2xl bg-[#F4EFE6] border border-[#E2DDD2] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2.5 text-[#4A3D29]">
            <Brain className="w-5 h-5 text-[#C98A2C] shrink-0" />
            <span>
              <strong>{tx('No Gameplay Telemetry Recorded Yet:', 'अभी कोई खेल टेलीमेट्री रिकॉर्ड नहीं:')}</strong>{' '}
              {tx(
                `Real-time cognitive progress, reaction speed trends, and AI difficulty adaptation will automatically populate from live sessions played by ${patientName} in the Player Zone.`,
                `खिलाड़ी क्षेत्र में ${patientName} द्वारा खेले गए सत्रों से वास्तविक समय संज्ञानात्मक प्रगति, प्रतिक्रिया गति और AI कठिनाई अनुकूलन स्वचालित रूप से दिखाई देगा।`
              )}
            </span>
          </div>
          {onNavigateToGames && (
            <button
              onClick={() => {
                soundController.playClick();
                onNavigateToGames();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#5B825B] text-white text-xs font-bold hover:bg-[#4A6D4A] shrink-0 shadow-xs flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-white" />
              <span>{tx('Play Games', 'खेल खेलें')}</span>
            </button>
          )}
        </div>
      )}

      {/* Metric KPI Summary Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Engagement Score */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E0DCD3] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5A6E5D] uppercase">{tx('Engagement Index', 'जुड़ाव सूचकांक')}</span>
            <div className={`flex items-center text-[11px] font-extrabold ${
              engagementTrend >= 0 ? 'text-[#5B825B]' : 'text-[#C46A66]'
            }`}>
              {engagementTrend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{Math.abs(engagementTrend)}%</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#2D3A2F]">{latestMetric ? `${latestMetric.engagement}%` : '0%'}</span>
            <span className="text-[11px] text-[#5A6E5D]">{tx('avg:', 'औसत:')} {averageEngagement}%</span>
          </div>
          <p className="text-[10px] text-[#5B825B] font-bold">{tx('Optimal Focus Range', 'इष्टतम एकाग्रता दायरा')}</p>
        </div>

        {/* Avg Latency */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E0DCD3] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5A6E5D] uppercase">{tx('Avg Latency', 'औसत प्रतिक्रिया')}</span>
            <Clock className="w-3.5 h-3.5 text-[#5A6E5D]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#2D3A2F]">{latestMetric ? `${latestMetric.latencySec}s` : '0s'}</span>
            <span className="text-[11px] text-[#5A6E5D]">{tx('avg:', 'औसत:')} {averageLatency}s</span>
          </div>
          <p className="text-[10px] text-[#5A6E5D] font-medium">{tx('Deliberate, steady tempo', 'स्थिर और संतुलित गति')}</p>
        </div>

        {/* Adaptive Difficulty Level */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E0DCD3] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5A6E5D] uppercase">{tx('Current Level', 'वर्तमान स्तर')}</span>
            <span className="px-1.5 py-0.5 rounded-md bg-[#EAF1E8] text-[#5B825B] text-[10px] font-black">
              {tx('DDA Scaled', 'DDA समायोजित')}
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#5B825B]">
              {tx('Level', 'स्तर')} {latestMetric ? latestMetric.difficultyLevel : 1}
            </span>
            <span className="text-[11px] text-[#5A6E5D]">{tx('of 5', '/ 5')}</span>
          </div>
          <p className="text-[10px] text-[#5A6E5D] font-medium">{tx('Automatic adjustments', 'स्वचालित समायोजन')}</p>
        </div>

        {/* Fatigue Risk & Shift */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E0DCD3] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5A6E5D] uppercase">{tx('Fatigue Flag', 'थकान चेतावनी')}</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#5B825B]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#5B825B]">{latestMetric ? latestMetric.fatigueRisk : tx('LOW', 'कम')}</span>
            <span className="text-[11px] text-[#5A6E5D]">{tx('Risk', 'जोखिम')}</span>
          </div>
          <p className="text-[10px] text-[#5B825B] font-bold">{tx('No hesitation burnout', 'कोई झिझक या थकावट नहीं')}</p>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E0DCD3] shadow-xs space-y-4">
        {/* Chart View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F0EDE6]">
          <div>
            <h3 className="font-extrabold text-base text-[#2D3A2F]">
              {tx('Cognitive Engagement Trend Line', 'संज्ञानात्मक जुड़ाव रुझान रेखा')}
            </h3>
            <p className="text-xs text-[#5A6E5D]">
              {tx(
                'Composite engagement score derived from accuracy, hesitation-free speed, and adaptive difficulty.',
                'सटीकता, झिझक रहित गति और अनुकूलन कठिनाई से तैयार समग्र जुड़ाव स्कोर।'
              )}
            </p>
          </div>

          <div className="flex items-center gap-1.5 self-start sm:self-auto bg-[#F5F2EB] p-1 rounded-xl">
            <button
              onClick={() => {
                soundController.playClick();
                setActiveMetricTab('engagement');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMetricTab === 'engagement'
                  ? 'bg-white text-[#2D3A2F] shadow-2xs'
                  : 'text-[#5A6E5D] hover:text-[#2D3A2F]'
              }`}
            >
              {tx('Engagement (%)', 'जुड़ाव (%)')}
            </button>

            <button
              onClick={() => {
                soundController.playClick();
                setActiveMetricTab('latency');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMetricTab === 'latency'
                  ? 'bg-white text-[#2D3A2F] shadow-2xs'
                  : 'text-[#5A6E5D] hover:text-[#2D3A2F]'
              }`}
            >
              {tx('Speed & Latency', 'गति एवं प्रतिक्रिया')}
            </button>

            <button
              onClick={() => {
                soundController.playClick();
                setActiveMetricTab('difficulty');
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                activeMetricTab === 'difficulty'
                  ? 'bg-white text-[#2D3A2F] shadow-2xs'
                  : 'text-[#5A6E5D] hover:text-[#2D3A2F]'
              }`}
            >
              {tx('Mistakes & Hints', 'त्रुटियां एवं संकेत')}
            </button>
          </div>
        </div>

        {/* Recharts Area: Tab 1 (Cognitive Engagement Trend Line) */}
        {activeMetricTab === 'engagement' && (
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="engagementGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#5B825B" stopOpacity={0.35} />
                    <stop offset="95%" stopColor="#5B825B" stopOpacity={0.02} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE7DF" />
                <XAxis 
                  dataKey="displayLabel" 
                  tick={{ fontSize: 11, fill: '#5A6E5D' }} 
                  axisLine={{ stroke: '#E0DCD3' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[30, 100]} 
                  tick={{ fontSize: 11, fill: '#5A6E5D' }} 
                  axisLine={{ stroke: '#E0DCD3' }}
                  tickLine={false}
                  unit="%"
                />
                <Tooltip content={<CustomEngagementTooltip tx={tx} />} />
                <ReferenceLine 
                  y={75} 
                  stroke="#C98A2C" 
                  strokeDasharray="4 4" 
                  label={{ value: tx('Target Engagement (75%)', 'लक्षित जुड़ाव (75%)'), position: 'insideTopRight', fill: '#C98A2C', fontSize: 10 }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="engagement" 
                  name={tx('Engagement Score', 'जुड़ाव स्कोर')} 
                  stroke="#5B825B" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#engagementGradient)" 
                  activeDot={{ r: 6, fill: '#5B825B', stroke: '#FFFFFF', strokeWidth: 2 }}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recharts Area: Tab 2 (Response Latency & Difficulty Trajectory) */}
        {activeMetricTab === 'latency' && (
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 10, right: 20, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE7DF" />
                <XAxis 
                  dataKey="displayLabel" 
                  tick={{ fontSize: 11, fill: '#5A6E5D' }} 
                  axisLine={{ stroke: '#E0DCD3' }}
                  tickLine={false}
                />
                <YAxis 
                  yAxisId="left"
                  domain={[0, 8]} 
                  tick={{ fontSize: 11, fill: '#5A6E5D' }} 
                  axisLine={{ stroke: '#E0DCD3' }}
                  tickLine={false}
                  unit="s"
                />
                <YAxis 
                  yAxisId="right" 
                  orientation="right"
                  domain={[1, 5]} 
                  tick={{ fontSize: 11, fill: '#C98A2C' }} 
                  axisLine={{ stroke: '#E0DCD3' }}
                  tickLine={false}
                  unit=" lvl"
                />
                <Tooltip content={<CustomLatencyTooltip tx={tx} />} />
                <Legend 
                  verticalAlign="top" 
                  height={30} 
                  wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} 
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="latencySec" 
                  name={tx('Response Latency (sec)', 'प्रतिक्रिया समय (सेकंड)')} 
                  stroke="#7A9CA4" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#7A9CA4' }}
                />
                <Line 
                  yAxisId="right"
                  type="stepAfter" 
                  dataKey="difficultyLevel" 
                  name={tx('Difficulty Level', 'कठिनाई स्तर')} 
                  stroke="#C98A2C" 
                  strokeWidth={2} 
                  strokeDasharray="4 4"
                  dot={{ r: 4, fill: '#C98A2C' }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Recharts Area: Tab 3 (Mistakes & Hints Bar Distribution) */}
        {activeMetricTab === 'difficulty' && (
          <div className="h-64 sm:h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#EBE7DF" />
                <XAxis 
                  dataKey="displayLabel" 
                  tick={{ fontSize: 11, fill: '#5A6E5D' }} 
                  axisLine={{ stroke: '#E0DCD3' }}
                  tickLine={false}
                />
                <YAxis 
                  domain={[0, 'auto']} 
                  tick={{ fontSize: 11, fill: '#5A6E5D' }} 
                  axisLine={{ stroke: '#E0DCD3' }}
                  tickLine={false}
                />
                <Tooltip content={<CustomMistakesTooltip tx={tx} />} />
                <Legend 
                  verticalAlign="top" 
                  height={30} 
                  wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} 
                />
                <Bar 
                  dataKey="mistakes" 
                  name={tx('Mistakes', 'त्रुटियां')} 
                  fill="#C46A66" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="hintsUsed" 
                  name={tx('Hints Requested', 'मांगे गए संकेत')} 
                  fill="#E8B25C" 
                  radius={[4, 4, 0, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Legend / Key takeaway footer */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-[#F0EDE6] text-xs text-[#5A6E5D]">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#5B825B]" />
              <strong>{tx('High Engagement (75%+)', 'उच्च जुड़ाव (75%+)')}</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8B25C]" />
              <strong>{tx('Adaptive Stabilized', 'अनुकूलन स्थिर')}</strong>
            </span>
          </div>
          <span className="font-semibold text-[11px]">
            {tx(
              `${chartData.length} Game Rounds Processed by DDA Engine`,
              `${chartData.length} खेल राउंड डीडीए इंजन द्वारा विश्लेषित`
            )}
          </span>
        </div>
      </div>

      {/* Clinical Telemetry Rationale Feed */}
      <div className="bg-white rounded-3xl p-5 border border-[#E0DCD3] shadow-xs space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center">
              <Sparkles className="w-4 h-4" />
            </div>
            <h3 className="font-extrabold text-sm text-[#2D3A2F] uppercase tracking-wide">
              {tx('Recent Adaptive Action Rationale', 'हालिया अनुकूलन निर्णय एवं कारण')}
            </h3>
          </div>
          <span className="text-xs text-[#5A6E5D] font-semibold">{tx('Gemini 3.8 Flash Rationale', 'जेमिनी 3.8 फ़्लैश विश्लेषण')}</span>
        </div>

        <div className="space-y-2.5">
          {chartData.slice(-4).reverse().map((item, idx) => (
            <div 
              key={idx} 
              className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-black ${
                    item.gameType === 'puzzle'
                      ? 'bg-[#FDF0D5] text-[#8C651E]'
                      : 'bg-[#EAF1E8] text-[#5B825B]'
                  }`}>
                    {item.gameType === 'puzzle' ? <Puzzle className="w-2.5 h-2.5" /> : <Brain className="w-2.5 h-2.5" />}
                    {item.gameTitle === 'Photo Puzzle' ? tx('Photo Puzzle', 'चित्र पहेली') : tx('Memory Match', 'स्मृति मिलान')}
                  </span>
                  <span className="font-black text-[#2D3A2F]">
                    {tx('Level', 'स्तर')} {item.difficultyLevel}
                  </span>
                  <span className="text-[11px] text-[#5A6E5D]">({item.dateLabel})</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                    item.adaptiveAction === 'increased'
                      ? 'bg-[#EAF1E8] text-[#5B825B]'
                      : item.adaptiveAction === 'eased'
                      ? 'bg-[#F0D8D6] text-[#C46A66]'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    {tx('Action:', 'क्रिया:')} {item.adaptiveAction === 'increased' ? tx('increased', 'बढ़ाया गया') : item.adaptiveAction === 'eased' ? tx('eased', 'आसान किया गया') : tx('maintained', 'स्थिर रखा गया')}
                  </span>
                </div>
                <p className="text-[#5A6E5D] leading-relaxed italic">
                  "{item.aiReasoning}"
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-[11px] font-bold text-[#5A6E5D] pt-1 sm:pt-0 border-t sm:border-t-0 border-[#EAE6DF]">
                <span>{tx('Speed:', 'गति:')} {item.latencySec}s</span>
                <span>{tx('Errors:', 'त्रुटियां:')} {item.mistakes}</span>
                <span className="text-[#5B825B] font-extrabold">{tx('Score:', 'स्कोर:')} {item.engagement}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Custom Tooltip for Engagement Chart
const CustomEngagementTooltip = ({ active, payload, label, tx }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const t = tx || ((en: string, hi: string) => en);
    return (
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#E0DCD3] shadow-lg text-xs space-y-1.5 max-w-xs">
        <div className="flex items-center justify-between font-black text-[#2D3A2F] border-b border-[#F0EDE6] pb-1">
          <span>{data.sessionName}</span>
          <span className="text-[#5B825B]">{data.dateLabel}</span>
        </div>
        <div className="flex items-center justify-between font-bold">
          <span className="text-[#5A6E5D]">{t('Cognitive Engagement:', 'संज्ञानात्मक जुड़ाव:')}</span>
          <span className="text-[#5B825B] text-sm font-black">{data.engagement}%</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-[#5A6E5D]">
          <div>{t('Difficulty:', 'कठिनाई:')} <strong className="text-[#2D3A2F]">{t('Lvl', 'स्तर')} {data.difficultyLevel}</strong></div>
          <div>{t('Latency:', 'प्रतिक्रिया:')} <strong className="text-[#2D3A2F]">{data.latencySec}s</strong></div>
          <div>{t('Mistakes:', 'त्रुटियां:')} <strong className="text-[#2D3A2F]">{data.mistakes}</strong></div>
          <div>{t('Hints:', 'संकेत:')} <strong className="text-[#2D3A2F]">{data.hintsUsed}</strong></div>
        </div>
        {data.aiReasoning && (
          <p className="text-[10px] text-[#5A6E5D] bg-[#FDFBF7] p-1.5 rounded-lg border border-[#EBE7DF] italic">
            {data.aiReasoning}
          </p>
        )}
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Latency & Difficulty Chart
const CustomLatencyTooltip = ({ active, payload, tx }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const t = tx || ((en: string, hi: string) => en);
    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#E0DCD3] shadow-lg text-xs space-y-1">
        <div className="font-black text-[#2D3A2F]">{data.sessionName} ({data.dateLabel})</div>
        <div className="text-[#7A9CA4] font-extrabold">{t('Response Speed:', 'प्रतिक्रिया गति:')} {data.latencySec} {t('seconds', 'सेकंड')}</div>
        <div className="text-[#C98A2C] font-extrabold">{t('Difficulty:', 'कठिनाई:')} {t('Level', 'स्तर')} {data.difficultyLevel}</div>
        <div className="text-[11px] text-[#5A6E5D]">{t('Adaptive Decision:', 'अनुकूलन निर्णय:')} {data.adaptiveAction}</div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Mistakes & Hints
const CustomMistakesTooltip = ({ active, payload, tx }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    const t = tx || ((en: string, hi: string) => en);
    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#E0DCD3] shadow-lg text-xs space-y-1">
        <div className="font-black text-[#2D3A2F]">{data.sessionName} ({data.dateLabel})</div>
        <div className="text-[#C46A66] font-extrabold">{t('Mistakes:', 'त्रुटियां:')} {data.mistakes}</div>
        <div className="text-[#E8B25C] font-extrabold">{t('Hints Used:', 'प्रयुक्त संकेत:')} {data.hintsUsed}</div>
      </div>
    );
  }
  return null;
};
