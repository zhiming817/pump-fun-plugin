#!/bin/bash

# 执行数据库迁移脚本
# 添加元数据字段到 create_events 表

# MySQL 配置（从 config.yaml 读取）
DB_HOST="localhost"
DB_PORT="3306"
DB_USER="root"
DB_PASSWORD="root"
DB_NAME="pumpfun"

echo "🗄️  执行数据库迁移: 添加元数据字段"
echo "数据库: $DB_NAME@$DB_HOST:$DB_PORT"
echo ""

# 执行 SQL 脚本
mysql -h "$DB_HOST" -P "$DB_PORT" -u "$DB_USER" -p"$DB_PASSWORD" "$DB_NAME" < data/add_metadata_fields.sql

if [ $? -eq 0 ]; then
    echo ""
    echo "✅ 数据库迁移成功！"
    echo ""
    echo "新增字段:"
    echo "  - twitter (VARCHAR 500)"
    echo "  - telegram (VARCHAR 500)"
    echo "  - website (VARCHAR 500)"
    echo "  - image (TEXT)"
    echo ""
    echo "现在可以运行:"
    echo "  cargo run --bin fetch_metadata  # 批量获取元数据"
    echo "  cargo run --bin http_server     # 启动 API 服务器"
else
    echo ""
    echo "❌ 数据库迁移失败！"
    echo "请检查数据库连接配置"
fi
