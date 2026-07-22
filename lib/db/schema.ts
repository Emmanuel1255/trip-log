export const SCHEMA_VERSION = 1;

export const CREATE_TABLES_SQL = `
CREATE TABLE IF NOT EXISTS drivers (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  name TEXT NOT NULL,
  phone TEXT,
  license_number TEXT,
  license_photo_url TEXT,
  license_expiry TEXT,
  synced_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS vehicles (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plate_number TEXT NOT NULL,
  make TEXT NOT NULL,
  fuel_type TEXT NOT NULL CHECK (fuel_type IN ('petrol','diesel')),
  active INTEGER NOT NULL DEFAULT 1,
  default_driver_id TEXT,
  starting_odometer REAL,
  synced_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (default_driver_id) REFERENCES drivers(id)
);

CREATE TABLE IF NOT EXISTS trips (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  trip_number TEXT NOT NULL,
  vehicle_id TEXT NOT NULL,
  driver_id TEXT NOT NULL,
  trip_date TEXT NOT NULL,
  departure_location TEXT NOT NULL,
  time_out TEXT NOT NULL,
  arrival_location TEXT NOT NULL,
  time_in TEXT NOT NULL,
  passengers TEXT,
  opening_odometer REAL NOT NULL,
  closing_odometer REAL NOT NULL,
  distance_km REAL NOT NULL,
  notes TEXT,
  synced_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (driver_id) REFERENCES drivers(id)
);

CREATE TABLE IF NOT EXISTS fuel_entries (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  vehicle_id TEXT NOT NULL,
  trip_id TEXT,
  litres REAL NOT NULL,
  cost REAL,
  fuel_date TEXT NOT NULL,
  synced_at TEXT,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (vehicle_id) REFERENCES vehicles(id),
  FOREIGN KEY (trip_id) REFERENCES trips(id)
);

CREATE TABLE IF NOT EXISTS sync_queue (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  entity_type TEXT NOT NULL CHECK (entity_type IN ('vehicle','driver','trip','fuel_entry')),
  entity_id TEXT NOT NULL,
  operation TEXT NOT NULL CHECK (operation IN ('insert','update','delete')),
  payload TEXT,
  created_at TEXT NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  last_attempt_at TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','in_flight','error')),
  last_error TEXT
);

CREATE TABLE IF NOT EXISTS sync_meta (
  table_name TEXT PRIMARY KEY,
  last_pulled_at TEXT
);

CREATE INDEX IF NOT EXISTS idx_trips_vehicle ON trips (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_trips_driver ON trips (driver_id);
CREATE INDEX IF NOT EXISTS idx_trips_date ON trips (trip_date);
CREATE INDEX IF NOT EXISTS idx_fuel_vehicle ON fuel_entries (vehicle_id);
CREATE INDEX IF NOT EXISTS idx_fuel_trip ON fuel_entries (trip_id);
CREATE INDEX IF NOT EXISTS idx_sync_queue_status ON sync_queue (status, created_at);
`;
