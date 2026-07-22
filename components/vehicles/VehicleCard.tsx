import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import type { Vehicle } from "@/lib/db/types";
import { useTheme } from "@/lib/theme/ThemeProvider";

export function VehicleCard({ vehicle, onPress }: { vehicle: Vehicle; onPress: () => void }) {
  const { colors, typography, radii } = useTheme();

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={[styles.icon, { backgroundColor: colors.lightAccent, borderRadius: radii.card }]}>
          <Feather name="truck" size={20} color={colors.deepAccent} />
        </View>
        <View style={styles.details}>
          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600" }]}>
            {vehicle.plate_number}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {vehicle.make} · {vehicle.fuel_type === "petrol" ? "Petrol" : "Diesel"}
          </Text>
        </View>
        <View
          style={[
            styles.statusBadge,
            { backgroundColor: vehicle.active ? `${colors.success}22` : `${colors.textSecondary}22` },
          ]}
        >
          <Text style={{ color: vehicle.active ? colors.success : colors.textSecondary, fontSize: 12, fontWeight: "600" }}>
            {vehicle.active ? "Active" : "Inactive"}
          </Text>
        </View>
      </Card>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 12,
  },
  icon: {
    width: 44,
    height: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  details: {
    flex: 1,
  },
  statusBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
});
