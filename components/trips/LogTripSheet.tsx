import {
  BottomSheetModal,
  BottomSheetScrollView,
  BottomSheetTextInput,
} from "@gorhom/bottom-sheet";
import { useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { GlassSheetBackground } from "@/components/ui/GlassSheetBackground";
import { TripFormFields } from "./TripFormFields";
import { useTripForm } from "./useTripForm";
import { useDrivers } from "@/hooks/useDrivers";
import { useLogTripSheetStore, useRegisterLogTripSheetRef } from "@/hooks/useLogTripSheet";
import { useVehicles } from "@/hooks/useVehicles";
import { useSession } from "@/lib/auth/SessionProvider";
import { insertTrip } from "@/lib/db/queries/trips";
import { useTheme } from "@/lib/theme/ThemeProvider";
import { formatTime24h } from "@/lib/utils/date";

function LogTripSheetForm({ onSaved }: { onSaved: () => void }) {
  const { colors, typography } = useTheme();
  const { session } = useSession();
  const { vehicles } = useVehicles();
  const { drivers } = useDrivers();
  const presentOptions = useLogTripSheetStore((s) => s.presentOptions);
  const { values, setters, distanceKm, odometerError, isValid } = useTripForm({
    initialValues: {
      vehicleId: presentOptions?.vehicleId ?? null,
      driverId: presentOptions?.driverId ?? null,
    },
    autoFillOpeningOdometer: true,
  });
  const [saving, setSaving] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const vehicleOptions = vehicles.map((v) => ({ label: `${v.plate_number} · ${v.make}`, value: v.id }));
  const driverOptions = drivers.map((d) => ({ label: d.name, value: d.id }));

  const handleSave = async () => {
    if (!session?.user.id || !values.vehicleId || !values.driverId || !values.timeOut) {
      return;
    }
    setSaving(true);
    setSubmitError(null);
    try {
      await insertTrip({
        userId: session.user.id,
        vehicleId: values.vehicleId,
        driverId: values.driverId,
        tripDate: values.tripDate.toISOString().slice(0, 10),
        departureLocation: values.departureLocation.trim(),
        timeOut: formatTime24h(values.timeOut),
        arrivalLocation: values.arrivalLocation.trim(),
        timeIn: values.timeIn ? formatTime24h(values.timeIn) : null,
        passengers: values.passengers || null,
        openingOdometer: Number(values.openingOdometer),
        closingOdometer: values.closingOdometer ? Number(values.closingOdometer) : null,
        notes: values.notes || null,
      });
      onSaved();
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Failed to save trip.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.content}>
      <Text style={[typography.title, { color: colors.textPrimary, marginBottom: 16 }]}>Log Trip</Text>

      <TripFormFields
        values={values}
        setters={setters}
        vehicleOptions={vehicleOptions}
        driverOptions={driverOptions}
        distanceKm={distanceKm}
        odometerError={odometerError}
        textInputComponent={BottomSheetTextInput}
      />

      {submitError ? (
        <Text style={[typography.caption, { color: colors.alert, marginBottom: 12 }]}>{submitError}</Text>
      ) : null}

      <Button label="Save Trip" onPress={handleSave} loading={saving} disabled={!isValid} />
    </View>
  );
}

export function LogTripSheet() {
  const ref = useRegisterLogTripSheetRef();
  const [formKey, setFormKey] = useState(0);
  const snapPoints = useMemo(() => ["90%"], []);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backgroundComponent={GlassSheetBackground}
      enablePanDownToClose
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      onDismiss={() => setFormKey((key) => key + 1)}
    >
      <BottomSheetScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        <LogTripSheetForm key={formKey} onSaved={() => ref.current?.dismiss()} />
      </BottomSheetScrollView>
    </BottomSheetModal>
  );
}

const styles = StyleSheet.create({
  scrollContent: {
    paddingBottom: 40,
  },
  content: {
    padding: 20,
  },
});
