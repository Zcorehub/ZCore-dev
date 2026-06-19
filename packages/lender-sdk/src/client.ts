import { ZCoreAuthError, ZCoreError, ZCoreNotFoundError } from "./errors";
import type {
  CreditHistoryResponse,
  EligibilityResult,
  LenderProfile,
  ScoreHistoryResponse,
  ScoreResponse,
  ZCoreClientOptions,
} from "./types";

interface ApiEnvelope<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

export class ZCoreClient {
  private readonly baseUrl: string;
  private readonly apiKey: string;
  private readonly walletSessionToken?: string;

  constructor(options: ZCoreClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/$/, "");
    this.apiKey = options.apiKey;
    this.walletSessionToken = options.walletSessionToken;
  }

  private async request<T>(
    path: string,
    init: RequestInit = {},
    useWalletSession = false
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      "x-api-key": this.apiKey,
      ...(init.headers as Record<string, string> | undefined),
    };

    if (useWalletSession && this.walletSessionToken) {
      headers.Authorization = `Bearer ${this.walletSessionToken}`;
    }

    const response = await fetch(`${this.baseUrl}${path}`, {
      ...init,
      headers,
    });

    const body = (await response.json()) as ApiEnvelope<T>;

    if (!response.ok) {
      const message = body.error ?? body.message ?? "Request failed";
      if (response.status === 401) throw new ZCoreAuthError(message);
      if (response.status === 404) throw new ZCoreNotFoundError(message);
      throw new ZCoreError(message, response.status);
    }

    if (!body.data) {
      throw new ZCoreError("Missing response data", response.status);
    }

    return body.data;
  }

  getScore(walletAddress: string): Promise<ScoreResponse> {
    return this.request<ScoreResponse>(`/api/user/${walletAddress}/score`);
  }

  getHistory(
    walletAddress: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<CreditHistoryResponse> {
    const query = new URLSearchParams();
    if (params.limit !== undefined) query.set("limit", String(params.limit));
    if (params.offset !== undefined) query.set("offset", String(params.offset));
    const suffix = query.size > 0 ? `?${query.toString()}` : "";
    return this.request<CreditHistoryResponse>(
      `/api/user/${walletAddress}/history${suffix}`,
      {},
      true
    );
  }

  getScoreHistory(
    walletAddress: string,
    params: { limit?: number; offset?: number } = {}
  ): Promise<ScoreHistoryResponse> {
    const query = new URLSearchParams();
    if (params.limit !== undefined) query.set("limit", String(params.limit));
    if (params.offset !== undefined) query.set("offset", String(params.offset));
    const suffix = query.size > 0 ? `?${query.toString()}` : "";
    return this.request<ScoreHistoryResponse>(
      `/api/user/${walletAddress}/score-history${suffix}`,
      {},
      true
    );
  }

  defineProfiles(profiles: LenderProfile[]): Promise<{ updated: boolean }> {
    return this.request<{ updated: boolean }>("/api/lender/profiles", {
      method: "POST",
      body: JSON.stringify({ apiKey: this.apiKey, profiles }),
    });
  }

  checkEligibility(
    walletAddress: string,
    input: { lenderId: string; requestedAmount: number; minTier?: "A" | "B" | "C" }
  ): Promise<EligibilityResult & { meetsMinTier: boolean }> {
    return this.request<EligibilityResult>(
      "/api/user/request",
      {
        method: "POST",
        body: JSON.stringify({
          walletAddress,
          lenderId: input.lenderId,
          requestedAmount: input.requestedAmount,
        }),
      }
    ).then((result) => {
      const tierOrder = { A: 3, B: 2, C: 1, REJECTED: 0 } as const;
      const assigned = result.profileAssigned as keyof typeof tierOrder;
      const minTier = input.minTier ?? "C";
      return {
        ...result,
        meetsMinTier: tierOrder[assigned] >= tierOrder[minTier],
      };
    });
  }
}
