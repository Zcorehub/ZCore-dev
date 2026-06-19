import {
  getCachedWalletData,
  setCachedWalletData,
} from "./horizon-cache.service";

interface StellarTransaction {
  id: string;
  created_at: string;
  successful: boolean;
  fee_charged: string;
  operation_count: number;
  source_account: string;
}

interface StellarAccountResponse {
  _embedded: {
    records: StellarTransaction[];
  };
}

interface StellarAccountInfo {
  id: string;
  account_id: string;
  sequence: string;
  subentry_count: number;
  last_modified_ledger: number;
  balances: Array<{
    balance: string;
    asset_type: string;
    asset_code?: string;
  }>;
}

interface StellarOperationResponse {
  _embedded: {
    records: Array<{
      type: string;
      created_at: string;
      transaction_successful: boolean;
    }>;
  };
}

interface StellarTransactionDetail {
  id: string;
  hash: string;
  created_at: string;
  successful: boolean;
  source_account: string;
  fee_charged: string;
}

export interface StellarWalletData {
  walletAge: number;
  totalTransactions: number;
  successfulTransactions: number;
  averageBalance: number;
  accountAge: number;
  operationsCount: number;
  trustlineCount: number;
  isValid: boolean;
  firstTransactionDate: string | null;
}

const HORIZON_URL =
  process.env.STELLAR_NETWORK === "testnet"
    ? "https://horizon-testnet.stellar.org"
    : "https://horizon.stellar.org";

export const fetchStellarWalletData = async (
  walletAddress: string
): Promise<StellarWalletData> => {
  const cached = getCachedWalletData(walletAddress);
  if (cached) return cached;

  const defaultData: StellarWalletData = {
    walletAge: 0,
    totalTransactions: 0,
    successfulTransactions: 0,
    averageBalance: 0,
    accountAge: 0,
    operationsCount: 0,
    trustlineCount: 0,
    isValid: false,
    firstTransactionDate: null,
  };

  try {
    const accountResponse = await fetch(
      `${HORIZON_URL}/accounts/${walletAddress}`
    );

    if (!accountResponse.ok) {
      if (accountResponse.status === 404) {
        throw new Error("Wallet not found on Stellar network");
      }
      throw new Error(`Stellar API error: ${accountResponse.status}`);
    }

    const accountData = (await accountResponse.json()) as StellarAccountInfo;

    const firstTxResponse = await fetch(
      `${HORIZON_URL}/accounts/${walletAddress}/transactions?order=asc&limit=1`
    );
    if (!firstTxResponse.ok) {
      throw new Error(
        `Error fetching first transaction: ${firstTxResponse.status}`
      );
    }
    const firstTxData =
      (await firstTxResponse.json()) as StellarAccountResponse;

    const allTxResponse = await fetch(
      `${HORIZON_URL}/accounts/${walletAddress}/transactions?limit=200&order=desc`
    );
    if (!allTxResponse.ok) {
      throw new Error(`Error fetching transactions: ${allTxResponse.status}`);
    }
    const allTxData = (await allTxResponse.json()) as StellarAccountResponse;

    const operationsResponse = await fetch(
      `${HORIZON_URL}/accounts/${walletAddress}/operations?limit=200&order=desc`
    );
    const operationsData: StellarOperationResponse = operationsResponse.ok
      ? ((await operationsResponse.json()) as StellarOperationResponse)
      : { _embedded: { records: [] } };

    const firstTx = firstTxData._embedded.records[0];
    const firstTxDate = firstTx ? new Date(firstTx.created_at) : null;
    const now = new Date();

    const walletAge = firstTxDate
      ? Math.floor(
          (now.getTime() - firstTxDate.getTime()) / (1000 * 60 * 60 * 24)
        )
      : 0;

    const totalTransactions = allTxData._embedded.records.length;
    const successfulTransactions = allTxData._embedded.records.filter(
      (tx) => tx.successful
    ).length;

    const xlmBalance = accountData.balances.find(
      (b) => b.asset_type === "native"
    );
    const averageBalance = xlmBalance ? parseFloat(xlmBalance.balance) : 0;

    const trustlineCount = accountData.balances.filter(
      (b) => b.asset_type !== "native"
    ).length;

    const operationsCount = operationsData._embedded.records.length;

    const result: StellarWalletData = {
      walletAge,
      totalTransactions,
      successfulTransactions,
      averageBalance,
      accountAge: walletAge,
      operationsCount,
      trustlineCount,
      isValid: true,
      firstTransactionDate: firstTx ? firstTx.created_at : null,
    };

    setCachedWalletData(walletAddress, result);
    return result;
  } catch (error) {
    console.error("Error fetching Stellar wallet data:", error);
    return { ...defaultData, isValid: false };
  }
};

export const verifyTransaction = async (
  txHash: string
): Promise<{
  valid: boolean;
  successful: boolean;
  sourceAccount: string;
  createdAt: string;
  error?: string;
}> => {
  try {
    const response = await fetch(`${HORIZON_URL}/transactions/${txHash}`);

    if (!response.ok) {
      if (response.status === 404) {
        return {
          valid: false,
          successful: false,
          sourceAccount: "",
          createdAt: "",
          error: "Transaction not found on Stellar network",
        };
      }
      return {
        valid: false,
        successful: false,
        sourceAccount: "",
        createdAt: "",
        error: `Stellar API error: ${response.status}`,
      };
    }

    const tx = (await response.json()) as StellarTransactionDetail;

    return {
      valid: true,
      successful: tx.successful,
      sourceAccount: tx.source_account,
      createdAt: tx.created_at,
    };
  } catch {
    return {
      valid: false,
      successful: false,
      sourceAccount: "",
      createdAt: "",
      error: "Failed to connect to Stellar network",
    };
  }
};

export const calculateStellarScore = (
  stellarData: StellarWalletData
): number => {
  if (!stellarData.isValid) return 0;

  let score = 0;

  const ageScore = Math.min((stellarData.walletAge / 365) * 50, 100);
  score += ageScore;

  const txScore = Math.min(stellarData.totalTransactions * 0.5, 80);
  score += txScore;

  const successRate =
    stellarData.totalTransactions > 0
      ? stellarData.successfulTransactions / stellarData.totalTransactions
      : 0;
  score += successRate * 50;

  const balanceScore = Math.min(
    Math.log10(stellarData.averageBalance + 1) * 20,
    70
  );
  score += balanceScore;

  score += Math.min(stellarData.trustlineCount * 10, 50);
  score += Math.min(stellarData.operationsCount * 0.2, 30);

  return Math.round(score);
};
