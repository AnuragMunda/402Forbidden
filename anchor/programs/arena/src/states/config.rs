use anchor_lang::prelude::*;

/// Long-term configuration of the game
#[account]
#[derive(InitSpace)]
pub struct Config {
    pub admin: Pubkey,         // Address of the Admin
    pub arena_count: u32,      // Total arena count
    pub mint: Pubkey,          // Mint token address
    pub treasury_ata: Pubkey,  // ATA to hold the platform treasury
    pub platform_fee_bps: u16, // Percentage the platform will cut from the fees
    pub bump: u8,              // Config PDA bump
}
