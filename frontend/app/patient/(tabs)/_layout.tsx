import { House, Images, PuzzlePiece, GearSix } from "phosphor-react-native";

import { AppTabs, type TabConfig } from "@/src/components/navigation/AppTabs";

const tabs: TabConfig[] = [
  {
    name: "home",
    title: "Home",
    sf: "house.fill",
    icon: (color, size) => <House size={size + 2} color={color} weight="fill" />,
  },
  {
    name: "play",
    title: "Play",
    sf: "puzzlepiece.fill",
    icon: (color, size) => <PuzzlePiece size={size + 2} color={color} weight="fill" />,
  },
  {
    name: "memories",
    title: "Memories",
    sf: "photo.on.rectangle",
    icon: (color, size) => <Images size={size + 2} color={color} weight="fill" />,
  },
  {
    name: "settings",
    title: "Settings",
    sf: "gearshape.fill",
    icon: (color, size) => <GearSix size={size + 2} color={color} weight="fill" />,
  },
];

export default function PatientTabsLayout() {
  return <AppTabs tabs={tabs} />;
}
