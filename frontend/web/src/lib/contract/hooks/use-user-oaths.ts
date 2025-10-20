/**
 * 查询用户的所有誓言
 * 
 * 从链上查询真实的誓言数据
 */

import { useQuery } from '@tanstack/react-query';
import { useWalletUi } from '@wallet-ui/react';
import { useSolana } from '@/components/solana/use-solana';
import { PublicKey } from '@solana/web3.js';
import type { Oath } from '../types-v2';
import { deriveGlobalStatePDA, deriveOathPDA } from '../instructions';

/**
 * 解析链上 Oath 账户数据
 */
function parseOathAccount(data: Buffer): Oath | null {
  try {
    let offset = 8; // 跳过 discriminator
    
    // id: u64
    const oathId = data.readBigUInt64LE(offset);
    offset += 8;
    
    // creator: Pubkey (32 bytes)
    const creatorBytes = data.subarray(offset, offset + 32);
    const creator = new PublicKey(creatorBytes);
    offset += 32;
    
    // content: String
    const contentLen = data.readUInt32LE(offset);
    offset += 4;
    const content = data.subarray(offset, offset + contentLen).toString('utf-8');
    offset += contentLen;
    
    // category: String
    const categoryLen = data.readUInt32LE(offset);
    offset += 4;
    const category = data.subarray(offset, offset + categoryLen).toString('utf-8');
    offset += categoryLen;
    
    // categoryId: String
    const categoryIdLen = data.readUInt32LE(offset);
    offset += 4;
    const categoryId = data.subarray(offset, offset + categoryIdLen).toString('utf-8');
    offset += categoryIdLen;
    
    // startTime: u64
    const startTime = data.readBigUInt64LE(offset);
    offset += 8;
    
    // endTime: u64
    const endTime = data.readBigUInt64LE(offset);
    offset += 8;
    
    // stableCollateral: u64
    const stableCollateral = data.readBigUInt64LE(offset);
    offset += 8;
    
    // collateralTokens: Vec<CollateralToken>
    const tokensLen = data.readUInt32LE(offset);
    offset += 4;
    const collateralTokens = [];
    
    for (let i = 0; i < tokensLen; i++) {
      const symbolLen = data.readUInt32LE(offset);
      offset += 4;
      const symbol = data.subarray(offset, offset + symbolLen).toString('utf-8');
      offset += symbolLen;
      
      const amount = data.readBigUInt64LE(offset);
      offset += 8;
      
      const addressLen = data.readUInt32LE(offset);
      offset += 4;
      const address = data.subarray(offset, offset + addressLen).toString('utf-8');
      offset += addressLen;
      
      const usdValue = data.readBigUInt64LE(offset);
      offset += 8;
      
      const lockedTime = data.readBigUInt64LE(offset);
      offset += 8;
      
      collateralTokens.push({ symbol, amount, address, usdValue, lockedTime });
    }
    
    // isOverCollateralized: bool
    const isOverCollateralized = data.readUInt8(offset) === 1;
    offset += 1;
    
    // tokenAddress: Option<Pubkey>
    const hasTokenAddress = data.readUInt8(offset) === 1;
    offset += 1;
    let tokenAddress = null;
    if (hasTokenAddress) {
      tokenAddress = new PublicKey(data.subarray(offset, offset + 32));
      offset += 32;
    }
    
    // targetApy: Option<u64>
    const hasTargetApy = data.readUInt8(offset) === 1;
    offset += 1;
    let targetApy = null;
    if (hasTargetApy) {
      targetApy = data.readBigUInt64LE(offset);
      offset += 8;
    }
    
    // currentApy: Option<u64>
    const hasCurrentApy = data.readUInt8(offset) === 1;
    offset += 1;
    let currentApy = null;
    if (hasCurrentApy) {
      currentApy = data.readBigUInt64LE(offset);
      offset += 8;
    }
    
    // status: enum (1 byte discriminator)
    const statusDiscriminator = data.readUInt8(offset);
    offset += 1;
    const status = statusDiscriminator; // 0=Active, 1=Completed, 2=Failed, 3=Expired
    
    // evidence: String
    const evidenceLen = data.readUInt32LE(offset);
    offset += 4;
    const evidence = data.subarray(offset, offset + evidenceLen).toString('utf-8');
    offset += evidenceLen;
    
    // slashingInfo: Option<SlashingInfo>
    const hasSlashingInfo = data.readUInt8(offset) === 1;
    offset += 1;
    let slashingInfo = null;
    if (hasSlashingInfo) {
      const slashedAmount = data.readBigUInt64LE(offset);
      offset += 8;
      const slashingTime = data.readBigUInt64LE(offset);
      offset += 8;
      const reasonLen = data.readUInt32LE(offset);
      offset += 4;
      const reason = data.subarray(offset, offset + reasonLen).toString('utf-8');
      offset += reasonLen;
      slashingInfo = { slashedAmount, slashingTime, reason };
    }
    
    // compensationInfo: Option<CompensationInfo>
    const hasCompensationInfo = data.readUInt8(offset) === 1;
    offset += 1;
    let compensationInfo = null;
    if (hasCompensationInfo) {
      const compensationAmount = data.readBigUInt64LE(offset);
      offset += 8;
      const compensationTime = data.readBigUInt64LE(offset);
      offset += 8;
      const compensatedToBytes = data.subarray(offset, offset + 32);
      const compensatedTo = new PublicKey(compensatedToBytes);
      offset += 32;
      compensationInfo = { compensationAmount, compensationTime, compensatedTo };
    }
    
    // bump: u8
    const bump = data.readUInt8(offset);
    offset += 1;
    
    // createdAt: u64
    const createdAt = data.readBigUInt64LE(offset);
    offset += 8;
    
    // updatedAt: u64
    const updatedAt = data.readBigUInt64LE(offset);
    offset += 8;
    
    return {
      id: oathId,
      creator,
      content,
      category,
      categoryId,
      startTime,
      endTime,
      stableCollateral,
      collateralTokens,
      isOverCollateralized,
      tokenAddress,
      targetApy,
      currentApy,
      status,
      evidence,
      slashingInfo,
      compensationInfo,
      bump,
      createdAt,
      updatedAt,
    };
  } catch (error) {
    console.error('解析 Oath 账户失败:', error);
    return null;
  }
}

