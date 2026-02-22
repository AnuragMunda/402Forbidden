use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};

use crate::states::Config;
use crate::utils::{events::TreasuryWithdrawn, GameError};

#[derive(Accounts)]
pub struct WithdrawTreasury<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,

    #[account(address = config.mint)]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = config
    )]
    pub treasury_ata: Account<'info, TokenAccount>,

    #[account(
        mut,
        associated_token::mint = mint,
        associated_token::authority = admin
    )]
    pub admin_ata: Account<'info, TokenAccount>,

    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> WithdrawTreasury<'info> {
    pub fn withdraw_treasury(&mut self, amount: u64) -> Result<()> {
        let treasury = &self.treasury_ata;
        let config = &self.config;

        require!(
            amount <= treasury.amount,
            GameError::InsufficientTreasuryFunds
        );

        let cpi_program = self.token_program.to_account_info();

        let cpi_accounts = Transfer {
            from: treasury.to_account_info(),
            to: self.admin_ata.to_account_info(),
            authority: config.to_account_info(),
        };

        let signer_seeds: &[&[&[u8]]] = &[&[b"config", &[config.bump]]];

        let cpi_ctx = CpiContext::new_with_signer(cpi_program, cpi_accounts, signer_seeds);

        transfer(cpi_ctx, amount)?;

        emit!(TreasuryWithdrawn { amount });

        Ok(())
    }
}
