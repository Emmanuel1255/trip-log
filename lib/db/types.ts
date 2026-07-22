export type FuelType = "petrol" | "diesel";

export interface Driver {
  id: string;
  user_id: string;
  name: string;
  phone: string | null;
  license_number: string | null;
  license_photo_url: string | null;
  license_expiry: string | null; // ISO date
  synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Vehicle {
  id: string;
  user_id: string;
  plate_number: string;
  make: string;
  fuel_type: FuelType;
  active: boolean;
  default_driver_id: string | null;
  starting_odometer: number | null;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Trip {
  id: string;
  user_id: string;
  trip_number: string;
  vehicle_id: string;
  driver_id: string;
  trip_date: string; // ISO date
  departure_location: string;
  time_out: string; // HH:mm
  arrival_location: string;
  time_in: string; // HH:mm
  passengers: string | null;
  opening_odometer: number;
  closing_odometer: number;
  distance_km: number;
  notes: string | null;
  synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface FuelEntry {
  id: string;
  user_id: string;
  vehicle_id: string;
  trip_id: string | null;
  litres: number;
  cost: number | null;
  fuel_date: string; // ISO date
  synced_at: string | null;
  created_at: string;
  updated_at: string;
}

export type SyncEntityType = "vehicle" | "driver" | "trip" | "fuel_entry";
export type SyncOperation = "insert" | "update" | "delete";
export type SyncStatus = "pending" | "in_flight" | "error";

export interface SyncQueueRow {
  id: number;
  entity_type: SyncEntityType;
  entity_id: string;
  operation: SyncOperation;
  payload: string | null;
  created_at: string;
  attempt_count: number;
  last_attempt_at: string | null;
  status: SyncStatus;
  last_error: string | null;
}
