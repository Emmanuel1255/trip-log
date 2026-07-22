import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { VehicleForm, type VehicleFormValues } from "@/components/vehicles/VehicleForm";
import { StepProgress } from "@/components/onboarding/StepProgress";
import { useSession } from "@/lib/auth/SessionProvider";
import { insertVehicle } from "@/lib/db/queries/vehicles";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function AddFirstVehicleScreen() {
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
      router.push("/(onboarding)/add-first-driver");
    } finally {
      setSaving(false);
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <StepProgress step={5} totalSteps={8} />
      <View style={[styles.iconWrap, { backgroundColor: colors.lightAccent, borderRadius: 999 }]}>
        <Feather name="truck" size={32} color={colors.deepAccent} />
      </View>
      <Text style={[typography.title, { color: colors.textPrimary, textAlign: "center" }]}>
        Add Your First Vehicle
      </Text>

      <View style={styles.form}>
        <VehicleForm submitLabel="Save Vehicle" saving={saving} onSubmit={handleSave} />
      </View>

      <Pressable onPress={() => router.push("/(onboarding)/add-first-driver")} style={styles.skip}>
        <Text style={[typography.body, { color: colors.primary }]}>Skip for now</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  iconWrap: {
    alignSelf: "center",
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  form: {
    marginTop: 24,
  },
  skip: {
    alignItems: "center",
    marginTop: 16,
  },
});
