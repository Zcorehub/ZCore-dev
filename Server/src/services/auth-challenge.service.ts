import { randomUUID } from "crypto";

const CHALLENGE_TTL_MS = 5 * 60 * 1000;

export interface ChallengePayload {
  walletAddress: string;
  nonce: string;
  issuedAt: number;
  expiresAt: number;
}

export function buildChallengeMessage(payload: ChallengePayload): string {
  return [
    "ZCore Authentication",
    `Wallet: ${payload.walletAddress}`,
    `Nonce: ${payload.nonce}`,
    `Issued: ${payload.issuedAt}`,
    `Expires: ${payload.expiresAt}`,
  ].join("\n");
}

export function createChallenge(walletAddress: string) {
  const issuedAt = Date.now();
  const expiresAt = issuedAt + CHALLENGE_TTL_MS;
  const payload: ChallengePayload = {
    walletAddress,
    nonce: randomUUID(),
    issuedAt,
    expiresAt,
  };

  return {
    message: buildChallengeMessage(payload),
    expiresAt,
  };
}

export function validateChallengeMessage(
  message: string,
  walletAddress: string
): boolean {
  const lines = message.split("\n");
  if (lines[0] !== "ZCore Authentication") return false;

  const walletLine = lines.find((l) => l.startsWith("Wallet: "));
  const expiresLine = lines.find((l) => l.startsWith("Expires: "));

  if (!walletLine || walletLine.slice(8) !== walletAddress) return false;
  if (!expiresLine) return false;

  const expiresAt = Number.parseInt(expiresLine.slice(9), 10);
  if (Number.isNaN(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}

export async function verifyWalletSignature(
  walletAddress: string,
  message: string,
  signatureBase64: string
): Promise<boolean> {
  try {
    if (!validateChallengeMessage(message, walletAddress)) return false;

    const { Keypair } = await import("@stellar/stellar-sdk");
    const keypair = Keypair.fromPublicKey(walletAddress);
    const signature = Buffer.from(signatureBase64, "base64");
    return keypair.verify(Buffer.from(message, "utf8"), signature);
  } catch {
    return false;
  }
}
