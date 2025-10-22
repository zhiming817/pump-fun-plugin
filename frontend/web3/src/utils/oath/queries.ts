import { PublicKey } from '@solana/web3.js';
import { getOathProgram, getReadOnlyOathProgram, OATH_CONTRACT_CONFIG } from './config';
import { deriveGlobalStatePDA, deriveOathPDA } from './pda';

/**
 * 获取单个 Oath 的详细信息
 */
export async function getOath(oathId: number, wallet: any = null) {
  try {
    const program = wallet ? getOathProgram(wallet) : getReadOnlyOathProgram();
    
    const programId = new PublicKey(OATH_CONTRACT_CONFIG.PROGRAM_ID);
    const oathPda = deriveOathPDA(oathId, programId);
    
    const oathAccount = await (program.account as any).oath.fetch(oathPda);
    
    const oath = {
      id: oathAccount.id.toNumber(),
      creator: oathAccount.creator.toString(),
      content: oathAccount.content,
      category: oathAccount.category,
      categoryId: oathAccount.categoryId,
      startTime: oathAccount.startTime.toNumber(),
      endTime: oathAccount.endTime.toNumber(),
      stableCollateral: oathAccount.stableCollateral.toNumber(),
      collateralTokens: oathAccount.collateralTokens.map((token: any) => ({
        symbol: token.symbol,
        amount: token.amount.toNumber(),
        address: token.address,
        usdValue: token.usdValue.toNumber(),
        lockedTime: token.lockedTime.toNumber()
      })),
      isOverCollateralized: oathAccount.isOverCollateralized,
      tokenAddress: oathAccount.tokenAddress?.toString(),
      targetApy: oathAccount.targetApy ? oathAccount.targetApy.toNumber() : null,
      currentApy: oathAccount.currentApy ? oathAccount.currentApy.toNumber() : null,
      status: oathAccount.status,
      evidence: oathAccount.evidence,
      slashingInfo: oathAccount.slashingInfo ? {
        slashedAmount: oathAccount.slashingInfo.slashedAmount.toNumber(),
        slashingTime: oathAccount.slashingInfo.slashingTime.toNumber(),
        reason: oathAccount.slashingInfo.reason
      } : null,
      compensationInfo: oathAccount.compensationInfo ? {
        compensationAmount: oathAccount.compensationInfo.compensationAmount.toNumber(),
        compensationTime: oathAccount.compensationInfo.compensationTime.toNumber(),
        compensatedTo: oathAccount.compensationInfo.compensatedTo.toString()
      } : null,
      createdAt: Number(oathAccount.createdAt),
      updatedAt: Number(oathAccount.updatedAt),
      address: oathPda.toString()
    };
    
    return {
      success: true,
      oathId,
      oath
    };
  } catch (error: any) {
    console.error('❌ Error getting oath:', error);
    return {
      success: false,
      oathId,
      error: error.message
    };
  }
}

/**
 * 获取 Oath 总数
 */
export async function getOathCount(wallet: any = null): Promise<number> {
  try {
    const program = wallet ? getOathProgram(wallet) : getReadOnlyOathProgram();
    
    const programId = new PublicKey(OATH_CONTRACT_CONFIG.PROGRAM_ID);
    const globalStatePda = deriveGlobalStatePDA(programId);
    
    try {
      const globalStateAccount = await (program.account as any).globalState.fetch(globalStatePda);
      return globalStateAccount.totalOaths.toNumber();
    } catch (error: any) {
      if (error.message?.includes('Account does not exist') || 
          error.message?.includes('has no data')) {
        console.log('ℹ️ Oath global not initialized yet, oath count is 0');
        return 0;
      }
      throw error;
    }
  } catch (error) {
    console.error('Error getting oath count:', error);
    return 0;
  }
}

/**
 * 获取 Oath 列表（通过查询所有 Oath 账户）
 */
export async function getOathList(limit: number = 10, wallet: any = null) {
  try {
    const program = wallet ? getOathProgram(wallet) : getReadOnlyOathProgram();
    
    const oaths = await (program.account as any).oath.all();
    
    return oaths
      .sort((a: any, b: any) => Number(b.account.createdAt) - Number(a.account.createdAt))
      .slice(0, limit)
      .map((o: any) => ({
        id: o.account.id.toNumber(),
        creator: o.account.creator.toString(),
        content: o.account.content,
        category: o.account.category,
        startTime: o.account.startTime.toNumber(),
        endTime: o.account.endTime.toNumber(),
        stableCollateral: o.account.stableCollateral.toNumber(),
        status: o.account.status,
        createdAt: Number(o.account.createdAt),
        address: o.publicKey.toString()
      }));
  } catch (error) {
    console.error('Error getting oath list:', error);
    return [];
  }
}

/**
 * 获取用户创建的 Oath 列表
 */
export async function getOathsByCreator(creatorAddress: string, wallet: any = null) {
  try {
    const program = wallet ? getOathProgram(wallet) : getReadOnlyOathProgram();
    
    const creatorPubkey = new PublicKey(creatorAddress);
    const oaths = await (program.account as any).oath.all([
      {
        memcmp: {
          offset: 8, // 跳过 discriminator
          bytes: creatorPubkey.toBase58(),
        }
      }
    ]);
    
    return oaths.map((o: any) => ({
      id: o.account.id.toNumber(),
      creator: o.account.creator.toString(),
      content: o.account.content,
      category: o.account.category,
      startTime: o.account.startTime.toNumber(),
      endTime: o.account.endTime.toNumber(),
      stableCollateral: o.account.stableCollateral.toNumber(),
      status: o.account.status,
      createdAt: Number(o.account.createdAt),
      address: o.publicKey.toString()
    }));
  } catch (error) {
    console.error('Error getting oaths by creator:', error);
    return [];
  }
}
