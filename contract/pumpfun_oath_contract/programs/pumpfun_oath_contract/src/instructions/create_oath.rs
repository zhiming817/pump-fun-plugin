use anchor_lang::prelude::*;
use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct CreateOathArgs {
    pub content: String,
    pub category: String,
    pub category_id: String,
    pub start_time: u64,
    pub end_time: u64,
    pub stable_collateral: u64,
    pub collateral_tokens: Vec<CollateralToken>,
    pub is_over_collateralized: bool,
    pub token_address: Option<Pubkey>,
    pub target_apy: Option<u64>,
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
    let collateral_pool = &mut ctx.accounts.collateral_pool;

    // 检查合约是否暂停
    require!(!global_state.is_paused, crate::errors::ErrorCode::ContractPaused);

    // 验证时间参数
    let current_time = Clock::get()?.unix_timestamp as u64;
    require!(args.start_time >= current_time, crate::errors::ErrorCode::InvalidStartTime);
    require!(args.end_time > args.start_time, crate::errors::ErrorCode::InvalidEndTime);

    // 验证内容长度
    require!(args.content.len() <= 200, crate::errors::ErrorCode::ContentTooLong);
    require!(args.category.len() <= 50, crate::errors::ErrorCode::CategoryTooLong);

    // 验证抵押品数量
    require!(args.collateral_tokens.len() <= 10, crate::errors::ErrorCode::TooManyTokens);

    // 计算总抵押品价值
    let mut total_collateral_value: u64 = 0;
    for token in &args.collateral_tokens {
        total_collateral_value = total_collateral_value
            .checked_add(token.amount)
            .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;
    }

    // 验证最小抵押品要求
    require!(total_collateral_value >= 100, crate::errors::ErrorCode::InsufficientCollateral); // 至少100美元

    // 初始化oath账户
    oath.id = global_state.next_oath_id;
    oath.creator = ctx.accounts.creator.key();
    oath.content = args.content;
    oath.category = args.category;
    oath.category_id = "default".to_string(); // 默认分类ID
    oath.start_time = args.start_time;
    oath.end_time = args.end_time;
    oath.stable_collateral = total_collateral_value;
    oath.collateral_tokens = args.collateral_tokens.clone();
    oath.is_over_collateralized = total_collateral_value > 1000; // 超过1000USD认为是过度抵押
    oath.token_address = None; // 可选的PumpFun token地址
    oath.target_apy = None;
    oath.current_apy = None;
    oath.status = OathStatus::Active;
    oath.evidence = String::new();
    oath.slashing_info = None;
    oath.compensation_info = None;
    oath.bump = ctx.bumps.oath;
    oath.created_at = Clock::get()?.unix_timestamp;
    oath.updated_at = Clock::get()?.unix_timestamp;

    // 更新collateral pool
    collateral_pool.total_stable_collateral = collateral_pool
        .total_stable_collateral
        .checked_add(total_collateral_value)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;

    // 更新全局统计
    global_state.total_oaths = global_state
        .total_oaths
        .checked_add(1)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;
        
    global_state.next_oath_id = global_state
        .next_oath_id
        .checked_add(1)
        .ok_or(crate::errors::ErrorCode::ArithmeticOverflow)?;

    Ok(())
}

