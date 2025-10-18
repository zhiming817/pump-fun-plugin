use anchor_lang::prelude::*;
use crate::errors::ErrorCode;
use crate::state::oath::{CollateralToken, Oath};
use crate::utils::constants::*;

/// 验证誓言时间参数
pub fn validate_oath_time(start_time: u64, end_time: u64) -> Result<()> {
    let current_time = Clock::get()?.unix_timestamp as u64;
    
    require!(
        start_time >= current_time,
        ErrorCode::InvalidStartTime
    );
    
    require!(
        end_time > start_time,
        ErrorCode::InvalidEndTime
    );
    
    // 确保誓言持续时间至少为1小时
    require!(
        end_time - start_time >= SECONDS_PER_HOUR,
        ErrorCode::InvalidEndTime
    );
    
    Ok(())
}

/// 计算抵押代币的总USD价值
pub fn calculate_total_collateral_value(
    stable_collateral: u64,
    collateral_tokens: &[CollateralToken],
) -> Result<u64> {
    let mut total_token_value = 0u64;
    
    for token in collateral_tokens {
        total_token_value = total_token_value
            .checked_add(token.usd_value)
            .ok_or(ErrorCode::ArithmeticOverflow)?;
    }
    
    stable_collateral
        .checked_add(total_token_value)
        .ok_or(ErrorCode::ArithmeticOverflow.into())
}

/// 验证抵押金额是否足够
pub fn validate_collateral_amount(collateral_value: u64) -> Result<()> {
    require!(
        collateral_value >= MIN_COLLATERAL_USD,
        ErrorCode::InsufficientCollateral
    );
    Ok(())
}

/// 计算削减金额
pub fn calculate_slashing_amount(total_collateral: u64, percentage_bp: u64) -> Result<u64> {
    require!(
        percentage_bp <= BASIS_POINTS_DIVISOR,
        ErrorCode::InvalidEvidence
    );
    
    total_collateral
        .checked_mul(percentage_bp)
        .ok_or(ErrorCode::ArithmeticOverflow)?
        .checked_div(BASIS_POINTS_DIVISOR)
        .ok_or(ErrorCode::ArithmeticOverflow.into())
}

/// 检查誓言是否已过期
pub fn is_oath_expired(oath: &Oath) -> Result<bool> {
    let current_time = Clock::get()?.unix_timestamp as u64;
    Ok(current_time > oath.end_time)
}

/// 验证PDA推导
pub fn validate_pda_derivation(
    program_id: &Pubkey,
    seeds: &[&[u8]],
    expected_address: &Pubkey,
) -> Result<()> {
    let (derived_key, _) = Pubkey::find_program_address(seeds, program_id);
    require!(
        derived_key == *expected_address,
        ErrorCode::InvalidAddress
    );
    Ok(())
}

/// 计算费用
pub fn calculate_fee(amount: u64, fee_rate: u64) -> Result<u64> {
    amount
        .checked_mul(fee_rate)
        .ok_or(ErrorCode::ArithmeticOverflow)?
        .checked_div(BASIS_POINTS_DIVISOR)
        .ok_or(ErrorCode::ArithmeticOverflow.into())
}
