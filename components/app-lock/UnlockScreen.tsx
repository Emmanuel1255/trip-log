import * as LocalAuthentication from "expo-local-authentication";
import { useCallback, useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import Animated from "react-native-reanimated";
import { NumericPad } from "@/components/ui/NumericPad";
import { PinDots } from "@/components/ui/PinDots";
import { usePinShake } from "@/hooks/usePinShake";
import {
  APP_LOCK_MAX_ATTEMPTS,
  getCooldownUntil,
  isBiometricEnabled,
  registerFailedAttempt,
  resetFailedAttempts,
  verifyPin,
} from "@/lib/auth/appLock";
import { useTheme } from "@/lib/theme/ThemeProvider";

const PIN_LENGTH = 6;

interface UnlockScreenProps {
  onUnlock: () => void;
}

export function UnlockScreen({ onUnlock }: UnlockScreenProps) {
  const { colors, typography } = useTheme();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [cooldownRemaining, setCooldownRemaining] = useState(0);
  const [biometricAvailable, setBiometricAvailable] = useState(false);
  const { shakeStyle, triggerShake } = usePinShake();

  const attemptBiometric = useCallback(async () => {
    const enabled = await isBiometricEnabled();
    if (!enabled) return;
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();
    if (!hasHardware || !isEnrolled) return;
    setBiometricAvailable(true);
    const result = await LocalAuthentication.authenticateAsync({
      promptMessage: "Unlock TripLog",
    });
    if (result.success) {
      await resetFailedAttempts();
      onUnlock();
    }
  }, [onUnlock]);

  useEffect(() => {
    getCooldownUntil().then((until) => {
      if (until && until > Date.now()) {
        setCooldownRemaining(Math.ceil((until - Date.now()) / 1000));
      }
    });
    attemptBiometric();
  }, [attemptBiometric]);

  useEffect(() => {
    if (cooldownRemaining <= 0) return;
    const interval = setInterval(() => {
      setCooldownRemaining((seconds) => Math.max(0, seconds - 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [cooldownRemaining]);

  const handleDigit = async (digit: string) => {
    if (cooldownRemaining > 0) return;
    const next = (pin + digit).slice(0, PIN_LENGTH);
    setPin(next);
    setError(null);

    if (next.length >= 4) {
      const isMatch = await verifyPin(next);
      if (isMatch) {
        await resetFailedAttempts();
        onUnlock();
        return;
      }
      if (next.length === PIN_LENGTH) {
        const { attempts, cooldownUntil } = await registerFailedAttempt();
        setPin("");
        triggerShake();
        if (cooldownUntil) {
          setCooldownRemaining(Math.ceil((cooldownUntil - Date.now()) / 1000));
          setError("Too many attempts. Try again shortly.");
        } else {
          setError(`Incorrect PIN. ${APP_LOCK_MAX_ATTEMPTS - attempts} attempts remaining.`);
        }
      }
    }
  };

  const handleBackspace = () => setPin((current) => current.slice(0, -1));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[typography.title, { color: colors.textPrimary, textAlign: "center" }]}>
        App Lock
      </Text>
      <Text
        style={[typography.body, { color: colors.textSecondary, textAlign: "center", marginTop: 4 }]}
      >
        Enter your PIN to continue
      </Text>

      <Animated.View style={shakeStyle}>
        <PinDots length={PIN_LENGTH} filled={pin.length} />
      </Animated.View>

      {error ? (
        <Text style={[typography.caption, { color: colors.alert, textAlign: "center" }]}>
          {error}
        </Text>
      ) : null}

      {cooldownRemaining > 0 ? (
        <Text
          style={[typography.caption, { color: colors.alert, textAlign: "center", marginTop: 8 }]}
        >
          Locked for {cooldownRemaining}s
        </Text>
      ) : (
        <View style={styles.pad}>
          <NumericPad
            onDigit={handleDigit}
            onBackspace={handleBackspace}
            onBiometric={attemptBiometric}
            showBiometric={biometricAvailable}
          />
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    paddingHorizontal: 32,
  },
  pad: {
    marginTop: 24,
  },
});
