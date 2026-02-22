use anchor_lang::prelude::*;

/// The main state of the current challenge
#[account]
#[derive(InitSpace)]
pub struct ChallengeArena {
    pub arena_id: u32,          // The id of the Arena
    pub winner: Option<Pubkey>, // Winner of this arena
    pub initial_prize: u64,     // The initial amount stored in vault as prize money
    pub final_prize: u64,       // The final amount won by a player
    pub secret_hash: [u8; 32],  // The hash of the real secret/password
    pub vault_ata: Pubkey,      // The ATA for the vault
    pub guess_fee: u64,         // The fee charged to submit password
    pub hint_fee: u64,          // The fee charged to generate a new hint
    pub is_active: bool,        // Flag indicating if the challenge is active/inactive
    pub bump: u8,               // Bump for Challenge Arena PDA
}
