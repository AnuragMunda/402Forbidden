use anchor_lang::prelude::*;

#[event]
pub struct ArenaCreated {
    pub arena_id: u32,
    pub prize: u64,
}

#[event]
pub struct TreasuryFunded {
    pub amount: u64,
}

#[event]
pub struct GuessConfirmed {
    pub arena_id: u32,
    pub winner: Pubkey,
    pub prize: u64,
}

#[event]
pub struct GuessRejected {
    pub arena_id: u32,
    pub player: Pubkey,
}

#[event]
pub struct TreasuryWithdrawn {
    pub amount: u64,
}
