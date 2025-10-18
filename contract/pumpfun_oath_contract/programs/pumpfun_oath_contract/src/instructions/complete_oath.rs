use anchor_lang::prelude::*;
use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CompleteOathArgs {
    pub evidence: String,
}

#[derive(Accounts)]
#[instruction(args: CompleteOathArgs)]
pub struct CompleteOath<'info> {
    #[account(
        mut,
        seeds = [b"oath", oath.id.to_le_bytes().as_ref()],
        bump = oath.bump,
        constraint = oath.creator == creator.key() @ crate::errors::ErrorCode::Unauthorized
    )]
    pub oath: Account<'info, Oath>,

    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        mut,
        seeds = [b"collateral_pool"],
        bump = collateral_pool.bump
    )]
    pub collateral_pool: Account<'info, CollateralPool>,

    #[account(mut)]
    pub creator: Signer<'info>,
}

pub fn complete_oath_handler(ctx: Context<CompleteOath>, args: CompleteOathArgs) -> Result<()> {
    let oath = &mut ctx.accounts.oath;
    let global_state = &mut ctx.accounts.global_state;
    let collateral_pool = &mut ctx.accounts.collateral_pool;

    // 验证誓言状态
    require!(oath.status == OathStatus::Active, crate::errors::ErrorCode::OathAlreadyCompleted);

    // 验证时间
    let current_time = Clock::get()?.unix_timestamp as u64;
    require!(current_time <= oath.end_time, crate::errors::ErrorCode::OathExpired);
    require!(current_time >= oath.start_time, crate::errors::ErrorCode::InvalidStartTime);

    // 验证证据
    require!(args.evidence.len() <= 500, crate::errors::ErrorCode::InvalidEvidence);
    require!(!args.evidence.is_empty(), crate::errors::ErrorCode::InvalidEvidence);

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

    // 更新誓言状态
    oath.status = OathStatus::Completed;
    oath.evidence = args.evidence;
    oath.updated_at = Clock::get()?.unix_timestamp;

    // 更新抵押池（释放抵押）
    collateral_pool.total_stable_collateral = collateral_pool.total_stable_collateral
        .checked_sub(oath.stable_collateral)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;

    collateral_pool.total_token_collateral = collateral_pool.total_token_collateral
        .checked_sub(total_token_value)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;

    // 更新全局状态（释放总抵押）
    global_state.total_collateral = global_state.total_collateral
        .checked_sub(total_collateral_value)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;

    msg!("Oath {} completed successfully by {}", oath.id, oath.creator);
    Ok(())
}