import "dotenv/config";

type Mode = "propose" | "accept";

function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing required environment variable: ${name}`);
  }
  return value;
}

function networkPassphrase(networks: { PUBLIC: string; TESTNET: string }): string {
  return process.env.STELLAR_NETWORK === "mainnet"
    ? networks.PUBLIC
    : networks.TESTNET;
}

function rpcUrl(): string {
  return (
    process.env.SOROBAN_RPC_URL ??
    (process.env.STELLAR_NETWORK === "mainnet"
      ? "https://soroban.stellar.org"
      : "https://soroban-testnet.stellar.org")
  );
}

function parseArgs() {
  const [, , modeArg, newAdminArg, ...flags] = process.argv;
  if (modeArg !== "propose" && modeArg !== "accept") {
    throw new Error(
      "Usage: ts-node scripts/rotate-oracle-admin.ts <propose NEW_ADMIN_PUBLIC_KEY|accept> [--send]"
    );
  }
  if (modeArg === "propose" && !newAdminArg) {
    throw new Error("propose requires NEW_ADMIN_PUBLIC_KEY");
  }
  return {
    mode: modeArg as Mode,
    newAdmin: modeArg === "propose" ? newAdminArg : undefined,
    send: flags.includes("--send"),
  };
}

function signerSecret(mode: Mode): string {
  if (mode === "accept") {
    return requiredEnv("NEW_ORACLE_SECRET_KEY");
  }
  return requiredEnv("ORACLE_SECRET_KEY");
}

async function main() {
  const stellar = await import("@stellar/stellar-sdk");
  const { Address, Contract, Keypair, TransactionBuilder, nativeToScVal, rpc } =
    stellar;
  const { mode, newAdmin, send } = parseArgs();
  const contract = new Contract(requiredEnv("SCORE_REGISTRY_CONTRACT_ID"));
  const signer = Keypair.fromSecret(signerSecret(mode));
  const server = new rpc.Server(rpcUrl(), { allowHttp: true });
  const account = await server.getAccount(signer.publicKey());

  const operation =
    mode === "propose"
      ? contract.call(
          "propose_admin",
          nativeToScVal(Address.fromString(newAdmin as string), {
            type: "address",
          })
        )
      : contract.call("accept_admin");

  let tx = new TransactionBuilder(account, {
    fee: "100000",
    networkPassphrase: networkPassphrase(stellar.Networks),
  })
    .addOperation(operation)
    .setTimeout(30)
    .build();

  tx = await server.prepareTransaction(tx);
  tx.sign(signer);

  if (!send) {
    console.log("Dry run prepared transaction XDR. Re-run with --send to submit.");
    console.log(tx.toXDR());
    return;
  }

  const response = await server.sendTransaction(tx);
  console.log(JSON.stringify(response, null, 2));
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error);
  process.exit(1);
});
