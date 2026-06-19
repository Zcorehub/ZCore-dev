export function withMockContractId(id: string): void {
  if (!id.trim()) {
    throw new Error("Mock Soroban contract id is required");
  }

  process.env.SCORE_REGISTRY_CONTRACT_ID = id;
}
