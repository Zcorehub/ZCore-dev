#![no_std]

use soroban_sdk::{contract, contractimpl, contracttype, Address, Env};

#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ScoreRecord {
    pub score: u32,
    pub tier: u32,
    pub updated_at: u64,
    pub valid_until: u64,
}

const INIT_KEY: &str = "INIT";
const INTERFACE_VERSION: u32 = 1;

#[contract]
pub struct MockScoreRegistry;

#[contractimpl]
impl MockScoreRegistry {
    pub fn init(env: Env) {
        env.storage().instance().set(&INIT_KEY, &true);
    }

    pub fn interface_version(_env: Env) -> u32 {
        INTERFACE_VERSION
    }

    pub fn set_mock_score(env: Env, wallet: Address, score: u32, tier: u32) {
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
    use soroban_sdk::{
        testutils::{Address as _, Ledger},
        Address, Env,
    };

    #[test]
    fn stores_and_reads_mock_score() {
        let env = Env::default();
        let contract_id = env.register(MockScoreRegistry, ());
        let client = MockScoreRegistryClient::new(&env, &contract_id);
        let wallet = Address::generate(&env);
        env.ledger().set_timestamp(1_718_000_000);

        client.init();
        client.set_mock_score(&wallet, &620, &3);

        let record = client.get_score(&wallet);
        assert_eq!(record.score, 620);
        assert_eq!(record.tier, 3);
        assert!(record.updated_at > 0);
        assert_eq!(record.valid_until, 0);
    }

    #[test]
    fn returns_default_for_unknown_wallet() {
        let env = Env::default();
        let contract_id = env.register(MockScoreRegistry, ());
        let client = MockScoreRegistryClient::new(&env, &contract_id);
        let wallet = Address::generate(&env);

        let record = client.get_score(&wallet);
        assert_eq!(record.score, 0);
        assert_eq!(record.tier, 0);
        assert_eq!(record.updated_at, 0);
        assert_eq!(record.valid_until, 0);
    }

    #[test]
    fn interface_version_returns_one() {
        let env = Env::default();
        let contract_id = env.register(MockScoreRegistry, ());
        let client = MockScoreRegistryClient::new(&env, &contract_id);

        assert_eq!(client.interface_version(), 1);
    }
}
