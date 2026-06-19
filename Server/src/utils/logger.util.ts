type LogLevel = "info" | "warn" | "error";

export function maskWallet(address: string): string {
  if (address.length <= 12) return address;
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
}

export function logStructured(
  level: LogLevel,
  message: string,
  fields: Record<string, unknown> = {}
): void {
  const entry = {
    level,
    message,
    timestamp: new Date().toISOString(),
    ...fields,
  };

  const line = JSON.stringify(entry);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}
