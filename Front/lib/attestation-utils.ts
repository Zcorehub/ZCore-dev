export type AttestationStatus = "none" | "fresh" | "expiring" | "expired"

const EXPIRING_THRESHOLD_SECONDS = 7 * 24 * 60 * 60

export function getAttestationStatus(
  updatedAt?: number,
  validUntil?: number | null,
  nowSeconds = Math.floor(Date.now() / 1000)
): AttestationStatus {
  if (!updatedAt || updatedAt === 0) return "none"

  if (!validUntil || validUntil === 0) return "fresh"

  if (nowSeconds > validUntil) return "expired"

  if (validUntil - nowSeconds <= EXPIRING_THRESHOLD_SECONDS) return "expiring"

  return "fresh"
}

export function attestationStatusLabel(status: AttestationStatus): string {
  switch (status) {
    case "fresh":
      return "Attestation vigente"
    case "expiring":
      return "Attestation por expirar"
    case "expired":
      return "Attestation expirada"
    default:
      return "Sin attestation on-chain"
  }
}
