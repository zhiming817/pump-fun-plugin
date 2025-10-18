use anchor_lang::prelude::*;
use crate::state::*;

#[derive(AnchorSerialize, AnchorDeserialize)]
pub struct GetOathListArgs {
    pub offset: u64,
    pub limit: u64,
    pub filter_by_creator: Option<Pubkey>,
    pub filter_by_status: Option<OathStatus>,
    pub filter_by_category: Option<String>,
}

#[derive(Accounts)]
#[instruction(args: GetOathListArgs)]
pub struct GetOathList<'info> {
    #[account(
        seeds = [b"global_state"],
        bump = global_state.bump
    )]
    pub global_state: Account<'info, GlobalState>,
}

// 注意：由于Solana程序的限制，我们不能直接返回复杂的数据结构
// 这个函数主要用于验证参数，实际的列表查询需要在客户端进行
pub fn get_oath_list_handler(ctx: Context<GetOathList>, args: GetOathListArgs) -> Result<()> {
    let global_state = &ctx.accounts.global_state;

    // 验证参数
    require!(args.limit > 0 && args.limit <= 100, crate::errors::ErrorCode::InvalidLimit);
    require!(args.offset < global_state.total_oaths, crate::errors::ErrorCode::InvalidOffset);

    // 验证分类过滤器长度
    if let Some(ref category) = args.filter_by_category {
        require!(category.len() <= 50, crate::errors::ErrorCode::CategoryTooLong);
    }

    msg!("Oath list query validated successfully");
    msg!("Total oaths: {}", global_state.total_oaths);
    msg!("Query offset: {}, limit: {}", args.offset, args.limit);
    
    Ok(())
}