export function useUserOaths() {
  const { account, connected } = useWalletUi();
  const { client } = useSolana();

  return useQuery({
    queryKey: ['oath', 'userOaths', account?.address],
    queryFn: async (): Promise<Oath[]> => {
      if (!account) {
        return [];
      }

      console.log('[useUserOaths] 🔍 查询链上誓言...');

      try {
        // 1. 获取全局状态以获取 next_oath_id
        const [globalStatePda] = await deriveGlobalStatePDA();
        
        const { value: globalAccountInfo } = await client.rpc
          .getAccountInfo(globalStatePda.toBase58() as any, { encoding: 'base64' })
          .send();
        
        if (!globalAccountInfo) {
          console.log('[useUserOaths] 合约未初始化');
          return [];
        }
        
        // 解析 next_oath_id (offset: 8 bytes discriminator + 32 bytes authority = 40)
        const globalData = Buffer.from(globalAccountInfo.data[0], 'base64');
        const nextOathId = globalData.readBigUInt64LE(40);
        console.log('[useUserOaths] ✓ next_oath_id:', nextOathId.toString());
        
        if (nextOathId <= 1n) {
          console.log('[useUserOaths] 没有誓言数据');
          return [];
        }
        
        // 2. 遍历查询所有誓言账户
        const oaths: Oath[] = [];
        const userPubkey = new PublicKey(account.address);
        
        for (let i = 1n; i < nextOathId; i++) {
          try {
            const [oathPda] = await deriveOathPDA(i);
            
            const { value: oathAccountInfo } = await client.rpc
              .getAccountInfo(oathPda.toBase58() as any, { encoding: 'base64' })
              .send();
            
            if (oathAccountInfo) {
              const oathData = Buffer.from(oathAccountInfo.data[0], 'base64');
              const oath = parseOathAccount(oathData);
              
              // 只返回当前用户创建的誓言
              if (oath && oath.creator.equals(userPubkey)) {
                console.log(`[useUserOaths] ✓ 找到用户誓言 ${i}: ${oath.content}`);
                oaths.push(oath);
              }
            }
          } catch (error) {
            console.log(`[useUserOaths] 誓言 ${i} 不存在或解析失败`);
          }
        }
        
        console.log(`[useUserOaths] ✅ 共找到 ${oaths.length} 个用户誓言`);
        return oaths;
      } catch (error) {
        console.error('[useUserOaths] 查询失败:', error);
        return [];
      }
    },
    enabled: connected && !!account,
    staleTime: 10000, // 10秒缓存
  });
}

