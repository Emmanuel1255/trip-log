export function calculateDistanceKm(
  openingOdometer: number,
  closingOdometer: number
): number {
  const distance = closingOdometer - openingOdometer;
  return Math.round(distance * 100) / 100;
}

/** Returns null while a trip is in progress (no closing odometer reading yet). */
export function calculateDistanceKmOrNull(
  openingOdometer: number,
  closingOdometer: number | null | undefined
): number | null {
  return closingOdometer == null ? null : calculateDistanceKm(openingOdometer, closingOdometer);
}

export function isValidOdometerPair(
  openingOdometer: number,
  closingOdometer: number
): boolean {
  return (
    Number.isFinite(openingOdometer) &&
    Number.isFinite(closingOdometer) &&
    closingOdometer >= openingOdometer
  );
}
