import { PublicKey } from '@solana/web3.js';
import { OATH_CONTRACT_CONFIG } from './config';

/**
 * 派生 Global State PDA
 */
export function deriveGlobalStatePDA(programId: PublicKey | string): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(OATH_CONTRACT_CONFIG.SEEDS.GLOBAL_STATE)],
    new PublicKey(programId)
  );
  return pda;
}

/**
 * 派生 Oath PDA
 */
export function deriveOathPDA(oathId: number, programId: PublicKey | string): PublicKey {
  const oathIdBuffer = Buffer.alloc(8);
  oathIdBuffer.writeBigUInt64LE(BigInt(oathId));
  
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(OATH_CONTRACT_CONFIG.SEEDS.OATH), oathIdBuffer],
    new PublicKey(programId)
  );
  return pda;
}

/**
 * 派生 Collateral Pool PDA
 */
export function deriveCollateralPoolPDA(programId: PublicKey | string): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from(OATH_CONTRACT_CONFIG.SEEDS.COLLATERAL_POOL)],
    new PublicKey(programId)
  );
  return pda;
}
