import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";
import { Card } from "@/components/ui/Card";
import { SegmentedControl } from "@/components/ui/SegmentedControl";
import { useSession } from "@/lib/auth/SessionProvider";
import { signOut } from "@/lib/auth/session";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function SettingsScreen() {
  const { colors, typography, preference, setPreference } = useTheme();
  const { session } = useSession();

  const handleLogout = async () => {
    await signOut();
    router.replace("/(auth)/login");
  };

  return (
    <ScrollView style={{ backgroundColor: colors.background }} contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Settings</Text>
        <View style={{ width: 24 }} />
      </View>

      <Card style={styles.card}>
        <Text style={[typography.caption, { color: colors.textSecondary }]}>Signed in as</Text>
        <Text style={[typography.body, { color: colors.textPrimary, fontWeight: "600", marginTop: 4 }]}>
          {session?.user.email ?? "-"}
        </Text>
      </Card>

      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 24, marginBottom: 8 }]}>
        APP LOCK
      </Text>
      <Card style={styles.card}>
        <Pressable style={styles.row} onPress={() => router.push("/settings/change-pin")}>
          <Text style={[typography.body, { color: colors.textPrimary }]}>Change PIN</Text>
          <Feather name="chevron-right" size={18} color={colors.textSecondary} />
        </Pressable>
      </Card>

      <Text style={[typography.caption, { color: colors.textSecondary, marginTop: 24, marginBottom: 8 }]}>
        APPEARANCE
      </Text>
      <Card style={styles.card}>
        <SegmentedControl
          options={[
            { label: "System", value: "system" },
            { label: "Light", value: "light" },
            { label: "Dark", value: "dark" },
          ]}
          value={preference}
          onChange={setPreference}
        />
      </Card>

      <Pressable style={styles.logout} onPress={handleLogout}>
        <Text style={{ color: colors.alert, fontWeight: "600" }}>Log Out</Text>
      </Pressable>
    </ScrollView>
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
  card: {
    marginBottom: 4,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  logout: {
    alignItems: "center",
    marginTop: 32,
  },
});
