import * as Crypto from "expo-crypto";
import { getDb } from "@/lib/db/client";
import type { Trip } from "@/lib/db/types";
import { useTripsVersionStore } from "@/lib/state/tripsStore";
import { enqueue } from "@/lib/sync/outbox";
import { calculateDistanceKmOrNull } from "@/lib/utils/distance";
import { nowIso } from "@/lib/utils/date";
import { formatTripNumber } from "@/lib/utils/tripNumber";

export interface TripFilters {
  vehicleId?: string;
  driverId?: string;
  dateFrom?: string; // ISO date, inclusive
  dateTo?: string; // ISO date, inclusive
}

export interface NewTripInput {
  userId: string;
  vehicleId: string;
  driverId: string;
  tripDate: string; // ISO date
  departureLocation: string;
  timeOut: string; // HH:mm
  arrivalLocation: string;
  timeIn?: string | null; // HH:mm, omit while the trip is in progress
  passengers?: string | null;
  openingOdometer: number;
  closingOdometer?: number | null; // omit while the trip is in progress
  notes?: string | null;
}

async function nextTripSequence(userId: string, year: string): Promise<number> {
  const db = getDb();
  const row = await db.getFirstAsync<{ count: number }>(
    `SELECT COUNT(*) as count FROM trips WHERE user_id = ? AND substr(trip_date, 1, 4) = ?`,
    userId,
    year
  );
  return (row?.count ?? 0) + 1;
}

export async function listTrips(userId: string, filters: TripFilters = {}): Promise<Trip[]> {
  const db = getDb();
  const clauses = ["user_id = ?"];
  const params: (string | number)[] = [userId];

  if (filters.vehicleId) {
    clauses.push("vehicle_id = ?");
    params.push(filters.vehicleId);
  }
  if (filters.driverId) {
    clauses.push("driver_id = ?");
    params.push(filters.driverId);
  }
  if (filters.dateFrom) {
    clauses.push("trip_date >= ?");
    params.push(filters.dateFrom);
  }
  if (filters.dateTo) {
    clauses.push("trip_date <= ?");
    params.push(filters.dateTo);
  }

  return db.getAllAsync<Trip>(
    `SELECT * FROM trips WHERE ${clauses.join(" AND ")} ORDER BY trip_date DESC, time_out DESC`,
    ...params
  );
}

export async function getTrip(id: string): Promise<Trip | null> {
  const db = getDb();
  return db.getFirstAsync<Trip>(`SELECT * FROM trips WHERE id = ?`, id);
}

export async function getLatestTripForVehicle(vehicleId: string): Promise<Trip | null> {
  const db = getDb();
  return db.getFirstAsync<Trip>(
    `SELECT * FROM trips WHERE vehicle_id = ? ORDER BY trip_date DESC, time_out DESC LIMIT 1`,
    vehicleId
  );
}

export async function insertTrip(input: NewTripInput): Promise<Trip> {
  const db = getDb();
  const id = Crypto.randomUUID();
  const timestamp = nowIso();
  const year = input.tripDate.slice(0, 4);
  const sequence = await nextTripSequence(input.userId, year);

  const trip: Trip = {
    id,
    user_id: input.userId,
    trip_number: formatTripNumber(Number(year), sequence),
    vehicle_id: input.vehicleId,
    driver_id: input.driverId,
    trip_date: input.tripDate,
    departure_location: input.departureLocation,
    time_out: input.timeOut,
    arrival_location: input.arrivalLocation,
    time_in: input.timeIn ?? null,
    passengers: input.passengers ?? null,
    opening_odometer: input.openingOdometer,
    closing_odometer: input.closingOdometer ?? null,
    distance_km: calculateDistanceKmOrNull(input.openingOdometer, input.closingOdometer),
    notes: input.notes ?? null,
    synced_at: null,
    created_at: timestamp,
    updated_at: timestamp,
  };

  await db.runAsync(
    `INSERT INTO trips (id, user_id, trip_number, vehicle_id, driver_id, trip_date, departure_location, time_out, arrival_location, time_in, passengers, opening_odometer, closing_odometer, distance_km, notes, synced_at, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    trip.id,
    trip.user_id,
    trip.trip_number,
    trip.vehicle_id,
    trip.driver_id,
    trip.trip_date,
    trip.departure_location,
    trip.time_out,
    trip.arrival_location,
    trip.time_in,
    trip.passengers,
    trip.opening_odometer,
    trip.closing_odometer,
    trip.distance_km,
    trip.notes,
    trip.synced_at,
    trip.created_at,
    trip.updated_at
  );

  await enqueue("trip", id, "insert", trip);
  useTripsVersionStore.getState().bump();
  return trip;
}

export async function updateTrip(
  id: string,
  updates: Partial<
    Pick<
      Trip,
      | "vehicle_id"
      | "driver_id"
      | "trip_date"
      | "departure_location"
      | "time_out"
      | "arrival_location"
      | "time_in"
      | "passengers"
      | "opening_odometer"
      | "closing_odometer"
      | "notes"
    >
  >
): Promise<Trip> {
  const db = getDb();
  const existing = await getTrip(id);
  if (!existing) throw new Error(`Trip ${id} not found`);

  const merged = { ...existing, ...updates };
  const updated: Trip = {
    ...merged,
    distance_km: calculateDistanceKmOrNull(merged.opening_odometer, merged.closing_odometer),
    updated_at: nowIso(),
  };

  await db.runAsync(
    `UPDATE trips SET vehicle_id = ?, driver_id = ?, trip_date = ?, departure_location = ?, time_out = ?, arrival_location = ?, time_in = ?, passengers = ?, opening_odometer = ?, closing_odometer = ?, distance_km = ?, notes = ?, updated_at = ? WHERE id = ?`,
    updated.vehicle_id,
    updated.driver_id,
    updated.trip_date,
    updated.departure_location,
    updated.time_out,
    updated.arrival_location,
    updated.time_in,
    updated.passengers,
    updated.opening_odometer,
    updated.closing_odometer,
    updated.distance_km,
    updated.notes,
    updated.updated_at,
    id
  );

  await enqueue("trip", id, "update", updated);
  useTripsVersionStore.getState().bump();
  return updated;
}

export async function deleteTrip(id: string): Promise<void> {
  const db = getDb();
  await db.runAsync(`DELETE FROM trips WHERE id = ?`, id);
  await enqueue("trip", id, "delete", null);
  useTripsVersionStore.getState().bump();
}
