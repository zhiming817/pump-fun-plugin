/**
 * 创建新誓言 Hook
 * 
 * 完全模仿 contract/pumpfun_oath_contract/tests/create-oath-manual.ts 实现
 * 使用 Anchor Program 直接调用合约
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BN, AnchorProvider, Program } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, Connection, Commitment } from '@solana/web3.js';
import { useWalletUi } from '@wallet-ui/react';
import type { PumpfunOathContract } from '../pumpfun_oath_contract';
import IDL from '../pumpfun_oath_contract.json';
import type { CreateOathArgs } from '../types-v2';

// RPC Endpoint
const RPC_ENDPOINT = 'https://api.zan.top/node/v1/solana/devnet/55c625d41c924f97971cdd05bb533048';
const COMMITMENT: Commitment = 'confirmed';

// 初始化 Solana 连接
export const connection = new Connection(RPC_ENDPOINT, COMMITMENT);

/**
 * 获取 Program 实例（带类型）
 */
function getProgram(wallet: any): Program<PumpfunOathContract> {
  const provider = new AnchorProvider(connection, wallet, { commitment: COMMITMENT });
  return new Program<PumpfunOathContract>(IDL as PumpfunOathContract, provider);
}

/**
 * 派生 PDA - Global State
 */
function deriveGlobalStatePDA(programId: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('global_state')],
    programId
  );
  return pda;
}

/**
 * 派生 PDA - Collateral Pool
 */
function deriveCollateralPoolPDA(programId: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('collateral_pool')],
    programId
  );
  return pda;
}

/**
 * 派生 PDA - Oath
 */
function deriveOathPDA(oathId: BN, programId: PublicKey): PublicKey {
  const [pda] = PublicKey.findProgramAddressSync(
    [Buffer.from('oath'), oathId.toArrayLike(Buffer, 'le', 8)],
    programId
  );
  return pda;
}

/**
 * 创建誓言的核心函数
 */
async function createOath(wallet: any, args: CreateOathArgs): Promise<string> {
  if (!wallet || !wallet.publicKey) {
    throw new Error('请先连接钱包');
  }

  console.log('[createOath] 🚀 开始创建誓言（使用 Anchor Program）...');
  console.log('[createOath] 钱包地址:', wallet.publicKey.toBase58());

  try {
    // Step 1: 创建 Program
    console.log('[createOath] Step 1: 创建 Anchor Program...');
    const program = getProgram(wallet);
    console.log('[createOath] ✓ Program ID:', program.programId.toBase58());

    // Step 2: 检查余额
    console.log('[createOath] Step 2: 检查账户余额...');
    const balance = await connection.getBalance(wallet.publicKey);
    const balanceInSol = balance / 1e9;
    console.log('[createOath] ✓ 当前余额:', balanceInSol, 'SOL');

    if (balance < 10_000_000) {
      // 0.01 SOL
      throw new Error(`余额不足，当前: ${balanceInSol.toFixed(4)} SOL，至少需要 0.01 SOL`);
    }

    // Step 3: 派生 PDAs
    console.log('[createOath] Step 3: 派生 PDA 账户...');
    const globalStatePda = deriveGlobalStatePDA(program.programId);
    const collateralPoolPda = deriveCollateralPoolPDA(program.programId);

    console.log('[createOath] ✓ Global State PDA:', globalStatePda.toBase58());
    console.log('[createOath] ✓ Collateral Pool PDA:', collateralPoolPda.toBase58());

    // Step 4: 获取 Global State 获取 next_oath_id
    console.log('[createOath] Step 4: 读取 Global State...');
    const globalStateAccount = await program.account.globalState.fetch(globalStatePda);
    const nextOathId = globalStateAccount.nextOathId;
    console.log('[createOath] ✓ Next Oath ID:', nextOathId.toString());

    // Step 5: 派生 Oath PDA
    const oathPda = deriveOathPDA(nextOathId, program.programId);
    console.log('[createOath] ✓ Oath PDA:', oathPda.toBase58());

    // Step 6: 准备参数
    console.log('[createOath] Step 6: 准备调用参数...');
    
    console.log('[createOath] 📝 创建参数:');
    console.log('[createOath]   - 内容:', args.content);
    console.log('[createOath]   - 分类:', args.category);
    console.log('[createOath]   - 开始时间:', new Date(Number(args.startTime) * 1000).toLocaleString());
    console.log('[createOath]   - 结束时间:', new Date(Number(args.endTime) * 1000).toLocaleString());
    console.log('[createOath]   - 稳定币抵押:', args.stableCollateral.toString(), 'USD');
    console.log('[createOath]   - 代币抵押:', args.collateralTokens.length, '种');

    // Step 7: 调用合约
    console.log('[createOath] Step 7: 调用 createOath 方法...');
    const signature = await program.methods
      .createOath(args)
      .accountsPartial({
        globalState: globalStatePda,
        oath: oathPda,
        collateralPool: collateralPoolPda,
        creator: wallet.publicKey,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    console.log('[createOath] ✅ 创建誓言成功！');
    console.log('[createOath] 📝 交易签名:', signature);
    console.log('[createOath] 🔗 查看交易: https://explorer.solana.com/tx/' + signature + '?cluster=devnet');
    console.log('[createOath] 🎯 Oath ID:', nextOathId.toString());
    console.log('[createOath] 📍 Oath PDA:', oathPda.toBase58());

    // Step 8: 验证誓言创建
    console.log('[createOath] 🔍 验证誓言账户...');
    try {
      const oathAccount = await program.account.oath.fetch(oathPda);
      console.log('[createOath] ✓ Oath ID:', oathAccount.id.toString());
      console.log('[createOath] ✓ 创建者:', oathAccount.creator.toBase58());
      console.log('[createOath] ✓ 内容:', oathAccount.content);
      console.log('[createOath] ✓ 状态:', JSON.stringify(oathAccount.status));
    } catch (err) {
      console.warn('[createOath] ⚠️ 无法立即验证誓言账户（可能需要等待确认）');
    }

    return signature;
  } catch (error: any) {
    console.error('[createOath] ❌ 创建誓言失败:', error);

    // 提取更友好的错误信息
    let friendlyMessage = error?.message || '未知错误';
    if (error.logs) {
      console.error('[createOath] 程序日志:', error.logs);
      // 尝试从日志中提取错误信息
      const errorLog = error.logs.find((log: string) => log.includes('Error'));
      if (errorLog) {
        friendlyMessage = errorLog;
      }
    }

    throw new Error(friendlyMessage);
  }
}

/**
 * 创建誓言 Hook
 */
export function useCreateOath() {
  const { wallet } = useWalletUi();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (args: CreateOathArgs) => createOath(wallet, args),
    onSuccess: (signature) => {
      toast.success(`誓言创建成功！签名: ${signature.slice(0, 8)}...`);
      queryClient.invalidateQueries({ queryKey: ['oath', 'userOaths'] });
    },
    onError: (error: Error) => {
      toast.error(`创建失败: ${error.message}`);
      console.error('[createOath] 错误详情:', error);
    },
  });
}
