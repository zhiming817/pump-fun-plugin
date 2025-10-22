import { PublicKey, SystemProgram } from '@solana/web3.js';
import { getOathProgram, getReadOnlyOathProgram, connection, OATH_CONTRACT_CONFIG } from './config';
import { deriveGlobalStatePDA, deriveCollateralPoolPDA } from './pda';

/**
 * 初始化 Oath 合约全局状态（只需要调用一次）
 */
export async function initializeOathGlobal(wallet: any) {
  try {
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const program = getOathProgram(wallet);
    const programId = new PublicKey(OATH_CONTRACT_CONFIG.PROGRAM_ID);
    
    const globalStatePda = deriveGlobalStatePDA(programId);
    const collateralPoolPda = deriveCollateralPoolPDA(programId);
    
    const tx = await program.methods
      .initialize()
      .accounts({
        globalState: globalStatePda,
        collateralPool: collateralPoolPda,
        authority: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([])  // Wallet adapter 会自动处理签名
      .rpc();
    
    console.log('📝 Initialize transaction sent:', tx);
    await connection.confirmTransaction(tx, 'confirmed');
    
    return {
      success: true,
      transactionSignature: tx
    };
  } catch (error: any) {
    console.error('Error initializing oath global:', error);
    throw new Error(`Failed to initialize: ${error.message}`);
  }
}

/**
 * 检查 Oath Global 是否已初始化
 */
export async function isOathGlobalInitialized(wallet: any = null): Promise<boolean> {
  try {
    const program = wallet ? getOathProgram(wallet) : getReadOnlyOathProgram();
    
    const programId = new PublicKey(OATH_CONTRACT_CONFIG.PROGRAM_ID);
    const globalStatePda = deriveGlobalStatePDA(programId);
    
    try {
      await (program.account as any).globalState.fetch(globalStatePda);
      return true;
    } catch (error: any) {
      if (error.message?.includes('Account does not exist') || 
          error.message?.includes('has no data')) {
        return false;
      }
      console.warn('Error checking oath global initialization:', error.message);
      return false;
    }
  } catch (error) {
    console.error('Error in isOathGlobalInitialized:', error);
    return false;
  }
}
