import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { FlatList, Pressable, StyleSheet, Text, View } from "react-native";
import { DriverCard } from "@/components/drivers/DriverCard";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { VehicleCard } from "@/components/vehicles/VehicleCard";
import { useDrivers } from "@/hooks/useDrivers";
import { useVehicles } from "@/hooks/useVehicles";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function VehiclesDriversScreen() {
  const { colors, typography } = useTheme();
  const [section, setSection] = useState<"vehicles" | "drivers">("vehicles");
  const { vehicles, refresh: refreshVehicles } = useVehicles();
  const { drivers, refresh: refreshDrivers } = useDrivers();

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Vehicles & Drivers</Text>
        <Pressable
          onPress={() =>
            router.push(
              section === "vehicles"
                ? "/(tabs)/vehicles-drivers/vehicles/add"
                : "/(tabs)/vehicles-drivers/drivers/add"
            )
          }
          style={[styles.addButton, { backgroundColor: colors.primary }]}
        >
          <Feather name="plus" size={20} color="#fff" />
        </Pressable>
      </View>

      <View style={styles.segment}>
        <SegmentedControl
          options={[
            { label: "Vehicles", value: "vehicles" },
            { label: "Drivers", value: "drivers" },
          ]}
          value={section}
          onChange={setSection}
        />
      </View>

      {section === "vehicles" ? (
        <FlatList
          data={vehicles}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={refreshVehicles}
          refreshing={false}
          ListEmptyComponent={
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: "center", marginTop: 40 }]}>
              No vehicles yet. Tap + to add one.
            </Text>
          }
          renderItem={({ item }) => (
            <VehicleCard
              vehicle={item}
              onPress={() => router.push(`/(tabs)/vehicles-drivers/vehicles/${item.id}`)}
            />
          )}
        />
      ) : (
        <FlatList
          data={drivers}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={refreshDrivers}
          refreshing={false}
          ListEmptyComponent={
            <Text style={[typography.body, { color: colors.textSecondary, textAlign: "center", marginTop: 40 }]}>
              No drivers yet. Tap + to add one.
            </Text>
          }
          renderItem={({ item }) => (
            <DriverCard
              driver={item}
              onPress={() => router.push(`/(tabs)/vehicles-drivers/drivers/${item.id}`)}
            />
          )}
        />
      )}
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
    marginBottom: 16,
  },
  addButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: "center",
    justifyContent: "center",
  },
  segment: {
    marginBottom: 16,
  },
  list: {
    paddingBottom: 140,
  },
});
