import type { CorsOptions } from "cors";

export function parseAllowedOrigins(): string[] {
  const raw =
    process.env.CORS_ORIGINS ?? "http://localhost:3001,http://127.0.0.1:3001";
  return raw
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
}

export function getCorsOptions(): CorsOptions {
  const allowedOrigins = parseAllowedOrigins();

  return {
    origin(origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
        return;
      }
      callback(new Error(`Origin ${origin} not allowed by CORS`));
    },
    credentials: true,
  };
}
