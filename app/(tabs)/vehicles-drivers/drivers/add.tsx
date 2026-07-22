import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { DriverForm, type DriverFormValues } from "@/components/drivers/DriverForm";
import { useSession } from "@/lib/auth/SessionProvider";
import { insertDriver } from "@/lib/db/queries/drivers";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function AddDriverScreen() {
  const { colors, typography } = useTheme();
  const { session } = useSession();
  const [saving, setSaving] = useState(false);

  const handleSave = async (values: DriverFormValues) => {
    if (!session?.user.id) return;
    setSaving(true);
    try {
      await insertDriver({
        userId: session.user.id,
        name: values.name,
        phone: values.phone ? `+232${values.phone.replace(/^0+/, "")}` : null,
        licenseNumber: values.licenseNumber || null,
        licenseExpiry: values.licenseExpiry ? values.licenseExpiry.toISOString().slice(0, 10) : null,
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
        <Text style={[typography.title, { color: colors.textPrimary }]}>Add Driver</Text>
        <View style={{ width: 24 }} />
      </View>

      <DriverForm submitLabel="Save Driver" saving={saving} onSubmit={handleSave} />

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
