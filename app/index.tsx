import { Redirect } from "expo-router";
import { useEffect, useState } from "react";
import { ActivityIndicator, View } from "react-native";
import { useSession } from "@/lib/auth/SessionProvider";
import { hasPinSetup } from "@/lib/auth/appLock";
import { listVehicles } from "@/lib/db/queries/vehicles";
import { listDrivers } from "@/lib/db/queries/drivers";
import { useTheme } from "@/lib/theme/ThemeProvider";

type Destination = "/(auth)/login" | "/(onboarding)/app-lock-setup" | "/(onboarding)/first-run-setup" | "/(tabs)";

export default function Splash() {
  const { session, isLoading: sessionLoading } = useSession();
  const { colors } = useTheme();
  const [destination, setDestination] = useState<Destination | null>(null);

  useEffect(() => {
    if (sessionLoading) return;

    if (!session) {
      setDestination("/(auth)/login");
      return;
    }

    (async () => {
      const pinReady = await hasPinSetup();
      if (!pinReady) {
        setDestination("/(onboarding)/app-lock-setup");
        return;
      }

      const [vehicles, drivers] = await Promise.all([
        listVehicles(session.user.id),
        listDrivers(session.user.id),
      ]);

      if (vehicles.length === 0 || drivers.length === 0) {
        setDestination("/(onboarding)/first-run-setup");
        return;
      }

      setDestination("/(tabs)");
    })();
  }, [session, sessionLoading]);

  if (!destination) {
    return (
      <View style={{ flex: 1, alignItems: "center", justifyContent: "center", backgroundColor: colors.background }}>
        <ActivityIndicator color={colors.primary} />
      </View>
    );
  }

  return <Redirect href={destination} />;
}
