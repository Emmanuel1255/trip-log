import { Pressable, StyleSheet, Text, View } from "react-native";
import { useTheme } from "@/lib/theme/ThemeProvider";

export type SyncBadgeState = "synced" | "pending" | "error";

interface SyncStatusBadgeProps {
  state: SyncBadgeState;
  onPress?: () => void;
}

const LABELS: Record<SyncBadgeState, string> = {
  synced: "Synced",
  pending: "Syncing…",
  error: "Sync error",
};

export function SyncStatusBadge({ state, onPress }: SyncStatusBadgeProps) {
  const { colors, typography } = useTheme();

  const dotColor =
    state === "synced" ? colors.success : state === "pending" ? "#D9A441" : colors.alert;

  return (
    <Pressable onPress={onPress} style={styles.row} disabled={state !== "error"}>
      <View style={[styles.dot, { backgroundColor: dotColor }]} />
      <Text style={[typography.caption, { color: colors.textSecondary }]}>{LABELS[state]}</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
});
