"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ZCoreClient = void 0;
const errors_1 = require("./errors");
class ZCoreClient {
    constructor(options) {
        this.baseUrl = options.baseUrl.replace(/\/$/, "");
        this.apiKey = options.apiKey;
        this.walletSessionToken = options.walletSessionToken;
    }
    async request(path, init = {}, useWalletSession = false) {
        const headers = {
            "Content-Type": "application/json",
            "x-api-key": this.apiKey,
            ...init.headers,
        };
        if (useWalletSession && this.walletSessionToken) {
            headers.Authorization = `Bearer ${this.walletSessionToken}`;
        }
        const response = await fetch(`${this.baseUrl}${path}`, {
            ...init,
            headers,
        });
        const body = (await response.json());
        if (!response.ok) {
            const message = body.error ?? body.message ?? "Request failed";
            if (response.status === 401)
                throw new errors_1.ZCoreAuthError(message);
            if (response.status === 404)
                throw new errors_1.ZCoreNotFoundError(message);
            throw new errors_1.ZCoreError(message, response.status);
        }
        if (!body.data) {
            throw new errors_1.ZCoreError("Missing response data", response.status);
        }
        return body.data;
    }
    getScore(walletAddress) {
        return this.request(`/api/user/${walletAddress}/score`);
    }
    getHistory(walletAddress, params = {}) {
        const query = new URLSearchParams();
        if (params.limit !== undefined)
            query.set("limit", String(params.limit));
        if (params.offset !== undefined)
            query.set("offset", String(params.offset));
        const suffix = query.size > 0 ? `?${query.toString()}` : "";
        return this.request(`/api/user/${walletAddress}/history${suffix}`, {}, true);
    }
    getScoreHistory(walletAddress, params = {}) {
        const query = new URLSearchParams();
        if (params.limit !== undefined)
            query.set("limit", String(params.limit));
        if (params.offset !== undefined)
            query.set("offset", String(params.offset));
        const suffix = query.size > 0 ? `?${query.toString()}` : "";
        return this.request(`/api/user/${walletAddress}/score-history${suffix}`, {}, true);
    }
    defineProfiles(profiles) {
        return this.request("/api/lender/profiles", {
            method: "POST",
            body: JSON.stringify({ apiKey: this.apiKey, profiles }),
        });
    }
    checkEligibility(walletAddress, input) {
        return this.request("/api/user/request", {
            method: "POST",
            body: JSON.stringify({
                walletAddress,
                lenderId: input.lenderId,
                requestedAmount: input.requestedAmount,
            }),
        }).then((result) => {
            const tierOrder = { A: 3, B: 2, C: 1, REJECTED: 0 };
            const assigned = result.profileAssigned;
            const minTier = input.minTier ?? "C";
            return {
                ...result,
                meetsMinTier: tierOrder[assigned] >= tierOrder[minTier],
            };
        });
    }
}
exports.ZCoreClient = ZCoreClient;
