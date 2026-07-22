import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { NumericPad } from "@/components/ui/NumericPad";
import { PinDots } from "@/components/ui/PinDots";
import { setupPin, verifyPin } from "@/lib/auth/appLock";
import { useTheme } from "@/lib/theme/ThemeProvider";

const PIN_LENGTH = 6;

type Phase = "verify" | "create" | "confirm";

export default function ChangePinScreen() {
  const { colors, typography } = useTheme();
  const [phase, setPhase] = useState<Phase>("verify");
  const [firstPin, setFirstPin] = useState("");
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  const titles: Record<Phase, string> = {
    verify: "Enter current PIN",
    create: "Create new PIN",
    confirm: "Confirm new PIN",
  };

  const handleDigit = async (digit: string) => {
    const next = (pin + digit).slice(0, PIN_LENGTH);
    setPin(next);
    setError(null);

    if (next.length !== PIN_LENGTH) return;

    if (phase === "verify") {
      const ok = await verifyPin(next);
      if (ok) {
        setPin("");
        setPhase("create");
      } else {
        setError("Incorrect PIN.");
        setPin("");
      }
      return;
    }

    if (phase === "create") {
      setFirstPin(next);
      setPin("");
      setPhase("confirm");
      return;
    }

    if (phase === "confirm") {
      if (next === firstPin) {
        await setupPin(next);
        router.back();
      } else {
        setError("PINs don't match. Try again.");
        setPin("");
        setFirstPin("");
        setPhase("create");
      }
    }
  };

  const handleBackspace = () => setPin((current) => current.slice(0, -1));

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Pressable onPress={() => router.back()}>
          <Feather name="chevron-left" size={24} color={colors.textPrimary} />
        </Pressable>
        <Text style={[typography.title, { color: colors.textPrimary }]}>Change PIN</Text>
        <View style={{ width: 24 }} />
      </View>

      <Text style={[typography.body, { color: colors.textSecondary, textAlign: "center", marginTop: 40 }]}>
        {titles[phase]}
      </Text>

      <PinDots length={PIN_LENGTH} filled={pin.length} />

      {error ? (
        <Text style={[typography.caption, { color: colors.alert, textAlign: "center" }]}>{error}</Text>
      ) : null}

      <View style={styles.pad}>
        <NumericPad onDigit={handleDigit} onBackspace={handleBackspace} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 32,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 60,
  },
  pad: {
    marginTop: 24,
  },
});
