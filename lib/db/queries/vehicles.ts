import * as Crypto from "expo-crypto";
import { getDb } from "@/lib/db/client";
import type { Vehicle } from "@/lib/db/types";
import { enqueue } from "@/lib/sync/outbox";
import { nowIso } from "@/lib/utils/date";

export interface NewVehicleInput {
  userId: string;
  plateNumber: string;
  make: string;
  fuelType: "petrol" | "diesel";
  defaultDriverId?: string | null;
  startingOdometer?: number | null;
}

function rowToVehicle(row: any): Vehicle {
  return { ...row, active: !!row.active };
}

export async function listVehicles(userId: string): Promise<Vehicle[]> {
  const db = getDb();
  const rows = await db.getAllAsync<any>(
    `SELECT * FROM vehicles WHERE user_id = ? ORDER BY created_at DESC`,
    userId
  );
  return rows.map(rowToVehicle);
}

export async function getVehicle(id: string): Promise<Vehicle | null> {
  const db = getDb();
  const row = await db.getFirstAsync<any>(`SELECT * FROM vehicles WHERE id = ?`, id);
  return row ? rowToVehicle(row) : null;
}

export async function insertVehicle(input: NewVehicleInput): Promise<Vehicle> {
  const db = getDb();
  const id = Crypto.randomUUID();
  const timestamp = nowIso();

  const vehicle: Vehicle = {
    id,
    user_id: input.userId,
    plate_number: input.plateNumber,
    make: input.make,
    fuel_type: input.fuelType,
    active: true,
    default_driver_id: input.defaultDriverId ?? null,
    starting_odometer: input.startingOdometer ?? null,
    synced_at: null,
    created_at: timestamp,
    updated_at: timestamp,
  };

  await db.runAsync(
    `INSERT INTO vehicles (id, user_id, plate_number, make, fuel_type, active, default_driver_id, starting_odometer, synced_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    vehicle.id,
    vehicle.user_id,
    vehicle.plate_number,
    vehicle.make,
    vehicle.fuel_type,
    1,
    vehicle.default_driver_id,
    vehicle.starting_odometer,
    vehicle.synced_at,
    vehicle.created_at,
    vehicle.updated_at
  );

  await enqueue("vehicle", id, "insert", vehicle);
  return vehicle;
}

export async function updateVehicle(
  id: string,
  updates: Partial<Omit<Vehicle, "id" | "user_id" | "created_at">>
): Promise<Vehicle> {
  const db = getDb();
  const existing = await getVehicle(id);
  if (!existing) throw new Error(`Vehicle ${id} not found`);

  const updated: Vehicle = { ...existing, ...updates, updated_at: nowIso() };

  await db.runAsync(
    `UPDATE vehicles SET plate_number = ?, make = ?, fuel_type = ?, active = ?, default_driver_id = ?, starting_odometer = ?, updated_at = ? WHERE id = ?`,
    updated.plate_number,
    updated.make,
    updated.fuel_type,
    updated.active ? 1 : 0,
    updated.default_driver_id,
    updated.starting_odometer,
    updated.updated_at,
    id
  );

  await enqueue("vehicle", id, "update", updated);
  return updated;
}

export async function deleteVehicle(id: string): Promise<void> {
  const db = getDb();
  await db.runAsync(`DELETE FROM vehicles WHERE id = ?`, id);
  await enqueue("vehicle", id, "delete", null);
}
