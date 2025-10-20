/**
 * 创建新誓言 Hook
 * 
 * 参考 Anchor 测试代码实现
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSolana } from '@/components/solana/use-solana';
import { useWalletUiSigner, type UiWalletAccount } from '@wallet-ui/react';
import { toast } from 'sonner';
import { PublicKey, SystemProgram } from '@solana/web3.js';
import { 
  createTransaction, 
  signAndSendTransactionMessageWithSigners, 
  getBase58Decoder, 
  type Address,
} from 'gill';
import type { CreateOathArgs } from '../types-v2';
import { PROGRAM_ID } from '../types-v2';
import { deriveGlobalStatePDA, deriveCollateralPoolPDA, deriveOathPDA } from '../instructions';

/**
 * 派生用户抵押账户 PDA
 */
async function deriveUserCollateralPDA(creator: PublicKey): Promise<[PublicKey, number]> {
  return await PublicKey.findProgramAddress(
    [Buffer.from('user_collateral'), creator.toBuffer()],
    PROGRAM_ID
  );
}

export function useCreateOath(account: UiWalletAccount | null) {
  const { client } = useSolana();
  const queryClient = useQueryClient();
  
  // 创建 signer
  const DUMMY_ADDRESS = '11111111111111111111111111111111' as Address;
  const accountOrDummy = account ?? ({ address: DUMMY_ADDRESS } as any);
  const signer = useWalletUiSigner({ account: accountOrDummy });

  return useMutation({
    mutationFn: async (args: CreateOathArgs) => {
      if (!account) {
        throw new Error('请先连接钱包');
      }

      console.log('[createOath] 🚀 开始创建誓言...');

      try {
        // Step 1: 获取最新区块哈希
        console.log('[createOath] Step 1: 获取最新区块哈希...');
        const { value: latestBlockhash } = await client.rpc
          .getLatestBlockhash({ commitment: 'confirmed' })
          .send();
        
        // Step 2: 获取全局状态以获取 next_oath_id
        console.log('[createOath] Step 2: 查询全局状态获取 next_oath_id...');
        const [globalStatePda] = await deriveGlobalStatePDA();
        
        const { value: globalAccountInfo } = await client.rpc
          .getAccountInfo(globalStatePda.toBase58() as any, { encoding: 'base64' })
          .send();
        
        if (!globalAccountInfo) {
          throw new Error('合约未初始化，请先初始化合约');
        }
        
        // 解析 next_oath_id (offset: 8 bytes discriminator + 32 bytes authority = 40)
        const data = Buffer.from(globalAccountInfo.data[0], 'base64');
        const nextOathId = data.readBigUInt64LE(40);
        console.log('[createOath] ✓ next_oath_id:', nextOathId.toString());
        
        // Step 3: 派生所有必需的 PDA
        console.log('[createOath] Step 3: 派生 PDA 账户...');
        const creatorPubkey = new PublicKey(account.address);
        const [oathPda] = await deriveOathPDA(nextOathId);
        const [userCollateralPda] = await deriveUserCollateralPDA(creatorPubkey);
        const [collateralPoolPda] = await deriveCollateralPoolPDA();
        
        console.log('[createOath] ✓ Oath PDA:', oathPda.toBase58());
        console.log('[createOath] ✓ User Collateral PDA:', userCollateralPda.toBase58());
        console.log('[createOath] ✓ Collateral Pool PDA:', collateralPoolPda.toBase58());
        
        // 4. 序列化参数
        console.log('[createOath] Step 4: 序列化参数...');
        console.log('[createOath] Args:', {
          content: args.content,
          category: args.category,
          categoryId: args.categoryId,
          startTime: args.startTime.toString(),
          endTime: args.endTime.toString(),
          stableCollateral: args.stableCollateral.toString(),
          collateralTokens: args.collateralTokens,
          isOverCollateralized: args.isOverCollateralized,
          tokenAddress: args.tokenAddress,
          targetApy: args.targetApy?.toString(),
        });
        
        const argsData = Buffer.alloc(2000);
        let offset = 0;
        
        // content (String)
        const contentBytes = Buffer.from(args.content, 'utf-8');
        argsData.writeUInt32LE(contentBytes.length, offset);
        offset += 4;
        contentBytes.copy(argsData, offset);
        offset += contentBytes.length;
        
        // category (String)
        const categoryBytes = Buffer.from(args.category, 'utf-8');
        argsData.writeUInt32LE(categoryBytes.length, offset);
        offset += 4;
        categoryBytes.copy(argsData, offset);
        offset += categoryBytes.length;
        
        // categoryId (String)
        const categoryIdBytes = Buffer.from(args.categoryId, 'utf-8');
        argsData.writeUInt32LE(categoryIdBytes.length, offset);
        offset += 4;
        categoryIdBytes.copy(argsData, offset);
        offset += categoryIdBytes.length;
        
        // startTime (u64)
        argsData.writeBigUInt64LE(args.startTime, offset);
        offset += 8;
        
        // endTime (u64)
        argsData.writeBigUInt64LE(args.endTime, offset);
        offset += 8;
        
        // stableCollateral (u64)
        argsData.writeBigUInt64LE(args.stableCollateral, offset);
        offset += 8;
        
        // collateralTokens (Vec<CollateralToken>)
        argsData.writeUInt32LE(args.collateralTokens.length, offset);
        offset += 4;
        
        for (const token of args.collateralTokens) {
          const symbolBytes = Buffer.from(token.symbol, 'utf-8');
          argsData.writeUInt32LE(symbolBytes.length, offset);
          offset += 4;
          symbolBytes.copy(argsData, offset);
          offset += symbolBytes.length;
          
          argsData.writeBigUInt64LE(token.amount, offset);
          offset += 8;
          
          const addrBytes = Buffer.from(token.address, 'utf-8');
          argsData.writeUInt32LE(addrBytes.length, offset);
          offset += 4;
          addrBytes.copy(argsData, offset);
          offset += addrBytes.length;
          
          argsData.writeBigUInt64LE(token.usdValue, offset);
          offset += 8;
          
          argsData.writeBigUInt64LE(token.lockedTime, offset);
          offset += 8;
        }
        
        // isOverCollateralized (bool)
        argsData.writeUInt8(args.isOverCollateralized ? 1 : 0, offset);
        offset += 1;
        
        // tokenAddress (Option<Pubkey>)
        if (args.tokenAddress) {
          argsData.writeUInt8(1, offset);
          offset += 1;
          const pubkeyBytes = args.tokenAddress.toBytes();
          Buffer.from(pubkeyBytes).copy(argsData, offset);
          offset += 32;
        } else {
          argsData.writeUInt8(0, offset);
          offset += 1;
        }
        
        // targetApy (Option<u64>)
        if (args.targetApy !== null) {
          argsData.writeUInt8(1, offset);
          offset += 1;
          argsData.writeBigUInt64LE(args.targetApy, offset);
          offset += 8;
        } else {
          argsData.writeUInt8(0, offset);
          offset += 1;
        }
        
        const finalArgsData = argsData.subarray(0, offset);
        console.log('[createOath] 序列化后的参数长度:', finalArgsData.length);
        console.log('[createOath] 序列化后的参数:', finalArgsData.toString('hex'));
        
        // 5. 构建 discriminator + args
        console.log('[createOath] Step 5: 构建指令数据...');
        const discriminator = new Uint8Array([18, 53, 143, 138, 106, 66, 255, 195]);
        const instructionData = Buffer.concat([Buffer.from(discriminator), finalArgsData]);
        console.log('[createOath] 指令数据总长度:', instructionData.length);
        
        // Step 6: 构建 gill 格式的交易指令
        console.log('[createOath] Step 6: 构建交易指令...');
        const createInstruction = {
          programAddress: PROGRAM_ID.toBase58() as Address,
          accounts: [
            { address: globalStatePda.toBase58() as Address, role: 1 as const }, // writable
            { address: oathPda.toBase58() as Address, role: 1 as const }, // writable
            { address: userCollateralPda.toBase58() as Address, role: 1 as const }, // writable
            { address: collateralPoolPda.toBase58() as Address, role: 1 as const }, // writable
            { address: account.address as Address, role: 3 as const }, // signer + writable
            { address: SystemProgram.programId.toBase58() as Address, role: 0 as const }, // readonly
          ],
          data: new Uint8Array(instructionData),
        };
        
        console.log('[createOath] ✓ 账户列表:');
        console.log('  [0] Global State (writable):', globalStatePda.toBase58());
        console.log('  [1] Oath PDA (writable):', oathPda.toBase58());
        console.log('  [2] User Collateral (writable):', userCollateralPda.toBase58());
        console.log('  [3] Collateral Pool (writable):', collateralPoolPda.toBase58());
        console.log('  [4] Creator (signer+writable):', account.address);
        console.log('  [5] System Program:', SystemProgram.programId.toBase58());
        
        // Step 7: 构建交易
        console.log('[createOath] Step 7: 构建交易...');
        const transaction = createTransaction({
          feePayer: signer,
          version: 0,
          latestBlockhash,
          instructions: [createInstruction],
        });
        
        // Step 8: 签名并发送交易
        console.log('[createOath] Step 8: 签名并发送交易...');
        const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction);
        const signature = getBase58Decoder().decode(signatureBytes);
        
        console.log('[createOath] ✅ 创建誓言成功！');
        console.log('[createOath] 交易签名:', signature);
        console.log('[createOath] 查看交易: https://explorer.solana.com/tx/' + signature + '?cluster=devnet');
        
        return signature;
      } catch (error) {
        console.error('创建誓言失败:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('誓言创建成功！');
      queryClient.invalidateQueries({ queryKey: ['oath', 'userOaths'] });
    },
    onError: (error: Error) => {
      toast.error(`创建失败: ${error.message}`);
      console.error('创建誓言错误:', error);
    },
  });
}
