import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { VehicleForm, type VehicleFormValues } from "@/components/vehicles/VehicleForm";
import { getVehicle, updateVehicle } from "@/lib/db/queries/vehicles";
import type { Vehicle } from "@/lib/db/types";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function EditVehicleScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography } = useTheme();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) getVehicle(id).then(setVehicle);
  }, [id]);

  if (!vehicle) return null;

  const handleSave = async (values: VehicleFormValues) => {
    setSaving(true);
    try {
      await updateVehicle(vehicle.id, {
        plate_number: values.plateNumber,
        make: values.make,
        fuel_type: values.fuelType,
        starting_odometer: values.startingOdometer ? Number(values.startingOdometer) : null,
      });
      router.back();
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Edit Vehicle</Text>
        <View style={{ width: 24 }} />
      </View>

      <VehicleForm
        submitLabel="Save Changes"
        saving={saving}
        onSubmit={handleSave}
        initialValues={{
          plateNumber: vehicle.plate_number,
          make: vehicle.make,
          fuelType: vehicle.fuel_type,
          startingOdometer: vehicle.starting_odometer != null ? String(vehicle.starting_odometer) : "",
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
});
