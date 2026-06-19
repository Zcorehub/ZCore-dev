import type { CreditHistoryResponse, EligibilityResult, LenderProfile, ScoreHistoryResponse, ScoreResponse, ZCoreClientOptions } from "./types";
export declare class ZCoreClient {
    private readonly baseUrl;
    private readonly apiKey;
    private readonly walletSessionToken?;
    constructor(options: ZCoreClientOptions);
    private request;
    getScore(walletAddress: string): Promise<ScoreResponse>;
    getHistory(walletAddress: string, params?: {
        limit?: number;
        offset?: number;
    }): Promise<CreditHistoryResponse>;
    getScoreHistory(walletAddress: string, params?: {
        limit?: number;
        offset?: number;
    }): Promise<ScoreHistoryResponse>;
    defineProfiles(profiles: LenderProfile[]): Promise<{
        updated: boolean;
    }>;
    checkEligibility(walletAddress: string, input: {
        lenderId: string;
        requestedAmount: number;
        minTier?: "A" | "B" | "C";
    }): Promise<EligibilityResult & {
        meetsMinTier: boolean;
    }>;
}
