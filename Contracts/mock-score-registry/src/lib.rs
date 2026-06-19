#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

/// TEST ONLY — do not deploy to mainnet.
/// Simplified score registry for local integration tests and CI.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ScoreRecord {
    pub score: u32,
    pub tier: u32,
    pub updated_at: u64,
    pub valid_until: u64,
}

const INIT_KEY: &str = "INIT";

#[contract]
pub struct MockScoreRegistry;

#[contractimpl]
impl MockScoreRegistry {
    pub fn init(env: Env) {
        env.storage().instance().set(&INIT_KEY, &true);
    }

    pub fn interface_version(_env: Env) -> u32 {
        1
    }

    pub fn set_mock_score(env: Env, wallet: Address, score: u32, tier: u32) {
        let updated_at = env.ledger().timestamp();
        let record = ScoreRecord {
            score,
            tier,
            updated_at,
            valid_until: 0,
        };
        env.storage().persistent().set(&wallet, &record);
    }

    pub fn get_score(env: Env, wallet: Address) -> ScoreRecord {
        env.storage()
            .persistent()
            .get(&wallet)
            .unwrap_or(ScoreRecord {
                score: 0,
                tier: 0,
                updated_at: 0,
                valid_until: 0,
            })
    }
}

#[cfg(test)]
mod test {
    use super::*;
    use soroban_sdk::{testutils::Address as _, Env};

    #[test]
    fn stores_and_reads_mock_score() {
        let env = Env::default();
        env.mock_all_auths();
        let contract_id = env.register(MockScoreRegistry, ());
        let client = MockScoreRegistryClient::new(&env, &contract_id);
        let wallet = Address::generate(&env);

        client.init();
        client.set_mock_score(&wallet, &420, &2);

        let record = client.get_score(&wallet);
        assert_eq!(record.score, 420);
        assert_eq!(record.tier, 2);
    }
}
