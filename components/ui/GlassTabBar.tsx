import { BlurView } from "expo-blur";
import { Feather } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useLogTripSheet } from "@/hooks/useLogTripSheet";

const TAB_ICONS: Record<string, keyof typeof Feather.glyphMap> = {
  index: "home",
  trips: "clipboard",
  "vehicles-drivers": "truck",
  export: "share",
};

const TAB_LABELS: Record<string, string> = {
  index: "Home",
  trips: "Trips",
  "vehicles-drivers": "Vehicles & Drivers",
  export: "Export",
};

export function GlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const { mode, colors, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const logTripSheet = useLogTripSheet();

  const leftRoutes = state.routes.slice(0, 2);
  const rightRoutes = state.routes.slice(2);

  const renderTab = (route: (typeof state.routes)[number]) => {
    const index = state.routes.findIndex((r) => r.key === route.key);
    const isFocused = state.index === index;
    const iconName = TAB_ICONS[route.name] ?? "circle";
    const label = TAB_LABELS[route.name] ?? route.name;

    const onPress = () => {
      const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Pressable key={route.key} onPress={onPress} style={styles.tab}>
        <Feather name={iconName} size={20} color={isFocused ? colors.primary : colors.textSecondary} />
        <Text
          numberOfLines={1}
          style={[
            styles.tabLabel,
            { color: isFocused ? colors.primary : colors.textSecondary },
          ]}
        >
          {label}
        </Text>
      </Pressable>
    );
  };

  const handleLogTripPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    logTripSheet.present();
  };

  return (
    <View
      style={[styles.container, { paddingBottom: Math.max(insets.bottom, 12) }]}
      pointerEvents="box-none"
    >
      <View style={[styles.bar, { borderRadius: radii.glass + 6, borderColor: colors.hairline }]}>
        {Platform.OS === "ios" ? (
          <>
            <BlurView intensity={50} tint={mode} style={StyleSheet.absoluteFill} />
            <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surface }]} />
          </>
        ) : (
          // Android: skip real blur for performance, use a near-opaque solid instead.
          <View style={[StyleSheet.absoluteFill, { backgroundColor: colors.surfaceOpaque }]} />
        )}
        <View style={styles.tabRow}>{leftRoutes.map(renderTab)}</View>
        <View style={styles.centerSpacer} />
        <View style={styles.tabRow}>{rightRoutes.map(renderTab)}</View>
      </View>
      <Pressable onPress={handleLogTripPress} style={[styles.fab, { backgroundColor: colors.primary }]}>
        <Feather name="plus" size={28} color="#fff" />
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    left: 16,
    right: 16,
    bottom: 0,
    alignItems: "center",
  },
  bar: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    height: 68,
    borderWidth: 1,
    overflow: "hidden",
  },
  tabRow: {
    flex: 1,
    flexDirection: "row",
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  centerSpacer: {
    width: 64,
  },
  fab: {
    position: "absolute",
    top: -24,
    width: 58,
    height: 58,
    borderRadius: 29,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 6,
  },
});
