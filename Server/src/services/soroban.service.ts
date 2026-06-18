export interface OnChainScoreRecord {
  score: number;
  tier: number;
  updatedAt: number;
}

const TIER_CODE_TO_LABEL: Record<number, string> = {
  0: "REJECTED",
  1: "C",
  2: "B",
  3: "A",
};

export function tierToCode(tier: string): number {
  switch (tier) {
    case "A":
      return 3;
    case "B":
      return 2;
    case "C":
      return 1;
    default:
      return 0;
  }
}

export function tierCodeToLabel(code: number): string {
  return TIER_CODE_TO_LABEL[code] ?? "REJECTED";
}

async function getNetworkPassphrase(): Promise<string> {
  const { Networks } = await import("@stellar/stellar-sdk");
  return process.env.STELLAR_NETWORK === "mainnet"
    ? Networks.PUBLIC
    : Networks.TESTNET;
}

function getRpcUrl(): string {
  return (
    process.env.SOROBAN_RPC_URL ??
    (process.env.STELLAR_NETWORK === "mainnet"
      ? "https://soroban.stellar.org"
      : "https://soroban-testnet.stellar.org")
  );
}

export function getContractConfig() {
  const contractId = process.env.SCORE_REGISTRY_CONTRACT_ID;
  if (!contractId) return null;

  return {
    contractId,
    network: process.env.STELLAR_NETWORK === "mainnet" ? "mainnet" : "testnet",
    rpcUrl: getRpcUrl(),
    tierEncoding: TIER_CODE_TO_LABEL,
  };
}

export async function readOnChainScore(
  walletAddress: string
): Promise<OnChainScoreRecord | null> {
  const contractId = process.env.SCORE_REGISTRY_CONTRACT_ID;
  if (!contractId) return null;

  try {
    const stellar = await import("@stellar/stellar-sdk");
    const { Account, Address, Contract, rpc, TransactionBuilder, nativeToScVal, scValToNative } =
      stellar;

    const server = new rpc.Server(getRpcUrl(), { allowHttp: true });
    const contract = new Contract(contractId);
    const sourceAccount = new Account(
      "GAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAWHF",
      "0"
    );

    const tx = new TransactionBuilder(sourceAccount, {
      fee: "100",
      networkPassphrase: await getNetworkPassphrase(),
    })
      .addOperation(
        contract.call(
          "get_score",
          nativeToScVal(Address.fromString(walletAddress), { type: "address" })
        )
      )
      .setTimeout(30)
      .build();

    const simulated = await server.simulateTransaction(tx);
    if (rpc.Api.isSimulationError(simulated)) {
      console.error("Soroban simulation error:", simulated.error);
      return null;
    }

    const result = simulated.result?.retval;
    if (!result) return null;

    const native = scValToNative(result) as {
      score: number;
      tier: number;
      updated_at: number;
    };

    return {
      score: native.score,
      tier: native.tier,
      updatedAt: native.updated_at,
    };
  } catch (error) {
    console.error("Failed to read on-chain score:", error);
    return null;
  }
}

export async function attestScoreOnChain(
  walletAddress: string,
  score: number,
  tier: string
): Promise<{ txHash: string } | null> {
  const contractId = process.env.SCORE_REGISTRY_CONTRACT_ID;
  const oracleSecret = process.env.ORACLE_SECRET_KEY;

  if (!contractId || !oracleSecret) return null;

  try {
    const stellar = await import("@stellar/stellar-sdk");
    const {
      Address,
      Contract,
      Keypair,
      rpc,
      TransactionBuilder,
      nativeToScVal,
    } = stellar;

    const server = new rpc.Server(getRpcUrl(), { allowHttp: true });
    const oracle = Keypair.fromSecret(oracleSecret);
    const contract = new Contract(contractId);
    const tierCode = tierToCode(tier);

    const account = await server.getAccount(oracle.publicKey());

    let tx = new TransactionBuilder(account, {
      fee: "100000",
      networkPassphrase: await getNetworkPassphrase(),
    })
      .addOperation(
        contract.call(
          "set_score",
          nativeToScVal(Address.fromString(walletAddress), { type: "address" }),
          nativeToScVal(score, { type: "u32" }),
          nativeToScVal(tierCode, { type: "u32" })
        )
      )
      .setTimeout(30)
      .build();

    tx = await server.prepareTransaction(tx);
    tx.sign(oracle);

    const response = await server.sendTransaction(tx);
    if (response.status === "ERROR") {
      console.error("Attestation tx error:", response);
      return null;
    }

    return { txHash: response.hash };
  } catch (error) {
    console.error("Failed to attest score on-chain:", error);
    return null;
  }
}
