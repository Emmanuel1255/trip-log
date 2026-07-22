export function calculateDistanceKm(
  openingOdometer: number,
  closingOdometer: number
): number {
  const distance = closingOdometer - openingOdometer;
  return Math.round(distance * 100) / 100;
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
