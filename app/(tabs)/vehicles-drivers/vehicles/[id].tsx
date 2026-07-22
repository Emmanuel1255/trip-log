import { Feather } from "@expo/vector-icons";
import { router, useLocalSearchParams } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { deleteVehicle, getVehicle } from "@/lib/db/queries/vehicles";
import type { Vehicle } from "@/lib/db/types";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function VehicleDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { colors, typography } = useTheme();
  const [vehicle, setVehicle] = useState<Vehicle | null>(null);

  useEffect(() => {
    if (id) getVehicle(id).then(setVehicle);
  }, [id]);

  if (!vehicle) return null;

  const handleDelete = () => {
    Alert.alert("Delete Vehicle", `Remove ${vehicle.plate_number}? This cannot be undone.`, [
      { text: "Cancel", style: "cancel" },
      {
        text: "Delete",
        style: "destructive",
        onPress: async () => {
          await deleteVehicle(vehicle.id);
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
        <Text style={[typography.title, { color: colors.textPrimary }]}>Vehicle Details</Text>
        <View style={styles.headerActions}>
          <Pressable onPress={() => router.push(`/(tabs)/vehicles-drivers/vehicles/${vehicle.id}/edit`)}>
            <Feather name="edit-2" size={20} color={colors.textPrimary} />
          </Pressable>
          <Pressable onPress={handleDelete}>
            <Feather name="trash-2" size={20} color={colors.alert} />
          </Pressable>
        </View>
      </View>

      <Card>
        <Text style={[typography.title, { color: colors.textPrimary }]}>{vehicle.plate_number}</Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 2 }]}>{vehicle.make}</Text>

        <View style={styles.rows}>
          <Row label="Fuel Type" value={vehicle.fuel_type === "petrol" ? "Petrol" : "Diesel"} colors={colors} />
          <Row label="Status" value={vehicle.active ? "Active" : "Inactive"} colors={colors} />
          {vehicle.starting_odometer != null ? (
            <Row label="Starting Odometer" value={`${vehicle.starting_odometer} km`} colors={colors} />
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
