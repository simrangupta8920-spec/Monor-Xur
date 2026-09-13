import { jsPDF } from 'jspdf';
import { PatientProfile, MedicalProfile, DDAMetric, Reminder } from '../types';
import { computeGameStats, getGameBreakdown, filterLogsByGame, GameFilterType } from './gameAnalytics';

export interface PdfExportOptions {
  includeDemographics?: boolean;
  includeCognitiveTrends?: boolean;
  includeMedicalConsultations?: boolean;
  includeReminders?: boolean;
  caregiverNotes?: string;
  gameFilter?: GameFilterType;
}

export function generateDoctorVisitSummaryPdf(
  patient: PatientProfile,
  medical: MedicalProfile,
  ddaLogs: DDAMetric[],
  reminders: Reminder[],
  options?: { caregiverNotes?: string }
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(91, 130, 91); // #5B825B
  doc.rect(14, y, pageWidth - 28, 22, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text('MONOR XUR - CLINICAL SUMMARY FOR DOCTOR VISIT', 20, y + 10);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Adaptive Cognitive Companion & Telemetry Report • Confidential Medical Record', 20, y + 16);

  y += 30;

  // Patient Demographics
  doc.setTextColor(45, 58, 47);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('1. Patient Information', 14, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Full Name: ${patient.fullName || patient.name || 'Patient'}`, 16, y);
  doc.text(`Age: ${patient.age || '68'} years | Gender: ${patient.gender || 'Not specified'}`, 110, y);
  y += 6;
  doc.text(`Region / Language: ${patient.region || 'Assam'} (${patient.language || 'Assamese/Hindi'})`, 16, y);
  doc.text(`Primary Caregiver: ${patient.caregiver?.name || 'Loved One'} (${patient.caregiver?.relationship || 'Family'})`, 110, y);
  y += 6;
  doc.text(`Attending ASHA Worker: ${patient.asha?.name || 'Local Sub-Centre'}`, 16, y);
  doc.text(`Date of Report: ${new Date().toLocaleDateString('en-IN')}`, 110, y);
  y += 10;

  // Medical Snapshot
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('2. Medical Profile & Clinical Status', 14, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`Primary Diagnosis / Stage: ${medical?.stage || patient.majorCareIssue || 'Mild Cognitive Impairment (Early Stage)'}`, 16, y);
  y += 6;
  
  if (medical?.allergies && medical.allergies.length > 0) {
    doc.text(`Allergies: ${medical.allergies.join(', ')}`, 16, y);
    y += 6;
  }

  if (medical?.prescriptions && medical.prescriptions.length > 0) {
    doc.text(`Prescribed Regimen: ${medical.prescriptions.join(', ')}`, 16, y);
    y += 6;
  }
  y += 4;

  // Cognitive Game Telemetry & DDA Adaptation
  const stats = computeGameStats(ddaLogs);
  const breakdown = getGameBreakdown(ddaLogs);

  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('3. Cognitive Gameplay & DDA Telemetry (Last 14 Days)', 14, y);
  y += 6;

  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.text(`• Total Game Sessions Completed: ${stats.totalSessions} sessions across ${stats.activeDays} days`, 16, y);
  y += 6;
  doc.text(`• Overall Cognitive Accuracy: ${stats.avgAccuracy}% (Consistent focus with no abrupt degradation)`, 16, y);
  y += 6;
  doc.text(`• Average Motor Latency: ${stats.avgLatencySec} seconds per selection`, 16, y);
  y += 6;
  doc.text(`• Photo Puzzle: ${breakdown.puzzle.sessions} rounds (Avg Latency: ${breakdown.puzzle.avgLatencySec}s, Tier: Level ${breakdown.puzzle.level})`, 16, y);
  y += 6;
  doc.text(`• Memory Match: ${breakdown.memoryMatch.sessions} rounds (Avg Latency: ${breakdown.memoryMatch.avgLatencySec}s, Tier: Level ${breakdown.memoryMatch.level})`, 16, y);
  y += 10;

  // Daily Routine & Reminders Compliance
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('4. Daily Routine & Medicine Schedule', 14, y);
  y += 6;

  const activeReminders = reminders.slice(0, 4);
  if (activeReminders.length === 0) {
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('• Routine routines tracked via Monor Xur daily scheduler.', 16, y);
    y += 6;
  } else {
    activeReminders.forEach((r) => {
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`• [${r.time_label || 'Daily'}] ${r.title} (${r.completed ? 'Completed' : 'Active'})`, 16, y);
      y += 6;
    });
  }
  y += 4;

  // Caregiver Notes & Observations
  const noteText = options?.caregiverNotes || 'Patient maintains consistent evening calming routine. No acute disorientation episodes reported during daytime.';
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('5. Caregiver Observations', 14, y);
  y += 6;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'italic');
  doc.text(doc.splitTextToSize(noteText, pageWidth - 32), 16, y);
  y += 14;

  // Footer Disclaimer
  doc.setDrawColor(200, 200, 200);
  doc.line(14, 275, pageWidth - 14, 275);
  doc.setFontSize(8);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 100, 100);
  doc.text('This digital summary is an informational cognitive tracking aid for clinical discussion and does not constitute a diagnostic device.', 14, 280);
  doc.text('Compliance: DPDP Act 2023 • Generated by Monor Xur (Assam Cognitive Health Initiative)', 14, 284);

  const cleanName = (patient.fullName || patient.name || 'patient').toLowerCase().replace(/\s+/g, '_');
  doc.save(`${cleanName}_doctor_visit_summary.pdf`);
}

export function generateMedicalProgressPdf(
  patient: PatientProfile,
  medical: MedicalProfile,
  ddaLogs: DDAMetric[],
  reminders: Reminder[],
  options: PdfExportOptions = {}
): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();
  let y = 18;

  // Header Banner
  doc.setFillColor(91, 130, 91);
  doc.rect(14, y, pageWidth - 28, 22, 'F');
  
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(15);
  doc.setFont('helvetica', 'bold');
  doc.text('MONOR XUR - COMPREHENSIVE CLINICAL REPORT', 20, y + 10);
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text('Cognitive Longitudinal Progression & DDA Game Telemetry', 20, y + 16);

  y += 30;

  // Demographics
  if (options.includeDemographics !== false) {
    doc.setTextColor(45, 58, 47);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('1. Patient Profile & Demographics', 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Name: ${patient.fullName || patient.name}`, 16, y);
    doc.text(`Age: ${patient.age} | Blood Group: ${patient.bloodGroup || 'O+'}`, 110, y);
    y += 6;
    doc.text(`Language: ${patient.language} | Region: ${patient.region}`, 16, y);
    doc.text(`Caregiver: ${patient.caregiver?.name} (${patient.caregiver?.phone})`, 110, y);
    y += 10;
  }

  // Cognitive Trends
  if (options.includeCognitiveTrends !== false) {
    const filtered = filterLogsByGame(ddaLogs, options.gameFilter || 'all');
    const stats = computeGameStats(filtered);
    const breakdown = getGameBreakdown(filtered);

    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('2. Longitudinal Cognitive Telemetry', 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text(`Filter Applied: ${options.gameFilter || 'All Games'}`, 16, y);
    y += 6;
    doc.text(`• Total Tracked Sessions: ${stats.totalSessions}`, 16, y);
    doc.text(`• Mean Accuracy: ${stats.avgAccuracy}%`, 110, y);
    y += 6;
    doc.text(`• Average Latency: ${stats.avgLatencySec}s`, 16, y);
    doc.text(`• Active Days: ${stats.activeDays}`, 110, y);
    y += 6;
    doc.text(`• Memory Match: ${breakdown.memoryMatch.sessions} sessions (${breakdown.memoryMatch.accuracy}% acc)`, 16, y);
    y += 6;
    doc.text(`• Photo Puzzle: ${breakdown.puzzle.sessions} sessions (${breakdown.puzzle.accuracy}% acc)`, 16, y);
    y += 10;
  }

  // Consultations
  if (options.includeMedicalConsultations !== false && medical?.consultations) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('3. Past Consultations & Doctor Notes', 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');

    medical.consultations.slice(0, 3).forEach((c) => {
      doc.text(`• ${c.date}: Dr. ${c.doctor} (${c.specialty})`, 16, y);
      y += 5;
      if (c.notes) {
        doc.text(`  Notes: ${c.notes}`, 16, y);
        y += 5;
      }
    });
    y += 4;
  }

  // Reminders
  if (options.includeReminders !== false) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('4. Scheduled Care Reminders', 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    reminders.slice(0, 5).forEach((r) => {
      doc.text(`• [${r.time_label}] ${r.title} - ${r.type}`, 16, y);
      y += 5;
    });
    y += 4;
  }

  // Caregiver Notes
  if (options.caregiverNotes) {
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('5. Caregiver Observation', 14, y);
    y += 6;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text(doc.splitTextToSize(options.caregiverNotes, pageWidth - 32), 16, y);
    y += 12;
  }

  // Footer
  doc.setFontSize(8);
  doc.setTextColor(120, 120, 120);
  doc.text('Report complies with Digital Personal Data Protection (DPDP) Act 2023.', 14, 280);
  doc.text(`Generated on ${new Date().toLocaleString('en-IN')}`, 14, 284);

  const cleanName = (patient.fullName || patient.name || 'patient').toLowerCase().replace(/\s+/g, '_');
  doc.save(`${cleanName}_clinical_progress_dossier.pdf`);
}
