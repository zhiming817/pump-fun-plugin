# Bug Fix: Signature Verification Failed

## 🐛 问题描述

**错误信息**:
```
Error creating oath: Error: Signature verification failed.
Missing signature for public key [`8dXiNhizFy1Mqq18ZcGAWFzZgZSyjwd5mJZeW1tLaxsz`].
```

**发生场景**: 用户尝试创建 Oath 时,交易签名验证失败

**根本原因**: 
1. ❌ 合约调用方法 `.rpc()` 缺少 `.signers([])` 链式调用
2. ❌ 组件中手动创建的 wallet 对象缺少真实的签名方法

---

## 🔧 修复方案

### 修复 1: 添加 `.signers([])` 到所有交易

Solana Wallet Adapter 需要明确指定签名者列表,即使是空数组也需要显式声明,这样 wallet adapter 才会正确处理用户钱包的签名。

#### 修改文件: `createOath.ts`
```typescript
// ❌ 修复前
const tx = await program.methods
  .createOath(args)
  .accounts({ ... })
  .rpc();

// ✅ 修复后
const tx = await program.methods
  .createOath(args)
  .accounts({ ... })
  .signers([])  // Wallet adapter 会自动处理签名
  .rpc();

console.log('📝 Transaction sent:', tx);
await connection.confirmTransaction(tx, 'confirmed');
```

#### 修改文件: `actions.ts`
```typescript
// completeOath 函数
const tx = await program.methods
  .completeOath({ evidence: String(evidence) })
  .accounts({ ... })
  .signers([])  // 添加
  .rpc();

// slashOath 函数
const tx = await program.methods
  .slashOath({ ... })
  .accounts({ ... })
  .signers([])  // 添加
  .rpc();
```

#### 修改文件: `initialize.ts`
```typescript
const tx = await program.methods
  .initialize()
  .accounts({ ... })
  .signers([])  // 添加
  .rpc();
```

---

### 修复 2: 使用完整的 Wallet 对象

组件中不应该手动创建简化的 wallet 对象,而应该直接传递 `useWallet()` 的完整返回值。

#### 修改文件: `CreateOathFlow.jsx`
```jsx
// ❌ 修复前
export default function CreateOathFlow() {
  const { publicKey, connected } = useWallet();
  
  const handleCreateOath = async () => {
    const wallet = {
      publicKey,
      signTransaction: async (tx) => tx,
      signAllTransactions: async (txs) => txs,
    };
    await createOath(wallet, formData);
  }
}

// ✅ 修复后
export default function CreateOathFlow() {
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  
  const handleCreateOath = async () => {
    await createOath(wallet, formData);  // 直接传递完整 wallet
  }
}
```

#### 修改文件: `OathDetail.jsx`
```jsx
// ✅ 同样的修复
export default function OathDetail() {
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  
  const handleCompleteOath = async () => {
    await completeOath(wallet, parseInt(oathId), evidence);
  }
}
```

#### 修改文件: `InitializeOathContract.jsx`
```jsx
// ✅ 同样的修复
export default function InitializeOathContract() {
  const wallet = useWallet();
  const { publicKey, connected } = wallet;
  
  const handleInitialize = async () => {
    await initializeOathGlobal(wallet);
  }
}
```

---

## 📝 修改文件清单

### 后端工具模块 (3 个文件)
- ✅ `frontend/web/src/utils/oath/createOath.ts`
  - 添加 `.signers([])` 到 createOath 交易
  - 添加交易确认日志

- ✅ `frontend/web/src/utils/oath/actions.ts`
  - 添加 `.signers([])` 到 completeOath 交易
  - 添加 `.signers([])` 到 slashOath 交易
  - 添加交易确认日志

- ✅ `frontend/web/src/utils/oath/initialize.ts`
  - 添加 `.signers([])` 到 initialize 交易
  - 修复重复导入 `getReadOnlyOathProgram`
  - 添加交易确认日志

