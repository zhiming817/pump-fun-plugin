# Oath 合约集成 - 钱包连接迁移指南

## 🎯 问题分析

当前错误提示：
```
Error: You have tried to read "publicKey" on a WalletContext without providing one.
```

**根本原因**: 
- 当前代码使用了 `@solana/wallet-adapter-react` 的 API (`useWallet`, `useConnection`)
- 但项目实际使用的是 `@wallet-ui/react` 和 `gill` (新版 Solana web3.js)

## 📚 项目技术栈

### 实际使用的库

| 库 | 用途 | 文档 |
|---|---|---|
| `@wallet-ui/react` | 钱包连接 UI | https://wallet-ui.dev |
| `@wallet-ui/react-gill` | Gill 集成 | https://wallet-ui.dev |
| `gill` | Solana Web3.js (新版) | https://github.com/solana-labs/solana-web3.js |

### 传统库 vs 新库对比

| 功能 | 传统方式 | 新方式 (项目使用) |
|------|---------|-----------------|
| 连接信息 | `useWallet()` | `useWalletUi()` |
| RPC 客户端 | `useConnection()` | `useSolana().client.rpc` |
| 账户地址 | `publicKey` | `account.address` |
| 签名器 | `wallet.signTransaction` | `useWalletUiSigner()` |
| 发送交易 | `sendTransaction` | `signAndSendTransactionMessageWithSigners` |

## 🔧 需要修改的文件

### 1. `/lib/contract/hooks.ts`

#### 当前问题代码：
```typescript
import { useConnection, useWallet } from '@solana/wallet-adapter-react';
import { PublicKey, Transaction } from '@solana/web3.js';

export function useCreateOath() {
  const { publicKey, sendTransaction } = useWallet();
  const { connection } = useConnection();
  // ...
}
```

#### 正确的实现：
```typescript
import { useSolana } from '@/components/solana/use-solana';
import { address, Address } from 'gill';
import { UiWalletAccount, useWalletUi, useWalletUiSigner } from '@wallet-ui/react';

export function useCreateOath() {
  const { account } = useWalletUi();
  const { client } = useSolana();
  const signer = useWalletUiSigner({ account });
  // ...
}
```

### 2. `/lib/contract/oath-contract.ts`

#### 需要更新：
- 使用 `gill` 的 `Address` 类型替代 `PublicKey`
- 使用 `gill` 的交易创建方法
- 使用 `Rpc` 客户端替代 `Connection`

### 3. `/lib/contract/types.ts`

#### 需要更新：
- `PublicKey` → `Address` (from 'gill')
- `BN` → `bigint` (原生类型)

## 🎨 正确的使用模式

### 模式 1: 获取钱包信息

```typescript
import { useWalletUi } from '@wallet-ui/react';

function MyComponent() {
  const { account, connected, wallet } = useWalletUi();
  
  if (!connected || !account) {
    return <div>请连接钱包</div>;
  }
  
  // account.address 是钱包地址 (Address 类型)
  return <div>地址: {account.address}</div>;
}
```

### 模式 2: 发送交易

```typescript
import { useSolana } from '@/components/solana/use-solana';
import { useWalletUi, useWalletUiSigner } from '@wallet-ui/react';
import { 
  createTransaction, 
  signAndSendTransactionMessageWithSigners 
} from 'gill';

function MyComponent() {
  const { account } = useWalletUi();
  const { client } = useSolana();
  const signer = useWalletUiSigner({ account });
  
  const sendTransaction = async () => {
    // 获取最新区块哈希
    const { value: latestBlockhash } = await client.rpc
      .getLatestBlockhash({ commitment: 'confirmed' })
      .send();
    
    // 创建交易
    const transaction = createTransaction({
      feePayer: signer,
      version: 0,
      latestBlockhash,
      instructions: [/* 你的指令 */],
    });
    
    // 签名并发送
    const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction);
    
    return signatureBytes;
  };
}
```

### 模式 3: 查询账户数据

