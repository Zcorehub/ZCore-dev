"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.verifyWebhookSignature = verifyWebhookSignature;
const crypto_1 = require("crypto");
function verifyWebhookSignature(body, signature, secret) {
    const expected = (0, crypto_1.createHmac)("sha256", secret).update(body, "utf8").digest("hex");
    if (expected.length !== signature.length)
        return false;
    return (0, crypto_1.timingSafeEqual)(Buffer.from(expected), Buffer.from(signature));
}
