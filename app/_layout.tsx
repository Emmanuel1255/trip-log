import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LogFuelSheet } from "@/components/fuel/LogFuelSheet";
import { LogTripSheet } from "@/components/trips/LogTripSheet";
import { AppLockProvider } from "@/lib/auth/AppLockProvider";
import { SessionProvider } from "@/lib/auth/SessionProvider";
import { initDb } from "@/lib/db/client";
import { ThemeProvider } from "@/lib/theme/ThemeProvider";

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function RootLayout() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    initDb()
      .catch((error) => console.error("Failed to initialize local database", error))
      .finally(() => {
        setIsReady(true);
        SplashScreen.hideAsync().catch(() => {});
      });
  }, []);

  if (!isReady) return null;

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <KeyboardProvider>
        <SafeAreaProvider>
          <ThemeProvider>
            <SessionProvider>
              <AppLockProvider>
                <BottomSheetModalProvider>
                  <Stack initialRouteName="index" screenOptions={{ headerShown: false }}>
                    <Stack.Screen name="index" />
                    <Stack.Screen
                      name="settings/index"
                      options={{ presentation: "modal", animation: "slide_from_bottom" }}
                    />
                    <Stack.Screen
                      name="settings/change-pin"
                      options={{ presentation: "modal", animation: "slide_from_bottom" }}
                    />
                  </Stack>
                  <LogTripSheet />
                  <LogFuelSheet />
                </BottomSheetModalProvider>
              </AppLockProvider>
            </SessionProvider>
          </ThemeProvider>
        </SafeAreaProvider>
      </KeyboardProvider>
    </GestureHandlerRootView>
  );
}
