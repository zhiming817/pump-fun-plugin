#!/usr/bin/env python3
import base64

# 从截图的 Instruction Data (hex) 转换
hex_data = "e445a52e51cb9a1dbddb7fd34ee661ee60dd2a4684061dcf1dfff46c9764a102a626808a01aeaae7153a120999096650000080841e00000000000001c7219fa910f46561999c33d0b69b0a592b2521121fd4b280464ac38e241add17c867f2680000000302b24fc0690000d07df102e3cf0300307f00000000000000d0754d8b902d00004c5519e98764012b852caf722a4281dcd6b846a8a021275d13aa2971e0000000005b0000000000000010000000000000001000000000000000c7219fa910f46561999c33d0b69b0a592b2521121fd4b280464ac38e241add171e00000000000001000000000000000100000000000000000000000000000000000000000000000000000000000030000000627579"

# 转为字节
data = bytes.fromhex(hex_data)
print(f"✅ 总长度: {len(data)} bytes\n")

print("=" * 70)
print("完整数据分析:")
print("=" * 70)

# 辅助函数
def read_pubkey(data, offset):
    pubkey_bytes = data[offset:offset+32]
    # 转为 base58 需要额外库，这里先用 hex
    return pubkey_bytes.hex(), offset + 32

def read_u64(data, offset):
    value = int.from_bytes(data[offset:offset+8], 'little')
    return value, offset + 8

def read_bool(data, offset):
    return bool(data[offset]), offset + 1

offset = 0

# 前 8 字节：指令鉴别器
discriminator = data[offset:offset+8].hex()
print(f"指令鉴别器 (8 bytes): {discriminator}")
offset += 8

# 接下来应该是 TradeEvent 的数据
print(f"\n{'=' * 70}")
print("TradeEvent 字段解析:")
print("=" * 70)

try:
    # Mint (32 bytes)
    mint_hex, offset = read_pubkey(data, offset)
    print(f"1. Mint (32 bytes): {mint_hex}")
    
    # SOL Amount (8 bytes)
    sol_amount, offset = read_u64(data, offset)
    print(f"2. SOL Amount (8 bytes): {sol_amount}")
    
    # Token Amount (8 bytes)
    token_amount, offset = read_u64(data, offset)
    print(f"3. Token Amount (8 bytes): {token_amount}")
    
    # Is Buy (1 byte)
    is_buy, offset = read_bool(data, offset)
    print(f"4. Is Buy (1 byte): {is_buy}")
    
    # User (32 bytes)
    user_hex, offset = read_pubkey(data, offset)
    print(f"5. User (32 bytes): {user_hex}")
    
    # Timestamp (8 bytes)
    timestamp, offset = read_u64(data, offset)
    print(f"6. Timestamp (8 bytes): {timestamp}")
    
    # Virtual SOL Reserves (8 bytes)
    virtual_sol, offset = read_u64(data, offset)
    print(f"7. Virtual SOL Reserves (8 bytes): {virtual_sol}")
    
    # Virtual Token Reserves (8 bytes)
    virtual_token, offset = read_u64(data, offset)
    print(f"8. Virtual Token Reserves (8 bytes): {virtual_token}")
    
    # Real SOL Reserves (8 bytes)
    real_sol, offset = read_u64(data, offset)
    print(f"9. Real SOL Reserves (8 bytes): {real_sol}")
    
    # Real Token Reserves (8 bytes)
    real_token, offset = read_u64(data, offset)
    print(f"10. Real Token Reserves (8 bytes): {real_token}")
    
    # Fee Recipient (32 bytes)
    fee_recipient_hex, offset = read_pubkey(data, offset)
    print(f"11. Fee Recipient (32 bytes): {fee_recipient_hex}")
    
    # Fee Basis Points (8 bytes)
    fee_basis_points, offset = read_u64(data, offset)
    print(f"12. Fee Basis Points (8 bytes): {fee_basis_points}")
    
    # Fee (8 bytes)
    fee, offset = read_u64(data, offset)
    print(f"13. Fee (8 bytes): {fee}")
    
    # Creator (32 bytes)
    creator_hex, offset = read_pubkey(data, offset)
    print(f"14. Creator (32 bytes): {creator_hex}")
    
    # Creator Fee Basis Points (8 bytes)
    creator_fee_basis, offset = read_u64(data, offset)
    print(f"15. Creator Fee Basis Points (8 bytes): {creator_fee_basis}")
    
    # Creator Fee (8 bytes)
    creator_fee, offset = read_u64(data, offset)
    print(f"16. Creator Fee (8 bytes): {creator_fee}")
    
    # Track Volume (1 byte)
    track_volume, offset = read_bool(data, offset)
    print(f"17. Track Volume (1 byte): {track_volume}")
    
    # Total Unclaimed Tokens (8 bytes)
    unclaimed, offset = read_u64(data, offset)
    print(f"18. Total Unclaimed Tokens (8 bytes): {unclaimed}")
    
    # Total Claimed Tokens (8 bytes)
    claimed, offset = read_u64(data, offset)
    print(f"19. Total Claimed Tokens (8 bytes): {claimed}")
    
    # Current SOL Volume (8 bytes)
    current_volume, offset = read_u64(data, offset)
    print(f"20. Current SOL Volume (8 bytes): {current_volume}")
    
    # Last Update Timestamp (8 bytes)
    last_update, offset = read_u64(data, offset)
    print(f"21. Last Update Timestamp (8 bytes): {last_update}")
    
    print(f"\n{'=' * 70}")
    print(f"✅ 解析完成!")
    print(f"📍 已使用: {offset} / {len(data)} bytes")
    print(f"🔄 剩余: {len(data) - offset} bytes")
    
    if len(data) - offset > 0:
        print(f"\n末尾数据 (hex): {data[offset:].hex()}")
        print(f"末尾数据 (UTF-8): {data[offset:].decode('utf-8', errors='ignore')}")
    
    # 对比 Solscan 数据
    print(f"\n{'=' * 70}")
    print("与 Solscan 数据对比:")
    print("=" * 70)
    print(f"SOL Amount: {sol_amount} (Solscan: 56) ✅" if sol_amount == 56 else f"❌ {sol_amount} != 56")
    print(f"Token Amount: {token_amount} (Solscan: 2000000) ✅" if token_amount == 2000000 else f"❌ {token_amount} != 2000000")
    print(f"Timestamp: {timestamp} (Solscan: 1760716744) ✅" if timestamp == 1760716744 else f"❌ {timestamp} != 1760716744")

except Exception as e:
    print(f"\n❌ 解析失败: {e}")
    import traceback
    traceback.print_exc()
