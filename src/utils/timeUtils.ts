// Time parsing and comparison utilities for Medicine Reminders

export function parseTimeToMinutes(timeStr?: string): number {
  if (!timeStr) return 480; // default 8:00 AM

  const clean = timeStr.trim().toLowerCase();

  // Keyword fallbacks
  if (clean.includes('morning') || clean.includes('breakfast')) return 510; // 8:30 AM
  if (clean.includes('afternoon') || clean.includes('lunch')) return 810; // 1:30 PM
  if (clean.includes('evening') || clean.includes('dinner')) return 1170; // 7:30 PM
  if (clean.includes('night') || clean.includes('bed')) return 1260; // 9:00 PM

  // Check 12-hour AM/PM format (e.g., "8:30 am", "08:30 AM", "8 PM", "12:15 pm")
  const ampmMatch = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(am|pm)$/i);
  if (ampmMatch) {
    let hours = parseInt(ampmMatch[1], 10);
    const minutes = ampmMatch[2] ? parseInt(ampmMatch[2], 10) : 0;
    const meridian = ampmMatch[3].toLowerCase();

    if (meridian === 'pm' && hours < 12) hours += 12;
    if (meridian === 'am' && hours === 12) hours = 0;

    return hours * 60 + minutes;
  }

  // Check 24-hour format (e.g., "08:30", "14:00", "20:15")
  const h24Match = clean.match(/^(\d{1,2}):(\d{2})$/);
  if (h24Match) {
    const hours = parseInt(h24Match[1], 10);
    const minutes = parseInt(h24Match[2], 10);
    return hours * 60 + minutes;
  }

  return 540; // Default 9:00 AM
}

export function getCurrentMinutesOfDay(): number {
  const now = new Date();
  return now.getHours() * 60 + now.getMinutes();
}

export function formatMinutesToDisplay(minutes: number): string {
  const hours24 = Math.floor(minutes / 60) % 24;
  const mins = minutes % 60;
  const period = hours24 >= 12 ? 'PM' : 'AM';
  const hours12 = hours24 % 12 || 12;
  const padMin = mins < 10 ? `0${mins}` : mins;
  return `${hours12}:${padMin} ${period}`;
}

export function isReminderDueNow(timeLabel: string, rawMinutes?: number, windowMinutes = 45): boolean {
  const targetMinutes = rawMinutes && rawMinutes > 0 ? rawMinutes : parseTimeToMinutes(timeLabel);
  const currentMinutes = getCurrentMinutesOfDay();
  
  // A reminder is active/due if the current time is within [targetMinutes - 15, targetMinutes + windowMinutes]
  // or if it was scheduled earlier today and not yet taken
  const diff = currentMinutes - targetMinutes;
  return diff >= -15 && diff <= windowMinutes;
}
