import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { VehicleForm, type VehicleFormValues } from "@/components/vehicles/VehicleForm";
import { useSession } from "@/lib/auth/SessionProvider";
import { insertVehicle } from "@/lib/db/queries/vehicles";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function AddVehicleScreen() {
  const { colors, typography } = useTheme();
  const { session } = useSession();
  const [saving, setSaving] = useState(false);

  const handleSave = async (values: VehicleFormValues) => {
    if (!session?.user.id) return;
    setSaving(true);
    try {
      await insertVehicle({
        userId: session.user.id,
        plateNumber: values.plateNumber,
        make: values.make,
        fuelType: values.fuelType,
        startingOdometer: values.startingOdometer ? Number(values.startingOdometer) : null,
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
        <Text style={[typography.title, { color: colors.textPrimary }]}>Add Vehicle</Text>
        <View style={{ width: 24 }} />
      </View>

      <VehicleForm submitLabel="Save Vehicle" saving={saving} onSubmit={handleSave} />

      <Pressable onPress={() => router.back()} style={styles.cancel}>
        <Text style={[typography.body, { color: colors.primary }]}>Cancel</Text>
      </Pressable>
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
  cancel: {
    alignItems: "center",
    marginTop: 16,
  },
});
