use anchor_lang::prelude::*;
use anchor_spl::{
    associated_token::AssociatedToken,
    token::{Mint, Token, TokenAccount},
};

use crate::{
    states::Config,
    utils::{GameError, BPS_CAP},
};

#[derive(Accounts)]
pub struct InitializeConfig<'info> {
    #[account(mut)]
    pub admin: Signer<'info>,

    #[account(
        init,
        payer = admin,
        space = Config::DISCRIMINATOR.len() + Config::INIT_SPACE,
        seeds = [b"config"],
        bump
    )]
    pub config: Account<'info, Config>,

    pub mint: Account<'info, Mint>,

    #[account(
        init,
        payer = admin,
        associated_token::mint = mint,
        associated_token::authority = config
    )]
    pub treasury_ata: Account<'info, TokenAccount>,

    pub associated_token_program: Program<'info, AssociatedToken>,
    pub token_program: Program<'info, Token>,
    pub system_program: Program<'info, System>,
}

impl<'info> InitializeConfig<'info> {
    pub fn init_config(
        &mut self,
        platform_fee_bps: u16,
        bumps: InitializeConfigBumps,
    ) -> Result<()> {
        require!(platform_fee_bps <= BPS_CAP, GameError::InvalidFee);

        // Set the config states
        self.config.set_inner(Config {
            admin: self.admin.key(),
            arena_count: 0,
            mint: self.mint.key(),
            treasury_ata: self.treasury_ata.key(),
            platform_fee_bps,
            bump: bumps.config,
        });

        Ok(())
    }
}
