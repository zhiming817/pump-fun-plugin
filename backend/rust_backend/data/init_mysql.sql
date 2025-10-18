-- MySQL 数据库初始化脚本
-- 用于重建 create_events 表

-- 1. 删除旧表（如果存在）
DROP TABLE IF EXISTS create_events;

-- 2. 创建新表（使用正确的字段类型）
CREATE TABLE create_events (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name TEXT NOT NULL,
    symbol TEXT NOT NULL,
    uri TEXT NOT NULL,
    mint VARCHAR(255) NOT NULL UNIQUE,  -- 使用 VARCHAR(255) 而不是 TEXT，以支持 UNIQUE 索引
    bonding_curve TEXT NOT NULL,
    user_pubkey TEXT NOT NULL,
    creator TEXT NOT NULL,
    timestamp BIGINT NOT NULL,
    virtual_token_reserves TEXT NOT NULL,
    virtual_sol_reserves TEXT NOT NULL,
    real_token_reserves TEXT NOT NULL,
    token_total_supply TEXT NOT NULL,
    transaction_signature TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_timestamp (timestamp),
    INDEX idx_creator (creator(255)),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- 3. 验证表结构
SHOW CREATE TABLE create_events;

-- 4. 查看索引
SHOW INDEX FROM create_events;
