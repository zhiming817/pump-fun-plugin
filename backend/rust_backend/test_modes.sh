#!/bin/bash

# Solana Vault 事件监听器 - 快速测试

echo "======================================"
echo "测试 WebSocket 和 Polling 模式"
echo "======================================"
echo ""

# 测试 1: Polling 模式
echo "📋 测试 1: 轮询模式（默认）"
echo "命令: cargo run"
echo "按 Ctrl+C 停止..."
echo ""
cargo run &
PID1=$!
sleep 8
kill $PID1 2>/dev/null
echo ""
echo "✅ 轮询模式测试完成"
echo ""

# 测试 2: WebSocket 模式
echo "======================================"
echo "📋 测试 2: WebSocket 模式"
echo "命令: LISTENER_MODE=websocket cargo run"
echo "按 Ctrl+C 停止..."
echo ""
LISTENER_MODE=websocket cargo run &
PID2=$!
sleep 8
kill $PID2 2>/dev/null
echo ""
echo "✅ WebSocket 模式测试完成"
echo ""

echo "======================================"
echo "✨ 所有测试完成！"
echo "======================================"
echo ""
echo "📝 使用说明："
echo "  轮询模式: cargo run"
echo "  WebSocket 模式: LISTENER_MODE=websocket cargo run"
echo ""
