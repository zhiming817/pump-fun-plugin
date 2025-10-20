/**
 * PumpFun Oath 合约 React Hooks
 * 
 * 此文件已重构为模块化结构，所有 hooks 已拆分到独立文件
 * 使用方式保持不变：from '@/lib/contract/hooks'
 */

// 重新导出所有 hooks
export { 
  useWalletStatus,
  useIsInitialized,
  useOath,
  useUserOaths,
  useInitializeContract,
  useCreateOath,
  useCompleteOath,
  useSlashOath,
} from './hooks/index';
