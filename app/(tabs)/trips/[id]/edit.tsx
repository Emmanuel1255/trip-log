import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Button } from "@/components/ui/Button";
import { TripFormFields } from "@/components/trips/TripFormFields";
import { useTripForm } from "@/components/trips/useTripForm";
import { useDrivers } from "@/hooks/useDrivers";
import { useVehicles } from "@/hooks/useVehicles";
import { deleteTrip, getTrip, updateTrip } from "@/lib/db/queries/trips";
import type { Trip } from "@/lib/db/types";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { formatTime24h, parseTimeToDate } from "@/lib/utils/date";

function EditTripForm({ trip }: { trip: Trip }) {
  const { colors } = useTheme();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const tripDate = new Date(`${trip.trip_date}T00:00:00`);
  const { values, setters, distanceKm, odometerError, isValid } = useTripForm({
    initialValues: {
      tripDate,
      vehicleId: trip.vehicle_id,
      driverId: trip.driver_id,
      departureLocation: trip.departure_location,
      timeOut: parseTimeToDate(trip.time_out, tripDate),
      arrivalLocation: trip.arrival_location,
      timeIn: trip.time_in ? parseTimeToDate(trip.time_in, tripDate) : null,
      passengers: trip.passengers ?? "",
      openingOdometer: String(trip.opening_odometer),
      closingOdometer: trip.closing_odometer != null ? String(trip.closing_odometer) : "",
      notes: trip.notes ?? "",
    },
  });

  const vehicleOptions = vehicles.map((v) => ({ label: `${v.plate_number} · ${v.make}`, value: v.id }));
  const driverOptions = drivers.map((d) => ({ label: d.name, value: d.id }));

  const handleSave = async () => {
    if (!values.vehicleId || !values.driverId || !values.timeOut) return;
    setSaving(true);
    setSubmitError(null);
    try {
      await updateTrip(trip.id, {
        vehicle_id: values.vehicleId,
        driver_id: values.driverId,
        trip_date: values.tripDate.toISOString().slice(0, 10),
        departure_location: values.departureLocation.trim(),
        time_out: formatTime24h(values.timeOut),
        arrival_location: values.arrivalLocation.trim(),
        time_in: values.timeIn ? formatTime24h(values.timeIn) : null,
        passengers: values.passengers || null,
        opening_odometer: Number(values.openingOdometer),
        closing_odometer: values.closingOdometer ? Number(values.closingOdometer) : null,
        notes: values.notes || null,
      });
      router.back();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save changes.");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = () => {
    Alert.alert("Delete Trip", "Remove this trip from the log? This cannot be undone.", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteTrip(trip.id);
          router.dismissTo(`/(tabs)/trips`);
        },
      },
    ]);
  };

  return (
    <>
      <TripFormFields
        values={values}
        setters={setters}
        vehicleOptions={vehicleOptions}
        driverOptions={driverOptions}
        distanceKm={distanceKm}
        odometerError={odometerError}
      />

      {submitError ? (
        <Text style={{ color: colors.alert, marginBottom: 12 }}>{submitError}</Text>
      ) : null}

      <Button label="Save Changes" onPress={handleSave} loading={saving} disabled={!isValid} />

      <Pressable onPress={handleDelete} style={styles.deleteLink}>
        <Text style={{ color: colors.alert, fontWeight: "600" }}>Delete Trip</Text>
      </Pressable>
    </>
  );
}

export default function EditTripScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography } = useTheme();
  const [trip, setTrip] = useState<Trip | null>(null);

  useEffect(() => {
    if (id) getTrip(id).then(setTrip);
  }, [id]);

  return (
    <KeyboardAwareScrollView
      style={[styles.flex, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bottomOffset={40}
    >
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Edit Trip</Text>
        <View style={{ width: 24 }} />
      </View>

      {trip ? <EditTripForm trip={trip} /> : null}
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 60,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  deleteLink: {
    alignItems: "center",
    marginTop: 16,
  },
});
