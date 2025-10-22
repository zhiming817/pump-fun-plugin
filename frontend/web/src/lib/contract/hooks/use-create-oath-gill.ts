/**
 * 创建新誓言 Hook
 * 
 * 参考 Anchor 官方文档重构
 * 使用 Anchor Program 和官方推荐的方式构建和发送交易
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { BN, AnchorProvider, Program } from '@coral-xyz/anchor';
import { PublicKey, SystemProgram, Connection, Commitment } from '@solana/web3.js';
import { 
  createTransaction, 
  signAndSendTransactionMessageWithSigners, 
  getBase58Decoder,
  type Address 
} from 'gill';
import { useSolana } from '@/components/solana/use-solana';
import { useWalletUiSigner, type UiWalletAccount } from '@wallet-ui/react';
import type { PumpfunOathContract } from '../pumpfun_oath_contract';
import IDL from '../pumpfun_oath_contract.json';
import type { CreateOathArgs } from '../types-v2';

// 配置
const RPC_ENDPOINT = 'https://api.zan.top/node/v1/solana/devnet/55c625d41c924f97971cdd05bb533048';
const COMMITMENT: Commitment = 'confirmed';

// 初始化 Solana 连接
export const connection = new Connection(RPC_ENDPOINT, COMMITMENT);

/**
 * 获取 Program 实例（用于构建指令，不用于发送交易）
 */
