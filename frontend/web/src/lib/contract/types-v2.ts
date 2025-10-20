/**
 * Oath 合约类型定义
 * 基于 Anchor 生成的 IDL
 */

import { PublicKey } from '@solana/web3.js';

// 导出 Program ID
export const PROGRAM_ID = new PublicKey('Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ');

// 导出账户类型（将 IDL 类型转为 TypeScript 类型）
export type GlobalState = {
  authority: PublicKey;
  nextOathId: bigint;
  totalOaths: bigint;
  totalCollateral: bigint;
  isPaused: boolean;
  bump: number;
};

export type CollateralToken = {
  symbol: string;
  amount: bigint;
  address: string;
  usdValue: bigint;
  lockedTime: bigint;
};

export type SlashingInfo = {
  slashedAmount: bigint;
  slashingTime: bigint;
  reason: string;
};

export type CompensationInfo = {
  compensationAmount: bigint;
  compensationTime: bigint;
  compensatedTo: PublicKey;
};

export type Oath = {
  id: bigint;
  creator: PublicKey;
  content: string;
  category: string;
  categoryId: string;
  startTime: bigint;
  endTime: bigint;
  stableCollateral: bigint;
  collateralTokens: CollateralToken[];
  isOverCollateralized: boolean;
  tokenAddress: PublicKey | null;
  targetApy: bigint | null;
  currentApy: bigint | null;
  status: OathStatus;
  evidence: string;
  slashingInfo: SlashingInfo | null;
  compensationInfo: CompensationInfo | null;
  bump: number;
  createdAt: bigint;
  updatedAt: bigint;
};

export type CollateralPool = {
  authority: PublicKey;
  totalStableCollateral: bigint;
  totalTokenCollateral: bigint;
  supportedTokens: PublicKey[];
  bump: number;
};

// 誓言状态枚举
export enum OathStatus {
  Active = 0,
  Completed = 1,
  Expired = 2,
  Failed = 3,
}

// 指令参数类型
export type CreateOathArgs = {
  content: string;
  category: string;
  startTime: bigint;
  endTime: bigint;
  collateralTokens: CollateralToken[];
};

export type CompleteOathArgs = {
  evidence: string;
};

export type SlashOathArgs = {
  reason: string;
  slashPercentage: number;
};

export type GetOathListArgs = {
  offset: bigint;
  limit: bigint;
  status: OathStatus | null;
};

// PDA Seeds
export const SEEDS = {
  GLOBAL_STATE: Buffer.from('global_state'),
  COLLATERAL_POOL: Buffer.from('collateral_pool'),
  OATH: Buffer.from('oath'),
} as const;

// 辅助函数：将 OathStatus 转换为可读字符串
export function getOathStatusText(status: OathStatus): string {
  switch (status) {
    case OathStatus.Active:
      return '活跃中';
    case OathStatus.Completed:
      return '已完成';
    case OathStatus.Expired:
      return '已过期';
    case OathStatus.Failed:
      return '失败';
    default:
      return '未知';
  }
}

// 辅助函数：获取状态颜色
export function getOathStatusColor(status: OathStatus): string {
  switch (status) {
    case OathStatus.Active:
      return 'text-green-600';
    case OathStatus.Completed:
      return 'text-blue-600';
    case OathStatus.Expired:
      return 'text-gray-600';
    case OathStatus.Failed:
      return 'text-red-600';
    default:
      return 'text-gray-400';
  }
}

// 导出 IDL 类型供高级使用
export type { PumpfunOathContract } from './pumpfun_oath_contract';
