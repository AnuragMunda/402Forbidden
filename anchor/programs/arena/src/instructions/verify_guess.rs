use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{transfer, Mint, Token, TokenAccount, Transfer},
};

use crate::{
    states::{ChallengeArena, Config},
    utils::{
        checked_mul_div,
        events::{GuessConfirmed, GuessRejected},
        GameError, MAX_BPS,
    },
};

#[derive(Accounts)]
pub struct VerifyGuess<'info> {
    #[account(mut)]
    pub player: Signer<'info>,

    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,

    #[account(
        mut,
        seeds = [b"arena", arena.arena_id.to_le_bytes().as_ref()],
        bump = arena.bump
    )]
    pub arena: Account<'info, ChallengeArena>,

    #[account(address = config.mint)]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = arena
    )]
    pub vault_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        address = config.treasury_ata,
        associated_token::mint = mint,
        associated_token::authority = config
    )]
    pub treasury_ata: Account<'info, TokenAccount>,

    #[account(
        init_if_needed,
        payer = player,
        associated_token::mint = mint,
        associated_token::authority = player
    )]
    pub player_ata: Account<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> VerifyGuess<'info> {
    pub fn verify_guess(&mut self, hashed_guess: [u8; 32]) -> Result<()> {
        require!(self.arena.is_active, GameError::ArenaInactive);

        let is_winner = hashed_guess == self.arena.secret_hash;

        match is_winner {
            true => {
                self.arena.is_active = false;
                self.arena.winner = Some(self.player.key());
                self.arena.final_prize = self.vault_ata.amount;
                self.payout_winner()?;
            }
            false => self.apply_wrong_guess_fee()?,
        };

        Ok(())
    }

    pub fn payout_winner(&self) -> Result<()> {
        let vault_amount = self.vault_ata.amount;
        let arena = &self.arena;

        require!(vault_amount > 0, GameError::EmptyVault);

        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.vault_ata.to_account_info(),
            to: self.player_ata.to_account_info(),
            authority: arena.to_account_info(),
        };

        let seed = arena.arena_id.to_le_bytes();
        let signer_seeds: &[&[&[u8]]] = &[&[b"arena", seed.as_ref(), &[arena.bump]]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);
        transfer(cpi_ctx, vault_amount)?;

        emit!(GuessConfirmed {
            arena_id: arena.arena_id,
            winner: self.player.key(),
            prize: vault_amount
        });

        Ok(())
    }

    pub fn apply_wrong_guess_fee(&self) -> Result<()> {
        let arena = &self.arena;
        let config = &self.config;

        let cpi_program = self.token_program.to_account_info();

        let vault_cpi_accounts = Transfer {
            from: self.player_ata.to_account_info(),
            to: self.vault_ata.to_account_info(),
            authority: self.player.to_account_info(),
        };

        let vault_cpi_ctx = CpiContext::new(cpi_program, vault_cpi_accounts);

        let platform_fee = checked_mul_div(
            arena.guess_fee,
            config.platform_fee_bps.into(),
            MAX_BPS.into(),
        )?;
        let vault_share = arena
            .guess_fee
            .checked_sub(platform_fee)
            .ok_or(GameError::ArenaOverflow)?;

        require!(vault_share > 0, GameError::InvalidAmount);

        let total = vault_share
            .checked_add(platform_fee)
            .ok_or(GameError::ArenaOverflow)?;

        require!(
            self.player_ata.amount >= total,
            GameError::InsufficientBalance
        );

        transfer(vault_cpi_ctx, vault_share)?;
        self.deduct_platform_fee(platform_fee)?;

        emit!(GuessRejected {
            arena_id: arena.arena_id,
            player: self.player.key()
        });

        Ok(())
    }

    pub fn deduct_platform_fee(&self, platform_fee: u64) -> Result<()> {
        if platform_fee == 0 {
            return Ok(());
        }

        let cpi_program = self.token_program.to_account_info();

        let platform_cpi_accounts = Transfer {
            from: self.player_ata.to_account_info(),
            to: self.treasury_ata.to_account_info(),
            authority: self.player.to_account_info(),
        };

        let platform_cpi_ctx = CpiContext::new(cpi_program, platform_cpi_accounts);

        transfer(platform_cpi_ctx, platform_fee)
    }
}
