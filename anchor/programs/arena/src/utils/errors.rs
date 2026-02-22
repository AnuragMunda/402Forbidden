use anchor_lang::prelude::*;

#[error_code]
pub enum GameError {
    #[msg("Invalid Amount")]
    InvalidAmount,
    #[msg("Insufficient balance available")]
    InsufficientBalance,
    #[msg("Invalid fee")]
    InvalidFee,
    #[msg("Low treasury balance")]
    InsufficientTreasuryFunds,
    #[msg("Overflow")]
    ArenaOverflow,
    #[msg("Arena not active")]
    ArenaInactive,
    #[msg("Vault is empty")]
    EmptyVault,
}
