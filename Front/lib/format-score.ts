export function formatScore(score: number): string {
  return Math.round(score).toLocaleString("en-US");
}

export function formatScoreDelta(delta: number): string {
  const prefix = delta >= 0 ? "+" : "";
  return `${prefix}${delta}`;
}

export function scoreToPercent(score: number, max = 850): number {
  return Math.min(Math.max((score / max) * 100, 0), 100);
}

export function formatUnixTimestamp(seconds: number): string {
  if (!seconds) return "—";
  return new Date(seconds * 1000).toLocaleDateString("es-ES", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
