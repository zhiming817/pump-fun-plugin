#!/usr/bin/env python3
import base64

# 从截图 #3 的 Program data (base64)
# 这是日志中看到的那个长长的 base64 字符串
program_data_b64 = "vdt/007mYe5g3SpGhAYdzx3/9GyXZKECpiaAigGuqucVOhIJmQlmWjgAAAAAAAAAgIQeAAAAAAABxyGfqRD0ZWGZnDPQtpsKWSslIRIf1LKARkrDjiQa3RexZfJoAAAAAPgqJPwGAAAAUAKQAuPPAwD4fgAAAAAAAFD6a4uQLQAATFUZ6YdkErhSyvcipCgdzWuEagoSddE6opaSJOhbZbFfAAAAAAAAAAEAAAAAAAAAxyGfqRD0ZWGZnDPQtpsKWSslIRIf1LKARkrDjiQa3RceAAAAAAAAAAEAAAAAAAAAAQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAwAAAGJ1eQ=="

decoded = base64.b64decode(program_data_b64)
print(f"✅ Program data 解码成功!")
print(f"📊 总长度: {len(decoded)} bytes\n")

# 辅助函数
def read_pubkey(data, offset):
    return data[offset:offset+32].hex(), offset + 32

def read_u64(data, offset):
    value = int.from_bytes(data[offset:offset+8], 'little')
    return value, offset + 8

def read_bool(data, offset):
    return bool(data[offset]), offset + 1

# 前 8 字节是鉴别器
discriminator = decoded[:8].hex()
print(f"鉴别器: {discriminator}\n")

print("=" * 70)
print("尝试按 TradeEvent 结构解析 (跳过前 8 字节):")
print("=" * 70)

offset = 8

try:
    # Mint (32 bytes)
    mint_hex, offset = read_pubkey(decoded, offset)
    print(f"1. Mint: {mint_hex}")
    
    # SOL Amount (8 bytes)
    sol_amount, offset = read_u64(decoded, offset)
    print(f"2. SOL Amount: {sol_amount} ({'✅' if sol_amount == 56 else '❌'})")
    
    # Token Amount (8 bytes)  
    token_amount, offset = read_u64(decoded, offset)
    print(f"3. Token Amount: {token_amount} ({'✅' if token_amount == 2000000 else '❌'})")
    
    # Is Buy (1 byte)
    is_buy, offset = read_bool(decoded, offset)
    print(f"4. Is Buy: {is_buy} ({'✅' if is_buy == True else '❌'})")
    
    # User (32 bytes)
    user_hex, offset = read_pubkey(decoded, offset)
    print(f"5. User: {user_hex}")
    
    # Timestamp (8 bytes)
    timestamp, offset = read_u64(decoded, offset)
    print(f"6. Timestamp: {timestamp} ({'✅' if timestamp == 1760716209 else '❌'})")
    
    print(f"\n📍 当前偏移: {offset} / {len(decoded)}")
    print(f"剩余: {len(decoded) - offset} bytes")
    
    # 继续解析剩余字段
    print("\n继续解析...")
    
    # Virtual SOL Reserves (8 bytes)
    virtual_sol, offset = read_u64(decoded, offset)
    print(f"7. Virtual SOL Reserves: {virtual_sol}")
    
    # Virtual Token Reserves (8 bytes)
    virtual_token, offset = read_u64(decoded, offset)
    print(f"8. Virtual Token Reserves: {virtual_token}")
    
    # Real SOL Reserves (8 bytes)
    real_sol, offset = read_u64(decoded, offset)
    print(f"9. Real SOL Reserves: {real_sol}")
    
    # Real Token Reserves (8 bytes)
    real_token, offset = read_u64(decoded, offset)
    print(f"10. Real Token Reserves: {real_token}")
    
    # Fee Recipient (32 bytes)
    fee_recipient, offset = read_pubkey(decoded, offset)
    print(f"11. Fee Recipient: {fee_recipient}")
    
    # Fee Basis Points (8 bytes)
    fee_basis, offset = read_u64(decoded, offset)
    print(f"12. Fee Basis Points: {fee_basis}")
    
    # Fee (8 bytes)
    fee, offset = read_u64(decoded, offset)
    print(f"13. Fee: {fee}")
    
    # Creator (32 bytes)
    creator, offset = read_pubkey(decoded, offset)
    print(f"14. Creator: {creator}")
    
    # Creator Fee Basis Points (8 bytes)
    creator_fee_basis, offset = read_u64(decoded, offset)
    print(f"15. Creator Fee Basis Points: {creator_fee_basis}")
    
    # Creator Fee (8 bytes)
    creator_fee, offset = read_u64(decoded, offset)
    print(f"16. Creator Fee: {creator_fee}")
    
    # Track Volume (1 byte)
    track_volume, offset = read_bool(decoded, offset)
    print(f"17. Track Volume: {track_volume}")
    
    # Total Unclaimed Tokens (8 bytes)
    unclaimed, offset = read_u64(decoded, offset)
    print(f"18. Total Unclaimed Tokens: {unclaimed}")
    
    # Total Claimed Tokens (8 bytes)
    claimed, offset = read_u64(decoded, offset)
    print(f"19. Total Claimed Tokens: {claimed}")
    
    # Current SOL Volume (8 bytes)
    current_vol, offset = read_u64(decoded, offset)
    print(f"20. Current SOL Volume: {current_vol}")
    
    # Last Update Timestamp (8 bytes)
    last_update, offset = read_u64(decoded, offset)
    print(f"21. Last Update Timestamp: {last_update}")
    
    print(f"\n{'=' * 70}")
    print(f"✅ 全部字段解析完成!")
    print(f"📍 使用: {offset} / {len(decoded)} bytes")
    print(f"🔄 剩余: {len(decoded) - offset} bytes")
    
    if len(decoded) - offset > 0:
        remaining = decoded[offset:]
        print(f"\n末尾数据 ({len(remaining)} bytes):")
        print(f"  Hex: {remaining.hex()}")
        print(f"  UTF-8: {remaining.decode('utf-8', errors='ignore')}")
        
        # 分析末尾结构
        if len(remaining) >= 4:
            str_len = int.from_bytes(remaining[:4], 'little')
            print(f"  前4字节作为长度: {str_len}")
            if str_len < 100 and len(remaining) >= 4 + str_len:
                string_data = remaining[4:4+str_len]
                print(f"  字符串: '{string_data.decode('utf-8', errors='ignore')}'")

except Exception as e:
    print(f"\n❌ 解析失败: {e}")
    import traceback
    traceback.print_exc()
