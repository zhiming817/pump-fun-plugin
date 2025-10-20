/**
 * 查询用户的所有誓言
 * 
 * TODO: 实现真实的合约查询
 * 当前返回 Mock 数据用于开发
 */

import { useQuery } from '@tanstack/react-query';
import { useWalletUi } from '@wallet-ui/react';
import type { Oath } from '../types-v2';

export function useUserOaths() {
  const { account, connected } = useWalletUi();

  return useQuery({
    queryKey: ['oath', 'userOaths', account?.address],
    queryFn: async (): Promise<Oath[]> => {
      // TODO: 调用真实的合约方法
      // 1. 使用 getProgramAccounts 或者预先知道的 PDA 地址
      // 2. 解析账户数据
      // 3. 过滤当前用户创建的誓言
      console.warn('[TODO] 需要实现真实的用户誓言查询');
      
      const now = BigInt(Date.now());
      const mockPublicKey = account?.address as any;
      
      // Mock 数据
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
