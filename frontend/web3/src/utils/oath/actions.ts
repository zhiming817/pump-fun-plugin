import { PublicKey } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { getOathProgram, connection, OATH_CONTRACT_CONFIG } from './config';
import { deriveGlobalStatePDA, deriveOathPDA, deriveCollateralPoolPDA } from './pda';

/**
 * 完成誓言
 */
export async function completeOath(wallet: any, oathId: number, evidence: string) {
  try {
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const program = getOathProgram(wallet);
    const programId = new PublicKey(OATH_CONTRACT_CONFIG.PROGRAM_ID);
    
    const oathPda = deriveOathPDA(oathId, programId);
    const globalStatePda = deriveGlobalStatePDA(programId);
    const collateralPoolPda = deriveCollateralPoolPDA(programId);
    
    const tx = await program.methods
      .completeOath({ evidence: String(evidence) })
      .accounts({
        oath: oathPda,
        globalState: globalStatePda,
        collateralPool: collateralPoolPda,
        creator: wallet.publicKey,
      })
      .signers([])  // Wallet adapter 会自动处理签名
      .rpc();
    
    console.log('📝 Complete oath transaction sent:', tx);
    await connection.confirmTransaction(tx, 'confirmed');
    
    return {
      success: true,
      transactionSignature: tx
    };
  } catch (error: any) {
    console.error('Error completing oath:', error);
    throw new Error(`Failed to complete oath: ${error.message}`);
  }
}

/**
 * 削减誓言（管理员功能）
 */
export async function slashOath(
  wallet: any, 
  oathId: number, 
  reason: string, 
  slashedPercentage: number
) {
  try {
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const program = getOathProgram(wallet);
    const programId = new PublicKey(OATH_CONTRACT_CONFIG.PROGRAM_ID);
    
    const oathPda = deriveOathPDA(oathId, programId);
    const globalStatePda = deriveGlobalStatePDA(programId);
    const collateralPoolPda = deriveCollateralPoolPDA(programId);
    
    const tx = await program.methods
      .slashOath({
        reason: String(reason),
        slashedPercentage: new BN(Math.round(slashedPercentage * 100))
      })
      .accounts({
        oath: oathPda,
        globalState: globalStatePda,
        collateralPool: collateralPoolPda,
        authority: wallet.publicKey,
      })
      .signers([])  // Wallet adapter 会自动处理签名
      .rpc();
    
    console.log('📝 Slash oath transaction sent:', tx);
    await connection.confirmTransaction(tx, 'confirmed');
    
    return {
      success: true,
      transactionSignature: tx
    };
  } catch (error: any) {
    console.error('Error slashing oath:', error);
    throw new Error(`Failed to slash oath: ${error.message}`);
  }
}
