import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { TextField } from "@/components/ui/TextField";
import { useLogFuelSheet } from "@/hooks/useLogFuelSheet";
import { getDriver } from "@/lib/db/queries/drivers";
import { deleteTrip, getTrip, updateTrip } from "@/lib/db/queries/trips";
import { getVehicle } from "@/lib/db/queries/vehicles";
import type { Driver, Trip, Vehicle } from "@/lib/db/types";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { formatDisplayDate, formatTime24h, formatTimeDisplay, parseTimeToDate } from "@/lib/utils/date";
import { isTripComplete } from "@/lib/utils/tripStatus";

function computeTimeTakenMinutes(trip: Trip): number | null {
  if (!trip.time_in) return null;
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
  const logFuelSheet = useLogFuelSheet();
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

  const isComplete = isTripComplete(trip);
  const timeTakenMinutes = computeTimeTakenMinutes(trip);
  const avgSpeed =
    timeTakenMinutes && timeTakenMinutes > 0 && trip.distance_km != null
      ? Math.round((trip.distance_km / (timeTakenMinutes / 60)) * 10) / 10
      : null;

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
          <View
            style={[styles.badge, { backgroundColor: isComplete ? `${colors.success}22` : "#D9A44122" }]}
          >
            <Text style={{ color: isComplete ? colors.success : "#D9A441", fontWeight: "600", fontSize: 12 }}>
              {isComplete ? "Completed" : "In Progress"}
            </Text>
          </View>
        </View>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 8 }]}>
          {formatDisplayDate(trip.trip_date)} · Trip ID: {trip.trip_number}
        </Text>
        <View style={styles.logFuelButton}>
          <Button
            label="Log Fuel"
            variant="secondary"
            onPress={() => logFuelSheet.present({ tripId: trip.id, vehicleId: trip.vehicle_id })}
          />
        </View>
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
          <View style={[styles.timelineDot, { backgroundColor: trip.time_in ? colors.alert : colors.hairline }]} />
          <View style={styles.timelineText}>
            <Text style={{ color: trip.time_in ? colors.alert : colors.textSecondary, fontWeight: "600" }}>
              Arrival
            </Text>
            <Text style={[typography.body, { color: colors.textPrimary }]}>{trip.arrival_location}</Text>
          </View>
          <Text style={[typography.caption, tabularNumsStyle, { color: colors.textSecondary }]}>
            {trip.time_in ? formatTimeDisplay(trip.time_in) : "Pending"}
          </Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <View style={styles.statsRow}>
          <Stat label="Distance" value={trip.distance_km != null ? `${trip.distance_km} km` : "—"} />
          <Stat label="Time Taken" value={timeTakenMinutes != null ? formatDuration(timeTakenMinutes) : "—"} />
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
              {trip.closing_odometer != null ? `${trip.closing_odometer} km` : "Pending"}
            </Text>
          </View>
        </View>
        <View style={styles.totalDistance}>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Total Distance</Text>
          <Text style={[typography.display, tabularNumsStyle, { color: colors.primary, fontSize: 22 }]}>
            {trip.distance_km != null ? `${trip.distance_km} km` : "—"}
          </Text>
        </View>
      </Card>

      <Card style={styles.section}>
        <DetailRow icon="users" label="Passengers" value={trip.passengers ?? "—"} />
        <DetailRow icon="clock" label="Time Out" value={formatTimeDisplay(trip.time_out)} />
        <DetailRow icon="clock" label="Time In" value={trip.time_in ? formatTimeDisplay(trip.time_in) : "Pending"} />
        <DetailRow icon="file-text" label="Notes" value={trip.notes ?? "—"} last />
      </Card>

      <EndTripSection trip={trip} onEnded={setTrip} />
    </ScrollView>
  );
}

function EndTripSection({ trip, onEnded }: { trip: Trip; onEnded: (trip: Trip) => void }) {
  const { colors, typography } = useTheme();
  const isComplete = isTripComplete(trip);
  const [isOpen, setIsOpen] = useState(false);
  const [timeIn, setTimeIn] = useState<Date | null>(trip.time_in ? parseTimeToDate(trip.time_in) : null);
  const [closingOdometer, setClosingOdometer] = useState(
    trip.closing_odometer != null ? String(trip.closing_odometer) : ""
  );
  const [passengers, setPassengers] = useState(trip.passengers ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleOpen = () => {
    setTimeIn(trip.time_in ? parseTimeToDate(trip.time_in) : null);
    setClosingOdometer(trip.closing_odometer != null ? String(trip.closing_odometer) : "");
    setPassengers(trip.passengers ?? "");
    setError(null);
    setIsOpen(true);
  };

  const handleSubmit = async () => {
    setError(null);
    const closingValue = Number(closingOdometer);
    if (!closingOdometer || !Number.isFinite(closingValue)) {
      setError("Enter a closing odometer reading.");
      return;
    }
    if (closingValue < trip.opening_odometer) {
      setError("Closing odometer must be greater than or equal to opening odometer.");
      return;
    }

    setSaving(true);
    try {
      const updated = await updateTrip(trip.id, {
        time_in: timeIn ? formatTime24h(timeIn) : formatTime24h(new Date()),
        closing_odometer: closingValue,
        passengers: passengers || null,
      });
      onEnded(updated);
      setIsOpen(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save.");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) {
    return (
      <Card style={[styles.section, !isComplete && { backgroundColor: "#D9A44115" }]}>
        <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600" }]}>
          {isComplete ? "Trip End Details" : "This trip is still in progress"}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 4, marginBottom: 12 }]}>
          {isComplete
            ? "Need to fix the time in, closing odometer, or passengers?"
            : "Fill in the time in and closing odometer to complete it."}
        </Text>
        <Button label={isComplete ? "Edit" : "End Trip"} onPress={handleOpen} />
      </Card>
    );
  }

  return (
    <Card style={styles.section}>
      <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600", marginBottom: 12 }]}>
        {isComplete ? "Edit Trip End Details" : "End Trip"}
      </Text>
      <DateTimeField label="Time In" mode="time" value={timeIn} onChange={setTimeIn} />
      <TextField
        label="Closing Odometer (km)"
        placeholder="0"
        keyboardType="numeric"
        value={closingOdometer}
        onChangeText={setClosingOdometer}
      />
      <TextField
        label="Passengers (Optional)"
        placeholder="Mr. Kallon, Ms. Kamara"
        value={passengers}
        onChangeText={setPassengers}
      />
      {error ? (
        <Text style={[typography.caption, { color: colors.alert, marginBottom: 12 }]}>{error}</Text>
      ) : null}
      <Button label={isComplete ? "Save Changes" : "Complete Trip"} onPress={handleSubmit} loading={saving} />
      <Pressable onPress={() => setIsOpen(false)} style={styles.cancelLink}>
        <Text style={[typography.body, { color: colors.textSecondary }]}>Cancel</Text>
      </Pressable>
    </Card>
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
  cancelLink: {
    alignItems: "center",
    marginTop: 12,
  },
  logFuelButton: {
    marginTop: 16,
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
