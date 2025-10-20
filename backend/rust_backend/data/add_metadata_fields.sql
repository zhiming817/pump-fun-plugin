-- 为 create_events 表添加元数据字段
-- Twitter, Telegram, Website, Image

ALTER TABLE create_events 
ADD COLUMN twitter VARCHAR(500),
ADD COLUMN telegram VARCHAR(500),
ADD COLUMN website VARCHAR(500),
ADD COLUMN image TEXT;

-- 添加索引以提高查询性能
CREATE INDEX idx_create_events_twitter ON create_events(twitter);
CREATE INDEX idx_create_events_has_metadata ON create_events(twitter, telegram, website, image);
