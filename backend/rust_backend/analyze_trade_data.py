#!/usr/bin/env python3
import base64

# 从日志中提取的 Program data
program_data = "vdt/007mYe5g3SpGhAYdzx3/9GyXZKECpiaAigGuqucVOhIJmQlmWjgAAAAAAAAAgIQeAAAAAAABxyGfqRD0ZWGZnDPQtpsKWSslIRIf1LKARkrDjiQa3RexZfJoAAAAAPgqJPwGAAAAUAKQAuPPAwD4fgAAAAAAAFD6a4uQLQAATFUZ6YdkErhSyvcipCgdzWuEagoSddE6opaSJOhbZbFfAAAAAAAAAAEAAAAAAAAAxyGfqRD0ZWGZnDPQtpsKWSslIRIf1LKARkrDjiQa3RceAAAAAAAAAAEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAGJ1eQ=="

decoded = base64.b64decode(program_data)
print(f"✅ 解码成功!")
print(f"📊 总长度: {len(decoded)} bytes\n")

print("=" * 60)
print("数据分析:")
print("=" * 60)
print(f"前 8 字节 (discriminator): {decoded[:8].hex()}")
print(f"后续数据长度: {len(decoded) - 8} bytes")
print(f"\n末尾 20 字节 (hex): {decoded[-20:].hex()}")
print(f"末尾 20 字节 (UTF-8): {decoded[-20:].decode('utf-8', errors='ignore')}")

# 尝试解析为 TradeEvent 结构
# 根据 Solscan 截图，TradeEvent 有以下字段（按顺序）:
# - mint: 32 bytes (Pubkey)
# - solAmount: 8 bytes (u64)
# - tokenAmount: 8 bytes (u64)
# - isBuy: 1 byte (bool)
# - user: 32 bytes (Pubkey)
# - timestamp: 8 bytes (u64)
# ... 等等

offset = 8  # 跳过 discriminator

print(f"\n{'=' * 60}")
print("尝试解析字段 (从第 8 字节开始):")
print("=" * 60)

# 辅助函数
def read_pubkey(data, offset):
    return data[offset:offset+32].hex(), offset + 32

def read_u64(data, offset):
    value = int.from_bytes(data[offset:offset+8], 'little')
    return value, offset + 8

def read_bool(data, offset):
    return bool(data[offset]), offset + 1

try:
    # Mint (32 bytes)
    mint_hex, offset = read_pubkey(decoded, offset)
    print(f"\n1. Mint: {mint_hex}")
    
    # SOL Amount (8 bytes)
    sol_amount, offset = read_u64(decoded, offset)
    print(f"2. SOL Amount: {sol_amount}")
    
    # Token Amount (8 bytes)
    token_amount, offset = read_u64(decoded, offset)
    print(f"3. Token Amount: {token_amount}")
    
    # Is Buy (1 byte)
    is_buy, offset = read_bool(decoded, offset)
    print(f"4. Is Buy: {is_buy}")
    
    # User (32 bytes)
    user_hex, offset = read_pubkey(decoded, offset)
    print(f"5. User: {user_hex}")
    
    # Timestamp (8 bytes)
    timestamp, offset = read_u64(decoded, offset)
    print(f"6. Timestamp: {timestamp}")
    
    print(f"\n✅ 成功解析前 6 个字段!")
    print(f"📍 当前偏移量: {offset} / {len(decoded)} bytes")
    print(f"🔄 剩余: {len(decoded) - offset} bytes")
    
except Exception as e:
    print(f"\n❌ 解析失败: {e}")

print(f"\n{'=' * 60}")
print(f"结论: 这是 {'指令数据' if decoded[-10:].decode('utf-8', errors='ignore').strip() else '可能是事件数据'}")
print("=" * 60)
