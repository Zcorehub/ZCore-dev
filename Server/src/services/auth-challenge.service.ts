import { createHash, randomUUID } from "crypto";
import { CHALLENGE_HEADER, CHALLENGE_TTL_MS } from "../constants/auth.constants";
import { logStructured, maskWallet } from "../utils/logger.util";

/** SEP-53 prefix used by Freighter, xBull, Albedo, and Stellar Wallets Kit. */
const SEP53_MESSAGE_PREFIX = Buffer.from("Stellar Signed Message:\n", "utf8");

export interface ChallengePayload {
  walletAddress: string;
  nonce: string;
  issuedAt: number;
  expiresAt: number;
}

export function buildChallengeMessage(payload: ChallengePayload): string {
  return [
    CHALLENGE_HEADER,
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
  if (lines[0] !== CHALLENGE_HEADER) return false;

  const walletLine = lines.find((l) => l.startsWith("Wallet: "));
  const expiresLine = lines.find((l) => l.startsWith("Expires: "));

  if (!walletLine || walletLine.slice(8) !== walletAddress) return false;
  if (!expiresLine) return false;

  const expiresAt = Number.parseInt(expiresLine.slice(9), 10);
  if (Number.isNaN(expiresAt) || Date.now() > expiresAt) return false;

  return true;
}

function sep53MessageHash(message: string): Buffer {
  const messageBytes = Buffer.from(message, "utf8");
  return createHash("sha256")
    .update(Buffer.concat([SEP53_MESSAGE_PREFIX, messageBytes]))
    .digest();
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
    if (signature.length !== 64) return false;

    return keypair.verify(sep53MessageHash(message), signature);
  } catch {
    logStructured("warn", "wallet_signature_verify_failed", {
      wallet: maskWallet(walletAddress),
    });
    return false;
  }
}
