// 系统常量
pub const MIN_COLLATERAL_USD: u64 = 100;           // 最小抵押金额（美元）
pub const MAX_CONTENT_LENGTH: usize = 200;         // 誓言内容最大长度
pub const MAX_CATEGORY_LENGTH: usize = 50;         // 分类名称最大长度
pub const MAX_EVIDENCE_LENGTH: usize = 500;        // 证据最大长度
pub const MAX_REASON_LENGTH: usize = 200;          // 削减原因最大长度
pub const MAX_COLLATERAL_TOKENS: usize = 10;       // 最大抵押代币数量
pub const MAX_ACTIVE_OATHS_PER_USER: usize = 50;   // 每用户最大活跃誓言数
pub const MAX_SUPPORTED_TOKENS: usize = 20;        // 最大支持代币数
pub const MAX_QUERY_LIMIT: u64 = 100;             // 最大查询限制
pub const BASIS_POINTS_DIVISOR: u64 = 10000;      // 基点除数（100% = 10000 基点）

// 时间常量
pub const SECONDS_PER_DAY: u64 = 86400;
pub const SECONDS_PER_HOUR: u64 = 3600;
pub const SECONDS_PER_MINUTE: u64 = 60;

// PDA 种子常量
pub const GLOBAL_STATE_SEED: &[u8] = b"global_state";
pub const COLLATERAL_POOL_SEED: &[u8] = b"collateral_pool";
pub const OATH_SEED: &[u8] = b"oath";
pub const USER_COLLATERAL_SEED: &[u8] = b"user_collateral";