```typescript
import { useSolana } from '@/components/solana/use-solana';
import { address } from 'gill';

function MyComponent() {
  const { client } = useSolana();
  
  const fetchAccountData = async (addressString: string) => {
    const accountAddress = address(addressString);
    const accountInfo = await client.rpc
      .getAccountInfo(accountAddress, { encoding: 'base64' })
      .send();
    
    return accountInfo.value;
  };
}
```

## 🚀 迁移步骤

### 第1步: 更新依赖导入

```diff
- import { useConnection, useWallet } from '@solana/wallet-adapter-react';
- import { PublicKey, Transaction } from '@solana/web3.js';
- import { BN } from '@coral-xyz/anchor';
+ import { useSolana } from '@/components/solana/use-solana';
+ import { useWalletUi, useWalletUiSigner } from '@wallet-ui/react';
+ import { address, Address, createTransaction } from 'gill';
```

### 第2步: 更新类型定义

```diff
// types.ts
- export const PROGRAM_ID = new PublicKey('...');
+ export const PROGRAM_ID = address('...');

- export interface Oath {
-   creator: PublicKey;
+ export interface Oath {
+   creator: Address;
```

### 第3步: 更新 Hooks

参考 `/features/account/data-access/use-transfer-sol-mutation.ts` 的实现模式。

### 第4步: 测试流程

1. 连接钱包
2. 检查 `account` 是否存在
3. 创建交易
4. 签名并发送
5. 等待确认

## 📝 代码示例

### 完整的创建誓言 Hook 示例

```typescript
import { useMutation } from '@tanstack/react-query';
import { useSolana } from '@/components/solana/use-solana';
import { useWalletUi, useWalletUiSigner } from '@wallet-ui/react';
import { createTransaction, signAndSendTransactionMessageWithSigners } from 'gill';
import { toast } from 'sonner';

export function useCreateOath() {
  const { account } = useWalletUi();
  const { client } = useSolana();
  const signer = useWalletUiSigner({ account });
  
  return useMutation({
    mutationFn: async (args: CreateOathArgs) => {
      if (!account) {
        throw new Error('钱包未连接');
      }
      
      // 获取最新区块哈希
      const { value: latestBlockhash } = await client.rpc
        .getLatestBlockhash({ commitment: 'confirmed' })
        .send();
      
      // 创建交易（需要实现创建指令的逻辑）
      const transaction = createTransaction({
        feePayer: signer,
        version: 0,
        latestBlockhash,
        instructions: [
          // TODO: 创建 Oath 的指令
        ],
      });
      
      // 签名并发送
      const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction);
      
      return signatureBytes;
    },
    onSuccess: (signature) => {
      toast.success('创建成功！');
      console.log('交易签名:', signature);
    },
    onError: (error) => {
      toast.error(`创建失败: ${error.message}`);
    },
  });
}
```

## ⚠️ 注意事项

1. **不要混用两套 API**
   - ❌ 不要同时使用 `@solana/wallet-adapter-react` 和 `@wallet-ui/react`
   - ✅ 统一使用项目现有的 `@wallet-ui/react`

2. **类型转换**
   - `PublicKey` → `Address`
   - `Connection` → `Rpc`
   - `BN` → `bigint`

3. **交易签名**
   - 新 API 需要使用 `useWalletUiSigner` 创建签名器
   - 使用 `signAndSendTransactionMessageWithSigners` 发送交易

4. **PDA 派生**
   - 可能需要使用不同的 PDA 派生方法
   - 参考 `gill` 文档中的 PDA 相关 API

## 🔗 参考资源

- [Wallet UI 文档](https://wallet-ui.dev)
- [Gill GitHub](https://github.com/solana-labs/solana-web3.js)
- 项目中的示例: `/features/account/data-access/`

## ✅ 下一步

1. 先不实现完整的智能合约交互
2. 创建一个简单的演示组件，确保钱包连接正常
3. 参考 Account 功能的实现
4. 逐步完善 Oath 功能

暂时可以：
- 显示钱包连接状态
- 显示钱包地址
- 显示"功能开发中"的提示
- 等待智能合约部署后再实现完整交互
