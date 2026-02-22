use anchor_lang::prelude::*;
use anchor_spl::token::{transfer, Mint, Token, TokenAccount, Transfer};

use crate::states::Config;
use crate::utils::{events::TreasuryFunded, GameError};

#[derive(Accounts)]
pub struct FundTreasury<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        mut,
        has_one = admin,
        seeds = [b"config"],
        bump = config.bump
    )]
    pub config: Account<'info, Config>,

    #[account(address = config.mint)]
    pub mint: Account<'info, Mint>,

    #[account(
        mut,
        address = config.treasury_ata,
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
}

impl<'info> FundTreasury<'info> {
    pub fn fund_treasury(&mut self, amount: u64) -> Result<()> {
        require!(amount > 0u64, GameError::InvalidAmount);
        require!(
            self.admin_ata.amount >= amount,
            GameError::InsufficientBalance
        );

        // Transfer funds to treasury
        let cpi_program = self.token_program.to_account_info();
        let cpi_accounts = Transfer {
            from: self.admin_ata.to_account_info(),
            to: self.treasury_ata.to_account_info(),
            authority: self.admin.to_account_info(),
        };

        let cpi_ctx = CpiContext::new(cpi_program, cpi_accounts);

        transfer(cpi_ctx, amount)?;

        emit!(TreasuryFunded { amount });

        Ok(())
    }
}
