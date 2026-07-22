import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import { Card } from "@/components/ui/Card";
import type { Driver, Trip, Vehicle } from "@/lib/db/types";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { formatTimeDisplay } from "@/lib/utils/date";
import { isTripComplete } from "@/lib/utils/tripStatus";

interface TripRowProps {
  trip: Trip;
  vehicle?: Vehicle;
  driver?: Driver;
  onPress: () => void;
  onDelete: () => void;
}

export function TripRow({ trip, vehicle, driver, onPress, onDelete }: TripRowProps) {
  const { colors, typography, radii, tabularNumsStyle } = useTheme();
  const isComplete = isTripComplete(trip);

  return (
    <Swipeable
      renderRightActions={() => (
        <Pressable onPress={onDelete} style={[styles.deleteAction, { backgroundColor: colors.alert, borderRadius: radii.card }]}>
          <Feather name="trash-2" size={20} color="#fff" />
        </Pressable>
      )}
    >
      <Pressable onPress={onPress}>
        <Card style={styles.card}>
          <View style={[styles.icon, { backgroundColor: colors.lightAccent, borderRadius: radii.card }]}>
            <Feather name="truck" size={18} color={colors.deepAccent} />
          </View>
          <View style={styles.details}>
            <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600" }]} numberOfLines={1}>
              {vehicle ? `${vehicle.make} · ${vehicle.plate_number}` : "Unknown vehicle"}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
              {driver?.name ?? "Unknown driver"}
            </Text>
            <View style={styles.timeRow}>
              <View style={[styles.dot, { backgroundColor: isComplete ? colors.success : "#D9A441" }]} />
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {formatTimeDisplay(trip.time_out)} → {trip.time_in ? formatTimeDisplay(trip.time_in) : "In progress"}
              </Text>
            </View>
          </View>
          {isComplete ? (
            <Text style={[typography.body, tabularNumsStyle, { color: colors.primary, fontWeight: "700" }]}>
              {trip.distance_km} km
            </Text>
          ) : (
            <View style={[styles.progressBadge, { backgroundColor: "#D9A44122" }]}>
              <Text style={{ color: "#D9A441", fontSize: 11, fontWeight: "600" }}>In Progress</Text>
            </View>
          )}
        </Card>
      </Pressable>
    </Swipeable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  icon: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    flex: 1,
  },
  timeRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginTop: 4,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
  },
  deleteAction: {
    width: 56,
    marginBottom: 12,
    marginLeft: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  progressBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
