import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { getDriver } from "@/lib/db/queries/drivers";
import { deleteTrip, getTrip } from "@/lib/db/queries/trips";
import { getVehicle } from "@/lib/db/queries/vehicles";
import type { Driver, Trip, Vehicle } from "@/lib/db/types";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { formatDisplayDate, formatTimeDisplay, parseTimeToDate } from "@/lib/utils/date";

function computeTimeTakenMinutes(trip: Trip): number {
  const outDate = parseTimeToDate(trip.time_out);
  const inDate = parseTimeToDate(trip.time_in);
  const diffMs = inDate.getTime() - outDate.getTime();
  return Math.max(0, Math.round(diffMs / 60000));
}

function formatDuration(minutes: number): string {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  if (hours === 0) return `${mins}m`;
  return `${hours}h ${String(mins).padStart(2, "0")}m`;
}

export default function TripDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, tabularNumsStyle } = useTheme();
  const [trip, setTrip] = useState<Trip | null>(null);
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [driver, setDriver] = useState<Driver | null>(null);

  useEffect(() => {
    if (!id) return;
    getTrip(id).then(async (row) => {
      setTrip(row);
      if (row) {
        const [v, d] = await Promise.all([getVehicle(row.vehicle_id), getDriver(row.driver_id)]);
        setVehicle(v);
        setDriver(d);
      }
    });
  }, [id]);

  if (!trip) return null;

  const timeTakenMinutes = computeTimeTakenMinutes(trip);
  const avgSpeed = timeTakenMinutes > 0 ? Math.round((trip.distance_km / (timeTakenMinutes / 60)) * 10) / 10 : null;

  const handleDelete = () => {
    Alert.alert("Delete Trip", "Remove this trip from the log? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTrip(trip.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Trip Details</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => router.push({ pathname: "/(tabs)/trips/[id]/edit", params: { id: trip.id } })}
          >
            <Feather name="edit-2" size={20} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={handleDelete}>
            <Feather name="trash-2" size={20} color={colors.alert} />
          </Pressable>
        </View>
      </View>

      <Card>
        <View style={styles.titleRow}>
          <View style={styles.titleText}>
            <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600" }]}>
              {vehicle ? `${vehicle.make} · ${vehicle.plate_number}` : "Unknown vehicle"}
            </Text>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>
              {driver?.name ?? "Unknown driver"}
            </Text>
          </View>
          <View style={[styles.badge, { backgroundColor: `${colors.success}22` }]}>
            <Text style={{ color: colors.success, fontWeight: "600", fontSize: 12 }}>Completed</Text>
          </View>
        </View>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 8 }]}>
          {formatDisplayDate(trip.trip_date)} · Trip ID: {trip.trip_number}
        </Text>
      </Card>

      <Card style={styles.section}>
        <View style={styles.timelineRow}>
          <View style={[styles.timelineDot, { backgroundColor: colors.success }]} />
          <View style={styles.timelineText}>
            <Text style={{ color: colors.success, fontWeight: "600" }}>Departure</Text>
            <Text style={[typography.body, { color: colors.textPrimary }]}>{trip.departure_location}</Text>
          </View>
          <Text style={[typography.caption, tabularNumsStyle, { color: colors.textSecondary }]}>
            {formatTimeDisplay(trip.time_out)}
          </Text>
        </View>
        <View style={[styles.timelineConnector, { backgroundColor: colors.hairline }]} />
        <View style={styles.timelineRow}>
          <View style={[styles.timelineDot, { backgroundColor: colors.alert }]} />
          <View style={styles.timelineText}>
            <Text style={{ color: colors.alert, fontWeight: "600" }}>Arrival</Text>
            <Text style={[typography.body, { color: colors.textPrimary }]}>{trip.arrival_location}</Text>
          </View>
          <Text style={[typography.caption, tabularNumsStyle, { color: colors.textSecondary }]}>
            {formatTimeDisplay(trip.time_in)}
          </Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.statsRow}>
          <Stat label="Distance" value={`${trip.distance_km} km`} />
          <Stat label="Time Taken" value={formatDuration(timeTakenMinutes)} />
          <Stat label="Avg Speed" value={avgSpeed != null ? `${avgSpeed} km/h` : "—"} />
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.odometerRow}>
          <View>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Opening Odometer</Text>
            <Text style={[typography.body, tabularNumsStyle, { color: colors.textPrimary, fontWeight: "600" }]}>
              {trip.opening_odometer} km
            </Text>
          </View>
          <Feather name="arrow-right" size={18} color={colors.textSecondary} />
          <View>
            <Text style={[typography.caption, { color: colors.textSecondary }]}>Closing Odometer</Text>
            <Text style={[typography.body, tabularNumsStyle, { color: colors.textPrimary, fontWeight: "600" }]}>
              {trip.closing_odometer} km
            </Text>
          </View>
        </View>
        <View style={styles.totalDistance}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Total Distance</Text>
          <Text style={[typography.display, tabularNumsStyle, { color: colors.primary, fontSize: 22 }]}>
            {trip.distance_km} km
          </Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <DetailRow icon="users" label="Passengers" value={trip.passengers ?? "—"} />
        <DetailRow icon="clock" label="Time Out" value={formatTimeDisplay(trip.time_out)} />
        <DetailRow icon="clock" label="Time In" value={formatTimeDisplay(trip.time_in)} />
        <DetailRow icon="file-text" label="Notes" value={trip.notes ?? "—"} last />
      </Card>
    </ScrollView>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  const { colors, typography, tabularNumsStyle } = useTheme();
  return (
    <View style={{ flex: 1, alignItems: "center" }}>
      <Text style={[typography.body, tabularNumsStyle, { color: colors.textPrimary, fontWeight: "700" }]}>
        {value}
      </Text>
      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>{label}</Text>
    </View>
  );
}

function DetailRow({
  icon,
  label,
  value,
  last,
}: {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  value: string;
  last?: boolean;
}) {
  const { colors, typography } = useTheme();
  return (
    <View style={[styles.detailRow, !last && { borderBottomWidth: 1, borderBottomColor: colors.hairline }]}>
      <View style={styles.detailLabel}>
        <Feather name={icon} size={16} color={colors.textSecondary} />
        <Text style={[typography.body, { color: colors.textSecondary }]}>{label}</Text>
      </View>
      <Text style={[typography.body, { color: colors.textPrimary, flexShrink: 1, textAlign: "right" }]}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
    gap: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  titleText: {
    flex: 1,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  section: {
    gap: 4,
  },
  timelineRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  timelineDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
  },
  timelineConnector: {
    width: 1,
    height: 16,
    marginLeft: 4,
  },
  timelineText: {
    flex: 1,
  },
  statsRow: {
    flexDirection: "row",
  },
  odometerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  totalDistance: {
    marginTop: 12,
    alignItems: "center",
  },
  detailRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  detailLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
});
