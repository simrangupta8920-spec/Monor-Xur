import { Stack } from "expo-router";

export default function PatientLayout() {
  return (
    <Stack screenOptions={{ headerShown: false, animation: "slide_from_right" }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="relaxation" />
      <Stack.Screen name="relaxation-music" />
      <Stack.Screen name="relaxation-breathing" />
      <Stack.Screen name="daily-life" />
      <Stack.Screen name="memory-viewer" />
      <Stack.Screen name="games/memory-match" />
    </Stack>
  );
}
