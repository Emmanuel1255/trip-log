import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { deleteDriver, getDriver } from "@/lib/db/queries/drivers";
import type { Driver } from "@/lib/db/types";
import { formatDisplayDate } from "@/lib/utils/date";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function DriverDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography } = useTheme();
  const [driver, setDriver] = useState<Driver | null>(null);

  useEffect(() => {
    if (id) getDriver(id).then(setDriver);
  }, [id]);

  if (!driver) return null;

  const handleDelete = () => {
    Alert.alert("Delete Driver", `Remove ${driver.name}? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteDriver(driver.id);
          router.back();
        },
      },
    ]);
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Driver Details</Text>
        <View style={styles.headerActions}>
          <Pressable onPress={() => router.push(`/(tabs)/vehicles-drivers/drivers/${driver.id}/edit`)}>
            <Feather name="edit-2" size={20} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={handleDelete}>
            <Feather name="trash-2" size={20} color={colors.alert} />
          </Pressable>
        </View>
      </View>

      <Card>
        <Text style={[typography.title, { color: colors.textPrimary }]}>{driver.name}</Text>
        {driver.phone ? (
          <Text style={[typography.body, { color: colors.textSecondary, marginTop: 2 }]}>{driver.phone}</Text>
        ) : null}

        <View style={styles.rows}>
          {driver.license_number ? (
            <Row label="License Number" value={driver.license_number} colors={colors} />
          ) : null}
          {driver.license_expiry ? (
            <Row label="License Expiry" value={formatDisplayDate(driver.license_expiry)} colors={colors} />
          ) : null}
        </View>
      </Card>

      <View style={styles.section}>
        <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600", marginBottom: 8 }]}>
          Trip History
        </Text>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>
          Trip history arrives with Milestone 2.
        </Text>
      </View>
    </ScrollView>
  );
}

function Row({ label, value, colors }: { label: string; value: string; colors: any }) {
  return (
    <View style={styles.row}>
      <Text style={{ color: colors.textSecondary }}>{label}</Text>
      <Text style={{ color: colors.textPrimary, fontWeight: "600" }}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 100,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  headerActions: {
    flexDirection: "row",
    gap: 16,
  },
  rows: {
    marginTop: 16,
    gap: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  section: {
    marginTop: 24,
  },
});
