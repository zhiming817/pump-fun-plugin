# Oath 合约初始化功能实现

## 🎉 完成内容

已成功实现 Oath 合约的初始化功能！

### 1. 创建指令构建器 (`instructions.ts`)

实现了以下功能：
- ✅ `deriveGlobalStatePDA()` - 派生全局状态 PDA
- ✅ `deriveCollateralPoolPDA()` - 派生抵押池 PDA  
- ✅ `deriveOathPDA()` - 派生 Oath PDA
- ✅ `createInitializeInstruction()` - 创建初始化指令

### 2. 更新 Hooks (`hooks.ts`)

**`useIsInitialized()`**
- ✅ 查询 global_state PDA 账户是否存在
- ✅ 通过账户存在性判断合约是否已初始化
- ✅ 自动缓存 30 秒

**`useInitializeContract()`**
- ✅ 创建初始化交易
- ✅ 使用 gill API 签名和发送
- ✅ 成功后刷新初始化状态
- ✅ 显示友好的成功/失败提示

### 3. 技术实现

**指令构建**：
```typescript
// 1. 派生 PDA 账户
const [globalState] = await deriveGlobalStatePDA();
const [collateralPool] = await deriveCollateralPoolPDA();

// 2. 创建指令（discriminator + accounts）
const instruction = new TransactionInstruction({
  keys: [
    { pubkey: globalState, isSigner: false, isWritable: true },
    { pubkey: collateralPool, isSigner: false, isWritable: true },
    { pubkey: authority, isSigner: true, isWritable: true },
    { pubkey: SystemProgram.programId, isSigner: false, isWritable: false },
  ],
  programId: PROGRAM_ID,
  data: Buffer.from([175, 175, 109, 31, 13, 152, 155, 237]), // discriminator
});
```

**交易发送**：
```typescript
// 1. 获取最新区块哈希
const { value: latestBlockhash } = await client.rpc
  .getLatestBlockhash({ commitment: 'confirmed' })
  .send();

// 2. 构建交易
const transaction = createTransaction({
  feePayer: signer,
  version: 0,
  latestBlockhash,
  instructions: [initInstruction],
});

// 3. 签名并发送
const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction);
const signature = getBase58Decoder().decode(signatureBytes);
```

## 🚀 使用方法

### 前端使用

```typescript
import { useInitializeContract, useIsInitialized } from '@/lib/contract';

function InitializeButton() {
  const { mutate: initialize, isPending } = useInitializeContract();
  const { data: isInitialized } = useIsInitialized();
  
  if (isInitialized) {
    return <div>合约已初始化</div>;
  }
  
  return (
    <button 
      onClick={() => initialize()}
      disabled={isPending}
    >
      {isPending ? '初始化中...' : '初始化合约'}
    </button>
  );
}
```

### 测试步骤

1. **连接钱包**
   - 访问 http://localhost:5173/oath/initialize
   - 点击右上角 "Connect Wallet"
   - 选择 Phantom 或其他钱包

2. **执行初始化**
   - 确认钱包已连接
   - 点击 "执行初始化" 按钮
   - 在钱包中批准交易

3. **验证结果**
   - 成功：显示 "合约初始化成功" toast
   - 失败：显示具体错误信息
   - 页面自动刷新，显示"合约已初始化"状态

## 📋 PDA 派生说明

### Global State PDA
- **Seeds**: `["global_state"]`
- **用途**: 存储全局配置和下一个 Oath ID

### Collateral Pool PDA
- **Seeds**: `["collateral_pool"]`  
- **用途**: 存储所有抵押资产

### Oath PDA
- **Seeds**: `["oath", oath_id]`
- **用途**: 存储单个誓言的数据

## 🔍 调试信息

### 合约信息
- **Program ID**: `Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ`
- **IDL 文件**: `src/lib/contract/pumpfun_oath_contract.json`
- **网络**: Devnet

### 账户大小
根据 Anchor 程序：
- Global State: ~100 bytes (8 + discriminator + fields)
- Collateral Pool: ~100 bytes
- Oath: ~300+ bytes (取决于字符串长度)

## ⚠️ 注意事项

1. **初始化只能执行一次**
   - Global State PDA 创建后不能重复初始化
   - 如需重新初始化，需要重新部署合约

2. **费用要求**
   - 交易费用: ~0.000005 SOL
   - 账户租金: ~0.002 SOL (Global State + Collateral Pool)
   - 确保钱包有足够的 SOL

3. **权限要求**
   - 任何人都可以初始化（首次）
   - 初始化者将成为 authority

## 🐛 常见问题

### 1. "账户已存在" 错误
**原因**: 合约已经初始化过了
**解决**: 检查 `useIsInitialized()` 的返回值

### 2. "余额不足" 错误
**原因**: 钱包 SOL 不足以支付交易和租金
**解决**: 从水龙头获取 Devnet SOL

### 3. "无法派生 PDA" 错误
**原因**: Program ID 不正确
**解决**: 检查 `types.ts` 中的 `PROGRAM_ID`

## 📊 下一步

现在合约初始化功能已完成，可以继续实现：

1. ✅ **合约初始化** ← 当前完成
2. ⏳ **创建誓言** (`useCreateOath`)
3. ⏳ **完成誓言** (`useCompleteOath`)
4. ⏳ **惩罚誓言** (`useSlashOath`)
5. ⏳ **查询誓言** (`useOath`, `useUserOaths`)

每个功能的实现步骤类似：
1. 在 `instructions.ts` 中创建指令构建函数
2. 在 `hooks.ts` 中实现 mutation/query
3. 在组件中使用 hook

## 📚 参考资源

- [Anchor PDA 文档](https://book.anchor-lang.com/anchor_references/space.html)
- [Solana Transaction 文档](https://solana.com/docs/core/transactions)
- [Gill API 文档](https://github.com/solana-labs/solana-web3.js)

---

✨ **初始化功能已完全实现并可用！**
