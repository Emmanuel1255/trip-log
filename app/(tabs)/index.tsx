import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { GlassCard } from "@/components/ui/GlassCard";
import { SyncStatusBadge } from "@/components/ui/SyncStatusBadge";
import { useLogTripSheet } from "@/hooks/useLogTripSheet";
import { useLogFuelSheet } from "@/hooks/useLogFuelSheet";
import { useTrips } from "@/hooks/useTrips";
import { useVehicles } from "@/hooks/useVehicles";
import { useDrivers } from "@/hooks/useDrivers";
import type { Trip } from "@/lib/db/types";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { formatDisplayDate, formatTimeDisplay, getDatePresetRange } from "@/lib/utils/date";
import { isTripComplete } from "@/lib/utils/tripStatus";

const QUICK_ACTIONS = [
  { key: "log-trip", label: "Log Trip", sublabel: "Add new trip", icon: "plus" as const, color: "#266CA9" },
  { key: "log-fuel", label: "Log Fuel", sublabel: "Add fuel entry", icon: "droplet" as const, color: "#2E8B57" },
  { key: "add-vehicle", label: "Add Vehicle", sublabel: "New vehicle", icon: "truck" as const, color: "#6B4EE6" },
  { key: "add-driver", label: "Add Driver", sublabel: "New driver", icon: "user-plus" as const, color: "#D9822B" },
];

export default function HomeScreen() {
  const { colors, typography, radii, tabularNumsStyle } = useTheme();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();
  const logTripSheet = useLogTripSheet();
  const logFuelSheet = useLogFuelSheet();

  const weekRange = useMemo(() => getDatePresetRange("week"), []);
  const { trips: weekTrips } = useTrips({ dateFrom: weekRange.dateFrom, dateTo: weekRange.dateTo });
  const { trips: allTrips } = useTrips();

  const vehicleById = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);
  const driverById = useMemo(() => new Map(drivers.map((d) => [d.id, d])), [drivers]);

  const tripsThisWeek = weekTrips.length;
  const totalDistanceThisWeek = Math.round(weekTrips.reduce((sum, t) => sum + (t.distance_km ?? 0), 0));
  const recentTrips = allTrips.slice(0, 5);

  const handleQuickAction = (key: string) => {
    switch (key) {
      case "log-trip":
        logTripSheet.present();
        break;
      case "log-fuel":
        logFuelSheet.present();
        break;
      case "add-vehicle":
        router.push("/(tabs)/vehicles-drivers/vehicles/add");
        break;
      case "add-driver":
        router.push("/(tabs)/vehicles-drivers/drivers/add");
        break;
    }
  };

  return (
    <ScrollView
      style={{ backgroundColor: colors.background }}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.push("/settings")} style={[styles.menuButton, { backgroundColor: colors.primary }]}>
          <Feather name="menu" size={18} color="#fff" />
        </Pressable>
        <View>
          <Text style={[typography.title, { color: colors.textPrimary }]}>Home</Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>Overview</Text>
        </View>
        <View style={{ width: 36 }} />
      </View>

      <GlassCard style={styles.summaryCard}>
        <View style={styles.summaryHeader}>
          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600" }]}>
            This Week Overview
          </Text>
          <SyncStatusBadge state="synced" />
        </View>
        <View style={styles.statsRow}>
          <Stat label="Trips Logged" value={String(tripsThisWeek)} unit="" />
          <Stat label="Total Distance" value={String(totalDistanceThisWeek)} unit="km" />
          <Stat label="Fuel Issued" value="0" unit="L" />
        </View>
      </GlassCard>

      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600" }]}>
            Recent Trips
          </Text>
          {recentTrips.length > 0 ? (
            <Pressable onPress={() => router.push("/(tabs)/trips")}>
              <Text style={[typography.caption, { color: colors.primary, fontWeight: "600" }]}>See all</Text>
            </Pressable>
          ) : null}
        </View>

        {recentTrips.length === 0 ? (
          <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 8 }]}>
            {vehicles.length === 0 || drivers.length === 0
              ? "Add a vehicle and driver to start logging trips."
              : "No trips logged yet."}
          </Text>
        ) : (
          <View style={{ marginTop: 12 }}>
            {recentTrips.map((trip) => (
              <RecentTripRow
                key={trip.id}
                trip={trip}
                vehicleLabel={
                  vehicleById.get(trip.vehicle_id)
                    ? `${vehicleById.get(trip.vehicle_id)!.make} · ${vehicleById.get(trip.vehicle_id)!.plate_number}`
                    : "Unknown vehicle"
                }
                driverName={driverById.get(trip.driver_id)?.name ?? "Unknown driver"}
                onPress={() => router.push({ pathname: "/(tabs)/trips/[id]", params: { id: trip.id } })}
              />
            ))}
          </View>
        )}
      </View>

      <View style={styles.section}>
        <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600", marginBottom: 12 }]}>
          Quick Actions
        </Text>
        <View style={styles.quickActionsGrid}>
          {QUICK_ACTIONS.map((action) => (
            <Pressable
              key={action.key}
              onPress={() => handleQuickAction(action.key)}
              style={[styles.quickAction, { backgroundColor: action.color, borderRadius: radii.card }]}
            >
              <Feather name={action.icon} size={20} color="#fff" />
              <Text style={styles.quickActionLabel}>{action.label}</Text>
              <Text style={styles.quickActionSublabel}>{action.sublabel}</Text>
            </Pressable>
          ))}
        </View>
      </View>
    </ScrollView>
  );

  function Stat({ label, value, unit }: { label: string; value: string; unit: string }) {
    return (
      <View style={styles.stat}>
        <Text style={[typography.display, tabularNumsStyle, { color: colors.textPrimary, fontSize: 24 }]}>
          {value}
          {unit ? <Text style={{ fontSize: 14, fontWeight: "400" }}> {unit}</Text> : null}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 2 }]}>{label}</Text>
      </View>
    );
  }
}

