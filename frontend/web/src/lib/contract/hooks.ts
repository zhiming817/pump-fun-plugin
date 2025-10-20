/**
 * PumpFun Oath 合约 React Hooks
 * 
 * 注意：当前为简化版本，使用 Mock 数据
 * 完整的智能合约交互需要：
 * 1. 部署智能合约到 Solana
 * 2. 使用 gill API 创建交易指令
 * 3. 实现 PDA 地址派生
 * 
 * 参考: /features/account/data-access/use-transfer-sol-mutation.ts
 */

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useSolana } from '@/components/solana/use-solana';
import { useWalletUi, useWalletUiSigner, type UiWalletAccount } from '@wallet-ui/react';
import { toast } from 'sonner';
import { createTransaction, signAndSendTransactionMessageWithSigners, getBase58Decoder, type Address } from 'gill';
import type { CreateOathArgs, Oath } from './types-v2';
import { PROGRAM_ID } from './types-v2';
import { deriveGlobalStatePDA, deriveCollateralPoolPDA, deriveOathPDA } from './instructions';

/**
 * 钱包状态 Hook
 */
export function useWalletStatus() {
  const { account, connected } = useWalletUi();
  const { client } = useSolana();

  return {
    connected,
    address: account?.address,
    account,
    client,
  };
}

/**
 * 检查合约是否已初始化
 * 
 * 通过查询 global_state PDA 账户是否存在来判断
 */
export function useIsInitialized() {
  const { connected } = useWalletUi();
  const { client } = useSolana();

  return useQuery({
    queryKey: ['oath', 'isInitialized'],
    queryFn: async () => {
      try {
        const [globalState] = await deriveGlobalStatePDA();
        
        // 转换 PublicKey 到 Address (gill 格式)
        const globalStateAddress = globalState.toBase58() as any;
        
        const { value: accountInfo } = await client.rpc
          .getAccountInfo(globalStateAddress, { encoding: 'base64' })
          .send();
        
        // 如果账户存在且有数据，说明已初始化
        return accountInfo !== null && accountInfo.data && accountInfo.data.length > 0;
      } catch (error) {
        console.error('[useIsInitialized] 查询失败:', error);
        return false;
      }
    },
    enabled: connected,
    staleTime: 30000, // 30秒缓存
  });
}

/**
 * 查询单个誓言
 * 
 * TODO: 实现真实的合约查询
 * 当前返回 Mock 数据用于开发
 */
export function useOath(oathId: string | null) {
  const { connected } = useWalletUi();

  return useQuery({
    queryKey: ['oath', 'detail', oathId],
    queryFn: async (): Promise<Oath> => {
      // TODO: 调用真实的合约方法
      console.warn('[TODO] 需要实现真实的誓言查询');
      
      const now = BigInt(Date.now());
      const mockPublicKey = 'mock_address' as any;
      
      // Mock 数据
      return {
        id: 1n,
        creator: mockPublicKey,
        content: 'Mock oath content - 这是一个示例誓言，等待智能合约部署后显示真实数据',
        category: '个人目标',
        categoryId: 'personal',
        startTime: now,
        endTime: now + BigInt(7 * 24 * 60 * 60 * 1000),
        stableCollateral: 1000000n,
        collateralTokens: [],
        isOverCollateralized: false,
        tokenAddress: null,
        targetApy: null,
        currentApy: null,
        status: 0, // OathStatus.Active
        evidence: '',
        slashingInfo: null,
        compensationInfo: null,
        bump: 0,
        createdAt: now,
        updatedAt: now,
      };
    },
    enabled: !!oathId && connected,
  });
}

/**
 * 查询用户的所有誓言
 * 
 * TODO: 实现真实的合约查询
 * 当前返回 Mock 数据用于开发
 */
