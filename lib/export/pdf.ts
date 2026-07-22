import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import type { Driver, Trip, Vehicle } from "@/lib/db/types";
import { formatDisplayDate, formatTimeDisplay } from "@/lib/utils/date";
import { isTripComplete } from "@/lib/utils/tripStatus";

export interface PdfExportMeta {
  title: string;
  subtitle: string;
  /** Total litres issued in the export range, including fuel entries not linked to any trip. */
  totalFuelLitres: number;
}

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function tripRowHtml(
  trip: Trip,
  vehicleById: Map<string, Vehicle>,
  driverById: Map<string, Driver>,
  fuelByTripId: Map<string, number>
): string {
  const vehicle = vehicleById.get(trip.vehicle_id);
  const driver = driverById.get(trip.driver_id);
  const complete = isTripComplete(trip);
  const statusColor = complete ? "#2E8B57" : "#D9A441";
  const fuel = fuelByTripId.get(trip.id);

  const cell = (value: string) => `<td>${escapeHtml(value)}</td>`;

  return `<tr>
    ${cell(trip.trip_number)}
    ${cell(formatDisplayDate(trip.trip_date))}
    ${cell(vehicle ? `${vehicle.make} (${vehicle.plate_number})` : "")}
    ${cell(driver?.name ?? "")}
    ${cell(trip.departure_location)}
    ${cell(formatTimeDisplay(trip.time_out))}
    ${cell(trip.arrival_location)}
    ${cell(trip.time_in ? formatTimeDisplay(trip.time_in) : "—")}
    ${cell(String(trip.opening_odometer))}
    ${cell(trip.closing_odometer != null ? String(trip.closing_odometer) : "—")}
    <td class="num">${trip.distance_km != null ? trip.distance_km : "—"}</td>
    <td class="num">${fuel != null ? fuel : "—"}</td>
    <td style="color:${statusColor};font-weight:600;">${complete ? "Completed" : "In Progress"}</td>
  </tr>`;
}

export function buildTripsHtml(
  trips: Trip[],
  vehicleById: Map<string, Vehicle>,
  driverById: Map<string, Driver>,
  fuelByTripId: Map<string, number>,
  meta: PdfExportMeta
): string {
  const totalDistance = trips.reduce((sum, t) => sum + (t.distance_km ?? 0), 0);
  const rows = trips.map((trip) => tripRowHtml(trip, vehicleById, driverById, fuelByTripId)).join("");

  return `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8" />
<style>
  body { font-family: -apple-system, Roboto, Helvetica, Arial, sans-serif; color: #10131A; padding: 24px; }
  h1 { font-size: 20px; margin-bottom: 4px; color: #0F2573; }
  .subtitle { font-size: 12px; color: #63707D; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 10px; }
  th, td { border: 1px solid #D8DEE6; padding: 6px 8px; text-align: left; }
  th { background-color: #266CA9; color: #fff; font-weight: 600; }
  tr:nth-child(even) { background-color: #F4F7FB; }
  td.num { text-align: right; font-variant-numeric: tabular-nums; }
  .summary { margin-top: 16px; font-size: 12px; color: #10131A; }
  .summary strong { color: #266CA9; }
</style>
</head>
<body>
  <h1>${escapeHtml(meta.title)}</h1>
  <div class="subtitle">${escapeHtml(meta.subtitle)}</div>
  <table>
    <thead>
      <tr>
        <th>Trip ID</th>
        <th>Date</th>
        <th>Vehicle</th>
        <th>Driver</th>
        <th>Departure</th>
        <th>Time Out</th>
        <th>Arrival</th>
        <th>Time In</th>
        <th>Opening Odo.</th>
        <th>Closing Odo.</th>
        <th>Distance (km)</th>
        <th>Fuel (L)</th>
        <th>Status</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
  <div class="summary">
    <strong>${trips.length}</strong> trip${trips.length === 1 ? "" : "s"} · <strong>${Math.round(totalDistance)} km</strong> total distance · <strong>${Math.round(meta.totalFuelLitres)} L</strong> fuel issued
  </div>
</body>
</html>`;
}

export async function exportTripsAsPdf(
  trips: Trip[],
  vehicleById: Map<string, Vehicle>,
  driverById: Map<string, Driver>,
  fuelByTripId: Map<string, number>,
  meta: PdfExportMeta
): Promise<void> {
  const html = buildTripsHtml(trips, vehicleById, driverById, fuelByTripId, meta);
  const { uri } = await Print.printToFileAsync({ html });

  await Sharing.shareAsync(uri, {
    mimeType: "application/pdf",
    dialogTitle: "Export Trips (PDF)",
    UTI: "com.adobe.pdf",
  });
}
