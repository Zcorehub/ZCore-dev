#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, Env, Vec};

/// On-chain credit score attestation for a Stellar wallet.
/// Written by the ZCore oracle; readable by any lender or protocol.
#[contracttype]
#[derive(Clone, Debug, Eq, PartialEq)]
pub struct ScoreRecord {
    pub score: u32,
    pub tier: u32,
    pub updated_at: u64,
    pub valid_until: u64,
}

const ADMIN_KEY: &str = "ADMIN";
const PENDING_ADMIN_KEY: &str = "PENDING_ADMIN";
const PAUSED_KEY: &str = "PAUSED";
const MAX_BATCH_SIZE: u32 = 25;
const INTERFACE_VERSION: u32 = 1;

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
        env.storage().instance().set(&PAUSED_KEY, &false);
    }

    /// Returns the IZCoreScore interface version.
    pub fn interface_version(_env: Env) -> u32 {
        INTERFACE_VERSION
    }

    /// Returns the oracle admin address.
    pub fn admin(env: Env) -> Address {
        env.storage()
            .instance()
            .get(&ADMIN_KEY)
            .expect("contract not initialized")
    }

    /// Returns the pending oracle admin, if a transfer has been proposed.
    pub fn pending_admin(env: Env) -> Option<Address> {
        env.storage().instance().get(&PENDING_ADMIN_KEY)
    }

    /// Current admin proposes the next oracle admin.
    ///
    /// Rotation is only allowed while paused so score writes cannot continue
    /// under a partially rotated operational key.
    pub fn propose_admin(env: Env, new_admin: Address) {
        let admin = Self::admin(env.clone());
        admin.require_auth();

        if !Self::is_paused(env.clone()) {
            panic!("contract must be paused");
        }
        if new_admin == admin {
            panic!("new admin must differ");
        }

        env.storage().instance().set(&PENDING_ADMIN_KEY, &new_admin);

        env.events()
            .publish((symbol_short!("adm_prop"), admin), new_admin);
    }

    /// Pending admin accepts control of the oracle registry.
    pub fn accept_admin(env: Env) {
        let pending_admin: Address = env
            .storage()
            .instance()
            .get(&PENDING_ADMIN_KEY)
            .expect("no pending admin");
        pending_admin.require_auth();

        let previous_admin = Self::admin(env.clone());
        env.storage().instance().set(&ADMIN_KEY, &pending_admin);
        env.storage().instance().remove(&PENDING_ADMIN_KEY);

        env.events()
            .publish((symbol_short!("adm_xfer"), previous_admin), pending_admin);
    }

    /// Emergency pause — blocks all score writes.
    pub fn pause(env: Env) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&ADMIN_KEY)
            .expect("contract not initialized");
        admin.require_auth();
        env.storage().instance().set(&PAUSED_KEY, &true);
    }

    /// Resume score writes after pause.
    pub fn unpause(env: Env) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&ADMIN_KEY)
            .expect("contract not initialized");
        admin.require_auth();
        env.storage().instance().set(&PAUSED_KEY, &false);
    }

    /// Returns whether the contract is paused.
    pub fn is_paused(env: Env) -> bool {
        env.storage().instance().get(&PAUSED_KEY).unwrap_or(false)
    }

    /// Oracle-only: publish or update a wallet's verified score.
    /// tier: 0=REJECTED, 1=C, 2=B, 3=A
    /// ttl_secs: 0 = no expiry; otherwise valid_until = now + ttl_secs
    pub fn set_score(env: Env, wallet: Address, score: u32, tier: u32, ttl_secs: u64) {
        Self::require_not_paused(&env);
        Self::require_admin_auth(&env);
        Self::write_score(env, wallet, score, tier, ttl_secs);
    }

    /// Oracle-only: batch attestation for up to 25 wallets per transaction.
    pub fn set_scores_batch(
        env: Env,
        wallets: Vec<Address>,
        scores: Vec<u32>,
        tiers: Vec<u32>,
        ttl_secs: u64,
    ) {
        Self::require_not_paused(&env);
        Self::require_admin_auth(&env);

        if wallets.len() != scores.len() || wallets.len() != tiers.len() {
            panic!("length mismatch");
        }
        if wallets.len() > MAX_BATCH_SIZE {
            panic!("batch too large");
        }

        for i in 0..wallets.len() {
            let wallet = wallets.get(i).unwrap();
            let score = scores.get(i).unwrap();
            let tier = tiers.get(i).unwrap();
            Self::write_score(env.clone(), wallet, score, tier, ttl_secs);
        }
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
                valid_until: 0,
            })
    }

    /// Returns only the tier code for a wallet.
    pub fn get_tier(env: Env, wallet: Address) -> u32 {
        Self::get_score(env, wallet).tier
    }

    /// Returns true if the wallet has a non-zero attestation timestamp.
    pub fn is_attested(env: Env, wallet: Address) -> bool {
        Self::get_score(env, wallet).updated_at > 0
    }

    /// Returns true if the score record is within max_age_secs of current ledger time.
    pub fn is_score_fresh(env: Env, wallet: Address, max_age_secs: u64) -> bool {
        let record = Self::get_score(env.clone(), wallet);
        if record.updated_at == 0 {
            return false;
        }

        let now = env.ledger().timestamp();

        if record.valid_until > 0 {
            return now <= record.valid_until;
        }

        now.saturating_sub(record.updated_at) <= max_age_secs
    }

    /// Returns the score record if fresh; otherwise returns default REJECTED record.
    pub fn get_score_if_fresh(env: Env, wallet: Address, max_age_secs: u64) -> ScoreRecord {
        if Self::is_score_fresh(env.clone(), wallet.clone(), max_age_secs) {
            Self::get_score(env, wallet)
        } else {
            ScoreRecord {
                score: 0,
                tier: 0,
                updated_at: 0,
                valid_until: 0,
            }
        }
    }

    fn require_not_paused(env: &Env) {
        if Self::is_paused(env.clone()) {
            panic!("contract is paused");
        }
    }

    fn require_admin_auth(env: &Env) {
        let admin: Address = env
            .storage()
            .instance()
            .get(&ADMIN_KEY)
            .expect("contract not initialized");
        admin.require_auth();
    }

    fn validate_score_tier(score: u32, tier: u32) {
        if score > 850 {
            panic!("score exceeds maximum 850");
        }
        if tier > 3 {
            panic!("invalid tier");
        }
    }

    fn write_score(env: Env, wallet: Address, score: u32, tier: u32, ttl_secs: u64) {
        Self::validate_score_tier(score, tier);

        let updated_at = env.ledger().timestamp();
        let valid_until = if ttl_secs > 0 {
            updated_at.saturating_add(ttl_secs)
        } else {
            0
        };

        let previous = Self::get_score(env.clone(), wallet.clone());

        let record = ScoreRecord {
            score,
            tier,
            updated_at,
            valid_until,
        };

        env.storage().persistent().set(&wallet, &record);

        env.events().publish(
            (symbol_short!("score_upd"), wallet.clone()),
            (score, tier, previous.score, previous.tier, updated_at),
        );
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
    fn set_and_get_score() {
        let env = Env::default();
        env.mock_all_auths();
        env.ledger().with_mut(|ledger| {
            ledger.timestamp = 1_718_000_000;
        });

        let contract_id = env.register(ScoreRegistry, ());
        let client = ScoreRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let wallet = Address::generate(&env);

        client.init(&admin);
        client.set_score(&wallet, &387, &2, &2_592_000u64);

        let record = client.get_score(&wallet);
        assert_eq!(record.score, 387);
        assert_eq!(record.tier, 2);
        assert!(record.updated_at > 0);
        assert!(record.valid_until > record.updated_at);
    }

    #[test]
    fn interface_version_returns_one() {
        let env = Env::default();
        let contract_id = env.register(ScoreRegistry, ());
        let client = ScoreRegistryClient::new(&env, &contract_id);
        assert_eq!(client.interface_version(), 1);
    }

    #[test]
    fn is_attested_false_for_new_wallet() {
        let env = Env::default();
        let contract_id = env.register(ScoreRegistry, ());
        let client = ScoreRegistryClient::new(&env, &contract_id);
        let wallet = Address::generate(&env);
        assert!(!client.is_attested(&wallet));
    }

    #[test]
    fn batch_attestation_writes_all() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(ScoreRegistry, ());
        let client = ScoreRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        client.init(&admin);

        let w1 = Address::generate(&env);
        let w2 = Address::generate(&env);

        let wallets = soroban_sdk::vec![&env, w1.clone(), w2.clone()];
        let scores = soroban_sdk::vec![&env, 400u32, 550u32];
        let tiers = soroban_sdk::vec![&env, 2u32, 3u32];

        client.set_scores_batch(&wallets, &scores, &tiers, &0u64);

        assert_eq!(client.get_score(&w1).score, 400);
        assert_eq!(client.get_score(&w2).score, 550);
    }

    #[test]
    fn pause_blocks_set_score() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(ScoreRegistry, ());
        let client = ScoreRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let wallet = Address::generate(&env);

        client.init(&admin);
        client.pause();
        assert!(client.is_paused());

        let result = client.try_set_score(&wallet, &100u32, &1u32, &0u64);
        assert!(result.is_err());
    }

    #[test]
    fn admin_rotation_two_step_updates_admin() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(ScoreRegistry, ());
        let client = ScoreRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let new_admin = Address::generate(&env);

        client.init(&admin);
        client.pause();
        client.propose_admin(&new_admin);

        assert_eq!(client.pending_admin(), Some(new_admin.clone()));

        client.accept_admin();

        assert_eq!(client.admin(), new_admin);
        assert_eq!(client.pending_admin(), None);
        assert!(client.is_paused());
    }

    #[test]
    fn propose_admin_requires_current_admin_auth() {
        let env = Env::default();

        let contract_id = env.register(ScoreRegistry, ());
        let client = ScoreRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let new_admin = Address::generate(&env);

        client.init(&admin);

        let result = client.try_propose_admin(&new_admin);
        assert!(result.is_err());
    }

    #[test]
    fn propose_admin_requires_pause() {
        let env = Env::default();
        env.mock_all_auths();

        let contract_id = env.register(ScoreRegistry, ());
        let client = ScoreRegistryClient::new(&env, &contract_id);

        let admin = Address::generate(&env);
        let new_admin = Address::generate(&env);

        client.init(&admin);

        let result = client.try_propose_admin(&new_admin);
        assert!(result.is_err());
    }
}
