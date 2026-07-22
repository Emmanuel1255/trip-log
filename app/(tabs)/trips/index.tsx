import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useMemo, useState } from "react";
import { Alert, SectionList, StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { TripFilterBar } from "@/components/trips/TripFilterBar";
import { TripRow } from "@/components/trips/TripRow";
import { useDrivers } from "@/hooks/useDrivers";
import { useLogTripSheet } from "@/hooks/useLogTripSheet";
import { useTrips } from "@/hooks/useTrips";
import { useVehicles } from "@/hooks/useVehicles";
import { deleteTrip } from "@/lib/db/queries/trips";
import type { Trip } from "@/lib/db/types";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { type DatePreset, getDatePresetRange, getRelativeDateLabel } from "@/lib/utils/date";

interface TripSection {
  title: string;
  data: Trip[];
}

export default function TripsScreen() {
  const { colors, typography } = useTheme();
  const logTripSheet = useLogTripSheet();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();

  const [search, setSearch] = useState("");
  const [vehicleId, setVehicleId] = useState<string | null>(null);
  const [driverId, setDriverId] = useState<string | null>(null);
  const [datePreset, setDatePreset] = useState<DatePreset>("all");

  const { dateFrom, dateTo } = getDatePresetRange(datePreset);
  const { trips } = useTrips({ vehicleId: vehicleId ?? undefined, driverId: driverId ?? undefined, dateFrom, dateTo });

  const vehicleById = useMemo(() => new Map(vehicles.map((v) => [v.id, v])), [vehicles]);
  const driverById = useMemo(() => new Map(drivers.map((d) => [d.id, d])), [drivers]);

  const filteredTrips = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return trips;
    return trips.filter((trip) => {
      const vehicle = vehicleById.get(trip.vehicle_id);
      const driver = driverById.get(trip.driver_id);
      const haystack = [
        vehicle?.plate_number,
        vehicle?.make,
        driver?.name,
        trip.departure_location,
        trip.arrival_location,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase();
      return haystack.includes(query);
    });
  }, [trips, search, vehicleById, driverById]);

  const sections: TripSection[] = useMemo(() => {
    const byDate = new Map<string, Trip[]>();
    for (const trip of filteredTrips) {
      const bucket = byDate.get(trip.trip_date) ?? [];
      bucket.push(trip);
      byDate.set(trip.trip_date, bucket);
    }
    return Array.from(byDate.entries())
      .sort(([a], [b]) => (a < b ? 1 : -1))
      .map(([date, data]) => ({ title: getRelativeDateLabel(date), data }));
  }, [filteredTrips]);

  const handleDelete = (trip: Trip) => {
    Alert.alert("Delete Trip", "Remove this trip from the log? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      { text: "Delete", style: "destructive", onPress: () => deleteTrip(trip.id) },
    ]);
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.title, { color: colors.textPrimary }]}>Trips</Text>
      <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 16 }]}>
        All Trip Logs
      </Text>

      <TextField
        placeholder="Search trips, vehicle, driver..."
        value={search}
        onChangeText={setSearch}
      />

      <View style={styles.filterBar}>
        <TripFilterBar
          vehicles={vehicles}
          drivers={drivers}
          vehicleId={vehicleId}
          driverId={driverId}
          datePreset={datePreset}
          onChangeVehicle={setVehicleId}
          onChangeDriver={setDriverId}
          onChangeDatePreset={setDatePreset}
        />
      </View>

      {sections.length === 0 ? (
        <View style={styles.empty}>
          <Feather name="clipboard" size={40} color={colors.textSecondary} />
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 12, textAlign: "center" }]}>
            {vehicles.length === 0 || drivers.length === 0
              ? "Add a vehicle and driver first, then log your first trip."
              : "No trips match your filters yet."}
          </Text>
        </View>
      ) : (
        <SectionList
          sections={sections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          stickySectionHeadersEnabled={false}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={[typography.caption, { color: colors.textSecondary, fontWeight: "600" }]}>
                {section.title}
              </Text>
              <Text style={[typography.caption, { color: colors.textSecondary }]}>
                {section.data.length} {section.data.length === 1 ? "Trip" : "Trips"}
              </Text>
            </View>
          )}
          renderItem={({ item }) => (
            <TripRow
              trip={item}
              vehicle={vehicleById.get(item.vehicle_id)}
              driver={driverById.get(item.driver_id)}
              onPress={() => router.push({ pathname: "/(tabs)/trips/[id]", params: { id: item.id } })}
              onDelete={() => handleDelete(item)}
            />
          )}
        />
      )}

      <View style={styles.logButton}>
        <Button label="+ Log Trip" onPress={() => logTripSheet.present()} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
  },
  filterBar: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
    marginTop: 4,
  },
  list: {
    paddingBottom: 100,
  },
  empty: {
    alignItems: "center",
    marginTop: 60,
    paddingHorizontal: 32,
  },
  logButton: {
    position: "absolute",
    left: 20,
    right: 20,
    bottom: 96,
  },
});
