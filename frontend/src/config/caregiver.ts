// Demo caregiver authentication config (prototype only).
// Mock credentials for local authentication — never shown in the UI.

export const PIN_LENGTH = 4;

// Family caregiver unlocks with a numeric PIN.
export const FAMILY_PIN = "1234";

// ASHA / health worker logs in with an ID + password.
export const ASHA_CREDENTIALS = {
  id: "ASHA001",
  password: "asha123",
} as const;

export type CaregiverRole = "family" | "asha";
