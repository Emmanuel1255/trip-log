import { Tabs } from "expo-router";
import { GlassTabBar } from "@/components/ui/GlassTabBar";

export default function TabsLayout() {
  return (
    <Tabs tabBar={(props) => <GlassTabBar {...props} />} screenOptions={{ headerShown: false }}>
      <Tabs.Screen name="index" options={{ title: "Home" }} />
      <Tabs.Screen name="trips" options={{ title: "Trips" }} />
      <Tabs.Screen name="vehicles-drivers" options={{ title: "Vehicles & Drivers" }} />
      <Tabs.Screen name="export" options={{ title: "Export" }} />
    </Tabs>
  );
}
