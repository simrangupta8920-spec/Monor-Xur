import { Bell, ChartBar, House, ListChecks } from "phosphor-react-native";

import { AppTabs, type TabConfig } from "@/src/components/navigation/AppTabs";
import { ProtectedRoute, Role } from "@/src/auth/rbac";

const tabs: TabConfig[] = [
  { name: "index", title: "Home", sf: "house.fill", icon: (c, s) => <House size={s} color={c} weight="fill" /> },
  { name: "report", title: "Report", sf: "chart.bar.fill", icon: (c, s) => <ChartBar size={s} color={c} weight="fill" /> },
  { name: "tasks", title: "Tasks", sf: "checklist", icon: (c, s) => <ListChecks size={s} color={c} weight="fill" /> },
  { name: "alerts", title: "Alerts", sf: "bell.fill", icon: (c, s) => <Bell size={s} color={c} weight="fill" /> },
];

export default function AshaLayout() {
  return (
    <ProtectedRoute role={Role.ASHA_WORKER}>
      <AppTabs tabs={tabs} />
    </ProtectedRoute>
  );
}
