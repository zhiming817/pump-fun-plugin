/**
 * Oath Contract Utils - 模块化导出
 * 
 * 这个文件统一导出所有 Oath 合约相关的功能函数
 * 使用方式:
 * import { createOath, getOathList, completeOath } from '@/utils/oath';
 */

// 配置和程序初始化
export {
  OATH_CONTRACT_CONFIG,
  connection,
  getOathProgram,
  getReadOnlyOathProgram
} from './config';

// PDA 派生函数
export {
  deriveGlobalStatePDA,
  deriveOathPDA,
  deriveCollateralPoolPDA
} from './pda';

// 初始化相关
export {
  initializeOathGlobal,
  isOathGlobalInitialized
} from './initialize';

// 创建 Oath
export {
  createOath
} from './createOath';

// Oath 操作
export {
  completeOath,
  slashOath
} from './actions';

// 查询函数
export {
  getOath,
  getOathCount,
  getOathList,
  getOathsByCreator
} from './queries';
