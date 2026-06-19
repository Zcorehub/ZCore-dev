import jwt from "jsonwebtoken";

export interface SessionClaims {
  walletAddress: string;
}

const DEFAULT_DEV_SECRET = "dev_jwt_secret_local_change_in_prod";
const SESSION_TTL_SECONDS = 24 * 60 * 60;

function getJwtSecret(): string {
  return process.env.JWT_SECRET ?? DEFAULT_DEV_SECRET;
}

export function createSessionToken(walletAddress: string): string {
  return jwt.sign({ walletAddress }, getJwtSecret(), {
    expiresIn: SESSION_TTL_SECONDS,
  });
}

export function verifySessionToken(token: string): SessionClaims | null {
  try {
    const payload = jwt.verify(token, getJwtSecret()) as SessionClaims;
    if (!payload.walletAddress) return null;
    return payload;
  } catch {
    return null;
  }
}

export function getSessionTtlSeconds(): number {
  return SESSION_TTL_SECONDS;
}
