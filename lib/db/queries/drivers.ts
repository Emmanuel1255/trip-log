import * as Crypto from "expo-crypto";
import { getDb } from "@/lib/db/client";
import type { Driver } from "@/lib/db/types";
import { enqueue } from "@/lib/sync/outbox";
import { nowIso } from "@/lib/utils/date";

export interface NewDriverInput {
  userId: string;
  name: string;
  phone?: string | null;
  licenseNumber?: string | null;
  licensePhotoUrl?: string | null;
  licenseExpiry?: string | null;
}

export async function listDrivers(userId: string): Promise<Driver[]> {
  const db = getDb();
  return db.getAllAsync<Driver>(
    `SELECT * FROM drivers WHERE user_id = ? ORDER BY created_at DESC`,
    userId
  );
}

export async function getDriver(id: string): Promise<Driver | null> {
  const db = getDb();
  return db.getFirstAsync<Driver>(`SELECT * FROM drivers WHERE id = ?`, id);
}

export async function insertDriver(input: NewDriverInput): Promise<Driver> {
  const db = getDb();
  const id = Crypto.randomUUID();
  const timestamp = nowIso();

  const driver: Driver = {
    id,
    user_id: input.userId,
    name: input.name,
    phone: input.phone ?? null,
    license_number: input.licenseNumber ?? null,
    license_photo_url: input.licensePhotoUrl ?? null,
    license_expiry: input.licenseExpiry ?? null,
    synced_at: null,
    created_at: timestamp,
    updated_at: timestamp,
  };

  await db.runAsync(
    `INSERT INTO drivers (id, user_id, name, phone, license_number, license_photo_url, license_expiry, synced_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    driver.id,
    driver.user_id,
    driver.name,
    driver.phone,
    driver.license_number,
    driver.license_photo_url,
    driver.license_expiry,
    driver.synced_at,
    driver.created_at,
    driver.updated_at
  );

  await enqueue("driver", id, "insert", driver);
  return driver;
}

export async function updateDriver(
  id: string,
  updates: Partial<Omit<Driver, "id" | "user_id" | "created_at">>
): Promise<Driver> {
  const db = getDb();
  const existing = await getDriver(id);
  if (!existing) throw new Error(`Driver ${id} not found`);

  const updated: Driver = { ...existing, ...updates, updated_at: nowIso() };

  await db.runAsync(
    `UPDATE drivers SET name = ?, phone = ?, license_number = ?, license_photo_url = ?, license_expiry = ?, updated_at = ? WHERE id = ?`,
    updated.name,
    updated.phone,
    updated.license_number,
    updated.license_photo_url,
    updated.license_expiry,
    updated.updated_at,
    id
  );

  await enqueue("driver", id, "update", updated);
  return updated;
}

export async function deleteDriver(id: string): Promise<void> {
  const db = getDb();
  await db.runAsync(`DELETE FROM drivers WHERE id = ?`, id);
  await enqueue("driver", id, "delete", null);
}
