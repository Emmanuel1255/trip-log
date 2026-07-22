import type { Trip } from "@/lib/db/types";

export function isTripComplete(trip: Pick<Trip, "time_in" | "closing_odometer">): boolean {
  return trip.time_in != null && trip.closing_odometer != null;
}