function getProgram(): Program<PumpfunOathContract> {
  // 创建一个没有 wallet 的 provider，只用于构建指令
  const provider = new AnchorProvider(connection, {} as any, { commitment: COMMITMENT });
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
 * 将 Anchor 指令转换为 gill 格式
 */
async function convertAnchorInstructionToGill(instruction: any) {
  return {
    programAddress: instruction.programId.toBase58() as Address,
    accounts: instruction.keys.map((key: any) => {
      // 计算 role: 3=signer+writable, 2=signer, 1=writable, 0=readonly
      let role: 0 | 1 | 2 | 3;
      if (key.isSigner && key.isWritable) {
        role = 3;
      } else if (key.isWritable) {
        role = 1;
      } else if (key.isSigner) {
        role = 2;
      } else {
        role = 0;
      }
      return {
        address: key.pubkey.toBase58() as Address,
        role,
      };
    }),
    data: instruction.data,
  };
}

/**
 * 创建誓言（使用 gill 签名和发送）
 */
export async function createOath(
  account: UiWalletAccount, 
  args: CreateOathArgs,
  client: any,
  signer: any
) {
  console.log('[createOath] 🚀 开始创建誓言...');
  console.log('[createOath] 钱包地址:', account.address);
  
  if (!account || !account.address) {
    throw new Error('请先连接钱包');
  }
  
  try {
    // Step 1: 检查余额
    const userPubkey = new PublicKey(account.address);
    const balance = await connection.getBalance(userPubkey);
    const balanceInSol = balance / 1e9;
    
    console.log('[createOath] ✓ 当前余额:', balanceInSol, 'SOL');
    
    if (balance < 10_000_000) {
      throw new Error(`余额不足，当前: ${balanceInSol.toFixed(4)} SOL，至少需要 0.01 SOL`);
    }
    
    // Step 2: 获取 Program（只用于构建指令）
    const program = getProgram();
    const programId = program.programId;
    
    console.log('[createOath] ✓ Program ID:', programId.toBase58());
    
    // Step 3: 派生 PDAs
    const globalStatePda = deriveGlobalStatePDA(programId);
    const collateralPoolPda = deriveCollateralPoolPDA(programId);
    
    console.log('[createOath] ✓ Global State PDA:', globalStatePda.toBase58());
    console.log('[createOath] ✓ Collateral Pool PDA:', collateralPoolPda.toBase58());
    
    // Step 4: 获取 next_oath_id
    const globalState = await program.account.globalState.fetch(globalStatePda);
    const nextOathId = globalState.nextOathId;
    
    console.log('[createOath] ✓ Next Oath ID:', nextOathId.toString());
    console.log('[createOath] ✓ Total Oaths:', globalState.totalOaths.toString());
    
    // Step 5: 派生 Oath PDA
    const oathPda = deriveOathPDA(nextOathId, programId);
    console.log('[createOath] ✓ Oath PDA:', oathPda.toBase58());
    
    // Step 6: 准备参数
    const currentTime = Math.floor(Date.now() / 1000);
    
    const createOathArgs = {
      content: args.content,
      category: args.category,
      categoryId: args.categoryId,
      startTime: new BN(args.startTime.toString()),
      endTime: new BN(args.endTime.toString()),
      stableCollateral: new BN(args.stableCollateral.toString()),
      collateralTokens: [
        {
          symbol: "USDC",
          amount: new BN(1 * 1000000),
          address: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v",
          usdValue: new BN(1),
          lockedTime: new BN(currentTime)
        }
      ],
      isOverCollateralized: args.isOverCollateralized,
      tokenAddress: args.tokenAddress || null,
      targetApy: args.targetApy !== null && args.targetApy !== undefined 
        ? new BN(args.targetApy.toString()) 
        : null,
    };
    
    console.log('[createOath] 📝 参数:', {
      content: createOathArgs.content,
      category: createOathArgs.category,
      startTime: new Date(Number(createOathArgs.startTime) * 1000).toLocaleString(),
      endTime: new Date(Number(createOathArgs.endTime) * 1000).toLocaleString(),
    });
    
    // Step 7: 构建 Anchor 指令
    console.log('[createOath] 🚀 构建指令...');
    
    const anchorInstruction = await program.methods
      .createOath(createOathArgs)
      .accountsPartial({
        globalState: globalStatePda,
        oath: oathPda,
        collateralPool: collateralPoolPda,
        creator: userPubkey,
        systemProgram: SystemProgram.programId,
      })
      .instruction();
    
    // Step 8: 转换为 gill 格式并发送
    console.log('[createOath] 🚀 发送交易...');
    
    const gillInstruction = await convertAnchorInstructionToGill(anchorInstruction);
    
    // 获取最新区块哈希
    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash({ commitment: 'confirmed' })
      .send();
    
    // 构建交易
    const transaction = createTransaction({
      feePayer: signer,
      version: 0,
      latestBlockhash,
      instructions: [gillInstruction],
    });
    
    // 签名并发送
    const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction as any);
    const signature = getBase58Decoder().decode(signatureBytes);
    
    console.log('[createOath] ✅ 创建誓言成功！');
    console.log('[createOath] 📝 交易签名:', signature);
    console.log('[createOath] 🔗 查看交易: https://explorer.solana.com/tx/' + signature + '?cluster=devnet');
    
    // 验证誓言创建
    try {
      const oathAccount = await program.account.oath.fetch(oathPda);
      console.log('[createOath] ✓ Oath ID:', oathAccount.id.toString());
      console.log('[createOath] ✓ 创建者:', oathAccount.creator.toBase58());
      console.log('[createOath] ✓ 内容:', oathAccount.content);
    } catch (err) {
      console.warn('[createOath] ⚠️ 无法立即验证誓言账户');
    }
    
    return {
      success: true,
      oathId: nextOathId.toNumber(),
      transactionSignature: signature,
      oathAddress: oathPda.toString()
    };
    
  } catch (error: any) {
    console.error('[createOath] ❌ 创建誓言失败:', error);
    
    let friendlyMessage = error?.message || '未知错误';
    if (error.logs) {
      console.error('[createOath] 程序日志:', error.logs);
      const errorLog = error.logs.find((log: string) => log.includes('Error'));
      if (errorLog) {
        friendlyMessage = errorLog;
      }
    }
    
    throw new Error(friendlyMessage);
  }
}

/**
 * React Hook
 */
export function useCreateOath(account: UiWalletAccount | null) {
  const { client } = useSolana();
  const queryClient = useQueryClient();
  
  // 创建 signer（只在有 account 时）
  const DUMMY_ADDRESS = '11111111111111111111111111111111' as Address;
  const accountOrDummy = account ?? ({ address: DUMMY_ADDRESS } as any);
  const signer = useWalletUiSigner({ account: accountOrDummy });

  return useMutation({
    mutationFn: async (args: CreateOathArgs) => {
      if (!account) {
        throw new Error('请先连接钱包');
      }
      return createOath(account, args, client, signer);
    },
    onSuccess: (result) => {
      toast.success(`誓言创建成功！签名: ${result.transactionSignature.slice(0, 8)}...`);
      queryClient.invalidateQueries({ queryKey: ['oath', 'userOaths'] });
    },
    onError: (error: Error) => {
      toast.error(`创建失败: ${error.message}`);
      console.error('[createOath] 错误详情:', error);
    },
  });
}
