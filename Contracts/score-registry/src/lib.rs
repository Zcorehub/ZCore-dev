#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

/// On-chain credit score attestation for a Stellar wallet.
/// Written by the ZCore oracle; readable by any lender or protocol.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ScoreRecord {
    pub score: u32,
    pub tier: u32,
    pub updated_at: u64,
}

const ADMIN_KEY: &str = "ADMIN";

#[contract]
pub struct ScoreRegistry;

#[contractimpl]
impl ScoreRegistry {
    /// One-time setup: stores the oracle admin address.
    pub fn init(env: Env, admin: Address) {
        if env.storage().instance().has(&ADMIN_KEY) {
            panic!("already initialized");
        }
        env.storage().instance().set(&ADMIN_KEY, &admin);
    }

    /// Oracle-only: publish or update a wallet's verified score.
    /// tier: 0=REJECTED, 1=C, 2=B, 3=A
    pub fn set_score(env: Env, wallet: Address, score: u32, tier: u32) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&ADMIN_KEY)
            .expect("contract not initialized");
        admin.require_auth();

        if score > 850 {
            panic!("score exceeds maximum 850");
        }
        if tier > 3 {
            panic!("invalid tier");
        }

        let record = ScoreRecord {
            score,
            tier,
            updated_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&wallet, &record);
    }

    /// Public read: any protocol can query a wallet's attested score.
    pub fn get_score(env: Env, wallet: Address) -> ScoreRecord {
        env.storage()
            .persistent()
            .get(&wallet)
            .unwrap_or(ScoreRecord {
                score: 0,
                tier: 0,
                updated_at: 0,
            })
    }

    /// Returns the oracle admin address.
    pub fn admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&ADMIN_KEY)
            .expect("contract not initialized")
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Address, Env};

    #[test]
    fn set_and_get_score() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(ScoreRegistry, ());
        let client = ScoreRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let wallet = Address::generate(&env);

        client.init(&admin);
        client.set_score(&wallet, &387, &2);

        let record = client.get_score(&wallet);
        assert_eq!(record.score, 387);
        assert_eq!(record.tier, 2);
        assert!(record.updated_at > 0);
    }
}
