import { describe, expect, it } from "vitest";
import { createHash } from "crypto";
import {
  createChallenge,
  verifyWalletSignature,
} from "../../services/auth-challenge.service";

const SEP53_PREFIX = Buffer.from("Stellar Signed Message:\n", "utf8");

async function createKeypair() {
  const { Keypair } = await import("@stellar/stellar-sdk");
  return Keypair.random();
}

async function signSep53Message(secretKey: string, message: string): Promise<string> {
  const { Keypair } = await import("@stellar/stellar-sdk");
  const keypair = Keypair.fromSecret(secretKey);
  const hash = createHash("sha256")
    .update(Buffer.concat([SEP53_PREFIX, Buffer.from(message, "utf8")]))
    .digest();
  return keypair.sign(hash).toString("base64");
}

describe("verifyWalletSignature", () => {
  it("verifies valid SEP-53 signature for challenge message", async () => {
    const keypair = await createKeypair();
    const wallet = keypair.publicKey();
    const { message } = createChallenge(wallet);
    const signature = await signSep53Message(keypair.secret(), message);

    const valid = await verifyWalletSignature(wallet, message, signature);
    expect(valid).toBe(true);
  });

  it("rejects signature from different keypair", async () => {
    const keypair = await createKeypair();
    const other = await createKeypair();
    const { message } = createChallenge(keypair.publicKey());
    const signature = await signSep53Message(other.secret(), message);

    const valid = await verifyWalletSignature(
      keypair.publicKey(),
      message,
      signature
    );
    expect(valid).toBe(false);
  });

  it("rejects invalid base64 signature", async () => {
    const keypair = await createKeypair();
    const { message } = createChallenge(keypair.publicKey());
    const valid = await verifyWalletSignature(
      keypair.publicKey(),
      message,
      "not-valid-base64!!!"
    );
    expect(valid).toBe(false);
  });

  it("rejects signature with wrong byte length", async () => {
    const keypair = await createKeypair();
    const { message } = createChallenge(keypair.publicKey());
    const shortSig = Buffer.from("tooshort").toString("base64");
    const valid = await verifyWalletSignature(
      keypair.publicKey(),
      message,
      shortSig
    );
    expect(valid).toBe(false);
  });
});
