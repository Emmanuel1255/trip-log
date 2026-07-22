import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { useTrips } from "@/hooks/useTrips";
import { useVehicles } from "@/hooks/useVehicles";
import { deleteDriver, getDriver } from "@/lib/db/queries/drivers";
import type { Driver } from "@/lib/db/types";
import { formatDisplayDate } from "@/lib/utils/date";
import { isTripComplete } from "@/lib/utils/tripStatus";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function DriverDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography, radii, tabularNumsStyle } = useTheme();
  const [driver, setDriver] = useState<Driver | null>(null);
  const { vehicles } = useVehicles();
  const { trips } = useTrips({ driverId: id });

  useEffect(() => {
    if (id) getDriver(id).then(setDriver);
  }, [id]);

  const vehicleById = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);
  const totalDistance = Math.round(trips.reduce((sum, t) => sum + (t.distance_km ?? 0), 0));
  const recentTrips = trips.slice(0, 5);

  if (!driver) return null;

  const handleDelete = () => {
    Alert.alert("Delete Driver", `Remove ${driver.name}? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDriver(driver.id);
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
        <Text style={[typography.title, { color: colors.textPrimary }]}>Driver Details</Text>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() =>
              router.push({ pathname: "/(tabs)/vehicles-drivers/drivers/[id]/edit", params: { id: driver.id } })
            }
          >
            <Feather name="edit-2" size={20} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={handleDelete}>
            <Feather name="trash-2" size={20} color={colors.alert} />
          </Pressable>
        </View>
      </View>

      <Card>
        <Text style={[typography.title, { color: colors.textPrimary }]}>{driver.name}</Text>
        {driver.phone ? (
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 2 }]}>{driver.phone}</Text>
        ) : null}

        <View style={styles.rows}>
          {driver.license_number ? <Row label="License Number" value={driver.license_number} /> : null}
          {driver.license_expiry ? (
            <Row label="License Expiry" value={formatDisplayDate(driver.license_expiry)} />
          ) : null}
        </View>
      </Card>

      <Card style={styles.statsCard}>
        <View style={styles.statsRow}>
          <Stat label="Total Trips" value={String(trips.length)} />
          <Stat label="Total Distance" value={`${totalDistance} km`} />
          <Stat label="Total Fuel" value="—" />
        </View>
      </Card>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600" }]}>Trip History</Text>
          {trips.length > 0 ? (
            <Pressable onPress={() => router.push("/(tabs)/trips")}>
              <Text style={[typography.caption, { color: colors.primary, fontWeight: "600" }]}>See all</Text>
            </Pressable>
          ) : null}
        </View>

        {recentTrips.length === 0 ? (
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 8 }]}>
            No trips logged for this driver yet.
          </Text>
        ) : (
          <View style={{ marginTop: 12 }}>
            {recentTrips.map((trip) => (
              <Pressable
                key={trip.id}
                onPress={() => router.push({ pathname: "/(tabs)/trips/[id]", params: { id: trip.id } })}
                style={[styles.tripRow, { backgroundColor: colors.surfaceSolid, borderRadius: radii.card }]}
              >
                <View style={styles.tripDetails}>
                  <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: "600" }]}>
                    {formatDisplayDate(trip.trip_date)}
                  </Text>
                  <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
                    {vehicleById.get(trip.vehicle_id)
                      ? `${vehicleById.get(trip.vehicle_id)!.make} · ${vehicleById.get(trip.vehicle_id)!.plate_number}`
                      : "Unknown vehicle"}{" "}
                    · {trip.departure_location} → {trip.arrival_location}
                  </Text>
                </View>
                {isTripComplete(trip) ? (
                  <Text style={[typography.body, tabularNumsStyle, { color: colors.primary, fontWeight: "700" }]}>
                    {trip.distance_km} km
                  </Text>
                ) : (
                  <Text style={{ color: "#D9A441", fontSize: 11, fontWeight: "600" }}>In Progress</Text>
                )}
              </Pressable>
            ))}
          </View>
        )}
      </View>
    </ScrollView>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  const { colors } = useTheme();
  return (
    <View style={styles.row}>
      <Text style={{ color: colors.textSecondary }}>{label}</Text>
      <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>{value}</Text>
    </View>
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

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  rows: {
    marginTop: 16,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  statsCard: {
    marginTop: 16,
  },
  statsRow: {
    flexDirection: "row",
  },
  section: {
    marginTop: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  tripRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 12,
    marginBottom: 8,
    gap: 8,
  },
  tripDetails: {
    flex: 1,
  },
});
