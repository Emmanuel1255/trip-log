import * as Crypto from "expo-crypto";
import { getDb } from "@/lib/db/client";
import type { FuelEntry } from "@/lib/db/types";
import { useFuelVersionStore } from "@/lib/state/fuelStore";
import { enqueue } from "@/lib/sync/outbox";
import { nowIso } from "@/lib/utils/date";

export interface FuelFilters {
  vehicleId?: string;
  tripId?: string;
  dateFrom?: string; // ISO date, inclusive
  dateTo?: string; // ISO date, inclusive
}

export interface NewFuelEntryInput {
  userId: string;
  vehicleId: string;
  tripId?: string | null;
  litres: number;
  cost?: number | null;
  fuelDate: string; // ISO date
}

export async function listFuelEntries(userId: string, filters: FuelFilters = {}): Promise<FuelEntry[]> {
  const db = getDb();
  const clauses = ["user_id = ?"];
  const params: (string | number)[] = [userId];

  if (filters.vehicleId) {
    clauses.push("vehicle_id = ?");
    params.push(filters.vehicleId);
  }
  if (filters.tripId) {
    clauses.push("trip_id = ?");
    params.push(filters.tripId);
  }
  if (filters.dateFrom) {
    clauses.push("fuel_date >= ?");
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    clauses.push("fuel_date <= ?");
    params.push(filters.dateTo);
  }

  return db.getAllAsync<FuelEntry>(
    `SELECT * FROM fuel_entries WHERE ${clauses.join(" AND ")} ORDER BY fuel_date DESC, created_at DESC`,
    ...params
  );
}

export async function getFuelEntry(id: string): Promise<FuelEntry | null> {
  const db = getDb();
  return db.getFirstAsync<FuelEntry>(`SELECT * FROM fuel_entries WHERE id = ?`, id);
}

export async function insertFuelEntry(input: NewFuelEntryInput): Promise<FuelEntry> {
  const db = getDb();
  const id = Crypto.randomUUID();
  const timestamp = nowIso();

  const entry: FuelEntry = {
    id,
    user_id: input.userId,
    vehicle_id: input.vehicleId,
    trip_id: input.tripId ?? null,
    litres: input.litres,
    cost: input.cost ?? null,
    fuel_date: input.fuelDate,
    synced_at: null,
    created_at: timestamp,
    updated_at: timestamp,
  };

  await db.runAsync(
    `INSERT INTO fuel_entries (id, user_id, vehicle_id, trip_id, litres, cost, fuel_date, synced_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    entry.id,
    entry.user_id,
    entry.vehicle_id,
    entry.trip_id,
    entry.litres,
    entry.cost,
    entry.fuel_date,
    entry.synced_at,
    entry.created_at,
    entry.updated_at
  );

  await enqueue("fuel_entry", id, "insert", entry);
  useFuelVersionStore.getState().bump();
  return entry;
}

export async function updateFuelEntry(
  id: string,
  updates: Partial<Pick<FuelEntry, "vehicle_id" | "trip_id" | "litres" | "cost" | "fuel_date">>
): Promise<FuelEntry> {
  const db = getDb();
  const existing = await getFuelEntry(id);
  if (!existing) throw new Error(`Fuel entry ${id} not found`);

  const updated: FuelEntry = { ...existing, ...updates, updated_at: nowIso() };

  await db.runAsync(
    `UPDATE fuel_entries SET vehicle_id = ?, trip_id = ?, litres = ?, cost = ?, fuel_date = ?, updated_at = ? WHERE id = ?`,
    updated.vehicle_id,
    updated.trip_id,
    updated.litres,
    updated.cost,
    updated.fuel_date,
    updated.updated_at,
    id
  );

  await enqueue("fuel_entry", id, "update", updated);
  useFuelVersionStore.getState().bump();
  return updated;
}

export async function deleteFuelEntry(id: string): Promise<void> {
  const db = getDb();
  await db.runAsync(`DELETE FROM fuel_entries WHERE id = ?`, id);
  await enqueue("fuel_entry", id, "delete", null);
  useFuelVersionStore.getState().bump();
}
