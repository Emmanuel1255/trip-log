import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { DriverForm, type DriverFormValues } from "@/components/drivers/DriverForm";
import { StepProgress } from "@/components/onboarding/StepProgress";
import { useSession } from "@/lib/auth/SessionProvider";
import { insertDriver } from "@/lib/db/queries/drivers";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function AddFirstDriverScreen() {
  const { colors, typography } = useTheme();
  const { session } = useSession();
  const [saving, setSaving] = useState(false);

  const handleSave = async (values: DriverFormValues) => {
    if (!session?.user.id) return;
    setSaving(true);
    try {
      await insertDriver({
        userId: session.user.id,
        name: values.name,
        phone: values.phone ? `+232${values.phone.replace(/^0+/, "")}` : null,
        licenseNumber: values.licenseNumber || null,
        licenseExpiry: values.licenseExpiry ? values.licenseExpiry.toISOString().slice(0, 10) : null,
      });
      router.push("/(onboarding)/setup-complete");
    } finally {
      setSaving(false);
    }
  };

  return (
    <KeyboardAwareScrollView
      style={[styles.flex, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bottomOffset={40}
    >
      <StepProgress step={6} totalSteps={8} />
      <View style={[styles.iconWrap, { backgroundColor: colors.lightAccent, borderRadius: 999 }]}>
        <Feather name="user" size={32} color={colors.deepAccent} />
      </View>
      <Text style={[typography.title, { color: colors.textPrimary, textAlign: "center" }]}>
        Add Your First Driver
      </Text>

      <View style={styles.form}>
        <DriverForm submitLabel="Save Driver" saving={saving} onSubmit={handleSave} />
      </View>

      <Pressable onPress={() => router.push("/(onboarding)/setup-complete")} style={styles.skip}>
        <Text style={[typography.body, { color: colors.primary }]}>Skip for now</Text>
      </Pressable>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  container: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  iconWrap: {
    alignSelf: "center",
    width: 72,
    height: 72,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
  },
  form: {
    marginTop: 24,
  },
  skip: {
    alignItems: "center",
    marginTop: 16,
  },
});
