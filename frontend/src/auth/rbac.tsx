// Role-based access control for Monor Xur.
//
// Enforcement is done at two levels:
//   1. ProtectedRoute — folder/navigation guard in each caregiver _layout. An
//      unauthenticated (or wrong-role) user is redirected to the correct login.
//   2. RoleGuard — screen-level permission guard. A screen declares the
//      permission it needs; if the active role lacks it, the user is redirected
//      to their authorized home. This blocks direct-URL access, not just hidden UI.

import { Redirect } from "expo-router";
import type { PropsWithChildren } from "react";

import { useCaregiverAuth } from "@/src/auth/caregiver-auth";

export const Role = {
  PATIENT: "PATIENT",
  FAMILY_CAREGIVER: "FAMILY_CAREGIVER",
  ASHA_WORKER: "ASHA_WORKER",
} as const;
export type Role = (typeof Role)[keyof typeof Role];

export type Permission =
  // Patient
  | "games"
  | "daily_life"
  | "relaxation"
  | "music"
  | "breathing"
  | "patient_settings"
  // Shared / caregiver
  | "patient_profile"
  | "basic_profile"
  | "personal_details"
  | "major_care_issue"
  | "medical_details"
  | "memories_view"
  | "memories_manage"
  | "game_progress"
  | "reports"
  | "calendar"
  | "care_tasks"
  | "appointments"
  | "emergency_contacts"
  | "alerts"
  | "care_info";

const PATIENT_PERMS: Permission[] = [
  "games",
  "daily_life",
  "relaxation",
  "music",
  "breathing",
  "memories_view",
  "patient_settings",
];

const FAMILY_PERMS: Permission[] = [
  "patient_profile",
  "basic_profile",
  "personal_details",
  "major_care_issue",
  "medical_details",
  "memories_view",
  "memories_manage",
  "game_progress",
  "reports",
  "calendar",
  "appointments",
  "emergency_contacts",
  "alerts",
  "care_info",
];

const ASHA_PERMS: Permission[] = [
  "basic_profile",
  "major_care_issue",
  "game_progress",
  "reports",
  "care_tasks",
  "appointments",
  "alerts",
  "emergency_contacts",
];

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  PATIENT: PATIENT_PERMS,
  FAMILY_CAREGIVER: FAMILY_PERMS,
  ASHA_WORKER: ASHA_PERMS,
};

export function hasPermission(role: Role | null, permission: Permission): boolean {
  if (!role) return false;
  return ROLE_PERMISSIONS[role].includes(permission);
}

export function homeForRole(role: Role): string {
  switch (role) {
    case "FAMILY_CAREGIVER":
      return "/caregiver/family";
    case "ASHA_WORKER":
      return "/caregiver/asha";
    default:
      return "/patient/home";
  }
}

/** Navigation guard: requires the given caregiver role to be authenticated. */
export function ProtectedRoute({ role, children }: PropsWithChildren<{ role: Role }>) {
  const { unlocked } = useCaregiverAuth();
  const authed =
    role === "FAMILY_CAREGIVER"
      ? unlocked.family
      : role === "ASHA_WORKER"
        ? unlocked.asha
        : true;

  if (!authed) {
    const loginPath = role === "ASHA_WORKER" ? "/asha/login" : "/family/login";
    return <Redirect href={loginPath as any} />;
  }
  return <>{children}</>;
}

/** Screen-level guard: the active role must hold the permission. */
export function RoleGuard({
  role,
  permission,
  children,
}: PropsWithChildren<{ role: Role; permission: Permission }>) {
  if (!hasPermission(role, permission)) {
    return <Redirect href={homeForRole(role) as any} />;
  }
  return <>{children}</>;
}
