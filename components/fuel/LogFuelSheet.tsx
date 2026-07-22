import { BottomSheetModal, BottomSheetScrollView, BottomSheetTextInput } from "@gorhom/bottom-sheet";
import { useEffect, useMemo, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { Button } from "@/components/ui/Button";
import { DateTimeField } from "@/components/ui/DateTimeField";
import { SelectField } from "@/components/ui/SelectField";
import { TextField } from "@/components/ui/TextField";
import { useLogFuelSheetStore, useRegisterLogFuelSheetRef } from "@/hooks/useLogFuelSheet";
import { useVehicles } from "@/hooks/useVehicles";
import { useSession } from "@/lib/auth/SessionProvider";
import { insertFuelEntry } from "@/lib/db/queries/fuelEntries";
import { getTrip } from "@/lib/db/queries/trips";
import type { Trip } from "@/lib/db/types";
import { useTheme } from "@/lib/theme/ThemeProvider";

function LogFuelSheetForm({ onSaved }: { onSaved: () => void }) {
  const { colors, typography } = useTheme();
  const { session } = useSession();
  const { vehicles } = useVehicles();
  const presentOptions = useLogFuelSheetStore((s) => s.presentOptions);

  const [linkedTrip, setLinkedTrip] = useState<Trip | null>(null);
  const [litres, setLitres] = useState("");
  const [fuelDate, setFuelDate] = useState(new Date());
  const [cost, setCost] = useState("");
  const [vehicleId, setVehicleId] = useState<string | null>(presentOptions?.vehicleId ?? null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (presentOptions?.tripId) {
      getTrip(presentOptions.tripId).then((trip) => {
        setLinkedTrip(trip);
        if (trip) setVehicleId(trip.vehicle_id);
      });
    }
  }, [presentOptions?.tripId]);

  const vehicleOptions = vehicles.map((v) => ({ label: `${v.plate_number} · ${v.make}`, value: v.id }));
  const isVehicleLocked = Boolean(presentOptions?.tripId);
  const litresValue = parseFloat(litres);
  const isValid = Boolean(vehicleId && Number.isFinite(litresValue) && litresValue > 0);

  const handleSave = async () => {
    if (!session?.user.id || !vehicleId) return;
    setError(null);
    setSaving(true);
    try {
      await insertFuelEntry({
        userId: session.user.id,
        vehicleId,
        tripId: presentOptions?.tripId ?? null,
        litres: litresValue,
        cost: cost ? Number(cost) : null,
        fuelDate: fuelDate.toISOString().slice(0, 10),
      });
      onSaved();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save fuel entry.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={styles.content}>
      <Text style={[typography.title, { color: colors.textPrimary, marginBottom: 4 }]}>Log Fuel</Text>
      {linkedTrip ? (
        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 16 }]}>
          Linked to trip {linkedTrip.trip_number}
        </Text>
      ) : (
        <View style={{ marginBottom: 16 }} />
      )}

      <View style={styles.litresRow}>
        <Text style={[typography.caption, { color: colors.textSecondary, marginBottom: 6 }]}>Litres</Text>
        <View style={styles.litresInputRow}>
          <BottomSheetTextInput
            keyboardType="decimal-pad"
            placeholder="0.0"
            placeholderTextColor={colors.textSecondary}
            value={litres}
            onChangeText={setLitres}
            style={[styles.litresInput, { color: colors.primary }]}
          />
          <Text style={[typography.title, { color: colors.textSecondary }]}>L</Text>
        </View>
      </View>

      <DateTimeField label="Date" mode="date" value={fuelDate} onChange={setFuelDate} />

      <SelectField
        label="Vehicle"
        placeholder="Select vehicle"
        value={vehicleId}
        options={vehicleOptions}
        onChange={setVehicleId}
        disabled={isVehicleLocked}
        emptyMessage="Add a vehicle first from the Vehicles & Drivers tab."
      />

      <TextField
        as={BottomSheetTextInput}
        label="Cost (Optional)"
        placeholder="0.00"
        keyboardType="decimal-pad"
        value={cost}
        onChangeText={setCost}
      />

      {error ? (
        <Text style={[typography.caption, { color: colors.alert, marginBottom: 12 }]}>{error}</Text>
      ) : null}

      <Button label="Save Fuel Entry" onPress={handleSave} loading={saving} disabled={!isValid} />
    </View>
  );
}

export function LogFuelSheet() {
  const { colors, radii } = useTheme();
  const ref = useRegisterLogFuelSheetRef();
  const [formKey, setFormKey] = useState(0);
  const snapPoints = useMemo(() => ["70%"], []);

  return (
    <BottomSheetModal
      ref={ref}
      snapPoints={snapPoints}
      backgroundStyle={{
        backgroundColor: colors.surfaceSolid,
        borderTopLeftRadius: radii.glass,
        borderTopRightRadius: radii.glass,
      }}
      handleIndicatorStyle={{ backgroundColor: colors.separator, width: 40, height: 4 }}
      enablePanDownToClose
      keyboardBehavior="extend"
      keyboardBlurBehavior="restore"
      onDismiss={() => setFormKey((key) => key + 1)}
    >
      <BottomSheetScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
        <LogFuelSheetForm key={formKey} onSaved={() => ref.current?.dismiss()} />
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
  litresRow: {
    marginBottom: 16,
  },
  litresInputRow: {
    flexDirection: "row",
    alignItems: "baseline",
    gap: 8,
  },
  litresInput: {
    fontSize: 40,
    fontWeight: "700",
    minWidth: 120,
    padding: 0,
  },
});
