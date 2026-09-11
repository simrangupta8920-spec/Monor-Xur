import React, { useState, useMemo } from 'react';
import { 
  FileText, Download, Check, X, ShieldAlert, Sparkles, Brain, Stethoscope, 
  Calendar, CheckSquare, Square, AlertCircle, Printer, Puzzle
} from 'lucide-react';
import { PatientProfile, MedicalProfile, DDAMetric, Reminder } from '../../types';
import { generateMedicalProgressPdf } from '../../utils/pdfReportGenerator';
import { soundController } from '../../utils/audio';
import { GameFilterType, getGameBreakdown, BASELINE_GAME_SESSIONS } from '../../utils/gameAnalytics';

interface ExportPdfModalProps {
  isOpen: boolean;
  onClose: () => void;
  patientProfile: PatientProfile;
  medicalProfile: MedicalProfile;
  ddaLogs: DDAMetric[];
  reminders: Reminder[];
}

export const ExportPdfModal: React.FC<ExportPdfModalProps> = ({
  isOpen,
  onClose,
  patientProfile,
  medicalProfile,
  ddaLogs,
  reminders,
}) => {
  const [includeDemographics, setIncludeDemographics] = useState(true);
  const [includeCognitiveTrends, setIncludeCognitiveTrends] = useState(true);
  const [includeMedicalConsultations, setIncludeMedicalConsultations] = useState(true);
  const [includeReminders, setIncludeReminders] = useState(true);
  const [gameFilter, setGameFilter] = useState<GameFilterType>('all');
  const [caregiverNotes, setCaregiverNotes] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const effectiveLogs = useMemo(() => {
    return ddaLogs && ddaLogs.length > 0 ? ddaLogs : BASELINE_GAME_SESSIONS;
  }, [ddaLogs]);

  const breakdown = useMemo(() => {
    return getGameBreakdown(effectiveLogs);
  }, [effectiveLogs]);

  if (!isOpen) return null;

  const handleGeneratePdf = () => {
    setIsGenerating(true);
    soundController.playClick();

    setTimeout(() => {
      try {
        generateMedicalProgressPdf(
          patientProfile,
          medicalProfile,
          ddaLogs,
          reminders,
          {
            includeDemographics,
            includeCognitiveTrends,
            includeMedicalConsultations,
            includeReminders,
            caregiverNotes,
            gameFilter,
          }
        );
        soundController.playSuccess();
        setIsGenerating(false);
        setDownloadSuccess(true);
        setTimeout(() => {
          setDownloadSuccess(false);
          onClose();
        }, 1800);
      } catch (err) {
        console.error('Failed to generate PDF:', err);
        setIsGenerating(false);
      }
    }, 400);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
      <div className="bg-[#FDFBF7] w-full max-w-lg rounded-3xl border border-[#E0DCD3] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="p-5 bg-white border-b border-[#E0DCD3] flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#5B825B] text-white flex items-center justify-center shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black text-[#2D3A2F]">Generate Clinical PDF Summary</h3>
              <p className="text-xs text-[#5A6E5D]">Download printable report for doctors, ASHA workers, & family</p>
            </div>
          </div>
          <button
            onClick={() => {
              soundController.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[#F5F2EB] text-[#5A6E5D] hover:text-[#2D3A2F] flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#2D3A2F]">
          {/* Patient Overview Badge */}
          <div className="p-3.5 rounded-2xl bg-[#EAF1E8]/70 border border-[#5B825B]/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#5B825B]">Patient File</span>
              <h4 className="font-extrabold text-sm text-[#2D3A2F]">{patientProfile.fullName}</h4>
              <p className="text-[11px] text-[#5A6E5D]">
                Age {patientProfile.age} • {patientProfile.majorCareIssue || 'Cognitive Support'} • Blood: {patientProfile.bloodGroup || 'O+'}
              </p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-xl bg-white border border-[#5B825B]/20 text-[#5B825B] text-[10px] font-black">
                {ddaLogs.length > 0 ? `${ddaLogs.length} DDA Sessions` : 'Baseline Telemetry'}
              </span>
            </div>
          </div>

          {/* Game Analytics Scope Selection */}
          <div className="space-y-2 bg-[#F9F7F2] p-3.5 rounded-2xl border border-[#E0DCD3]">
            <div className="flex items-center justify-between">
              <label className="font-black text-xs uppercase tracking-wider text-[#2D3A2F] block">
                Game Analytics Scope
              </label>
              <span className="text-[10px] font-bold text-[#5A6E5D]">
                {gameFilter === 'all' ? 'Combined Assessment' : gameFilter === 'puzzle' ? 'Photo Puzzle Only' : 'Memory Match Only'}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  soundController.playClick();
                  setGameFilter('all');
                }}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                  gameFilter === 'all'
                    ? 'bg-[#2D3A2F] text-white border-[#2D3A2F] shadow-2xs'
                    : 'bg-white text-[#5A6E5D] border-[#E0DCD3] hover:bg-[#EAF1E8]'
                }`}
              >
                <span className="font-black text-xs">All Games</span>
                <span className="text-[10px] opacity-80 mt-0.5">Dual Comparison</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundController.playClick();
                  setGameFilter('memory_match');
                }}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                  gameFilter === 'memory_match'
                    ? 'bg-[#5B825B] text-white border-[#5B825B] shadow-2xs'
                    : 'bg-white text-[#5A6E5D] border-[#E0DCD3] hover:bg-[#EAF1E8]'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <Brain className="w-3 h-3" />
                  <span className="font-black text-xs">Memory Match</span>
                </div>
                <span className="text-[10px] opacity-80 mt-0.5">{breakdown.memoryMatch.sessions} sessions</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  soundController.playClick();
                  setGameFilter('puzzle');
                }}
                className={`p-2.5 rounded-xl border text-center transition-all flex flex-col items-center justify-center ${
                  gameFilter === 'puzzle'
                    ? 'bg-[#E8B25C] text-[#332610] border-[#E8B25C] shadow-2xs'
                    : 'bg-white text-[#5A6E5D] border-[#E0DCD3] hover:bg-[#FDF0D5]'
                }`}
              >
                <div className="flex items-center justify-center gap-1">
                  <Puzzle className="w-3 h-3" />
                  <span className="font-black text-xs">Photo Puzzle</span>
                </div>
                <span className="text-[10px] opacity-80 mt-0.5">{breakdown.puzzle.sessions} sessions</span>
              </button>
            </div>
          </div>

          {/* Section Selection */}
          <div className="space-y-2">
            <label className="font-black text-xs uppercase tracking-wider text-[#5A6E5D] block">
              Include In Report
            </label>

            {/* Option 1: Demographics */}
            <button
              type="button"
              onClick={() => setIncludeDemographics(!includeDemographics)}
              className="w-full p-3 rounded-2xl bg-white border border-[#E0DCD3] flex items-center justify-between hover:bg-[#F9F7F2] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#F0EBE1] text-[#2D3A2F] flex items-center justify-center">
                  <Printer className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className="font-extrabold text-xs">Patient Profile & Clinical Baseline</p>
                  <p className="text-[10px] text-[#5A6E5D]">Demographics, emergency contacts, attending caregiver</p>
                </div>
              </div>
              {includeDemographics ? (
                <CheckSquare className="w-4 h-4 text-[#5B825B]" />
              ) : (
                <Square className="w-4 h-4 text-[#8C9B8E]" />
              )}
            </button>

            {/* Option 2: Cognitive Trends & DDA */}
            <button
              type="button"
              onClick={() => setIncludeCognitiveTrends(!includeCognitiveTrends)}
              className="w-full p-3 rounded-2xl bg-white border border-[#E0DCD3] flex items-center justify-between hover:bg-[#F9F7F2] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#EAF1E8] text-[#5B825B] flex items-center justify-center">
                  <Brain className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className="font-extrabold text-xs">Cognitive Engagement Trends & DDA Telemetry</p>
                  <p className="text-[10px] text-[#5A6E5D]">
                    Engagement scores, latency trajectory, mistake rates, AI adaptive rationales
                  </p>
                </div>
              </div>
              {includeCognitiveTrends ? (
                <CheckSquare className="w-4 h-4 text-[#5B825B]" />
              ) : (
                <Square className="w-4 h-4 text-[#8C9B8E]" />
              )}
            </button>

            {/* Option 3: Medical Consultations */}
            <button
              type="button"
              onClick={() => setIncludeMedicalConsultations(!includeMedicalConsultations)}
              className="w-full p-3 rounded-2xl bg-white border border-[#E0DCD3] flex items-center justify-between hover:bg-[#F9F7F2] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#F0D8D6] text-[#A84844] flex items-center justify-center">
                  <Stethoscope className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className="font-extrabold text-xs">Medical Concerns & Doctor Consultations</p>
                  <p className="text-[10px] text-[#5A6E5D]">
                    Primary conditions, clinical care guidance, visit logs ({medicalProfile.consultations?.length || 0} recorded)
                  </p>
                </div>
              </div>
              {includeMedicalConsultations ? (
                <CheckSquare className="w-4 h-4 text-[#5B825B]" />
              ) : (
                <Square className="w-4 h-4 text-[#8C9B8E]" />
              )}
            </button>

            {/* Option 4: Reminders & Daily Routine */}
            <button
              type="button"
              onClick={() => setIncludeReminders(!includeReminders)}
              className="w-full p-3 rounded-2xl bg-white border border-[#E0DCD3] flex items-center justify-between hover:bg-[#F9F7F2] transition-colors"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#FDF0D5] text-[#C98A2C] flex items-center justify-center">
                  <Calendar className="w-3.5 h-3.5" />
                </div>
                <div className="text-left">
                  <p className="font-extrabold text-xs">Daily Routine & Medication Adherence</p>
                  <p className="text-[10px] text-[#5A6E5D]">
                    Scheduled tasks, medication compliance ({reminders.length} items)
                  </p>
                </div>
              </div>
              {includeReminders ? (
                <CheckSquare className="w-4 h-4 text-[#5B825B]" />
              ) : (
                <Square className="w-4 h-4 text-[#8C9B8E]" />
              )}
            </button>
          </div>

          {/* Caregiver Observation Notes */}
          <div className="space-y-1.5">
            <label className="font-black text-xs uppercase tracking-wider text-[#5A6E5D] block">
              Caregiver Observation / Physician Note (Optional)
            </label>
            <textarea
              value={caregiverNotes}
              onChange={(e) => setCaregiverNotes(e.target.value)}
              placeholder="e.g., Patient showed elevated recall when solving nostalgic puzzles. Sleeping well, morning appetite normal..."
              className="w-full p-3 rounded-2xl bg-white border border-[#E0DCD3] text-xs focus:outline-hidden focus:border-[#5B825B] resize-none h-20 placeholder:text-gray-400"
            />
          </div>

          {/* Clinical Format Notice */}
          <div className="p-3 rounded-xl bg-[#FDF0D5]/70 border border-[#EADBBD] flex items-start gap-2 text-[11px] text-[#5E4416]">
            <AlertCircle className="w-4 h-4 text-[#C98A2C] shrink-0 mt-0.5" />
            <span>
              Formatted for medical consultations, clinical reviews, or ASHA home visits. Contains standardized cognitive progression metrics and disclaimer.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-white border-t border-[#E0DCD3] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => {
              soundController.playClick();
              onClose();
            }}
            className="px-4 py-2.5 rounded-xl border border-[#E0DCD3] text-xs font-bold text-[#5A6E5D] hover:bg-[#F5F2EB]"
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={isGenerating || downloadSuccess}
            onClick={handleGeneratePdf}
            className={`flex-1 py-3 px-4 rounded-2xl font-extrabold text-xs text-white flex items-center justify-center gap-2 shadow-xs transition-all ${
              downloadSuccess
                ? 'bg-[#4A6E4A]'
                : isGenerating
                ? 'bg-[#7A9A7A] cursor-wait'
                : 'bg-[#5B825B] hover:bg-[#4A6E4A]'
            }`}
          >
            {downloadSuccess ? (
              <>
                <Check className="w-4 h-4" />
                <span>PDF Downloaded Successfully!</span>
              </>
            ) : isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>Compiling Clinical PDF...</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>Download Clinical PDF Summary</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
