export type ProfileTier = "A" | "B" | "C" | "REJECTED";
export interface ScoreBreakdown {
    stellarBase: number;
    eventsScore: number;
    totalEvents: number;
    platforms: string[];
}
export interface ScoreResponse {
    walletAddress: string;
    score: number;
    tier: ProfileTier;
    breakdown: ScoreBreakdown;
    lastUpdated: string;
}
export interface CreditEventItem {
    eventId: string;
    platform: string;
    eventType: string;
    amount: number;
    currency: string;
    scoreImpact: number;
    txHash: string;
    date: string;
}
export interface CreditHistoryResponse {
    events: CreditEventItem[];
    totalPositive: number;
    totalNegative: number;
    pagination: Pagination;
}
export interface ScoreHistoryEntry {
    timestamp: string;
    scoreBefore: number;
    scoreAfter: number;
    delta: number;
    source: string;
    txHash: string | null;
}
export interface ScoreHistoryResponse {
    walletAddress: string;
    currentScore: number;
    history: ScoreHistoryEntry[];
    pagination: Pagination;
}
export interface Pagination {
    limit: number;
    offset: number;
    total: number;
}
export interface LenderProfile {
    tier: "A" | "B" | "C";
    minScore: number;
    maxAmount: number;
    interestRate: number;
}
export interface EligibilityResult {
    eligible: boolean;
    profileAssigned: string;
    maxAmount: number;
    requestId: string;
}
export interface ZCoreClientOptions {
    baseUrl: string;
    apiKey: string;
    walletSessionToken?: string;
}
