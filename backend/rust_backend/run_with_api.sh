#!/bin/bash

# 启动 HTTP API 服务器
# 设置环境变量启用 HTTP API

export ENABLE_HTTP_API=true

echo "🚀 启动带 HTTP API 的事件监听器..."
cargo run --release --bin rust_backend
