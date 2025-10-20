/**
 * Oath 合约指令构建器
 */

import { PublicKey, TransactionInstruction, SystemProgram } from '@solana/web3.js';
import { PROGRAM_ID } from './types-v2';

// PDA Seeds
const GLOBAL_STATE_SEED = Buffer.from('global_state');
const COLLATERAL_POOL_SEED = Buffer.from('collateral_pool');
const OATH_SEED = Buffer.from('oath');

/**
 * 派生全局状态 PDA
 */
export async function deriveGlobalStatePDA(): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [GLOBAL_STATE_SEED],
    PROGRAM_ID
  );
}

/**
 * 派生抵押池 PDA
 */
export async function deriveCollateralPoolPDA(): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [COLLATERAL_POOL_SEED],
    PROGRAM_ID
  );
}

/**
 * 派生 Oath PDA
 * @param oathId - 誓言 ID
 */
export async function deriveOathPDA(oathId: bigint): Promise<[PublicKey, number]> {
  const oathIdBuffer = Buffer.alloc(8);
  oathIdBuffer.writeBigUInt64LE(oathId);
  
  return await PublicKey.findProgramAddress(
    [OATH_SEED, oathIdBuffer],
    PROGRAM_ID
  );
}

/**
 * 创建初始化指令
 * 
 * discriminator: [175, 175, 109, 31, 13, 152, 155, 237]
 * 
 * Accounts:
 * 0. [writable, pda] global_state
 * 1. [writable, pda] collateral_pool  
 * 2. [writable, signer] authority
 * 3. [] system_program
 */
export async function createInitializeInstruction(
  authority: PublicKey
): Promise<TransactionInstruction> {
  const [globalState] = await deriveGlobalStatePDA();
  const [collateralPool] = await deriveCollateralPoolPDA();
  
  // 指令判别器 (从 IDL 获取)
  const discriminator = Buffer.from([175, 175, 109, 31, 13, 152, 155, 237]);
  
  // 构建指令数据 (initialize 没有参数，只有 discriminator)
  const data = discriminator;
  
  return new TransactionInstruction({
    keys: [
      { pubkey: globalState, isSigner: false, isWritable: true },
      { pubkey: collateralPool, isSigner: false, isWritable: true },
      { pubkey: authority, isSigner: true, isWritable: true },
      { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
    ],
    programId: PROGRAM_ID,
    data,
  });
}

