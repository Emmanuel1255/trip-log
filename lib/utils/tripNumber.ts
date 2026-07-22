export function formatTripNumber(year: number, sequence: number): string {
  const paddedSequence = String(sequence).padStart(5, "0");
  return `TRP-${year}-${paddedSequence}`;
}
