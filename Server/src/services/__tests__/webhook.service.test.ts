import { describe, expect, it } from "vitest";
import {
  signWebhookBody,
  verifyWebhookSignature,
} from "../../services/webhook.service";

describe("webhook.service", () => {
  it("signs and verifies webhook payloads", () => {
    const body = JSON.stringify({ event: "score_updated", newScore: 400 });
    const secret = "webhook_secret_test";
    const signature = signWebhookBody(body, secret);

    expect(verifyWebhookSignature(body, signature, secret)).toBe(true);
    expect(verifyWebhookSignature(body, "bad-signature", secret)).toBe(false);
  });
});
