-- Oath Created Events 表初始化脚本

-- 创建 oath_created_events 表
CREATE TABLE IF NOT EXISTS oath_created_events (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT '自增主键',
    oath_id BIGINT NOT NULL UNIQUE COMMENT 'Oath ID (唯一标识)',
    creator VARCHAR(255) NOT NULL COMMENT '创建者地址',
    token_address VARCHAR(255) NOT NULL COMMENT 'Token 地址',
    sol_collateral BIGINT NOT NULL COMMENT 'SOL 抵押金额 (lamports)',
    target_market_cap BIGINT NOT NULL COMMENT '目标市值 (USDC, 6 decimals)',
    start_time BIGINT NOT NULL COMMENT '开始时间 (Unix timestamp)',
    end_time BIGINT NOT NULL COMMENT '结束时间 (Unix timestamp)',
    timestamp BIGINT NOT NULL COMMENT '事件时间戳',
    signature VARCHAR(255) COMMENT '交易签名',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP COMMENT '创建时间',
    INDEX idx_creator (creator) COMMENT '创建者索引',
    INDEX idx_token_address (token_address) COMMENT 'Token地址索引',
    INDEX idx_created_at (created_at) COMMENT '创建时间索引'
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='Oath 创建事件表';

-- 查看表结构
SHOW CREATE TABLE oath_created_events;
