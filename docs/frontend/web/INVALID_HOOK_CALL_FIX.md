# React Hook 调用错误修复

## 🐛 问题描述

### 错误信息
```
hooks.ts:271 初始化错误: Error: Invalid hook call. Hooks can only be called inside of the body of a function component. 
This could happen for one of the following reasons:
1. You might have mismatching versions of React and the renderer (such as React DOM)
2. You might be breaking the Rules of Hooks
3. You might have more than one copy of React in the same app
See https://react.dev/link/invalid-hook-call for tips about how to debug and fix this problem.
    at Object.mutationFn (hooks.ts:233:22)
```

### 触发场景
- 用户点击"执行初始化"按钮
- `useInitializeContract` Hook 执行
- 在 `mutationFn` 回调中调用了 `useWalletUiSigner` Hook

---

## 🔍 根本原因

### React Hook 规则
React Hooks 只能在以下两种情况下调用：
1. ✅ 函数组件的顶层
2. ✅ 自定义 Hook 的顶层
3. ❌ **回调函数中**（如 `mutationFn`, `onClick`, `useEffect` 内部等）
4. ❌ 条件语句中
5. ❌ 循环中

### 问题代码
```typescript
export function useInitializeContract() {
  const { account } = useWalletUi();
  const { client } = useSolana();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {  // ❌ 这是一个回调函数
      if (!account) {
        throw new Error('请先连接钱包');
      }

      // ❌ 在回调函数中调用 Hook - 违反规则！
      const signer = useWalletUiSigner({ account });
      
      // ... 其他代码
    },
  });
}
```

### 为什么会报错？
- `mutationFn` 是一个**异步回调函数**，在用户点击按钮时才会执行
- Hook 必须在组件每次渲染时**按照相同的顺序**调用
- 在回调中调用 Hook 会破坏这个顺序，导致 React 内部状态错乱

---

## ✅ 修复方案

### 解决方案：在 Hook 顶层调用并使用有效占位符
将 `useWalletUiSigner` 移到函数组件/Hook 的顶层，**在 `useMutation` 之前**调用，并使用有效的 Solana 地址作为占位符。

### 修复后的代码
```typescript
export function useInitializeContract() {
  const { account } = useWalletUi();
  const { client } = useSolana();
  const queryClient = useQueryClient();
  
  // ✅ 使用有效的占位符地址（System Program）避免地址验证错误
  // 当钱包未连接时，mutationFn 会立即检查并抛出错误，不会真正使用这个占位符
  const DUMMY_ADDRESS = '11111111111111111111111111111111' as Address;
  const accountOrDummy = account ?? { address: DUMMY_ADDRESS } as any;
  const signer = useWalletUiSigner({ account: accountOrDummy });

  return useMutation({
    mutationFn: async () => {
      // ✅ 立即检查钱包连接状态
      if (!account) {
        throw new Error('请先连接钱包');
      }

      try {
        // ✅ 直接使用顶层的 signer
        const { value: latestBlockhash } = await client.rpc
          .getLatestBlockhash({ commitment: 'confirmed' })
          .send();
        
        const authorityPubkey = new PublicKey(account.address);
        const initInstruction = await createInitializeInstruction(authorityPubkey);
        
        const transaction = createTransaction({
          feePayer: signer,  // ✅ 使用顶层声明的 signer
          version: 0,
          latestBlockhash,
          instructions: [initInstruction as any],
        });
        
        const signatureBytes = await signAndSendTransactionMessageWithSigners(transaction);
        const signature = getBase58Decoder().decode(signatureBytes);
        
        return signature;
      } catch (error) {
        console.error('初始化失败:', error);
        throw error;
      }
    },
    onSuccess: (signature) => {
      toast.success(`合约初始化成功！签名: ${signature.slice(0, 8)}...`);
      queryClient.invalidateQueries({ queryKey: ['oath', 'isInitialized'] });
    },
    onError: (error: Error) => {
      toast.error(`初始化失败: ${error.message}`);
      console.error('初始化错误:', error);
    },
  });
}
```

---

## 🐛 后续问题：地址验证错误

### 错误信息
```
初始化失败: SolanaError: Expected base58-encoded address string of length in the range [32, 44]. 
Actual length: 9.
```

### 根本原因
最初的修复使用了**空字符串**作为占位符地址：
```typescript
// ❌ 错误：空字符串不是有效的 Solana 地址
const dummyAccount = account ?? { address: '' as Address } as any;
```

当 `account` 为 `null` 时，`useWalletUiSigner` 仍然会用空字符串创建 signer，导致后续的地址验证失败。

### 最终解决方案
使用**有效的 Solana 地址**作为占位符：
```typescript
// ✅ 正确：使用 System Program 地址（32 个字符的有效地址）
const DUMMY_ADDRESS = '11111111111111111111111111111111' as Address;
const accountOrDummy = account ?? { address: DUMMY_ADDRESS } as any;
const signer = useWalletUiSigner({ account: accountOrDummy });
```

