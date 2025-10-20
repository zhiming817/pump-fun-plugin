/**
 * PumpFun Oath 智能合约类型定义
 */

import { PublicKey } from '@solana/web3.js';

// 程序 ID
export const PROGRAM_ID = new PublicKey('Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ');

// 誓言状态枚举
export enum OathStatus {
  Active = 0,
  Completed = 1,
  Expired = 2,
  Failed = 3,
}

// 抵押代币结构
export interface CollateralToken {
  symbol: string;
  amount: bigint;
  address: string;
  usdValue: bigint;
  lockedTime: bigint;
}

// 削减信息
export interface SlashingInfo {
  slashedAmount: bigint;
  slashingTime: bigint;
  reason: string;
}

// 补偿信息
export interface CompensationInfo {
  compensationAmount: bigint;
  compensationTime: bigint;
  compensatedTo: PublicKey;
}

// 誓言数据结构
export interface Oath {
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
}

// 全局状态
export interface GlobalState {
  authority: PublicKey;
  nextOathId: bigint;
  totalOaths: bigint;
  totalCollateral: bigint;
  isPaused: boolean;
  bump: number;
}

// 抵押池
export interface CollateralPool {
  authority: PublicKey;
  totalStableCollateral: bigint;
  totalTokenCollateral: bigint;
  supportedTokens: PublicKey[];
  bump: number;
}

// 创建誓言参数
export interface CreateOathArgs {
  content: string;
  category: string;
  startTime: bigint;
  endTime: bigint;
  collateralTokens: CollateralToken[];
}

// 完成誓言参数
export interface CompleteOathArgs {
  evidence: string;
}

// 削减誓言参数
export interface SlashOathArgs {
  reason: string;
  slashPercentage: number;
}

// 获取誓言列表参数
export interface GetOathListArgs {
  offset: bigint;
  limit: bigint;
  status: OathStatus | null;
}

// PDA Seeds
export const SEEDS = {
  GLOBAL_STATE: Buffer.from('global_state'),
  COLLATERAL_POOL: Buffer.from('collateral_pool'),
  OATH: Buffer.from('oath'),
};

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
