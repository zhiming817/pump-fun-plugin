use anchor_lang::prelude::*;
use crate::state::*;
use crate::events::*;

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

    // 获取总抵押价值（现在只有 SOL）
    let total_collateral_value = oath.sol_collateral;

    // 计算削减金额
    let slashed_amount = total_collateral_value
        .checked_mul(args.slashed_percentage)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?
        .checked_div(10000)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;

    // 更新誓言状态
    oath.status = OathStatus::Failed;
    
    // 克隆 reason 以便在事件中使用
    let reason_clone = args.reason.clone();
    
    oath.slashing_info = Some(SlashingInfo {
        slashed_amount,
        slashing_time: Clock::get()?.unix_timestamp as u64,
        reason: args.reason,
    });
    oath.updated_at = Clock::get()?.unix_timestamp;

    // 更新抵押池
    collateral_pool.total_stable_collateral = collateral_pool.total_stable_collateral
        .checked_sub(oath.sol_collateral)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;

    // 更新全局状态
    global_state.total_collateral = global_state.total_collateral
        .checked_sub(total_collateral_value)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;

    // 发射事件
    emit!(OathSlashed {
        oath_id: oath.id,
        creator: oath.creator,
        slashed_amount,
        reason: reason_clone,
        timestamp: oath.updated_at,
    });

    msg!(
        "Oath {} slashed by authority. Amount: {}, Reason: {}", 
        oath.id, 
        slashed_amount, 
        oath.slashing_info.as_ref().unwrap().reason
    );
    
    Ok(())
}