export function useUserOaths() {
  const { account, connected } = useWalletUi();

  return useQuery({
    queryKey: ['oath', 'userOaths', account?.address],
    queryFn: async (): Promise<Oath[]> => {
      // TODO: 调用真实的合约方法
      // 1. 使用 getProgramAccounts 或者预先知道的 PDA 地址
      // 2. 解析账户数据
      // 3. 过滤当前用户创建的誓言
      console.warn('[TODO] 需要实现真实的用户誓言查询');
      
      const now = BigInt(Date.now());
      const mockPublicKey = account?.address as any;
      
      // Mock 数据
      return [
        {
          id: 1n,
          creator: mockPublicKey,
          content: '完成 Solana 开发学习',
          category: '个人目标',
          categoryId: 'personal',
          startTime: now - BigInt(24 * 60 * 60 * 1000),
          endTime: now + BigInt(7 * 24 * 60 * 60 * 1000),
          stableCollateral: 1000000n, // 0.001 SOL
          collateralTokens: [],
          isOverCollateralized: false,
          tokenAddress: null,
          targetApy: null,
          currentApy: null,
          status: 0, // OathStatus.Active
          evidence: '',
          slashingInfo: null,
          compensationInfo: null,
          bump: 0,
          createdAt: now - BigInt(24 * 60 * 60 * 1000),
          updatedAt: now - BigInt(24 * 60 * 60 * 1000),
        },
        {
          id: 2n,
          creator: mockPublicKey,
          content: '部署第一个智能合约',
          category: '技术学习',
          categoryId: 'tech',
          startTime: now - BigInt(2 * 24 * 60 * 60 * 1000),
          endTime: now + BigInt(14 * 24 * 60 * 60 * 1000),
          stableCollateral: 2000000n, // 0.002 SOL
          collateralTokens: [],
          isOverCollateralized: false,
          tokenAddress: null,
          targetApy: null,
          currentApy: null,
          status: 0, // OathStatus.Active
          evidence: '',
          slashingInfo: null,
          compensationInfo: null,
          bump: 0,
          createdAt: now - BigInt(2 * 24 * 60 * 60 * 1000),
          updatedAt: now - BigInt(2 * 24 * 60 * 60 * 1000),
        },
        {
          id: 3n,
          creator: mockPublicKey,
          content: '完成前端集成',
          category: '项目开发',
          categoryId: 'project',
          startTime: now - BigInt(10 * 24 * 60 * 60 * 1000),
          endTime: now - BigInt(24 * 60 * 60 * 1000), // 已过期
          stableCollateral: 5000000n, // 0.005 SOL
          collateralTokens: [],
          isOverCollateralized: false,
          tokenAddress: null,
          targetApy: null,
          currentApy: null,
          status: 2, // OathStatus.Expired
          evidence: '',
          slashingInfo: {
            slashedAmount: 5000000n,
            slashingTime: now - BigInt(24 * 60 * 60 * 1000),
            reason: '未在截止日期前完成',
          },
          compensationInfo: null,
          bump: 0,
          createdAt: now - BigInt(10 * 24 * 60 * 60 * 1000),
          updatedAt: now - BigInt(24 * 60 * 60 * 1000),
        },
      ];
    },
    enabled: connected && !!account,
    staleTime: 10000, // 10秒缓存
  });
}

/**
 * 初始化合约
 * 
 * 创建 global_state 和 collateral_pool PDA 账户
 * 
 * @param account - 必需的钱包账户，确保类型安全
 */
