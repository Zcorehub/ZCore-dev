import { createHmac, randomBytes, timingSafeEqual } from "crypto";
import { logStructured } from "../utils/logger.util";

export interface ScoreUpdatedWebhookPayload {
  event: "score_updated";
  walletAddress: string;
  previousScore: number;
  newScore: number;
  profileTier: string;
  eventType: string;
  txHash: string;
  timestamp: string;
}

export function signWebhookBody(body: string, secret: string): string {
  return createHmac("sha256", secret).update(body, "utf8").digest("hex");
}

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expected = signWebhookBody(body, secret);
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}

export function generateWebhookSecret(): string {
  return randomBytes(32).toString("hex");
}

async function postWebhook(
  url: string,
  body: string,
  signature: string
): Promise<Response> {
  return fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-ZCore-Signature": signature,
    },
    body,
  });
}

export async function dispatchScoreUpdatedWebhook(
  webhookUrl: string,
  webhookSecret: string,
  payload: ScoreUpdatedWebhookPayload
): Promise<void> {
  const body = JSON.stringify(payload);
  const signature = signWebhookBody(body, webhookSecret);

  const send = async (): Promise<boolean> => {
    const response = await postWebhook(webhookUrl, body, signature);
    if (response.ok) return true;

    logStructured("warn", "webhook_delivery_failed", {
      url: webhookUrl,
      status: response.status,
    });
    return false;
  };

  const firstAttempt = await send();
  if (firstAttempt) return;

  await new Promise((resolve) => setTimeout(resolve, 5000));
  await send();
}