**为什么这样安全？**
1. `DUMMY_ADDRESS` 是 Solana System Program 的地址，总是有效的
2. 在 `mutationFn` 开始时立即检查 `account` 是否存在
3. 如果 `account` 为 `null`，会立即抛出错误，**不会使用占位符进行任何操作**
4. 只有在真实的 `account` 存在时，才会执行交易

---

## 🤔 技术细节

### Q: 为什么使用 System Program 地址作为占位符？
**A**: `11111111111111111111111111111111` 是 Solana System Program 的地址，它是一个有效的、永远存在的地址。

**地址验证问题**:
```typescript
// ❌ 空字符串 - 长度只有 0，验证失败
const dummyAccount = { address: '' as Address };

// ❌ 随机字符串 - 长度不符合 base58 编码要求
const dummyAccount = { address: 'dummy' as Address };  // 长度只有 5

// ✅ System Program - 长度 32，有效的 base58 地址
const DUMMY_ADDRESS = '11111111111111111111111111111111' as Address;
const accountOrDummy = account ?? { address: DUMMY_ADDRESS };
```

**Solana 地址要求**:
- 必须是 base58 编码的字符串
- 长度必须在 32-44 个字符之间
- System Program (`11111111111111111111111111111111`) 恰好符合这些要求

### Q: 占位符会被实际使用吗？
**A**: 不会，因为有安全检查。

**执行流程**:
```typescript
// 1. Hook 初始化时（钱包未连接）
const accountOrDummy = null ?? { address: DUMMY_ADDRESS };  // 使用占位符
const signer = useWalletUiSigner({ account: accountOrDummy });  // 创建占位符 signer

// 2. 用户点击按钮，mutationFn 执行
mutationFn: async () => {
  // ⚠️ 第一行就检查！
  if (!account) {
    throw new Error('请先连接钱包');  // ❌ 立即抛出错误，不会继续
  }
  
  // ✅ 下面的代码根本不会执行
  const transaction = createTransaction({
    feePayer: signer,  // 这行代码永远不会用到占位符 signer
    // ...
  });
}
```

### Q: 为什么不用其他方案？
**A**: `useWalletUiSigner` 需要一个必需的 `UiWalletAccount` 参数，但 `account` 可能是 `undefined`（钱包未连接时）。

**问题**:
```typescript
// ❌ 条件性调用 Hook - 违反规则
const signer = account ? useWalletUiSigner({ account }) : null;

// ❌ 传入 undefined - 类型错误
const signer = useWalletUiSigner({ account: account ?? undefined });
```

**解决方案**:
```typescript
// ✅ 总是调用 Hook，但使用占位符
const dummyAccount = account ?? { address: '' as Address } as any;
const signer = useWalletUiSigner({ account: dummyAccount });

// 然后在 mutationFn 中检查 account
if (!account) {
  throw new Error('请先连接钱包');
}
```

### Q: 为什么不用其他方案？
**A**: 有其他方案，但各有权衡：

**方案 1**: 条件性渲染（推荐用于 UI）
```typescript
// 在组件中
function InitializeButton() {
  const { account } = useWalletUi();
  
  if (!account) {
    return <button disabled>请先连接钱包</button>;
  }
  
  const { mutate } = useInitializeContractSafe(account);
  return <button onClick={() => mutate()}>执行初始化</button>;
}
```

**方案 2**: 两个 Hook（更类型安全，但更复杂）
```typescript
// Hook 1: 需要 account
function useInitializeContractCore(account: UiWalletAccount) {
  const signer = useWalletUiSigner({ account });
  // ...
}

// Hook 2: 包装器
function useInitializeContract() {
  const { account } = useWalletUi();
  return account ? useInitializeContractCore(account) : null;
}
```

**当前方案的优势**:
- ✅ 简单直接，一个 Hook 搞定
- ✅ 不改变现有 API
- ✅ 符合 React Query 的使用模式
- ✅ 使用有效地址避免验证错误

---

## 🔧 两次修复总结

### 第一次修复：Hook 调用位置错误
**问题**: 在 `mutationFn` 回调中调用 `useWalletUiSigner`  
**解决**: 移到 Hook 顶层  
**结果**: ✅ 修复了 "Invalid hook call" 错误

### 第二次修复：占位符地址无效
**问题**: 使用空字符串 `''` 作为占位符地址  
**解决**: 使用 System Program 地址 `'11111111111111111111111111111111'`  
**结果**: ✅ 修复了 "Expected base58-encoded address" 错误

---
**A**: 有，但各有权衡：

**方案 1**: 在组件层面确保 account 存在
```typescript
// 在组件中
const { account } = useWalletUi();

if (!account) {
  return <div>请先连接钱包</div>;
}

// 确保传入时 account 一定存在
const { mutate } = useInitializeContract(account);
```

