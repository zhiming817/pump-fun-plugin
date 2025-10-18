use anchor_lang::prelude::*;

declare_id!("Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ");

pub mod state;
pub mod instructions;
pub mod errors;
pub mod utils;

use instructions::*;
pub use errors::*;

#[program]
pub mod pumpfun_oath_contract {
    use super::*;

    /// 初始化合约
    pub fn initialize(ctx: Context<Initialize>) -> Result<()> {
        instructions::initialize_handler(ctx)
    }

    /// 创建誓言
    pub fn create_oath(ctx: Context<CreateOath>, args: CreateOathArgs) -> Result<()> {
        instructions::create_oath_handler(ctx, args)
    }

    /// 完成誓言
    pub fn complete_oath(ctx: Context<CompleteOath>, args: CompleteOathArgs) -> Result<()> {
        instructions::complete_oath_handler(ctx, args)
    }

    /// 削减誓言（管理员功能）
    pub fn slash_oath(ctx: Context<SlashOath>, args: SlashOathArgs) -> Result<()> {
        instructions::slash_oath_handler(ctx, args)
    }

    /// 获取誓言列表（验证查询参数）
    pub fn get_oath_list(ctx: Context<GetOathList>, args: GetOathListArgs) -> Result<()> {
        instructions::get_oath_list_handler(ctx, args)
    }
}
