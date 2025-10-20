/**
 * 查询单个誓言
 * 
 * TODO: 实现真实的合约查询
 * 当前返回 Mock 数据用于开发
 */

import { useQuery } from '@tanstack/react-query';
import { useWalletUi } from '@wallet-ui/react';
import type { Oath } from '../types-v2';

export function useOath(oathId: string | null) {
  const { connected } = useWalletUi();

  return useQuery({
    queryKey: ['oath', 'detail', oathId],
    queryFn: async (): Promise<Oath> => {
      // TODO: 调用真实的合约方法
      console.warn('[TODO] 需要实现真实的誓言查询');
      
      const now = BigInt(Date.now());
      const mockPublicKey = 'mock_address' as any;
      
      // Mock 数据
      return {
        id: 1n,
        creator: mockPublicKey,
        content: 'Mock oath content - 这是一个示例誓言，等待智能合约部署后显示真实数据',
        category: '个人目标',
        categoryId: 'personal',
        startTime: now,
        endTime: now + BigInt(7 * 24 * 60 * 60 * 1000),
        stableCollateral: 1000000n,
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
        createdAt: now,
        updatedAt: now,
      };
    },
    enabled: !!oathId && connected,
  });
}
