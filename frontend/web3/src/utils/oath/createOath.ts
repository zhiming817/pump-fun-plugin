import { PublicKey, SystemProgram } from '@solana/web3.js';
import { BN } from '@coral-xyz/anchor';
import { getOathProgram, connection, OATH_CONTRACT_CONFIG } from './config';
import { deriveGlobalStatePDA, deriveOathPDA, deriveCollateralPoolPDA } from './pda';
import { initializeOathGlobal } from './initialize';

/**
 * 创建誓言
 */
export async function createOath(wallet: any, oathData: any) {
  let nextOathId = 0;
  let oathPda: PublicKey | undefined = undefined;
  
  try {
    console.log('🚀 Creating oath with data:', oathData);
    
    if (!wallet || !wallet.publicKey) {
      throw new Error('Wallet not connected');
    }

    const program = getOathProgram(wallet);
    const programId = new PublicKey(OATH_CONTRACT_CONFIG.PROGRAM_ID);
    
    // 获取 global state
    const globalStatePda = deriveGlobalStatePDA(programId);
    const collateralPoolPda = deriveCollateralPoolPDA(programId);
    
    let needsInitialization = false;
    
    try {
      const globalStateAccount = await (program.account as any).globalState.fetch(globalStatePda);
      nextOathId = globalStateAccount.nextOathId.toNumber();
      console.log('📊 Next oath ID:', nextOathId);
    } catch (error) {
      console.log('⚠️ Oath global not initialized, will initialize first...');
      needsInitialization = true;
    }
    
    // 如果需要初始化，先初始化 oath global
    if (needsInitialization) {
      console.log('🔧 Initializing oath global...');
      try {
        const initResult = await initializeOathGlobal(wallet);
        console.log('✅ Oath global initialized:', initResult.transactionSignature);
        nextOathId = 0;
      } catch (initError: any) {
        console.error('❌ Failed to initialize oath global:', initError);
        throw new Error(`Failed to initialize oath global: ${initError.message}`);
      }
    }
    
    oathPda = deriveOathPDA(nextOathId, programId);
    
    // 构建参数
    const args = {
      startTime: new BN(oathData.startTime || Math.floor(Date.now() / 1000)),
      endTime: new BN(oathData.endTime || Math.floor(Date.now() / 1000) + 86400 * 30),
      solCollateral: new BN(Math.round((oathData.stableCollateral || 0) * 1000000000)), // 转换为 lamports (1 SOL = 10^9 lamports)
      tokenAddress: new PublicKey(oathData.tokenAddress), // 必填字段
      targetMarketCap: new BN(Math.round((oathData.targetApy || 80000))) // 默认目标市值 $80,000
    };
    
    console.log('🔍 Debug args:', {
      startTime: args.startTime.toString(),
      startTimeDate: new Date(args.startTime.toNumber() * 1000).toISOString(),
      endTime: args.endTime.toString(),
      endTimeDate: new Date(args.endTime.toNumber() * 1000).toISOString(),
      currentTime: Math.floor(Date.now() / 1000),
      currentTimeDate: new Date().toISOString(),
      solCollateral: args.solCollateral.toString(),
      solCollateralInSOL: (args.solCollateral.toNumber() / 1000000000).toFixed(4),
      tokenAddress: args.tokenAddress.toString(), // 必填，不再是 optional
      targetMarketCap: args.targetMarketCap.toString()
    });
    
    // 先检查 Oath 账户是否已存在
    console.log('🔍 Checking if oath already exists...');
    try {
      const existingOath = await (program.account as any).oath.fetch(oathPda);
      if (existingOath) {
        console.log('⚠️ Oath already exists, treating as success');
        return {
          success: true,
          oathId: nextOathId,
          transactionSignature: 'already-exists',
          oathAddress: oathPda.toString(),
          note: 'Oath already exists'
        };
      }
    } catch (checkError) {
      // 账户不存在，继续创建
      console.log('✓ Oath does not exist yet, proceeding with creation');
    }
    
    // 使用 rpc() 方法发送交易
    console.log('📤 Sending transaction...');
    const tx = await program.methods
      .createOath(args)
      .accounts({
        globalState: globalStatePda,
        oath: oathPda,
        collateralPool: collateralPoolPda,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .signers([])
      .rpc({ 
        skipPreflight: true,  // 跳过预检查，避免钱包显示模拟错误
        commitment: 'confirmed'
      });
    
    console.log('📝 Transaction sent:', tx);
    console.log('⏳ Waiting for confirmation...');
    
    // 等待交易确认
    const latestBlockhash = await connection.getLatestBlockhash();
    await connection.confirmTransaction({
      signature: tx,
      blockhash: latestBlockhash.blockhash,
      lastValidBlockHeight: latestBlockhash.lastValidBlockHeight
    }, 'confirmed');
    
    console.log('✅ Transaction confirmed!');
    
    return {
      success: true,
      oathId: nextOathId,
      transactionSignature: tx,
      oathAddress: oathPda.toString()
    };
    
  } catch (error: any) {
    console.error('❌ Error creating oath:', error);
    
    // 提取错误信息
    let errorMessage = error.message || String(error);
    
    // 检查是否是"交易已处理"错误 - 这通常意味着交易实际上成功了
    if (errorMessage.includes('already been processed')) {
      console.log('⚠️ Transaction already processed - treating as success');
      // 交易已被处理，返回成功（可能是重复提交或网络延迟）
      return {
        success: true,
        oathId: nextOathId,
        transactionSignature: 'processed', // 无法获取真实签名
        oathAddress: (oathPda as any)?.toString() || 'unknown',
        note: 'Transaction was already processed'
      };
    }
    
    // 其他错误才抛出
    if (errorMessage.includes('User rejected')) {
      errorMessage = 'Transaction was cancelled by user.';
    } else if (errorMessage.includes('Simulation failed')) {
      // 尝试提取更详细的模拟失败信息
      const logs = error.logs || error.transactionLogs || [];
      if (logs.length > 0) {
        console.log('📋 Transaction logs:', logs);
      }
    }
    
    throw new Error(errorMessage);
  }
}
