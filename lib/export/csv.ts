import { File, Paths } from "expo-file-system";
import * as Sharing from "expo-sharing";
import type { Driver, Trip, Vehicle } from "@/lib/db/types";
import { formatDisplayDate, formatTimeDisplay } from "@/lib/utils/date";
import { isTripComplete } from "@/lib/utils/tripStatus";

const CSV_HEADERS = [
  "Trip ID",
  "Date",
  "Vehicle",
  "Driver",
  "Departure",
  "Time Out",
  "Arrival",
  "Time In",
  "Passengers",
  "Opening Odometer (km)",
  "Closing Odometer (km)",
  "Distance (km)",
  "Fuel (L)",
  "Status",
  "Notes",
];

function escapeCsvField(value: string): string {
  if (/[",\n]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function tripToRow(
  trip: Trip,
  vehicleById: Map<string, Vehicle>,
  driverById: Map<string, Driver>,
  fuelByTripId: Map<string, number>
): string[] {
  const vehicle = vehicleById.get(trip.vehicle_id);
  const driver = driverById.get(trip.driver_id);
  const complete = isTripComplete(trip);
  const fuel = fuelByTripId.get(trip.id);

  return [
    trip.trip_number,
    formatDisplayDate(trip.trip_date),
    vehicle ? `${vehicle.make} (${vehicle.plate_number})` : "",
    driver?.name ?? "",
    trip.departure_location,
    formatTimeDisplay(trip.time_out),
    trip.arrival_location,
    trip.time_in ? formatTimeDisplay(trip.time_in) : "",
    trip.passengers ?? "",
    String(trip.opening_odometer),
    trip.closing_odometer != null ? String(trip.closing_odometer) : "",
    trip.distance_km != null ? String(trip.distance_km) : "",
    fuel != null ? String(fuel) : "",
    complete ? "Completed" : "In Progress",
    trip.notes ?? "",
  ];
}

export function buildTripsCsv(
  trips: Trip[],
  vehicleById: Map<string, Vehicle>,
  driverById: Map<string, Driver>,
  fuelByTripId: Map<string, number>
): string {
  const lines = [
    CSV_HEADERS,
    ...trips.map((trip) => tripToRow(trip, vehicleById, driverById, fuelByTripId)),
  ];
  return lines.map((row) => row.map(escapeCsvField).join(",")).join("\r\n");
}

export async function exportTripsAsCsv(
  trips: Trip[],
  vehicleById: Map<string, Vehicle>,
  driverById: Map<string, Driver>,
  fuelByTripId: Map<string, number>,
  filenameSuffix: string
): Promise<void> {
  const csv = buildTripsCsv(trips, vehicleById, driverById, fuelByTripId);
  const file = new File(Paths.cache, `triplog-${filenameSuffix}.csv`);
  file.create({ overwrite: true });
  file.write(csv);

  await Sharing.shareAsync(file.uri, {
    mimeType: "text/csv",
    dialogTitle: "Export Trips (CSV)",
    UTI: "public.comma-separated-values-text",
  });
}