export function useInitializeContract(account: UiWalletAccount | null) {
  const { client } = useSolana();
  const queryClient = useQueryClient();
  
  // ✅ 只在有真实 account 时创建 signer，否则使用占位符
  const DUMMY_ADDRESS = '11111111111111111111111111111111' as Address;
  const accountOrDummy = account ?? ({ address: DUMMY_ADDRESS } as any);
  
  // 🔍 调试：打印 account 信息
  console.log('useInitializeContract - account:', account);
  console.log('useInitializeContract - accountOrDummy:', accountOrDummy);
  console.log('useInitializeContract - address:', accountOrDummy.address);
  
  const signer = useWalletUiSigner({ account: accountOrDummy });

  return useMutation({
    mutationFn: async () => {
      console.log('mutationFn 开始执行');
      console.log('mutationFn - account:', account);
      console.log('mutationFn - account?.address:', account?.address);
      
      // ✅ 严格检查钱包连接状态
      if (!account) {
        throw new Error('请先连接钱包');
      }

      // ✅ 验证地址有效性
      if (!account.address || account.address.length < 32) {
        console.error('地址无效:', account.address, '长度:', account.address?.length);
        throw new Error(`钱包地址无效: ${account.address} (长度: ${account.address?.length})`);
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
            { address: '11111111111111111111111111111111' as Address, role: 0 as const }, // System Program readonly
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
        
        // 4. 签名并发送
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

/**
 * 创建新誓言
 */
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

      if (!account.address || account.address.length < 32) {
        throw new Error('钱包地址无效');
      }

      try {
        // 1. 获取最新区块哈希
        const { value: latestBlockhash } = await client.rpc
          .getLatestBlockhash({ commitment: 'confirmed' })
          .send();
        
        // 2. 获取全局状态以获取 next_oath_id
        const [globalState] = await deriveGlobalStatePDA();
        const { value: globalAccountInfo } = await client.rpc
          .getAccountInfo(globalState.toBase58() as any, { encoding: 'base64' })
          .send();
        
        if (!globalAccountInfo) {
          throw new Error('合约未初始化，请先初始化合约');
        }
        
        // 从账户数据中读取 next_oath_id (假设在第 40 字节位置)
        const data = Buffer.from(globalAccountInfo.data[0], 'base64');
        const nextOathId = data.readBigUInt64LE(40); // authority(32) + bump(1) + discriminator(8) - 1 = 40
        
        // 3. 派生 Oath PDA
        const [oathPDA] = await deriveOathPDA(nextOathId);
        const [collateralPool] = await deriveCollateralPoolPDA();
        
        // 4. 序列化参数
        const argsData = Buffer.alloc(1000); // 预分配足够空间
        let offset = 0;
        
        // content (String): 4 bytes length + content bytes
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
        
        // startTime (i64)
        argsData.writeBigInt64LE(args.startTime, offset);
        offset += 8;
        
        // endTime (i64)
        argsData.writeBigInt64LE(args.endTime, offset);
        offset += 8;
        
        // collateralTokens (Vec<CollateralToken>)
        argsData.writeUInt32LE(args.collateralTokens.length, offset);
        offset += 4;
        
        for (const token of args.collateralTokens) {
          // symbol
          const symbolBytes = Buffer.from(token.symbol, 'utf-8');
          argsData.writeUInt32LE(symbolBytes.length, offset);
          offset += 4;
          symbolBytes.copy(argsData, offset);
          offset += symbolBytes.length;
          
          // amount
          argsData.writeBigUInt64LE(token.amount, offset);
          offset += 8;
          
          // address
          const addrBytes = Buffer.from(token.address, 'utf-8');
          argsData.writeUInt32LE(addrBytes.length, offset);
          offset += 4;
          addrBytes.copy(argsData, offset);
          offset += addrBytes.length;
          
          // usdValue
          argsData.writeBigUInt64LE(token.usdValue, offset);
          offset += 8;
          
          // lockedTime
          argsData.writeBigInt64LE(token.lockedTime, offset);
          offset += 8;
        }
        
        const finalArgsData = argsData.subarray(0, offset);
        
        // 5. 构建 discriminator + args
        const discriminator = new Uint8Array([18, 53, 143, 138, 106, 66, 255, 195]);
        const instructionData = Buffer.concat([Buffer.from(discriminator), finalArgsData]);
        
        // 6. 构建 gill 格式的指令
        const createInstruction = {
          programAddress: PROGRAM_ID.toBase58() as Address,
          accounts: [
            { address: globalState.toBase58() as Address, role: 1 as const }, // writable
            { address: oathPDA.toBase58() as Address, role: 1 as const }, // writable
            { address: collateralPool.toBase58() as Address, role: 1 as const }, // writable
            { address: account.address as Address, role: 3 as const }, // signer + writable
            { address: '11111111111111111111111111111111' as Address, role: 0 as const }, // System Program
          ],
          data: new Uint8Array(instructionData),
        };
        
        // 7. 构建并发送交易
        const transaction = createTransaction({
          feePayer: signer,
          version: 0,
          latestBlockhash,
          instructions: [createInstruction],
        });
        
        const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction);
        const signature = getBase58Decoder().decode(signatureBytes);
        
        console.log('创建誓言成功！交易签名:', signature);
        return signature;
      } catch (error) {
        console.error('创建誓言失败:', error);
        throw error;
      }
    },
    onSuccess: () => {
      toast.success('誓言创建成功！');
      // 刷新用户誓言列表
      queryClient.invalidateQueries({ queryKey: ['oath', 'userOaths'] });
    },
    onError: (error: Error) => {
      toast.error(`创建失败: ${error.message}`);
      console.error('创建誓言错误:', error);
    },
  });
}

/**
 * 完成誓言
 * 
 * TODO: 实现真实的完成誓言交易
 */
export function useCompleteOath() {
  const { account } = useWalletUi();
  // const { client } = useSolana(); // TODO: 实现真实交易时使用
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (oathId: string) => {
      if (!account) {
        throw new Error('请先连接钱包');
      }

      console.warn('[TODO] 需要实现真实的完成誓言交易', oathId);
      
      // Mock 延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      throw new Error('完成誓言功能尚未实现。请先部署智能合约到 Solana。');
    },
    onSuccess: (_, oathId) => {
      toast.success('誓言完成！抵押金已返还。');
      // 刷新相关数据
      queryClient.invalidateQueries({ queryKey: ['oath', 'userOaths'] });
      queryClient.invalidateQueries({ queryKey: ['oath', 'detail', oathId] });
    },
    onError: (error: Error) => {
      toast.error(`完成失败: ${error.message}`);
      console.error('完成誓言错误:', error);
    },
  });
}

/**
 * 惩罚违约誓言
 * 
 * TODO: 实现真实的惩罚交易
 */
export function useSlashOath() {
  const { account } = useWalletUi();
  // const { client } = useSolana(); // TODO: 实现真实交易时使用
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (oathId: string) => {
      if (!account) {
        throw new Error('请先连接钱包');
      }

      console.warn('[TODO] 需要实现真实的惩罚交易', oathId);
      
      // Mock 延迟
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      throw new Error('惩罚功能尚未实现。请先部署智能合约到 Solana。');
    },
    onSuccess: (_, oathId) => {
      toast.success('誓言已被惩罚,抵押金已没收。');
      // 刷新相关数据
      queryClient.invalidateQueries({ queryKey: ['oath', 'userOaths'] });
      queryClient.invalidateQueries({ queryKey: ['oath', 'detail', oathId] });
    },
    onError: (error: Error) => {
      toast.error(`惩罚失败: ${error.message}`);
      console.error('惩罚誓言错误:', error);
    },
  });
}