// 保留 Mock 数据作为备用（开发时可以切换）
export function useUserOathsMock() {
  const { account, connected } = useWalletUi();

  return useQuery({
    queryKey: ['oath', 'userOaths', 'mock', account?.address],
    queryFn: async (): Promise<Oath[]> => {
      const now = BigInt(Date.now());
      const mockPublicKey = account?.address as any;
      
      return [
        {
          id: 1n,
          creator: mockPublicKey,
          content: '完成 Solana 开发学习',
          category: '个人目标',
          categoryId: 'personal',
          startTime: now - BigInt(24 * 60 * 60 * 1000),
          endTime: now + BigInt(7 * 24 * 60 * 60 * 1000),
          stableCollateral: 1000000n, // 0.001 SOL
          collateralTokens: [],
          isOverCollateralized: false,
          tokenAddress: null,
          targetApy: null,
          currentApy: null,
          status: 0, // OathStatus.Active
          evidence: '',
          slashingInfo: null,
          compensationInfo: null,
          bump: 0,
          createdAt: now - BigInt(24 * 60 * 60 * 1000),
          updatedAt: now - BigInt(24 * 60 * 60 * 1000),
        },
        {
          id: 2n,
          creator: mockPublicKey,
          content: '部署第一个智能合约',
          category: '技术学习',
          categoryId: 'tech',
          startTime: now - BigInt(2 * 24 * 60 * 60 * 1000),
          endTime: now + BigInt(14 * 24 * 60 * 60 * 1000),
          stableCollateral: 2000000n, // 0.002 SOL
          collateralTokens: [],
          isOverCollateralized: false,
          tokenAddress: null,
          targetApy: null,
          currentApy: null,
          status: 0, // OathStatus.Active
          evidence: '',
          slashingInfo: null,
          compensationInfo: null,
          bump: 0,
          createdAt: now - BigInt(2 * 24 * 60 * 60 * 1000),
          updatedAt: now - BigInt(2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 3n,
          creator: mockPublicKey,
          content: '完成前端集成',
          category: '项目开发',
          categoryId: 'project',
          startTime: now - BigInt(10 * 24 * 60 * 60 * 1000),
          endTime: now - BigInt(24 * 60 * 60 * 1000), // 已过期
          stableCollateral: 5000000n, // 0.005 SOL
          collateralTokens: [],
          isOverCollateralized: false,
          tokenAddress: null,
          targetApy: null,
          currentApy: null,
          status: 2, // OathStatus.Expired
          evidence: '',
          slashingInfo: {
            slashedAmount: 5000000n,
            slashingTime: now - BigInt(24 * 60 * 60 * 1000),
            reason: '未在截止日期前完成',
          },
          compensationInfo: null,
          bump: 0,
          createdAt: now - BigInt(10 * 24 * 60 * 60 * 1000),
          updatedAt: now - BigInt(24 * 60 * 60 * 1000),
        },
      ];
    },
    enabled: connected && !!account,
    staleTime: 10000, // 10秒缓存
  });
}
