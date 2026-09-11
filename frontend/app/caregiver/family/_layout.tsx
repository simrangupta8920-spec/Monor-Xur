import { CalendarBlank, Bell, House, User } from "phosphor-react-native";

import { AppTabs, type TabConfig } from "@/src/components/navigation/AppTabs";
import { ProtectedRoute, Role } from "@/src/auth/rbac";

const tabs: TabConfig[] = [
  { name: "index", title: "Home", sf: "house.fill", icon: (c, s) => <House size={s} color={c} weight="fill" /> },
  {
    name: "calendar",
    title: "Calendar",
    sf: "calendar",
    icon: (c, s) => <CalendarBlank size={s} color={c} weight="fill" />,
  },
  { name: "alerts", title: "Alerts", sf: "bell.fill", icon: (c, s) => <Bell size={s} color={c} weight="fill" /> },
  { name: "profile", title: "Profile", sf: "person.fill", icon: (c, s) => <User size={s} color={c} weight="fill" /> },
];

const hidden = ["reports", "emergency-contacts", "medical-details", "memories", "game-progress"];

export default function FamilyLayout() {
  return (
    <ProtectedRoute role={Role.FAMILY_CAREGIVER}>
      <AppTabs tabs={tabs} hidden={hidden} />
    </ProtectedRoute>
  );
}
