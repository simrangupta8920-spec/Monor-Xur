import { useState, useEffect } from 'react';
import { PatientProfile } from '../types';
import { soundController } from '../utils/audio';

export interface SundowningState {
  isTimeWindow: boolean; // Currently between 4:30 PM (16:30) and 7:30 PM (19:30)
  isActive: boolean; // Automation active or manual override engaged
  isManualOverride: boolean;
  automationEnabled: boolean;
  currentTimeFormatted: string;
}

/**
 * Hook to manage "Sundowning" Evening Calming Automation (4:30 PM - 7:30 PM).
 * Dementia individuals often experience agitation and sensory overload in twilight hours.
 * Automatically dims bright whites to warm amber, reduces chime volumes, and promotes evening ragas.
 */
export function useSundowningState(patientProfile?: PatientProfile) {
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setNow(new Date());
    }, 30000); // Check every 30 seconds

    return () => clearInterval(timer);
  }, []);

  const hours = now.getHours();
  const minutes = now.getMinutes();
  const totalMinutes = hours * 60 + minutes;

  // 4:30 PM is 16:30 (16 * 60 + 30 = 990 minutes)
  // 7:30 PM is 19:30 (19 * 60 + 30 = 1170 minutes)
  const isTimeWindow = totalMinutes >= 990 && totalMinutes <= 1170;

  const automationEnabled = patientProfile?.sundowningAutomationEnabled !== false;
  const isManualOverride = Boolean(patientProfile?.sundowningManualOverride);

  const isActive = (isTimeWindow && automationEnabled) || isManualOverride;

  // Automatically sync with audio controller to attenuate sharp clicks and reduce chime volume
  useEffect(() => {
    soundController.setSundowningMode(isActive);
  }, [isActive]);

  const formattedTime = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  return {
    isTimeWindow,
    isActive,
    isManualOverride,
    automationEnabled,
    currentTimeFormatted: formattedTime,
  };
}