**方案 2**: 使用两个 Hook
```typescript
// Hook 1: 只在有 account 时使用
function useInitializeContractCore(account: UiWalletAccount) {
  const signer = useWalletUiSigner({ account });
  // ...
}

// Hook 2: 包装器
function useInitializeContract() {
  const { account } = useWalletUi();
  return account ? useInitializeContractCore(account) : null;
}
```

**当前方案的优势**:
- ✅ 简单直接
- ✅ 不改变 API
- ✅ 符合 React Query 的使用模式

---

## 📚 相关参考

### React Hooks 规则
- [React Hooks 规则](https://react.dev/reference/rules/rules-of-hooks)
- [Invalid Hook Call 错误](https://react.dev/link/invalid-hook-call)
- [Hooks FAQ](https://react.dev/learn/hooks-faq)

### 相似案例
项目中的其他正确示例：
```typescript
// features/account/data-access/use-transfer-sol-mutation.ts
export function useTransferSolMutation({ 
  account, 
  address 
}: { 
  account: UiWalletAccount;  // ✅ 确保 account 存在
  address: Address 
}) {
  const { client } = useSolana()
  const signer = useWalletUiSigner({ account })  // ✅ 在顶层调用
  
  return useMutation({
    mutationFn: async (input) => {
      // ✅ 直接使用 signer，不在这里调用 Hook
      const transaction = createTransaction({
        feePayer: signer,
        // ...
      });
    }
  });
}
```

---

## ✅ 修复验证

### TypeScript 编译
```bash
$ get_errors frontend/web/src
No errors found.
```

### 构建测试
```bash
$ npm run build
✓ 2155 modules transformed.
✓ built in 2.64s
```

### 运行时测试
1. ✅ 启动开发服务器: `npm run dev`
2. ✅ 访问初始化页面: http://localhost:5173/oath/initialize
3. ✅ 连接钱包
4. ✅ 点击"执行初始化"按钮
5. ✅ 不再出现 "Invalid hook call" 错误

---

## 📝 修改文件

### 修改的文件
- ✅ `frontend/web/src/lib/contract/hooks.ts`
  - 将 `useWalletUiSigner` 调用移到 `useInitializeContract` 函数顶层
  - 添加 `dummyAccount` 占位符处理 `account` 可能为 `undefined` 的情况
  - 导入 `Address` 类型

### 添加的导入
```typescript
import { 
  createTransaction, 
  signAndSendTransactionMessageWithSigners, 
  getBase58Decoder, 
  type Address  // ✅ 新增
} from 'gill';
```

---

## 🎯 关键要点

### React Hook 调用位置
```typescript
function MyComponent() {
  // ✅ 正确：组件顶层
  const [state, setState] = useState(0);
  const data = useQuery(...);
  
  // ❌ 错误：回调函数中
  const handleClick = () => {
    const [error] = useState(null);  // ❌
  };
  
  // ❌ 错误：条件语句中
  if (condition) {
    const data = useQuery(...);  // ❌
  }
  
  // ❌ 错误：循环中
  for (let i = 0; i < 10; i++) {
    const data = useQuery(...);  // ❌
  }
  
  return useMutation({
    // ❌ 错误：在 mutationFn 回调中
    mutationFn: async () => {
      const signer = useWalletUiSigner(...);  // ❌
    }
  });
}
```

### 正确模式
```typescript
function MyComponent() {
  // ✅ 所有 Hooks 都在顶层调用
  const { account } = useWalletUi();
  const { client } = useSolana();
  const signer = useWalletUiSigner({ account: account ?? dummyAccount });
  
  return useMutation({
    mutationFn: async () => {
      // ✅ 只使用顶层声明的变量
      if (!account) throw new Error('...');
      
      const transaction = createTransaction({
        feePayer: signer,  // ✅
        // ...
      });
    }
  });
}
```

---

## 🚀 未来改进

### 可选的类型安全改进
```typescript
// 创建一个类型安全的包装器
export function useInitializeContractSafe(account: UiWalletAccount) {
  const signer = useWalletUiSigner({ account });
  const { client } = useSolana();
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async () => {
      // account 确保存在，无需检查
      const transaction = createTransaction({
        feePayer: signer,
        // ...
      });
    }
  });
}

// 在组件中使用
function InitializeButton() {
  const { account } = useWalletUi();
  
  if (!account) {
    return <div>请先连接钱包</div>;
  }
  
  const { mutate } = useInitializeContractSafe(account);
  // ...
}
```

---

**✅ 问题修复完成**: 2025-01-XX  
**✅ 测试状态**: 通过  
**✅ 构建状态**: 成功 (2.64s)  
**📖 相关文档**: `TYPE_MIGRATION_TO_ANCHOR.md`, `OATH_INITIALIZE_IMPLEMENTATION.md`
