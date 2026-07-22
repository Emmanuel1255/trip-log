export function isNonEmpty(value: string | null | undefined): boolean {
  return typeof value === "string" && value.trim().length > 0;
}

export function isValidPin(pin: string): boolean {
  return /^\d{4,6}$/.test(pin);
}
