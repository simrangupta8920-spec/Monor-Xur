// In-memory caregiver auth. State is NOT persisted, so every app launch
// requires re-authentication — a dashboard can never be opened just by navigating.

import { createContext, useCallback, useContext, useMemo, useState, type PropsWithChildren } from "react";

import { ASHA_CREDENTIALS, FAMILY_PIN, type CaregiverRole } from "@/src/config/caregiver";

type CaregiverAuthValue = {
  unlocked: Record<CaregiverRole, boolean>;
  unlockFamily: (pin: string) => boolean;
  loginAsha: (id: string, password: string) => boolean;
  lock: (role: CaregiverRole) => void;
};

const CaregiverAuthContext = createContext<CaregiverAuthValue | null>(null);

export function CaregiverAuthProvider({ children }: PropsWithChildren) {
  const [unlocked, setUnlocked] = useState<Record<CaregiverRole, boolean>>({
    family: false,
    asha: false,
  });

  const unlockFamily = useCallback((pin: string) => {
    const ok = pin === FAMILY_PIN;
    if (ok) setUnlocked((prev) => ({ ...prev, family: true }));
    return ok;
  }, []);

  const loginAsha = useCallback((id: string, password: string) => {
    const ok =
      id.trim().toLowerCase() === ASHA_CREDENTIALS.id.toLowerCase() &&
      password === ASHA_CREDENTIALS.password;
    if (ok) setUnlocked((prev) => ({ ...prev, asha: true }));
    return ok;
  }, []);

  const lock = useCallback((role: CaregiverRole) => {
    setUnlocked((prev) => ({ ...prev, [role]: false }));
  }, []);

  const value = useMemo(
    () => ({ unlocked, unlockFamily, loginAsha, lock }),
    [unlocked, unlockFamily, loginAsha, lock],
  );
  return <CaregiverAuthContext.Provider value={value}>{children}</CaregiverAuthContext.Provider>;
}

export function useCaregiverAuth() {
  const ctx = useContext(CaregiverAuthContext);
  if (!ctx) throw new Error("useCaregiverAuth must be used within CaregiverAuthProvider");
  return ctx;
}
