use anchor_lang::prelude::*;
use anchor_lang::system_program;
use crate::state::*;
use crate::events::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateOathArgs {
    pub start_time: u64,
    pub end_time: u64,               // 结束时间
    pub sol_collateral: u64,         // 质押的 SOL 数量（lamports）
    pub token_address: Pubkey,       // 关联的 token 地址（必填）
    pub target_market_cap: u64,      // 目标市值（USDC，例如 78320 表示 $78,320）
}

#[derive(Accounts)]
#[instruction(args: CreateOathArgs)]
pub struct CreateOath<'info> {
    #[account(
        mut,
        seeds = [b"global_state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,

    #[account(
        init,
        payer = creator,
        space = Oath::MAXIMUM_SIZE,
        seeds = [b"oath", global_state.next_oath_id.to_le_bytes().as_ref()],
        bump
    )]
    pub oath: Account<'info, Oath>,

    #[account(
        mut,
        seeds = [b"collateral_pool"],
        bump = collateral_pool.bump
    )]
    pub collateral_pool: Account<'info, CollateralPool>,

    #[account(mut)]
    pub creator: Signer<'info>,
    
    pub system_program: Program<'info, System>,
}

pub fn create_oath_handler(ctx: Context<CreateOath>, args: CreateOathArgs) -> Result<()> {
    let global_state = &mut ctx.accounts.global_state;
    let oath = &mut ctx.accounts.oath;

    // 检查合约是否暂停
    require!(!global_state.is_paused, crate::errors::ErrorCode::ContractPaused);

    // 验证时间参数
    let current_time = Clock::get()?.unix_timestamp as u64;
    require!(args.start_time >= current_time, crate::errors::ErrorCode::InvalidStartTime);
    require!(args.end_time > args.start_time, crate::errors::ErrorCode::InvalidEndTime);

    // 验证SOL抵押数量（至少0.1 SOL）
    require!(args.sol_collateral >= 100_000_000, crate::errors::ErrorCode::InsufficientCollateral); // 0.1 SOL

    // 转移SOL到抵押池
    let transfer_instruction = system_program::Transfer {
        from: ctx.accounts.creator.to_account_info(),
        to: ctx.accounts.collateral_pool.to_account_info(),
    };
    
    let cpi_context = CpiContext::new(
        ctx.accounts.system_program.to_account_info(),
        transfer_instruction,
    );
    
    system_program::transfer(cpi_context, args.sol_collateral)?;

    // 初始化oath账户
    oath.id = global_state.next_oath_id;
    oath.creator = ctx.accounts.creator.key();
    oath.start_time = args.start_time;
    oath.end_time = args.end_time;
    oath.sol_collateral = args.sol_collateral;
    oath.token_address = args.token_address;
    oath.target_market_cap = args.target_market_cap;
    oath.status = OathStatus::Active;
    oath.evidence = String::new();
    oath.slashing_info = None;
    oath.compensation_info = None;
    oath.bump = ctx.bumps.oath;
    oath.created_at = Clock::get()?.unix_timestamp;
    oath.updated_at = Clock::get()?.unix_timestamp;

    // 更新collateral pool (借用 ctx.accounts.collateral_pool 而不是使用之前的可变引用)
    let collateral_pool = &mut ctx.accounts.collateral_pool;
    collateral_pool.total_stable_collateral = collateral_pool
        .total_stable_collateral
        .checked_add(args.sol_collateral)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;

    // 更新全局统计
    global_state.total_oaths = global_state
        .total_oaths
        .checked_add(1)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;
        
    global_state.total_collateral = global_state
        .total_collateral
        .checked_add(args.sol_collateral)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;
        
    global_state.next_oath_id = global_state
        .next_oath_id
        .checked_add(1)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;

    // create事件
    emit!(OathCreated {
        oath_id: oath.id,
        creator: oath.creator,
        token_address: oath.token_address,
        sol_collateral: oath.sol_collateral,
        target_market_cap: oath.target_market_cap,
        start_time: oath.start_time,
        end_time: oath.end_time,
        timestamp: oath.created_at,
    });

    Ok(())
}

