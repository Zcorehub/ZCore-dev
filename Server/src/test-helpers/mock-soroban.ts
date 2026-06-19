let mockContractIdOverride: string | null = null;

export function withMockContractId(contractId: string): void {
  mockContractIdOverride = contractId;
}

export function clearMockContractId(): void {
  mockContractIdOverride = null;
}

export function getEffectiveContractId(): string | undefined {
  return mockContractIdOverride ?? process.env.SCORE_REGISTRY_CONTRACT_ID;
}

export function isUsingMockContract(): boolean {
  return mockContractIdOverride !== null;
}