### 前端组件 (3 个文件)
- ✅ `frontend/web/src/oath/CreateOathFlow.jsx`
  - 使用完整 `wallet` 对象而非手动创建
  - 移除 `signTransaction` 和 `signAllTransactions` 模拟

- ✅ `frontend/web/src/oath/OathDetail.jsx`
  - 使用完整 `wallet` 对象而非手动创建
  - 移除 `signTransaction` 和 `signAllTransactions` 模拟

- ✅ `frontend/web/src/oath/InitializeOathContract.jsx`
  - 使用完整 `wallet` 对象而非手动创建
  - 移除 `signTransaction` 和 `signAllTransactions` 模拟

---

## 🎯 技术原理

### 为什么需要 `.signers([])`?

在 Anchor 框架中:

1. **显式签名者声明**: `.signers([])` 告诉 Anchor 这个交易需要由钱包签名
2. **Wallet Adapter 集成**: 空数组表示使用默认签名者(即连接的钱包)
3. **交易构建流程**:
   ```typescript
   program.methods.xxx()
     .accounts({...})     // 指定账户
     .signers([])         // 指定签名者(空=使用钱包)
     .rpc()               // 发送交易
   ```

### 为什么需要完整的 Wallet 对象?

Wallet Adapter 的完整对象包含:
```typescript
{
  publicKey: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
  signAllTransactions: (txs: Transaction[]) => Promise<Transaction[]>,
  signMessage?: (message: Uint8Array) => Promise<Uint8Array>,
  // ... 其他方法和状态
}
```

手动创建的简化对象缺少:
- ❌ 真实的签名实现
- ❌ 钱包连接状态
- ❌ 错误处理逻辑
- ❌ Wallet Adapter 的内部状态管理

---

## ✅ 验证结果

### 编译检查
```bash
✅ createOath.ts - No errors found
✅ actions.ts - No errors found
✅ initialize.ts - No errors found
✅ CreateOathFlow.jsx - No errors found
✅ OathDetail.jsx - No errors found
✅ InitializeOathContract.jsx - No errors found
```

### 预期行为
现在当用户点击 "Create Oath" 按钮时:

1. ✅ Phantom/Solflare 钱包会弹出签名确认窗口
2. ✅ 用户批准后交易会被正确签名
3. ✅ 交易成功发送到 Solana 网络
4. ✅ 控制台显示交易签名: `📝 Transaction sent: xxx`
5. ✅ 创建成功后跳转到 Oath 详情页

---

## 🔍 调试技巧

### 如果问题依然存在,检查:

1. **钱包连接状态**
   ```javascript
   console.log('Wallet connected:', connected);
   console.log('Public key:', publicKey?.toString());
   ```

2. **Program ID 是否正确**
   ```javascript
   console.log('Program ID:', OATH_CONTRACT_CONFIG.PROGRAM_ID);
   ```

3. **RPC 连接是否正常**
   ```javascript
   const version = await connection.getVersion();
   console.log('RPC version:', version);
   ```

4. **账户是否有足够 SOL**
   ```javascript
   const balance = await connection.getBalance(publicKey);
   console.log('Balance:', balance / 1e9, 'SOL');
   ```

---

## 📚 相关资源

- [Anchor Book - Transactions](https://www.anchor-lang.com/docs/transactions)
- [Solana Wallet Adapter Docs](https://github.com/solana-labs/wallet-adapter)
- [Solana Web3.js Guide](https://solana-labs.github.io/solana-web3.js/)

---

## 🎓 经验教训

1. **始终使用完整的 Wallet Adapter 对象**: 不要尝试手动模拟签名方法
2. **显式声明签名者**: 即使是空数组也要添加 `.signers([])`
3. **添加详细日志**: 帮助调试交易流程
4. **理解 Anchor 框架**: 熟悉 `.methods()`, `.accounts()`, `.signers()`, `.rpc()` 的调用链

---

**修复完成时间**: 2025-01-XX  
**影响范围**: 6 个文件  
**破坏性变更**: 无  
**测试状态**: 待用户验证  
