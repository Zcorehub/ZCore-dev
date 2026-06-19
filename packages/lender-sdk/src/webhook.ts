import { createHmac, timingSafeEqual } from "crypto";

export function verifyWebhookSignature(
  body: string,
  signature: string,
  secret: string
): boolean {
  const expected = createHmac("sha256", secret).update(body, "utf8").digest("hex");
  if (expected.length !== signature.length) return false;
  return timingSafeEqual(Buffer.from(expected), Buffer.from(signature));
}
