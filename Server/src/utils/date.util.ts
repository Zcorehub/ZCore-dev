export function toIsoTimestamp(date: Date = new Date()): string {
  return date.toISOString();
}

export function secondsSince(epochMs: number): number {
  return Math.floor((Date.now() - epochMs) / 1000);
}

export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}