function RecentTripRow({
  trip,
  vehicleLabel,
  driverName,
  onPress,
}: {
  trip: Trip;
  vehicleLabel: string;
  driverName: string;
  onPress: () => void;
}) {
  const { colors, typography, radii, tabularNumsStyle } = useTheme();
  const isComplete = isTripComplete(trip);

  return (
    <Pressable
      onPress={onPress}
      style={[styles.recentRow, { backgroundColor: colors.surfaceSolid, borderRadius: radii.card }]}
    >
      <View style={[styles.recentIcon, { backgroundColor: colors.lightAccent, borderRadius: radii.card }]}>
        <Feather name="truck" size={16} color={colors.deepAccent} />
      </View>
      <View style={styles.recentDetails}>
        <Text style={[typography.caption, { color: colors.textPrimary, fontWeight: "600" }]} numberOfLines={1}>
          {vehicleLabel}
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]} numberOfLines={1}>
          {driverName} · {formatDisplayDate(trip.trip_date)} {formatTimeDisplay(trip.time_out)}
        </Text>
      </View>
      {isComplete ? (
        <Text style={[typography.body, tabularNumsStyle, { color: colors.primary, fontWeight: "700" }]}>
          {trip.distance_km} km
        </Text>
      ) : (
        <Text style={{ color: "#D9A441", fontSize: 11, fontWeight: "600" }}>In Progress</Text>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  content: {
    padding: 20,
    paddingBottom: 140,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  menuButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  summaryCard: {
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  statsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  stat: {
    flex: 1,
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  recentRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
    padding: 12,
    marginBottom: 8,
  },
  recentIcon: {
    width: 32,
    height: 32,
    alignItems: "center",
    justifyContent: "center",
  },
  recentDetails: {
    flex: 1,
  },
  quickActionsGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
  },
  quickAction: {
    width: "47%",
    padding: 16,
    gap: 4,
  },
  quickActionLabel: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 15,
    marginTop: 8,
  },
  quickActionSublabel: {
    color: "rgba(255,255,255,0.8)",
    fontSize: 12,
  },
});
