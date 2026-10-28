//! Support desk helpers: ticket IDs, agent assignment, follow-up timing and queue order.

use rand::distributions::{Alphanumeric, Distribution, Uniform};
use rand::rngs::{SmallRng, StdRng};
use rand::seq::SliceRandom;
use rand::{thread_rng, Rng, SeedableRng};

/// A ticket ID like `T-4Q7ZK2`: a prefix and six upper-case alphanumeric characters.
pub fn ticket_id<R: Rng>(rng: &mut R) -> String {
    let suffix: String = rng
        .sample_iter(&Alphanumeric)
        .take(6)
        .map(|b| char::from(b).to_ascii_uppercase())
        .collect();
    format!("T-{suffix}")
}

/// The agent a new ticket goes to, or `None` when nobody is on shift.
pub fn assign<'a, R: Rng>(rng: &mut R, agents: &[&'a str]) -> Option<&'a str> {
    agents.choose(rng).copied()
}

/// Minutes before the first follow-up, anywhere in `min..=max`.
pub fn follow_up_minutes<R: Rng>(rng: &mut R, min: u32, max: u32) -> u32 {
    Uniform::new_inclusive(min, max).sample(rng)
}

/// A retry delay: `base` milliseconds plus up to half of it again as jitter.
pub fn jitter_ms(base: u64) -> u64 {
    base + thread_rng().gen_range(0..=base / 2)
}

/// A reproducible generator for replays.
pub fn seeded(seed: u64) -> StdRng {
    StdRng::seed_from_u64(seed)
}

/// A fast generator for load tests.
pub fn fast(seed: u64) -> SmallRng {
    SmallRng::seed_from_u64(seed)
}

/// The order agents pick tickets in during a shift.
pub fn shuffle_queue<R: Rng>(rng: &mut R, queue: &mut [u32]) {
    queue.shuffle(rng);
}
