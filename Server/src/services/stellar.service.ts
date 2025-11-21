// Tipos para las respuestas de Stellar Horizon API
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

export interface StellarWalletData {
  walletAge: number; // días desde primera transacción
  totalTransactions: number;
  successfulTransactions: number;
  averageBalance: number; // XLM balance
  accountAge: number; // días desde creación de cuenta
  operationsCount: number;
  trustlineCount: number;
  isValid: boolean;
  firstTransactionDate: string | null;
}

export const fetchStellarWalletData = async (
  walletAddress: string
): Promise<StellarWalletData> => {
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
    // 1. Obtener información básica de la cuenta
    const accountResponse: Response = await fetch(
      `https://horizon.stellar.org/accounts/${walletAddress}`
    );

    if (!accountResponse.ok) {
      if (accountResponse.status === 404) {
        throw new Error("Wallet not found on Stellar network");
      }
      throw new Error(`Stellar API error: ${accountResponse.status}`);
    }

    const accountData: StellarAccountInfo =
      (await accountResponse.json()) as StellarAccountInfo;

    // 2. Obtener primera transacción (orden ascendente, límite 1)
    const firstTxResponse: Response = await fetch(
      `https://horizon.stellar.org/accounts/${walletAddress}/transactions?order=asc&limit=1`
    );

    if (!firstTxResponse.ok) {
      throw new Error(
        `Error fetching first transaction: ${firstTxResponse.status}`
      );
    }

    const firstTxData: StellarAccountResponse =
      (await firstTxResponse.json()) as StellarAccountResponse;

    // 3. Obtener todas las transacciones para estadísticas
    const allTxResponse: Response = await fetch(
      `https://horizon.stellar.org/accounts/${walletAddress}/transactions?limit=200&order=desc`
    );

    if (!allTxResponse.ok) {
      throw new Error(`Error fetching transactions: ${allTxResponse.status}`);
    }

    const allTxData: StellarAccountResponse =
      (await allTxResponse.json()) as StellarAccountResponse;

    // 4. Obtener operaciones para análisis detallado
    const operationsResponse: Response = await fetch(
      `https://horizon.stellar.org/accounts/${walletAddress}/operations?limit=200&order=desc`
    );

    const operationsData: StellarOperationResponse = operationsResponse.ok
      ? ((await operationsResponse.json()) as StellarOperationResponse)
      : { _embedded: { records: [] } };

    // Calcular métricas
    const firstTx: StellarTransaction | undefined =
      firstTxData._embedded.records[0];
    const firstTxDate: Date | null = firstTx
      ? new Date(firstTx.created_at)
      : null;
    const currentDate: Date = new Date();

    const walletAge: number = firstTxDate
      ? Math.floor(
          (currentDate.getTime() - firstTxDate.getTime()) /
            (1000 * 60 * 60 * 24)
        )
      : 0;

    const totalTransactions: number = allTxData._embedded.records.length;
    const successfulTransactions: number = allTxData._embedded.records.filter(
      (tx: StellarTransaction) => tx.successful
    ).length;

    // Balance en XLM (native asset)
    const xlmBalance = accountData.balances.find(
      (b) => b.asset_type === "native"
    );
    const averageBalance: number = xlmBalance
      ? parseFloat(xlmBalance.balance)
      : 0;

    // Contar trustlines (indicador de uso DeFi/trading)
    const trustlineCount: number = accountData.balances.filter(
      (b) => b.asset_type !== "native"
    ).length;

    const operationsCount: number = operationsData._embedded.records.length;

    return {
      walletAge,
      totalTransactions,
      successfulTransactions,
      averageBalance,
      accountAge: walletAge, // Por simplicidad, usar walletAge como accountAge
      operationsCount,
      trustlineCount,
      isValid: true,
      firstTransactionDate: firstTx ? firstTx.created_at : null,
    };
  } catch (error: unknown) {
    console.error("Error fetching Stellar wallet data:", error);

    // En caso de error, retornar data default pero marcar como inválida
    return {
      ...defaultData,
      isValid: false,
    };
  }
};

export const calculateStellarScore = (
  stellarData: StellarWalletData
): number => {
  if (!stellarData.isValid) {
    return 0; // No contribuye al score si no es válida
  }

  let score = 0;

  // 1. Edad de wallet (máximo 100 puntos)
  // Wallets más antiguas son más confiables
  const ageScore = Math.min((stellarData.walletAge / 365) * 50, 100); // 50 puntos por año, máx 100
  score += ageScore;

  // 2. Actividad transaccional (máximo 80 puntos)
  const txScore = Math.min(stellarData.totalTransactions * 0.5, 80);
  score += txScore;

  // 3. Tasa de éxito (máximo 50 puntos)
  const successRate =
    stellarData.totalTransactions > 0
      ? stellarData.successfulTransactions / stellarData.totalTransactions
      : 0;
  const successScore = successRate * 50;
  score += successScore;

  // 4. Balance promedio (máximo 70 puntos)
  // Usar log para evitar que balances muy altos dominen
  const balanceScore = Math.min(
    Math.log10(stellarData.averageBalance + 1) * 20,
    70
  );
  score += balanceScore;

  // 5. Diversidad de activos / DeFi usage (máximo 50 puntos)
  const trustlineScore = Math.min(stellarData.trustlineCount * 10, 50);
  score += trustlineScore;

  // 6. Actividad de operaciones (máximo 30 puntos)
  const opsScore = Math.min(stellarData.operationsCount * 0.2, 30);
  score += opsScore;

  return Math.round(score);
};
