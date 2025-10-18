use anchor_lang::prelude::*;
use crate::state::*;

#[derive(Accounts)]
pub struct Initialize<'info> {
    #[account(
        init,
        payer = authority,
        space = GlobalState::MAXIMUM_SIZE,
        seeds = [b"global_state"],
        bump
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        init,
        payer = authority,
        space = CollateralPool::MAXIMUM_SIZE,
        seeds = [b"collateral_pool"],
        bump
    )]
    pub collateral_pool: Account<'info, CollateralPool>,

    #[account(mut)]
    pub authority: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn initialize_handler(ctx: Context<Initialize>) -> Result<()> {
    let global_state = &mut ctx.accounts.global_state;
    let collateral_pool = &mut ctx.accounts.collateral_pool;

    // 初始化全局状态
    global_state.authority = ctx.accounts.authority.key();
    global_state.next_oath_id = 1;
    global_state.total_oaths = 0;
    global_state.total_collateral = 0;
    global_state.is_paused = false;
    global_state.bump = ctx.bumps.global_state;

    // 初始化抵押池
    collateral_pool.authority = ctx.accounts.authority.key();
    collateral_pool.total_stable_collateral = 0;
    collateral_pool.total_token_collateral = 0;
    collateral_pool.supported_tokens = Vec::new();
    collateral_pool.bump = ctx.bumps.collateral_pool;

    msg!("Oath contract initialized successfully");
    Ok(())
}