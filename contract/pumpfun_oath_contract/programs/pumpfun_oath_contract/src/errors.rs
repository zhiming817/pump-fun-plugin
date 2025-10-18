use anchor_lang::prelude::*;

#[error_code]
pub enum ErrorCode {
    #[msg("Contract is paused")]
    ContractPaused,
    #[msg("Invalid start time")]
    InvalidStartTime,
    #[msg("Invalid end time")]
    InvalidEndTime,
    #[msg("Content too long")]
    ContentTooLong,
    #[msg("Category too long")]
    CategoryTooLong,
    #[msg("Too many tokens")]
    TooManyTokens,
    #[msg("Insufficient collateral")]
    InsufficientCollateral,
    #[msg("Arithmetic overflow")]
    ArithmeticOverflow,
    #[msg("Oath not found")]
    OathNotFound,
    #[msg("Unauthorized")]
    Unauthorized,
    #[msg("Oath already completed")]
    OathAlreadyCompleted,
    #[msg("Oath expired")]
    OathExpired,
    #[msg("Invalid evidence")]
    InvalidEvidence,
    #[msg("Invalid limit")]
    InvalidLimit,
    #[msg("Invalid offset")]
    InvalidOffset,
    #[msg("Invalid address")]
    InvalidAddress,
}