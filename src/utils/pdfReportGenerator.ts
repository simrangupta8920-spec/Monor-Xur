import { jsPDF } from 'jspdf';
import { PatientProfile, MedicalProfile, DDAMetric, Reminder } from '../types';
import { MEDICAL_DISCLAIMER } from '../data/mockData';
import { 
  computeGameStats, 
  getGameBreakdown, 
  filterLogsByGame, 
  BASELINE_GAME_SESSIONS, 
  GameFilterType 
} from './gameAnalytics';

export interface PdfExportOptions {
  includeDemographics?: boolean;
  includeCognitiveTrends?: boolean;
  includeMedicalConsultations?: boolean;
  includeReminders?: boolean;
  caregiverNotes?: string;
  gameFilter?: GameFilterType;
}

// Helper to compute cognitive engagement score (0 - 100)
function calculateEngagement(metric: DDAMetric): number {
  const baseLevel = metric.difficultyLevel || 1;
  const levelContribution = 55 + (baseLevel - 1) * 12;
  const mistakePenalty = Math.min((metric.mistakes || 0) * 4.5, 20);
  const hintPenalty = Math.min((metric.hintsUsed || 0) * 3.5, 12);
  const seconds = (metric.latencyMs || 3500) / 1000;
  let speedFactor = 0;
  if (seconds >= 1.8 && seconds <= 4.0) speedFactor = 6;
  else if (seconds > 7.0) speedFactor = -8;

  const rawScore = levelContribution - mistakePenalty - hintPenalty + speedFactor;
  return Math.max(35, Math.min(100, Math.round(rawScore)));
}

