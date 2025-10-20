/**
 * 初始化合约 Hook
 * 
 * 创建 global_state 和 collateral_pool PDA 账户
 */

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useSolana } from '@/components/solana/use-solana';
import { useWalletUiSigner, type UiWalletAccount } from '@wallet-ui/react';
import { toast } from 'sonner';
import { 
  createTransaction, 
  signAndSendTransactionMessageWithSigners, 
  getBase58Decoder, 
  type Address 
} from 'gill';
import { PROGRAM_ID } from '../types-v2';
import { deriveGlobalStatePDA, deriveCollateralPoolPDA } from '../instructions';

export function useInitializeContract(account: UiWalletAccount | null) {
  const { client } = useSolana();
  const queryClient = useQueryClient();
  
  // ✅ 只在有真实 account 时创建 signer，否则使用占位符
  const DUMMY_ADDRESS = '11111111111111111111111111111111' as Address;
  const accountOrDummy = account ?? ({ address: DUMMY_ADDRESS } as any);
  
  const signer = useWalletUiSigner({ account: accountOrDummy });

  return useMutation({
    mutationFn: async () => {
      // ✅ 严格检查钱包连接状态
      if (!account) {
        throw new Error('请先连接钱包');
      }

      // ✅ 验证地址有效性
      if (!account.address || account.address.length < 32) {
        throw new Error(`钱包地址无效: ${account.address}`);
      }

      try {
        // 1. 获取最新区块哈希
        const { value: latestBlockhash } = await client.rpc
          .getLatestBlockhash({ commitment: 'confirmed' })
          .send();
        
        // 2. 派生 PDA 地址
        const [globalState] = await deriveGlobalStatePDA();
        const [collateralPool] = await deriveCollateralPoolPDA();
        
        console.log('Global State PDA:', globalState.toBase58());
        console.log('Collateral Pool PDA:', collateralPool.toBase58());
        console.log('Authority:', account.address);
        
        // 3. 构建 gill 格式的初始化指令
        const initInstruction = {
          programAddress: PROGRAM_ID.toBase58() as Address,
          accounts: [
            { address: globalState.toBase58() as Address, role: 1 as const }, // writable
            { address: collateralPool.toBase58() as Address, role: 1 as const }, // writable
            { address: account.address as Address, role: 3 as const }, // signer + writable
            { address: '11111111111111111111111111111111' as Address, role: 0 as const }, // System Program
          ],
          data: new Uint8Array([175, 175, 109, 31, 13, 152, 155, 237]), // discriminator
        };
        
        // 4. 构建交易
        const transaction = createTransaction({
          feePayer: signer,
          version: 0,
          latestBlockhash,
          instructions: [initInstruction],
        });
        
        // 5. 签名并发送
        const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction);
        const signature = getBase58Decoder().decode(signatureBytes);
        
        console.log('初始化成功！交易签名:', signature);
        return signature;
      } catch (error) {
        console.error('初始化失败:', error);
        throw error;
      }
    },
    onSuccess: (signature) => {
      toast.success(`合约初始化成功！签名: ${signature.slice(0, 8)}...`);
      // 刷新初始化状态
      queryClient.invalidateQueries({ queryKey: ['oath', 'isInitialized'] });
    },
    onError: (error: Error) => {
      toast.error(`初始化失败: ${error.message}`);
      console.error('初始化错误:', error);
    },
  });
}
