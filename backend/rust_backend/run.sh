#!/bin/bash

echo "======================================"
echo "Solana Vault 事件监听器 - 测试脚本"
echo "======================================"
echo ""

# 显示当前配置
echo "📋 当前配置："
echo "  RPC 端点: https://api.zan.top/node/v1/solana/devnet/55c625d41c924f97971cdd05bb533048"
echo "  Program ID: HZWKVfammvEHaNfPnYTppEgXYppZWfqPiGgxwgAjEdVv"
echo ""

# 测试选项
echo "请选择测试模式："
echo "  1) 轮询模式 (Polling) - 每5秒查询一次"
echo "  2) WebSocket 模式 - 实时监听"
echo "  3) 自定义配置"
echo ""

read -p "请输入选项 (1-3): " choice

case $choice in
  1)
    echo ""
    echo "🔄 启动轮询模式..."
    echo "======================================"
    export LISTENER_MODE=polling
    cargo run
    ;;
  2)
    echo ""
    echo "📡 启动 WebSocket 模式..."
    echo "======================================"
    export LISTENER_MODE=websocket
    cargo run
    ;;
  3)
    echo ""
    echo "⚙️  自定义配置"
    echo "======================================"
    
    read -p "RPC URL (留空使用默认): " custom_rpc
    read -p "Program ID (留空使用默认): " custom_program
    read -p "监听模式 (polling/websocket, 默认 polling): " custom_mode
    
    if [ ! -z "$custom_rpc" ]; then
      export SOLANA_RPC_URL="$custom_rpc"
      echo "✓ 使用自定义 RPC: $custom_rpc"
    fi
    
    if [ ! -z "$custom_program" ]; then
      export VAULT_PROGRAM_ID="$custom_program"
      echo "✓ 使用自定义 Program ID: $custom_program"
    fi
    
    if [ ! -z "$custom_mode" ]; then
      export LISTENER_MODE="$custom_mode"
      echo "✓ 使用模式: $custom_mode"
    fi
    
    echo ""
    echo "启动事件监听器..."
    echo "======================================"
    cargo run
    ;;
  *)
    echo "❌ 无效选项"
    exit 1
    ;;
esac