export function generateMedicalProgressPdf(
  patientProfile: PatientProfile,
  medicalProfile: MedicalProfile,
  ddaLogs: DDAMetric[],
  reminders: Reminder[] = [],
  options: PdfExportOptions = {}
): void {
  const {
    includeDemographics = true,
    includeCognitiveTrends = true,
    includeMedicalConsultations = true,
    includeReminders = true,
    caregiverNotes = '',
    gameFilter = 'all',
  } = options;

  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  const pageHeight = doc.internal.pageSize.getHeight();
  const margin = 16;
  const contentWidth = pageWidth - margin * 2;
  let y = margin;

  // Helper to check page boundaries and add page if needed
  const checkPageBreak = (neededHeight: number) => {
    if (y + neededHeight > pageHeight - 18) {
      doc.addPage();
      y = margin;
      drawHeaderWatermark();
    }
  };

  const drawHeaderWatermark = () => {
    doc.setFontSize(8);
    doc.setTextColor(140, 150, 140);
    doc.text('MONOR XUR • CLINICAL & CAREGIVER HEALTHCARE SUMMARY', margin, 10);
    doc.text(`Patient: ${patientProfile.fullName} • Confidential`, pageWidth - margin, 10, { align: 'right' });
    doc.setDrawColor(220, 225, 220);
    doc.line(margin, 12, pageWidth - margin, 12);
  };

  // --- TOP HEADER BANNER ---
  doc.setFillColor(91, 130, 91); // #5B825B Primary Sage Green
  doc.roundedRect(margin, y, contentWidth, 24, 3, 3, 'F');

  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(16);
  doc.text('MONOR XUR HEALTHCARE SUMMARY', margin + 6, y + 9);

  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Comprehensive Patient Medical Logs & Cognitive Engagement Trends', margin + 6, y + 16);

  const reportDate = new Date().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
  doc.setFontSize(8);
  doc.text(`Generated: ${reportDate}`, pageWidth - margin - 6, y + 9, { align: 'right' });
  doc.text('Confidential Medical Record', pageWidth - margin - 6, y + 16, { align: 'right' });

  y += 29;

  // --- SECTION 1: PATIENT DEMOGRAPHICS & PROFILE ---
  if (includeDemographics) {
    checkPageBreak(38);

    doc.setFillColor(248, 250, 247);
    doc.setDrawColor(218, 225, 216);
    doc.roundedRect(margin, y, contentWidth, 34, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(45, 58, 47);
    doc.text('1. Patient Profile & Clinical Baseline', margin + 4, y + 6);

    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(70, 85, 72);

    const col1 = margin + 4;
    const col2 = margin + contentWidth / 2;

    doc.text(`Full Name: `, col1, y + 13);
    doc.setFont('helvetica', 'bold');
    doc.text(patientProfile.fullName, col1 + 20, y + 13);

    doc.setFont('helvetica', 'normal');
    doc.text(`Age / Gender: `, col1, y + 19);
    doc.setFont('helvetica', 'bold');
    doc.text(`${patientProfile.age} yrs (${patientProfile.bloodGroup || 'O+'})`, col1 + 24, y + 19);

    doc.setFont('helvetica', 'normal');
    doc.text(`Care Focus: `, col1, y + 25);
    doc.setFont('helvetica', 'bold');
    doc.text(`${patientProfile.majorCareIssue || 'Mild Cognitive Support'}`, col1 + 20, y + 25);

    doc.setFont('helvetica', 'normal');
    doc.text(`Region / Location: `, col2, y + 13);
    doc.setFont('helvetica', 'bold');
    doc.text(patientProfile.region, col2 + 30, y + 13);

    doc.setFont('helvetica', 'normal');
    doc.text(`Primary Caregiver: `, col2, y + 19);
    doc.setFont('helvetica', 'bold');
    doc.text(`${patientProfile.caregiver?.name || 'Family'} (${patientProfile.caregiver?.relationship || 'Family'})`, col2 + 30, y + 19);

    doc.setFont('helvetica', 'normal');
    doc.text(`Emergency Contact: `, col2, y + 25);
    doc.setFont('helvetica', 'bold');
    doc.text(patientProfile.caregiver?.phone || '+91 98765 43210', col2 + 30, y + 25);

    y += 38;
  }

  // --- SECTION 2: COGNITIVE ENGAGEMENT & DDA TRENDS ---
  if (includeCognitiveTrends) {
    checkPageBreak(50);

    const effectiveLogs = ddaLogs && ddaLogs.length > 0 ? ddaLogs : BASELINE_GAME_SESSIONS;
    const filteredLogs = filterLogsByGame(effectiveLogs, gameFilter);
    const gameStats = computeGameStats(filteredLogs);
    const breakdown = getGameBreakdown(effectiveLogs);

    let sectionTitle = '2. Cognitive Engagement Trends & Multi-Game Telemetry (DDA)';
    let sectionSubtitle = 'Comparative performance analysis across Memory Match and Photo Puzzle exercises';

    if (gameFilter === 'memory_match') {
      sectionTitle = '2. Cognitive Engagement - Memory Match Clinical Assessment';
      sectionSubtitle = 'Working spatial memory, card recognition tempo, and adaptive difficulty';
    } else if (gameFilter === 'puzzle') {
      sectionTitle = '2. Cognitive Engagement - Photo Puzzle Clinical Assessment';
      sectionSubtitle = 'Visual-spatial assembly, nostalgic photo recognition, and adaptive difficulty';
    }

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(45, 58, 47);
    doc.text(sectionTitle, margin, y + 4);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(90, 110, 93);
    doc.text(sectionSubtitle, margin, y + 8);
    y += 11;

    // 4 Key KPI Boxes
    const boxWidth = (contentWidth - 6) / 4;
    const boxHeight = 16;

    const kpiBoxes = [
      { label: 'Avg Accuracy', value: `${gameStats.avgAccuracy}%`, sub: 'Target benchmark: 75%+' },
      { label: 'Decision Speed', value: `${gameStats.avgLatencySec}s`, sub: 'Mean response latency' },
      { label: 'DDA AI Tier', value: `Level ${gameStats.currentDifficultyLevel}`, sub: 'Dynamic AI scaling' },
      { 
        label: 'Sessions Evaluated', 
        value: `${gameStats.totalSessions}`, 
        sub: gameFilter === 'all' ? 'All games combined' : `${gameFilter === 'puzzle' ? 'Photo Puzzle' : 'Memory Match'} logs` 
      },
    ];

    kpiBoxes.forEach((box, i) => {
      const bx = margin + i * (boxWidth + 2);
      doc.setFillColor(245, 248, 244);
      doc.setDrawColor(215, 225, 215);
      doc.roundedRect(bx, y, boxWidth, boxHeight, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(90, 110, 93);
      doc.text(box.label, bx + 3, y + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(11);
      doc.setTextColor(91, 130, 91);
      doc.text(box.value, bx + 3, y + 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(6);
      doc.setTextColor(120, 135, 120);
      doc.text(box.sub, bx + 3, y + 14);
    });

    y += boxHeight + 4;

    // Side-by-side Dual Game Comparison Box when 'all' is selected
    if (gameFilter === 'all') {
      checkPageBreak(22);
      const halfWidth = (contentWidth - 3) / 2;
      const compareHeight = 18;

      // Memory Match Card
      doc.setFillColor(243, 248, 243);
      doc.setDrawColor(180, 210, 180);
      doc.roundedRect(margin, y, halfWidth, compareHeight, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(45, 58, 47);
      doc.text('GAME 1: MEMORY MATCH (Recall)', margin + 3, y + 5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(91, 130, 91);
      doc.text(`${breakdown.memoryMatch.accuracy}% Accuracy`, margin + halfWidth - 3, y + 5, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(70, 90, 72);
      doc.text(`Sessions: ${breakdown.memoryMatch.sessions} • Latency: ${breakdown.memoryMatch.avgLatencySec}s • Errors: ${breakdown.memoryMatch.avgMistakes}/rd`, margin + 3, y + 10.5);
      doc.text(`Adaptive Difficulty: Tier Level ${breakdown.memoryMatch.level} • DDA Shifts: ${breakdown.memoryMatch.adaptiveShifts}`, margin + 3, y + 15);

      // Photo Puzzle Card
      const puzzleX = margin + halfWidth + 3;
      doc.setFillColor(254, 250, 242);
      doc.setDrawColor(230, 205, 160);
      doc.roundedRect(puzzleX, y, halfWidth, compareHeight, 1.5, 1.5, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(45, 58, 47);
      doc.text('GAME 2: PHOTO PUZZLE (Visual)', puzzleX + 3, y + 5);

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(190, 125, 30);
      doc.text(`${breakdown.puzzle.accuracy}% Accuracy`, puzzleX + halfWidth - 3, y + 5, { align: 'right' });

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(90, 80, 60);
      doc.text(`Sessions: ${breakdown.puzzle.sessions} • Latency: ${breakdown.puzzle.avgLatencySec}s • Errors: ${breakdown.puzzle.avgMistakes}/rd`, puzzleX + 3, y + 10.5);
      doc.text(`Adaptive Difficulty: Tier Level ${breakdown.puzzle.level} • DDA Shifts: ${breakdown.puzzle.adaptiveShifts}`, puzzleX + 3, y + 15);

      y += compareHeight + 4;
    }

    // DDA Historical Table
    checkPageBreak(40);

    // Table Header
    doc.setFillColor(91, 130, 91);
    doc.rect(margin, y, contentWidth, 6.5, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);

    const c1 = margin + 2;
    const c2 = margin + 24;
    const c3 = margin + 50;
    const c4 = margin + 64;
    const c5 = margin + 78;
    const c6 = margin + 94;
    const c7 = margin + 116;
    const c8 = margin + 134;

    doc.text('Date / Time', c1, y + 4.5);
    doc.text('Game Type', c2, y + 4.5);
    doc.text('Round', c3, y + 4.5);
    doc.text('Level', c4, y + 4.5);
    doc.text('Speed', c5, y + 4.5);
    doc.text('Mistakes', c6, y + 4.5);
    doc.text('Accuracy', c7, y + 4.5);
    doc.text('Adaptive Action & AI Engine', c8, y + 4.5);

    y += 6.5;

    const displayLogs = filteredLogs.length > 0 ? filteredLogs.slice(-8) : [];

    if (displayLogs.length === 0) {
      doc.setFillColor(253, 251, 247);
      doc.rect(margin, y, contentWidth, 8, 'F');
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(90, 110, 93);
      doc.text('No sessions recorded for the selected game filter yet. Playing a round will append live metrics.', margin + 4, y + 5.5);
      y += 8;
    } else {
      displayLogs.forEach((log, index) => {
        checkPageBreak(7.5);
        const isEven = index % 2 === 0;
        doc.setFillColor(isEven ? 255 : 249, isEven ? 255 : 251, isEven ? 255 : 247);
        doc.rect(margin, y, contentWidth, 7, 'F');
        doc.setDrawColor(230, 235, 230);
        doc.line(margin, y + 7, margin + contentWidth, y + 7);

        const dateStr = new Date(log.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
        const timeStr = new Date(log.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
        const score = calculateEngagement(log);
        const gameLabel = log.gameTitle || (log.gameType === 'puzzle' ? 'Photo Puzzle' : 'Memory Match');

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(6.5);
        doc.setTextColor(60, 75, 63);

        doc.text(`${dateStr} ${timeStr}`, c1, y + 4.5);

        // Game badge text
        doc.setFont('helvetica', 'bold');
        if (log.gameType === 'puzzle') {
          doc.setTextColor(165, 110, 25);
        } else {
          doc.setTextColor(70, 115, 70);
        }
        doc.text(gameLabel.substring(0, 16), c2, y + 4.5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 75, 63);
        doc.text(`R${log.roundNumber || index + 1}`, c3, y + 4.5);
        doc.text(`Lvl ${log.difficultyLevel || 1}`, c4, y + 4.5);
        doc.text(`${((log.latencyMs || 3000) / 1000).toFixed(1)}s`, c5, y + 4.5);
        doc.text(`${log.mistakes || 0} err / ${log.hintsUsed || 0} h`, c6, y + 4.5);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(91, 130, 91);
        doc.text(`${score}%`, c7, y + 4.5);

        doc.setFont('helvetica', 'normal');
        doc.setTextColor(60, 75, 63);
        const actionText = `${log.adaptiveAction || 'maintained'} (${log.aiModel || 'Gemini 3.8'})`;
        doc.text(actionText.substring(0, 30), c8, y + 4.5);

        y += 7;
      });
    }

    y += 5;
  }

  // --- SECTION 3: MEDICAL CONCERNS & DOCTOR CONSULTATIONS ---
  if (includeMedicalConsultations) {
    checkPageBreak(50);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(45, 58, 47);
    doc.text('3. Medical Concerns & Clinical Consultations', margin, y + 4);
    y += 7;

    // Concerns & Physician Care Guidance Box
    doc.setFillColor(254, 252, 248);
    doc.setDrawColor(224, 220, 211);
    doc.roundedRect(margin, y, contentWidth, 22, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(91, 130, 91);
    doc.text('PRIMARY MEDICAL CONCERNS:', margin + 4, y + 5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 75, 63);
    const concernsText = medicalProfile.concerns?.length > 0
      ? medicalProfile.concerns.join(' • ')
      : 'Mild Cognitive Impairment (Early Amnestic Type), Hypertension, Age-related mild visual decline';
    doc.text(concernsText, margin + 4, y + 10);

    doc.setFont('helvetica', 'bold');
    doc.text('CARE GUIDANCE:', margin + 4, y + 16);
    doc.setFont('helvetica', 'normal');
    const guidancePreview = medicalProfile.careInfo
      ? medicalProfile.careInfo.substring(0, 110) + '...'
      : 'Maintain structured daily routines, encourage reminiscence puzzles, monitor blood pressure weekly.';
    doc.text(guidancePreview, margin + 28, y + 16);

    y += 26;

    // Doctor Consultations List
    checkPageBreak(30);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(45, 58, 47);
    doc.text('Doctor Consultations History', margin, y + 3);
    y += 5;

    if (medicalProfile.consultations && medicalProfile.consultations.length > 0) {
      medicalProfile.consultations.forEach((consult) => {
        checkPageBreak(22);

        doc.setFillColor(255, 255, 255);
        doc.setDrawColor(218, 225, 216);
        doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'FD');

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(45, 58, 47);
        doc.text(`${consult.doctor} (${consult.specialty})`, margin + 4, y + 5);

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(91, 130, 91);
        doc.text(`Consult Date: ${consult.date}`, pageWidth - margin - 4, y + 5, { align: 'right' });

        doc.setTextColor(70, 85, 72);
        doc.text(`Clinical Notes: ${consult.notes || 'Routine follow up conducted.'}`, margin + 4, y + 10);

        y += 18;
      });
    } else {
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(120, 130, 120);
      doc.text('No formal external consultations logged this month.', margin + 4, y + 4);
      y += 8;
    }
  }

  // --- SECTION 4: ROUTINE & MEDICATION ADHERENCE ---
  if (includeReminders && reminders.length > 0) {
    checkPageBreak(35);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(45, 58, 47);
    doc.text('4. Daily Routine & Medication Schedule', margin, y + 4);
    y += 7;

    const completedCount = reminders.filter((r) => r.completed).length;
    const adherenceRate = Math.round((completedCount / reminders.length) * 100);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(70, 85, 72);
    doc.text(`Active Scheduled Care Tasks: ${reminders.length}   |   Current Adherence: ${adherenceRate}% (${completedCount}/${reminders.length} completed)`, margin, y + 3);
    y += 6;

    reminders.slice(0, 5).forEach((rem) => {
      checkPageBreak(8);
      doc.setFillColor(rem.completed ? 245 : 255, rem.completed ? 250 : 255, rem.completed ? 244 : 255);
      doc.setDrawColor(225, 230, 223);
      doc.roundedRect(margin, y, contentWidth, 7, 1, 1, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(rem.completed ? 91 : 45, rem.completed ? 130 : 58, rem.completed ? 91 : 47);
      doc.text(`${rem.time_label}`, margin + 3, y + 4.5);

      doc.setFont('helvetica', 'normal');
      doc.text(`${rem.title} [${rem.type.toUpperCase()}]`, margin + 24, y + 4.5);

      doc.setFont('helvetica', 'bold');
      doc.setTextColor(rem.completed ? 91 : 201, rem.completed ? 130 : 138, rem.completed ? 91 : 44);
      doc.text(rem.completed ? 'Completed' : 'Pending', pageWidth - margin - 4, y + 4.5, { align: 'right' });

      y += 8.5;
    });
    y += 3;
  }

  // --- SECTION 5: CAREGIVER OBSERVATIONS (OPTIONAL) ---
  if (caregiverNotes.trim().length > 0) {
    checkPageBreak(25);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.setTextColor(45, 58, 47);
    doc.text('5. Caregiver Observations & Notes', margin, y + 4);
    y += 6;

    doc.setFillColor(254, 252, 248);
    doc.setDrawColor(224, 220, 211);
    doc.roundedRect(margin, y, contentWidth, 18, 1.5, 1.5, 'FD');

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(60, 75, 63);
    const splitNotes = doc.splitTextToSize(caregiverNotes, contentWidth - 8);
    doc.text(splitNotes, margin + 4, y + 5);

    y += 22;
  }

  // --- FOOTER & MEDICAL DISCLAIMER ---
  checkPageBreak(20);
  doc.setDrawColor(220, 225, 220);
  doc.line(margin, pageHeight - 16, pageWidth - margin, pageHeight - 16);

  doc.setFont('helvetica', 'italic');
  doc.setFontSize(6.5);
  doc.setTextColor(140, 150, 140);
  const disclaimerText = doc.splitTextToSize(`Disclaimer: ${MEDICAL_DISCLAIMER}`, contentWidth);
  doc.text(disclaimerText, margin, pageHeight - 12);

  // Add Page Numbers
  const totalPages = doc.getNumberOfPages();
  for (let p = 1; p <= totalPages; p++) {
    doc.setPage(p);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(140, 150, 140);
    doc.text(`Page ${p} of ${totalPages}`, pageWidth - margin, pageHeight - 5, { align: 'right' });
  }

  // Trigger download
  const sanitizedName = patientProfile.fullName.replace(/\s+/g, '_');
  const filename = `MonorXur_Medical_Progress_Summary_${sanitizedName}_${reportDate.replace(/\s+/g, '_')}.pdf`;
  doc.save(filename);
}
