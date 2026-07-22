import { BlurView } from "expo-blur";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import * as Haptics from "expo-haptics";
import { Platform, Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { useLogTripSheet } from "@/hooks/useLogTripSheet";

type TabMeta = {
  label: string;
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  iconActive: keyof typeof MaterialCommunityIcons.glyphMap;
};

const TAB_META: Record<string, TabMeta> = {
  index: { label: "Home", icon: "home-outline", iconActive: "home" },
  trips: { label: "Trips", icon: "clipboard-text-outline", iconActive: "clipboard-text" },
  "vehicles-drivers": { label: "Vehicles & Drivers", icon: "truck-outline", iconActive: "truck" },
  "export/index": { label: "Report", icon: "chart-bar", iconActive: "chart-bar" },
};

const FALLBACK_TAB_META: TabMeta = {
  label: "",
  icon: "help-circle-outline",
  iconActive: "help-circle",
};

export function GlassTabBar({ state, navigation }: BottomTabBarProps) {
  const { mode, colors, radii } = useTheme();
  const insets = useSafeAreaInsets();
  const logTripSheet = useLogTripSheet();

  const renderTab = (route: (typeof state.routes)[number], index: number) => {
    const meta = TAB_META[route.name] ?? FALLBACK_TAB_META;
    const isFocused = state.index === index;

    const onPress = () => {
      const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
      if (!isFocused && !event.defaultPrevented) {
        navigation.navigate(route.name);
      }
    };

    return (
      <Pressable
        key={route.key}
        accessibilityRole="button"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={meta.label}
        onPress={onPress}
        style={styles.tab}
      >
        <MaterialCommunityIcons
          name={isFocused ? meta.iconActive : meta.icon}
          size={24}
          color={isFocused ? colors.primary : colors.textSecondary}
        />
        <Text
          numberOfLines={1}
          style={[styles.tabLabel, { color: isFocused ? colors.primary : colors.textSecondary }]}
        >
          {meta.label}
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
        {state.routes.slice(0, 2).map((route, i) => renderTab(route, i))}
        <View style={styles.tab} />
        {state.routes.slice(2).map((route, i) => renderTab(route, i + 2))}
      </View>
      <Pressable onPress={handleLogTripPress} style={[styles.fab, { backgroundColor: colors.primary }]}>
        <MaterialCommunityIcons name="plus" size={30} color="#fff" />
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
    alignSelf: "stretch",
    height: 68,
    borderWidth: StyleSheet.hairlineWidth,
    overflow: "hidden",
    paddingHorizontal: 6,
  },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: "600",
  },
  fab: {
    position: "absolute",
    top: -24,
    alignSelf: "center",
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
