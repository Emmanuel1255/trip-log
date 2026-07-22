import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DriverForm, type DriverFormValues } from "@/components/drivers/DriverForm";
import { getDriver, updateDriver } from "@/lib/db/queries/drivers";
import type { Driver } from "@/lib/db/types";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function EditDriverScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography } = useTheme();
  const [driver, setDriver] = useState<Driver | null>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (id) getDriver(id).then(setDriver);
  }, [id]);

  if (!driver) return null;

  const handleSave = async (values: DriverFormValues) => {
    setSaving(true);
    try {
      await updateDriver(driver.id, {
        name: values.name,
        phone: values.phone || null,
        license_number: values.licenseNumber || null,
        license_expiry: values.licenseExpiry ? values.licenseExpiry.toISOString().slice(0, 10) : null,
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
        <Text style={[typography.title, { color: colors.textPrimary }]}>Edit Driver</Text>
        <View style={{ width: 24 }} />
      </View>

      <DriverForm
        submitLabel="Save Changes"
        saving={saving}
        onSubmit={handleSave}
        initialValues={{
          name: driver.name,
          phone: driver.phone ?? "",
          licenseNumber: driver.license_number ?? "",
          licenseExpiry: driver.license_expiry ? new Date(driver.license_expiry) : null,
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
