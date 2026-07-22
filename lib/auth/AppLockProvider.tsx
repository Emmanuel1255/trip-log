import { createContext, useContext, useEffect, useRef, useState } from "react";
import { AppState, StyleSheet, View, type AppStateStatus } from "react-native";
import { UnlockScreen } from "@/components/app-lock/UnlockScreen";
import { hasPinSetup } from "@/lib/auth/appLock";

interface AppLockContextValue {
  isLocked: boolean;
  lock: () => void;
}

const AppLockContext = createContext<AppLockContextValue>({
  isLocked: false,
  lock: () => {},
});

export function useAppLock() {
  return useContext(AppLockContext);
}

export function AppLockProvider({ children }: { children: React.ReactNode }) {
  const [isLocked, setIsLocked] = useState(false);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  useEffect(() => {
    hasPinSetup().then((hasPin) => {
      if (hasPin) setIsLocked(true);
    });

    const subscription = AppState.addEventListener("change", async (nextState) => {
      const cameToForeground =
        appState.current.match(/inactive|background/) && nextState === "active";
      appState.current = nextState;

      if (cameToForeground) {
        const hasPin = await hasPinSetup();
        if (hasPin) setIsLocked(true);
      }
    });

    return () => subscription.remove();
  }, []);

  const lock = () => setIsLocked(true);
  const unlock = () => setIsLocked(false);

  return (
    <AppLockContext.Provider value={{ isLocked, lock }}>
      <View style={styles.fill}>
        {children}
        {isLocked ? (
          <View style={StyleSheet.absoluteFill}>
            <UnlockScreen onUnlock={unlock} />
          </View>
        ) : null}
      </View>
    </AppLockContext.Provider>
  );
}

const styles = StyleSheet.create({
  fill: {
    flex: 1,
  },
});
