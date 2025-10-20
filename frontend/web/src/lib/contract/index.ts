/**
 * PumpFun Oath 合约集成模块
 */

// 类型定义 - 使用 Anchor 生成的类型
export * from './types-v2';

// 合约交互类（暂不使用，等待真实合约部署）
// export { OathContract } from './oath-contract';

// React Hooks
export {
  useWalletStatus,
  useIsInitialized,
  useOath,
  useUserOaths,
  useCreateOath,
  useCompleteOath,
  useSlashOath,
  useInitializeContract,
} from './hooks';

