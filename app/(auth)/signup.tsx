import { Feather } from "@expo/vector-icons";
import { router } from "expo-router";
import { useState } from "react";
import { Image, Pressable, StyleSheet, Text, View } from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-controller";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { signUp } from "@/lib/auth/session";
import { useTheme } from "@/lib/theme/ThemeProvider";

export default function SignupScreen() {
  const { colors, typography } = useTheme();
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [awaitingConfirmation, setAwaitingConfirmation] = useState(false);

  const canSubmit =
    fullName.trim().length > 0 &&
    email.trim().length > 0 &&
    password.length >= 6 &&
    password === confirmPassword;

  const handleSignup = async () => {
    setError(null);

    if (password !== confirmPassword) {
      setError("Passwords don't match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      const { session } = await signUp(email.trim(), password, fullName.trim());
      if (session) {
        router.replace("/");
      } else {
        setAwaitingConfirmation(true);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign up failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (awaitingConfirmation) {
    return (
      <View style={[styles.flex, styles.confirmContainer, { backgroundColor: colors.background }]}>
        <Feather name="mail" size={48} color={colors.primary} style={styles.confirmIcon} />
        <Text style={[typography.title, { color: colors.textPrimary, textAlign: "center" }]}>
          Check your email
        </Text>
        <Text
          style={[
            typography.body,
            { color: colors.textSecondary, textAlign: "center", marginTop: 8 },
          ]}
        >
          We sent a confirmation link to {email.trim()}. Confirm your address, then log in.
        </Text>
        <View style={styles.confirmAction}>
          <Button label="Back to Login" onPress={() => router.replace("/(auth)/login")} />
        </View>
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={[styles.flex, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.container}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      bottomOffset={40}
    >
      <View style={styles.header}>
        <Image
          source={require("@/assets/images/icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
        <Text style={[typography.title, { color: colors.textPrimary, marginTop: 16 }]}>
          Create Account
        </Text>
        <Text style={[typography.body, { color: colors.textSecondary, marginTop: 4 }]}>
          Set up your TripLog operator account
        </Text>
      </View>

      <TextField label="Full Name" placeholder="Jane Operator" value={fullName} onChangeText={setFullName} />
      <TextField
        label="Email"
        placeholder="you@example.com"
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
      />
      <TextField
        label="Password"
        placeholder="At least 6 characters"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextField
        label="Confirm Password"
        placeholder="Re-enter your password"
        secureTextEntry
        value={confirmPassword}
        onChangeText={setConfirmPassword}
      />

      {error ? (
        <Text style={[typography.caption, { color: colors.alert, marginBottom: 12 }]}>{error}</Text>
      ) : null}

      <Button label="Sign Up" onPress={handleSignup} loading={loading} disabled={!canSubmit} />

      <Pressable onPress={() => router.back()} style={styles.loginLink}>
        <Text style={[typography.body, { color: colors.textSecondary }]}>
          Already have an account? <Text style={{ color: colors.primary, fontWeight: "600" }}>Log In</Text>
        </Text>
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
    paddingHorizontal: 24,
    paddingVertical: 40,
  },
  confirmContainer: {
    justifyContent: "center",
    paddingHorizontal: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 32,
  },
  logo: {
    width: 96,
    height: 96,
  },
  loginLink: {
    alignItems: "center",
    marginTop: 20,
  },
  confirmIcon: {
    alignSelf: "center",
    marginBottom: 16,
  },
  confirmAction: {
    marginTop: 32,
  },
});
