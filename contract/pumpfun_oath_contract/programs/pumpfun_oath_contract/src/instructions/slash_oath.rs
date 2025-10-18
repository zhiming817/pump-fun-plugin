use anchor_lang::prelude::*;
use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct SlashOathArgs {
    pub reason: String,
    pub slashed_percentage: u64, // 基点，例如 5000 = 50%
}

#[derive(Accounts)]
#[instruction(args: SlashOathArgs)]
pub struct SlashOath<'info> {
    #[account(
        mut,
        seeds = [b"oath", oath.id.to_le_bytes().as_ref()],
        bump = oath.bump
    )]
    pub oath: Account<'info, Oath>,

    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump,
        constraint = global_state.authority == authority.key() @ crate::errors::ErrorCode::Unauthorized
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [b"collateral_pool"],
        bump = collateral_pool.bump
    )]
    pub collateral_pool: Account<'info, CollateralPool>,

    #[account(mut)]
    pub authority: Signer<'info>,
}

pub fn slash_oath_handler(ctx: Context<SlashOath>, args: SlashOathArgs) -> Result<()> {
    let oath = &mut ctx.accounts.oath;
    let global_state = &mut ctx.accounts.global_state;
    let collateral_pool = &mut ctx.accounts.collateral_pool;

    // 验证誓言状态（只能对活跃或过期的誓言进行削减）
    require!(
        oath.status == OathStatus::Active || oath.status == OathStatus::Expired,
        crate::errors::ErrorCode::OathAlreadyCompleted
    );

    // 验证削减百分比（最大100%）
    require!(args.slashed_percentage <= 10000, crate::errors::ErrorCode::InvalidEvidence);

    // 验证原因
    require!(args.reason.len() <= 200, crate::errors::ErrorCode::InvalidEvidence);
    require!(!args.reason.is_empty(), crate::errors::ErrorCode::InvalidEvidence);

    // 计算总抵押价值
    let mut total_token_value = 0u64;
    for token in &oath.collateral_tokens {
        total_token_value = total_token_value
            .checked_add(token.usd_value)
            .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;
    }

    let total_collateral_value = oath.stable_collateral
        .checked_add(total_token_value)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;

    // 计算削减金额
    let slashed_amount = total_collateral_value
        .checked_mul(args.slashed_percentage)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?
        .checked_div(10000)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;

    // 更新誓言状态
    oath.status = OathStatus::Failed;
    oath.slashing_info = Some(SlashingInfo {
        slashed_amount,
        slashing_time: Clock::get()?.unix_timestamp as u64,
        reason: args.reason,
    });
    oath.updated_at = Clock::get()?.unix_timestamp;

    // 更新抵押池
    collateral_pool.total_stable_collateral = collateral_pool.total_stable_collateral
        .checked_sub(oath.stable_collateral)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;

    collateral_pool.total_token_collateral = collateral_pool.total_token_collateral
        .checked_sub(total_token_value)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;

    // 更新全局状态
    global_state.total_collateral = global_state.total_collateral
        .checked_sub(total_collateral_value)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;

    msg!(
        "Oath {} slashed by authority. Amount: {}, Reason: {}", 
        oath.id, 
        slashed_amount, 
        oath.slashing_info.as_ref().unwrap().reason
    );
    
    Ok(())
}