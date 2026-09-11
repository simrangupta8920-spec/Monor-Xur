import React, { useState, useMemo } from 'react';
import { DDAMetric } from '../../types';
import { 
  TrendingUp, Activity, Brain, Clock, ShieldCheck, Sparkles, 
  AlertTriangle, ArrowUpRight, ArrowDownRight, Minus, RefreshCw, 
  HelpCircle, Calendar, Play, Download, FileText
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

interface CognitiveProgressViewProps {
  ddaLogs: DDAMetric[];
  patientName: string;
  onBack?: () => void;
  onNavigateToGames?: () => void;
  onAddSampleSession?: (metric: DDAMetric) => void;
  onOpenPdfExport?: () => void;
}

// Sample baseline historical trend to display when the user hasn't played games yet
const BASELINE_DDA_SESSIONS: DDAMetric[] = [
  {
    timestamp: Date.now() - 6 * 24 * 3600 * 1000,
    roundNumber: 1,
    difficultyLevel: 1,
    latencyMs: 4600,
    mistakes: 3,
    moves: 14,
    hintsUsed: 2,
    adaptiveAction: 'eased',
    aiReasoning: 'Initial familiarization session. Mild hesitation detected; maintaining gentle pace.',
    aiModel: 'Gemini 3.8 Flash',
    fatigueRisk: 'LOW',
  },
  {
    timestamp: Date.now() - 5 * 24 * 3600 * 1000,
    roundNumber: 2,
    difficultyLevel: 1,
    latencyMs: 3900,
    mistakes: 2,
    moves: 12,
    hintsUsed: 1,
    adaptiveAction: 'maintained',
    aiReasoning: 'Response times stabilized. Improved spatial recall on pattern recognition.',
    aiModel: 'Gemini 3.8 Flash',
    fatigueRisk: 'LOW',
  },
  {
    timestamp: Date.now() - 4 * 24 * 3600 * 1000,
    roundNumber: 3,
    difficultyLevel: 2,
    latencyMs: 3400,
    mistakes: 1,
    moves: 10,
    hintsUsed: 1,
    adaptiveAction: 'increased',
    aiReasoning: 'Consistent speed and low error rate prompted automatic promotion to Level 2.',
    aiModel: 'Gemini 3.8 Flash',
    fatigueRisk: 'LOW',
  },
  {
    timestamp: Date.now() - 3 * 24 * 3600 * 1000,
    roundNumber: 4,
    difficultyLevel: 2,
    latencyMs: 3600,
    mistakes: 2,
    moves: 12,
    hintsUsed: 0,
    adaptiveAction: 'maintained',
    aiReasoning: 'Healthy focus maintained with zero hint dependencies.',
    aiModel: 'Gemini 3.8 Flash',
    fatigueRisk: 'LOW',
  },
  {
    timestamp: Date.now() - 2 * 24 * 3600 * 1000,
    roundNumber: 5,
    difficultyLevel: 2,
    latencyMs: 3100,
    mistakes: 1,
    moves: 10,
    hintsUsed: 0,
    adaptiveAction: 'increased',
    aiReasoning: 'High visual search efficiency; scaling challenge to level 3.',
    aiModel: 'Gemini 3.8 Flash',
    fatigueRisk: 'LOW',
  },
  {
    timestamp: Date.now() - 1 * 24 * 3600 * 1000,
    roundNumber: 6,
    difficultyLevel: 3,
    latencyMs: 3300,
    mistakes: 1,
    moves: 14,
    hintsUsed: 1,
    adaptiveAction: 'maintained',
    aiReasoning: 'Steady cognitive rhythm at level 3. Good retention of multi-step sequence.',
    aiModel: 'Gemini 3.8 Flash',
    fatigueRisk: 'LOW',
  },
  {
    timestamp: Date.now() - 4 * 3600 * 1000,
    roundNumber: 7,
    difficultyLevel: 3,
    latencyMs: 2900,
    mistakes: 0,
    moves: 12,
    hintsUsed: 0,
    adaptiveAction: 'maintained',
    aiReasoning: 'Peak accuracy achieved today without hesitation flags.',
    aiModel: 'Gemini 3.8 Flash',
    fatigueRisk: 'LOW',
  },
];

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
}) => {
  const [timeFilter, setTimeFilter] = useState<'all' | 'recent' | 'adaptive'>('all');
  const [activeMetricTab, setActiveMetricTab] = useState<'engagement' | 'latency' | 'difficulty'>('engagement');

  const isUsingBaseline = ddaLogs.length === 0;
  const rawLogs = isUsingBaseline ? BASELINE_DDA_SESSIONS : ddaLogs;

  // Process and sort logs chronologically for recharts
  const chartData = useMemo(() => {
    const sorted = [...rawLogs].sort((a, b) => a.timestamp - b.timestamp);

    return sorted.map((log, index) => {
      const dateObj = new Date(log.timestamp);
      const dateLabel = dateObj.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
      const timeLabel = dateObj.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const engagement = calculateEngagementScore(log);
      const latencySec = parseFloat(((log.latencyMs || 0) / 1000).toFixed(1));

      return {
        id: log.roundNumber || index + 1,
        sessionName: `Session ${index + 1}`,
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
      };
    });
  }, [rawLogs]);

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
              ← Back
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-[#2D3A2F]">DDA Cognitive Progress</h2>
              <span className="px-2.5 py-0.5 rounded-full bg-[#EAF1E8] text-[#5B825B] text-[10px] font-black uppercase tracking-wide">
                Live Telemetry
              </span>
            </div>
            <p className="text-xs text-[#5A6E5D]">
              Tracking {patientName}'s cognitive engagement, response speed, and adaptive difficulty over time.
            </p>
          </div>
        </div>

        {/* Quick action: play, simulate, or download PDF */}
        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          {onOpenPdfExport && (
            <button
              onClick={() => {
                soundController.playClick();
                onOpenPdfExport();
              }}
              className="px-3 py-1.5 rounded-xl bg-[#F0EBE1] border border-[#D5CFBF] text-[#2D3A2F] text-xs font-extrabold flex items-center gap-1.5 hover:bg-[#EAE4D6] shadow-2xs transition-colors"
              title="Download clinical summary PDF for doctor or family"
            >
              <FileText className="w-3.5 h-3.5 text-[#5B825B]" />
              <span>Export PDF Report</span>
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
              <span>Play Game</span>
            </button>
          )}

          {onAddSampleSession && (
            <button
              onClick={handleSimulateNewEntry}
              className="px-3 py-1.5 rounded-xl bg-[#FDFBF7] border border-[#E0DCD3] text-xs font-bold text-[#2D3A2F] flex items-center gap-1.5 hover:bg-[#EAF1E8]"
              title="Add a sample session to test the graph"
            >
              <RefreshCw className="w-3 h-3 text-[#5B825B]" />
              <span>Simulate Session</span>
            </button>
          )}
        </div>
      </div>

      {/* Baseline Notice Banner if no game played yet */}
      {isUsingBaseline && (
        <div className="p-3.5 rounded-2xl bg-[#F4EFE6] border border-[#E2DDD2] flex items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-2 text-[#4A3D29]">
            <Brain className="w-4 h-4 text-[#C98A2C] shrink-0" />
            <span>
              <strong>Showing Baseline Progression:</strong> Telemetry from player puzzle & memory games will automatically update this trend line in real time.
            </span>
          </div>
          {onAddSampleSession && (
            <button
              onClick={handleSimulateNewEntry}
              className="px-2.5 py-1 rounded-lg bg-white border border-[#D5CFBF] text-[11px] font-black text-[#2D3A2F] hover:bg-[#EAF1E8] shrink-0 shadow-2xs"
            >
              + Log Sample Point
            </button>
          )}
        </div>
      )}

      {/* Metric KPI Summary Tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        {/* Engagement Score */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E0DCD3] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5A6E5D] uppercase">Engagement Index</span>
            <div className={`flex items-center text-[11px] font-extrabold ${
              engagementTrend >= 0 ? 'text-[#5B825B]' : 'text-[#C46A66]'
            }`}>
              {engagementTrend >= 0 ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
              <span>{Math.abs(engagementTrend)}%</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#2D3A2F]">{latestMetric.engagement}%</span>
            <span className="text-[11px] text-[#5A6E5D]">avg: {averageEngagement}%</span>
          </div>
          <p className="text-[10px] text-[#5B825B] font-bold">Optimal Focus Range</p>
        </div>

        {/* Avg Latency */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E0DCD3] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5A6E5D] uppercase">Avg Latency</span>
            <Clock className="w-3.5 h-3.5 text-[#5A6E5D]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#2D3A2F]">{latestMetric.latencySec}s</span>
            <span className="text-[11px] text-[#5A6E5D]">avg: {averageLatency}s</span>
          </div>
          <p className="text-[10px] text-[#5A6E5D] font-medium">Deliberate, steady tempo</p>
        </div>

        {/* Adaptive Difficulty Level */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E0DCD3] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5A6E5D] uppercase">Current Level</span>
            <span className="px-1.5 py-0.5 rounded-md bg-[#EAF1E8] text-[#5B825B] text-[10px] font-black">
              DDA Scaled
            </span>
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#5B825B]">Level {latestMetric.difficultyLevel}</span>
            <span className="text-[11px] text-[#5A6E5D]">of 5</span>
          </div>
          <p className="text-[10px] text-[#5A6E5D] font-medium">Automatic adjustments</p>
        </div>

        {/* Fatigue Risk & Shift */}
        <div className="bg-white p-3.5 rounded-2xl border border-[#E0DCD3] shadow-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-[#5A6E5D] uppercase">Fatigue Flag</span>
            <ShieldCheck className="w-3.5 h-3.5 text-[#5B825B]" />
          </div>
          <div className="flex items-baseline gap-1.5">
            <span className="text-2xl font-black text-[#5B825B]">{latestMetric.fatigueRisk}</span>
            <span className="text-[11px] text-[#5A6E5D]">Risk</span>
          </div>
          <p className="text-[10px] text-[#5B825B] font-bold">No hesitation burnout</p>
        </div>
      </div>

      {/* Main Chart Card */}
      <div className="bg-white rounded-3xl p-4 sm:p-5 border border-[#E0DCD3] shadow-xs space-y-4">
        {/* Chart View Switcher */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#F0EDE6]">
          <div>
            <h3 className="font-extrabold text-base text-[#2D3A2F]">
              Cognitive Engagement Trend Line
            </h3>
            <p className="text-xs text-[#5A6E5D]">
              Composite engagement score derived from accuracy, hesitation-free speed, and adaptive difficulty.
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
              Engagement (%)
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
              Speed & Latency
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
              Mistakes & Hints
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
                <Tooltip content={<CustomEngagementTooltip />} />
                <ReferenceLine 
                  y={75} 
                  stroke="#C98A2C" 
                  strokeDasharray="4 4" 
                  label={{ value: 'Target Engagement (75%)', position: 'insideTopRight', fill: '#C98A2C', fontSize: 10 }} 
                />
                <Area 
                  type="monotone" 
                  dataKey="engagement" 
                  name="Engagement Score" 
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
                <Tooltip content={<CustomLatencyTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={30} 
                  wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} 
                />
                <Line 
                  yAxisId="left"
                  type="monotone" 
                  dataKey="latencySec" 
                  name="Response Latency (sec)" 
                  stroke="#7A9CA4" 
                  strokeWidth={2.5} 
                  dot={{ r: 4, fill: '#7A9CA4' }}
                />
                <Line 
                  yAxisId="right"
                  type="stepAfter" 
                  dataKey="difficultyLevel" 
                  name="Difficulty Level" 
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
                <Tooltip content={<CustomMistakesTooltip />} />
                <Legend 
                  verticalAlign="top" 
                  height={30} 
                  wrapperStyle={{ fontSize: '11px', fontWeight: 600 }} 
                />
                <Bar 
                  dataKey="mistakes" 
                  name="Mistakes" 
                  fill="#C46A66" 
                  radius={[4, 4, 0, 0]} 
                />
                <Bar 
                  dataKey="hintsUsed" 
                  name="Hints Requested" 
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
              <strong>High Engagement (75%+)</strong>
            </span>
            <span className="flex items-center gap-1.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#E8B25C]" />
              <strong>Adaptive Stabilized</strong>
            </span>
          </div>
          <span className="font-semibold text-[11px]">
            {chartData.length} Game Rounds Processed by DDA Engine
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
              Recent Adaptive Action Rationale
            </h3>
          </div>
          <span className="text-xs text-[#5A6E5D] font-semibold">Gemini 3.8 Flash Rationale</span>
        </div>

        <div className="space-y-2.5">
          {chartData.slice(-4).reverse().map((item, idx) => (
            <div 
              key={idx} 
              className="p-3 rounded-2xl bg-[#FDFBF7] border border-[#E0DCD3] flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 text-xs"
            >
              <div className="space-y-1 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#2D3A2F]">
                    {item.sessionName} • Level {item.difficultyLevel}
                  </span>
                  <span className="text-[11px] text-[#5A6E5D]">({item.dateLabel})</span>
                  <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${
                    item.adaptiveAction === 'increased'
                      ? 'bg-[#EAF1E8] text-[#5B825B]'
                      : item.adaptiveAction === 'eased'
                      ? 'bg-[#F0D8D6] text-[#C46A66]'
                      : 'bg-gray-100 text-gray-700'
                  }`}>
                    Action: {item.adaptiveAction}
                  </span>
                </div>
                <p className="text-[#5A6E5D] leading-relaxed italic">
                  "{item.aiReasoning}"
                </p>
              </div>

              <div className="flex items-center gap-3 shrink-0 text-[11px] font-bold text-[#5A6E5D] pt-1 sm:pt-0 border-t sm:border-t-0 border-[#EAE6DF]">
                <span>Speed: {item.latencySec}s</span>
                <span>Errors: {item.mistakes}</span>
                <span className="text-[#5B825B] font-extrabold">Score: {item.engagement}%</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

// Custom Tooltip for Engagement Chart
const CustomEngagementTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md p-3.5 rounded-2xl border border-[#E0DCD3] shadow-lg text-xs space-y-1.5 max-w-xs">
        <div className="flex items-center justify-between font-black text-[#2D3A2F] border-b border-[#F0EDE6] pb-1">
          <span>{data.sessionName}</span>
          <span className="text-[#5B825B]">{data.dateLabel}</span>
        </div>
        <div className="flex items-center justify-between font-bold">
          <span className="text-[#5A6E5D]">Cognitive Engagement:</span>
          <span className="text-[#5B825B] text-sm font-black">{data.engagement}%</span>
        </div>
        <div className="grid grid-cols-2 gap-x-3 gap-y-1 text-[11px] text-[#5A6E5D]">
          <div>Difficulty: <strong className="text-[#2D3A2F]">Lvl {data.difficultyLevel}</strong></div>
          <div>Latency: <strong className="text-[#2D3A2F]">{data.latencySec}s</strong></div>
          <div>Mistakes: <strong className="text-[#2D3A2F]">{data.mistakes}</strong></div>
          <div>Hints: <strong className="text-[#2D3A2F]">{data.hintsUsed}</strong></div>
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
const CustomLatencyTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#E0DCD3] shadow-lg text-xs space-y-1">
        <div className="font-black text-[#2D3A2F]">{data.sessionName} ({data.dateLabel})</div>
        <div className="text-[#7A9CA4] font-extrabold">Response Speed: {data.latencySec} seconds</div>
        <div className="text-[#C98A2C] font-extrabold">Difficulty: Level {data.difficultyLevel}</div>
        <div className="text-[11px] text-[#5A6E5D]">Adaptive Decision: {data.adaptiveAction}</div>
      </div>
    );
  }
  return null;
};

// Custom Tooltip for Mistakes & Hints
const CustomMistakesTooltip = ({ active, payload }: any) => {
  if (active && payload && payload.length) {
    const data = payload[0].payload;
    return (
      <div className="bg-white/95 backdrop-blur-md p-3 rounded-2xl border border-[#E0DCD3] shadow-lg text-xs space-y-1">
        <div className="font-black text-[#2D3A2F]">{data.sessionName} ({data.dateLabel})</div>
        <div className="text-[#C46A66] font-extrabold">Mistakes: {data.mistakes}</div>
        <div className="text-[#E8B25C] font-extrabold">Hints Used: {data.hintsUsed}</div>
      </div>
    );
  }
  return null;
};
