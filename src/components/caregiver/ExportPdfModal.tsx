import React, { useState, useMemo } from 'react';
import { 
  FileText, Download, Check, X, ShieldAlert, Sparkles, Brain, Stethoscope, 
  Calendar, CheckSquare, Square, AlertCircle, Printer, Puzzle, Lock, KeyRound, ShieldCheck
} from 'lucide-react';
import { PatientProfile, MedicalProfile, DDAMetric, Reminder } from '../../types';
import { generateMedicalProgressPdf, generateDoctorVisitSummaryPdf } from '../../utils/pdfReportGenerator';
import { soundController } from '../../utils/audio';
import { GameFilterType, getGameBreakdown } from '../../utils/gameAnalytics';
import { encryptData } from '../../utils/crypto';
import { logAuditEvent, DEFAULT_PATIENT_ID } from '../../services/firebase';
import { useLanguage } from '../../context/LanguageContext';

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
  const { tx } = useLanguage();
  const [includeDemographics, setIncludeDemographics] = useState(true);
  const [includeCognitiveTrends, setIncludeCognitiveTrends] = useState(true);
  const [includeMedicalConsultations, setIncludeMedicalConsultations] = useState(true);
  const [includeReminders, setIncludeReminders] = useState(true);
  const [gameFilter, setGameFilter] = useState<GameFilterType>('all');
  const [caregiverNotes, setCaregiverNotes] = useState('');
  const [enableAesEncryption, setEnableAesEncryption] = useState(false);
  const [encryptionPin, setEncryptionPin] = useState(patientProfile.caregiver?.pin || '2468');
  const [isGenerating, setIsGenerating] = useState(false);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const effectiveLogs = useMemo(() => {
    return ddaLogs || [];
  }, [ddaLogs]);

  const breakdown = useMemo(() => {
    return getGameBreakdown(effectiveLogs);
  }, [effectiveLogs]);

  if (!isOpen) return null;

  const handleGeneratePdf = async () => {
    setIsGenerating(true);
    soundController.playClick();

    try {
      // 1. Generate Standard Clinical PDF
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

      // 2. Optional: Generate AES-256-GCM Encrypted Clinical Dossier Archive
      if (enableAesEncryption) {
        const dossierPayload = {
          exportType: 'CLINICAL_DOSSIER_ARCHIVE',
          dpdpCompliance: 'Digital Personal Data Protection Act 2023',
          patientProfile: includeDemographics ? patientProfile : { name: patientProfile.name },
          medicalProfile: includeMedicalConsultations ? medicalProfile : null,
          cognitiveLogs: includeCognitiveTrends ? (ddaLogs || []) : [],
          routineReminders: includeReminders ? reminders : [],
          caregiverObservation: caregiverNotes || undefined,
          exportedAt: new Date().toISOString(),
        };

        const encryptedString = await encryptData(
          JSON.stringify(dossierPayload, null, 2),
          encryptionPin || '2468'
        );

        const blob = new Blob([encryptedString], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `${patientProfile.name.toLowerCase().replace(/\s+/g, '_')}_encrypted_clinical_dossier.mxe`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      }

      // 3. Log Immutable Compliance Audit Event to Firestore
      await logAuditEvent(DEFAULT_PATIENT_ID, {
        action: 'exported_pdf',
        actorRole: 'family',
        actorName: patientProfile.caregiver?.name || 'Family Caregiver',
        details: `Exported clinical dossier for ${patientProfile.name}. AES-256 encrypted container: ${enableAesEncryption ? 'YES' : 'NO'}.`,
      });

      soundController.playSuccess();
      setIsGenerating(false);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1800);
    } catch (err) {
      console.error('Failed to generate PDF or encrypted export:', err);
      setIsGenerating(false);
    }
  };

  const handleGenerateDoctorSummary = async () => {
    setIsGenerating(true);
    soundController.playClick();
    try {
      generateDoctorVisitSummaryPdf(patientProfile, medicalProfile, ddaLogs, reminders, {
        caregiverNotes,
      });

      await logAuditEvent(DEFAULT_PATIENT_ID, {
        action: 'exported_pdf',
        actorRole: 'family',
        actorName: patientProfile.caregiver?.name || 'Family Caregiver',
        details: `Exported 1-Page Clinical Summary for doctor visit for ${patientProfile.name}.`,
      });

      soundController.playSuccess();
      setIsGenerating(false);
      setDownloadSuccess(true);
      setTimeout(() => {
        setDownloadSuccess(false);
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Failed to generate 1-page doctor visit summary:', err);
      setIsGenerating(false);
    }
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
              <h3 className="text-base font-black text-[#2D3A2F]">
                {tx('Generate Clinical PDF Summary', 'क्लीनिकल पीडीएफ (PDF) सारांश बनाएं')}
              </h3>
              <p className="text-xs text-[#5A6E5D]">
                {tx('Download printable report for doctors, ASHA workers, & family', 'डॉक्टरों, आशा कार्यकर्ताओं और परिवार के लिए मुद्रण योग्य रिपोर्ट')}
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              soundController.playClick();
              onClose();
            }}
            className="w-8 h-8 rounded-full bg-[#F5F2EB] text-[#5A6E5D] hover:text-[#2D3A2F] flex items-center justify-center transition-colors"
            title={tx('Close', 'बंद करें')}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs text-[#2D3A2F]">
          {/* Patient Overview Badge */}
          <div className="p-3.5 rounded-2xl bg-[#EAF1E8]/70 border border-[#5B825B]/30 flex items-center justify-between">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-[#5B825B]">
                {tx('Patient File', 'मरीज़ फ़ाइल')}
              </span>
              <h4 className="font-extrabold text-sm text-[#2D3A2F]">{patientProfile.fullName}</h4>
              <p className="text-[11px] text-[#5A6E5D]">
                {tx(`Age ${patientProfile.age} • ${patientProfile.majorCareIssue || 'Cognitive Support'} • Blood: ${patientProfile.bloodGroup || 'O+'}`, `आयु ${patientProfile.age} वर्ष • ${patientProfile.majorCareIssue || 'संज्ञानात्मक सहायता'} • ब्लड: ${patientProfile.bloodGroup || 'O+'}`)}
              </p>
            </div>
            <div className="text-right">
              <span className="px-2.5 py-1 rounded-xl bg-white border border-[#5B825B]/20 text-[#5B825B] text-[10px] font-black">
                {ddaLogs.length > 0 
                  ? tx(`${ddaLogs.length} DDA Sessions`, `${ddaLogs.length} डीडीए सत्र`) 
                  : tx('Baseline Telemetry', 'आरंभिक टेलीमेट्री')}
              </span>
            </div>
          </div>

          {/* Quick 1-Page Doctor Summary Export Option */}
          <div className="p-4 rounded-3xl bg-linear-to-r from-[#EAF1E8] to-[#D5E6D7] border-2 border-[#5B825B] space-y-2.5 shadow-xs">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-2xl bg-[#3D663D] text-white flex items-center justify-center shrink-0 shadow-2xs">
                  <Stethoscope className="w-5 h-5 text-emerald-200" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="font-black text-xs text-[#1E331E] uppercase tracking-wide">
                      {tx('1-Page Doctor Summary (Geriatrician Visit)', '1-पेज डॉक्टर सारांश (जेरियाट्रिशियन भेंट)')}
                    </h4>
                    <span className="px-2 py-0.5 rounded-full bg-[#3D663D] text-white text-[9px] font-black uppercase">
                      Fast PDF
                    </span>
                  </div>
                  <p className="text-[11px] text-[#3D523E] mt-0.5 leading-snug">
                    {tx(
                      'Optimized for geriatrician/neurologist consultations: 30-day latency, morning vs evening sundowning divergence, medication adherence, & doctor annotation handwriting box.',
                      'जेरियाट्रिशियन व न्यूरोलॉजिस्ट हेतु अनुकूलित: 30-दिवसीय विलंब, सुबह बनाम शाम का अंतर, दवा अनुपालन और डॉक्टर के लिए हस्तलिखित नोट बॉक्स।'
                    )}
                  </p>
                </div>
              </div>
            </div>

            <button
              type="button"
              disabled={isGenerating}
              onClick={handleGenerateDoctorSummary}
              className="w-full py-2.5 px-3 rounded-xl bg-[#3D663D] hover:bg-[#2B4B2B] text-white font-black text-xs flex items-center justify-center gap-2 shadow-xs transition-all active:scale-[0.99]"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{tx('Export 1-Page Doctor Summary (PDF)', '1-पेज डॉक्टर सारांश डाउनलोड करें (PDF)')}</span>
            </button>
          </div>

          {/* Game Analytics Scope Selection */}
          <div className="space-y-2 bg-[#F9F7F2] p-3.5 rounded-2xl border border-[#E0DCD3]">
            <div className="flex items-center justify-between">
              <label className="font-black text-xs uppercase tracking-wider text-[#2D3A2F] block">
                {tx('Game Analytics Scope', 'गेम एनालिटिक्स दायरा')}
              </label>
              <span className="text-[10px] font-bold text-[#5A6E5D]">
                {gameFilter === 'all' 
                  ? tx('Combined Assessment', 'संयुक्त मूल्यांकन') 
                  : gameFilter === 'puzzle' 
                  ? tx('Photo Puzzle Only', 'केवल फोटो पहेली') 
                  : tx('Memory Match Only', 'केवल मेमोरी मैच')}
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
                <span className="font-black text-xs">{tx('All Games', 'सभी खेल')}</span>
                <span className="text-[10px] opacity-80 mt-0.5">{tx('Dual Comparison', 'तुलनात्मक रिपोर्ट')}</span>
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
                  <span className="font-black text-xs">{tx('Memory Match', 'मेमोरी मैच')}</span>
                </div>
                <span className="text-[10px] opacity-80 mt-0.5">{breakdown.memoryMatch.sessions} {tx('sessions', 'सत्र')}</span>
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
                  <span className="font-black text-xs">{tx('Photo Puzzle', 'फोटो पहेली')}</span>
                </div>
                <span className="text-[10px] opacity-80 mt-0.5">{breakdown.puzzle.sessions} {tx('sessions', 'सत्र')}</span>
              </button>
            </div>
          </div>

          {/* Section Selection */}
          <div className="space-y-2">
            <label className="font-black text-xs uppercase tracking-wider text-[#5A6E5D] block">
              {tx('Include In Report', 'रिपोर्ट में शामिल करें')}
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
                  <p className="font-extrabold text-xs">{tx('Patient Profile & Clinical Baseline', 'मरीज़ प्रोफ़ाइल व क्लीनिकल विवरण')}</p>
                  <p className="text-[10px] text-[#5A6E5D]">{tx('Demographics, emergency contacts, attending caregiver', 'जनसांख्यिकी, आपातकालीन संपर्क, देखभालकर्ता')}</p>
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
                  <p className="font-extrabold text-xs">{tx('Cognitive Engagement Trends & DDA Telemetry', 'संज्ञानात्मक रुझान व डीडीए टेलीमेट्री')}</p>
                  <p className="text-[10px] text-[#5A6E5D]">
                    {tx('Engagement scores, latency trajectory, mistake rates, AI adaptive rationales', 'स्कोर, प्रतिक्रिया समय, गलती दर व एआई अनुकूली तर्क')}
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
                  <p className="font-extrabold text-xs">{tx('Medical Concerns & Doctor Consultations', 'चिकित्सा चिंताएं व डॉक्टर परामर्श')}</p>
                  <p className="text-[10px] text-[#5A6E5D]">
                    {tx(
                      `Primary conditions, clinical care guidance, visit logs (${medicalProfile.consultations?.length || 0} recorded)`,
                      `प्रमुख स्थितियां, देखभाल मार्गदर्शन, परामर्श लॉग (${medicalProfile.consultations?.length || 0} दर्ज)`
                    )}
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
                  <p className="font-extrabold text-xs">{tx('Daily Routine & Medication Adherence', 'दैनिक दिनचर्या व दवाइयों की सूची')}</p>
                  <p className="text-[10px] text-[#5A6E5D]">
                    {tx(`Scheduled tasks, medication compliance (${reminders.length} items)`, `निर्धारित कार्य व दवाइयां (${reminders.length} कार्य)`)}
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
              {tx('Caregiver Observation / Physician Note (Optional)', 'देखभालकर्ता अवलोकन / डॉक्टर नोट (वैकल्पिक)')}
            </label>
            <textarea
              value={caregiverNotes}
              onChange={(e) => setCaregiverNotes(e.target.value)}
              placeholder={tx(
                'e.g., Patient showed elevated recall when solving nostalgic puzzles. Sleeping well, morning appetite normal...',
                'उदा. पुरानी यादों की पहेलियों को हल करते समय अच्छी प्रतिक्रिया। नींद अच्छी, सुबह की भूख सामान्य...'
              )}
              className="w-full p-3 rounded-2xl bg-white border border-[#E0DCD3] text-xs focus:outline-hidden focus:border-[#5B825B] resize-none h-20 placeholder:text-gray-400"
            />
          </div>

          {/* DPDP Act 2023: AES-256-GCM Encrypted Container Option */}
          <div className="p-3.5 rounded-2xl bg-[#F4F8F4] border border-[#5B825B]/30 space-y-3">
            <button
              type="button"
              onClick={() => setEnableAesEncryption(!enableAesEncryption)}
              className="w-full flex items-center justify-between text-left"
            >
              <div className="flex items-center gap-2.5">
                <div className="w-7 h-7 rounded-xl bg-[#5B825B]/15 text-[#3D663D] flex items-center justify-center">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <p className="font-black text-xs text-[#2D3A2F]">{tx('Encrypt Export (AES-256-GCM)', 'निर्यात एन्क्रिप्ट करें (AES-256-GCM)')}</p>
                  <p className="text-[10px] text-[#5A6E5D]">
                    {tx('DPDP Act 2023 compliant encrypted payload (.mxe) alongside PDF', 'डीपीडीपी अधिनियम 2023 के अनुरूप सुरक्षित एन्क्रिप्टेड फ़ाइल (.mxe)')}
                  </p>
                </div>
              </div>
              {enableAesEncryption ? (
                <CheckSquare className="w-4 h-4 text-[#5B825B]" />
              ) : (
                <Square className="w-4 h-4 text-[#8C9B8E]" />
              )}
            </button>

            {enableAesEncryption && (
              <div className="pt-2 border-t border-[#DDE7DC] flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-[#5B825B] shrink-0" />
                <label className="text-[11px] font-bold text-[#2D3A2F] shrink-0">{tx('Passphrase / PIN:', 'पासफ़्रेज़ / पिन:')}</label>
                <input
                  type="password"
                  value={encryptionPin}
                  onChange={(e) => setEncryptionPin(e.target.value)}
                  placeholder="PIN"
                  className="flex-1 px-2.5 py-1.5 text-xs font-bold rounded-lg border border-[#C6D8C5] bg-white focus:outline-hidden focus:border-[#5B825B]"
                />
              </div>
            )}
          </div>

          {/* Clinical Format Notice */}
          <div className="p-3 rounded-xl bg-[#FDF0D5]/70 border border-[#EADBBD] flex items-start gap-2 text-[11px] text-[#5E4416]">
            <AlertCircle className="w-4 h-4 text-[#C98A2C] shrink-0 mt-0.5" />
            <span>
              {tx(
                'Formatted for medical consultations, clinical reviews, or ASHA home visits. Contains standardized cognitive progression metrics and disclaimer.',
                'चिकित्सा परामर्श, क्लिनिकल समीक्षा या आशा गृह भेंट के लिए प्रारूपित। मानकीकृत संज्ञानात्मक मीट्रिक्स शामिल हैं।'
              )}
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
            {tx('Cancel', 'रद्द करें')}
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
                <span>{tx('PDF Downloaded Successfully!', 'पीडीएफ सफलतापूर्वक डाउनलोड हो गई!')}</span>
              </>
            ) : isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{tx('Compiling Clinical PDF...', 'क्लीनिकल पीडीएफ तैयार की जा रही है...')}</span>
              </>
            ) : (
              <>
                <Download className="w-4 h-4" />
                <span>{tx('Download Clinical PDF Summary', 'क्लीनिकल पीडीएफ सारांश डाउनलोड करें')}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
