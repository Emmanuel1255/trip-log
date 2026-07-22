import { Feather } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import type { Driver } from "@/lib/db/types";
import { useTheme } from "@/lib/theme/ThemeProvider";

function isExpiringSoon(licenseExpiry: string | null): "valid" | "expiring" | "expired" | null {
  if (!licenseExpiry) return null;
  const daysUntil = (new Date(licenseExpiry).getTime() - Date.now()) / (1000 * 60 * 60 * 24);
  if (daysUntil < 0) return "expired";
  if (daysUntil <= 30) return "expiring";
  return "valid";
}

export function DriverCard({ driver, onPress }: { driver: Driver; onPress: () => void }) {
  const { colors, typography, radii } = useTheme();
  const licenseState = isExpiringSoon(driver.license_expiry);

  return (
    <Pressable onPress={onPress}>
      <Card style={styles.card}>
        <View style={[styles.icon, { backgroundColor: colors.lightAccent, borderRadius: 999 }]}>
          <Feather name="user" size={20} color={colors.deepAccent} />
        </View>
        <View style={styles.details}>
          <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600" }]}>
            {driver.name}
          </Text>
          <Text style={[typography.caption, { color: colors.textSecondary }]}>
            {driver.phone ?? "No phone on file"}
          </Text>
        </View>
        {licenseState ? (
          <View
            style={[
              styles.statusBadge,
              {
                backgroundColor:
                  licenseState === "valid" ? `${colors.success}22` : `${colors.alert}22`,
                borderRadius: radii.card,
              },
            ]}
          >
            <Text
              style={{
                color: licenseState === "valid" ? colors.success : colors.alert,
                fontSize: 11,
                fontWeight: "600",
              }}
            >
              {licenseState === "valid" ? "Valid" : licenseState === "expiring" ? "Expiring" : "Expired"}
            </Text>
          </View>
        ) : null}
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
  },
});
