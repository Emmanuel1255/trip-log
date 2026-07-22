import * as Crypto from "expo-crypto";
import * as SecureStore from "expo-secure-store";

const KEYS = {
  pinHash: "triplog.pinHash",
  pinSalt: "triplog.pinSalt",
  biometricEnabled: "triplog.biometricEnabled",
  failedAttempts: "triplog.failedAttempts",
  cooldownUntil: "triplog.cooldownUntil",
} as const;

const MAX_ATTEMPTS = 5;
const COOLDOWN_MS = 30_000;

function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

async function hashPin(pin: string, salt: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, `${salt}:${pin}`);
}

export async function hasPinSetup(): Promise<boolean> {
  const hash = await SecureStore.getItemAsync(KEYS.pinHash);
  return hash != null;
}

export async function setupPin(pin: string): Promise<void> {
  const saltBytes = await Crypto.getRandomBytesAsync(16);
  const salt = bytesToHex(saltBytes);
  const hash = await hashPin(pin, salt);
  await SecureStore.setItemAsync(KEYS.pinSalt, salt);
  await SecureStore.setItemAsync(KEYS.pinHash, hash);
}

export async function verifyPin(pin: string): Promise<boolean> {
  const salt = await SecureStore.getItemAsync(KEYS.pinSalt);
  const storedHash = await SecureStore.getItemAsync(KEYS.pinHash);
  if (!salt || !storedHash) return false;
  const hash = await hashPin(pin, salt);
  return hash === storedHash;
}

export async function setBiometricEnabled(enabled: boolean): Promise<void> {
  await SecureStore.setItemAsync(KEYS.biometricEnabled, enabled ? "true" : "false");
}

export async function isBiometricEnabled(): Promise<boolean> {
  const value = await SecureStore.getItemAsync(KEYS.biometricEnabled);
  return value === "true";
}

export async function getFailedAttempts(): Promise<number> {
  const value = await SecureStore.getItemAsync(KEYS.failedAttempts);
  return value ? parseInt(value, 10) : 0;
}

export async function registerFailedAttempt(): Promise<{
  attempts: number;
  cooldownUntil: number | null;
}> {
  const attempts = (await getFailedAttempts()) + 1;
  await SecureStore.setItemAsync(KEYS.failedAttempts, String(attempts));

  if (attempts >= MAX_ATTEMPTS) {
    const cooldownUntil = Date.now() + COOLDOWN_MS;
    await SecureStore.setItemAsync(KEYS.cooldownUntil, String(cooldownUntil));
    return { attempts, cooldownUntil };
  }
  return { attempts, cooldownUntil: null };
}

export async function resetFailedAttempts(): Promise<void> {
  await SecureStore.deleteItemAsync(KEYS.failedAttempts);
  await SecureStore.deleteItemAsync(KEYS.cooldownUntil);
}

export async function getCooldownUntil(): Promise<number | null> {
  const value = await SecureStore.getItemAsync(KEYS.cooldownUntil);
  return value ? parseInt(value, 10) : null;
}

export async function clearAppLock(): Promise<void> {
  await Promise.all([
    SecureStore.deleteItemAsync(KEYS.pinHash),
    SecureStore.deleteItemAsync(KEYS.pinSalt),
    SecureStore.deleteItemAsync(KEYS.biometricEnabled),
    SecureStore.deleteItemAsync(KEYS.failedAttempts),
    SecureStore.deleteItemAsync(KEYS.cooldownUntil),
  ]);
}

export const APP_LOCK_MAX_ATTEMPTS = MAX_ATTEMPTS;
export const APP_LOCK_COOLDOWN_MS = COOLDOWN_MS;
