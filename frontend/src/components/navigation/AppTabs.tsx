import { Platform } from "react-native";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import type { ReactNode } from "react";

import { fonts, useTheme } from "@/src/theme";

export type TabConfig = {
  name: string;
  title: string;
  sf: string;
  icon: (color: string, size: number, focused: boolean) => ReactNode;
};

const isIOS26 = Platform.OS === "ios" && parseInt(String(Platform.Version), 10) >= 26;

type AppTabsProps = {
  tabs: TabConfig[];
  /** Route names present in the folder but hidden from the tab bar (pushed screens). */
  hidden?: string[];
};

export function AppTabs({ tabs, hidden = [] }: AppTabsProps) {
  const { colors } = useTheme();

  // NativeTabs cannot host hidden pushed routes; fall back to classic Tabs then.
  if (isIOS26 && hidden.length === 0) {
    return (
      <NativeTabs>
        {tabs.map((t) => (
          <NativeTabs.Trigger key={t.name} name={t.name}>
            <Icon sf={t.sf} />
            <Label>{t.title}</Label>
          </NativeTabs.Trigger>
        ))}
      </NativeTabs>
    );
  }

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.brandPrimary,
        tabBarInactiveTintColor: colors.muted,
        tabBarStyle: {
          backgroundColor: colors.surfaceSecondary,
          borderTopColor: colors.divider,
          borderTopWidth: 1,
          ...(Platform.OS === "web" ? { height: 70 } : {}),
        },
        tabBarItemStyle: { alignSelf: "center" },
        tabBarLabelStyle: { fontFamily: fonts.semibold, fontSize: 12, marginTop: 2 },
      }}
    >
      {tabs.map((t) => (
        <Tabs.Screen
          key={t.name}
          name={t.name}
          options={{
            title: t.title,
            tabBarIcon: ({ color, size, focused }) => t.icon(color, size, focused),
          }}
        />
      ))}
      {hidden.map((h) => (
        <Tabs.Screen key={h} name={h} options={{ href: null }} />
      ))}
    </Tabs>
  );
}
