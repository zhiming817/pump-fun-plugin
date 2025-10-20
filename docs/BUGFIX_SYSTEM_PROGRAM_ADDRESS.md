# System Program 地址错误修复

## 🐛 错误信息
```
初始化失败: 0e: Unexpected error
at signAndSendTransaction
at hooks.ts:291:32
```

---

## 🔍 问题原因

### 错误的 System Program 地址
```typescript
// ❌ 错误：最后一位是 '2'
{ address: '11111111111111111111111111111112' as Address, role: 0 as const }
```

### 正确的 System Program 地址
```typescript
// ✅ 正确：全部是 '1'（32 个 1）
{ address: '11111111111111111111111111111111' as Address, role: 0 as const }
```

---

## ⚠️ 为什么会导致 "Unexpected error"？

### Solana 系统验证
1. System Program 是 Solana 的核心程序，地址固定为 `11111111111111111111111111111111`
2. 当交易中包含错误的 System Program 地址时，Solana 运行时会拒绝执行
3. 这会导致 `signAndSendTransaction` 抛出 "Unexpected error"

### 错误的影响范围
使用错误的 System Program 地址会导致：
- ✅ 地址格式验证**通过**（32 个字符，有效的 base58）
- ❌ 程序执行**失败**（Solana 找不到该程序）
- ❌ 交易**被拒绝**（无效的程序账户）

---

## ✅ 修复

### 代码更改
```diff
  const initInstruction = {
    programAddress: PROGRAM_ID.toBase58() as Address,
    accounts: [
      { address: globalState.toBase58() as Address, role: 1 as const },
      { address: collateralPool.toBase58() as Address, role: 1 as const },
      { address: account.address as Address, role: 3 as const },
-     { address: '11111111111111111111111111111112' as Address, role: 0 as const },
+     { address: '11111111111111111111111111111111' as Address, role: 0 as const },
    ],
    data: new Uint8Array([175, 175, 109, 31, 13, 152, 155, 237]),
  };
```

### 验证
```bash
$ node -e "const { SystemProgram } = require('@solana/web3.js'); console.log(SystemProgram.programId.toBase58());"
11111111111111111111111111111111
```

---

## 📚 Solana 系统程序地址

### 常用系统程序
```typescript
// System Program - 创建账户、转账等基础操作
const SYSTEM_PROGRAM = '11111111111111111111111111111111';

// Token Program - SPL Token 操作
const TOKEN_PROGRAM = 'TokenkegQfeZyiNwAJbNbGKPFXCWuBvf9Ss623VQ5DA';

// Associated Token Account Program
const ASSOCIATED_TOKEN_PROGRAM = 'ATokenGPvbdGVxr1b2hvZbsiqW5xWH25efTNsLJA8knL';

// Wrapped SOL (Native Mint)
const WRAPPED_SOL = 'So11111111111111111111111111111111111111112';
```

### 注意区别
```typescript
// ⚠️ 容易混淆
SYSTEM_PROGRAM   = '11111111111111111111111111111111'  // 32 个 '1'
WRAPPED_SOL      = 'So11111111111111111111111111111111111111112'  // 以 'So' 开头

// System Program 是纯数字 '1'
// Wrapped SOL 有字母和数字混合
```

---

## 💡 防止类似错误的建议

### 1. 使用常量定义
```typescript
// ✅ 推荐：定义常量避免手动输入
import { SystemProgram } from '@solana/web3.js';

const SYSTEM_PROGRAM_ADDRESS = SystemProgram.programId.toBase58() as Address;

const initInstruction = {
  accounts: [
    // ...
    { address: SYSTEM_PROGRAM_ADDRESS, role: 0 as const },
  ],
};
```

### 2. 从 @solana/web3.js 导入
```typescript
// ✅ 更好：直接使用 web3.js 的常量
import { SystemProgram } from '@solana/web3.js';

// 在需要 gill Address 类型时转换
const systemProgramAddress = SystemProgram.programId.toBase58() as Address;
```

### 3. 创建辅助函数
```typescript
// ✅ 最佳：封装转换逻辑
import { SystemProgram, PublicKey } from '@solana/web3.js';
import type { Address } from 'gill';

export function toGillAddress(publicKey: PublicKey): Address {
  return publicKey.toBase58() as Address;
}

// 使用
const systemProgram = toGillAddress(SystemProgram.programId);
```

---

## 📊 验证结果

### 构建测试
```bash
$ npm run build
✓ 2155 modules transformed.
✓ built in 2.73s
```

### 预期效果
- ✅ System Program 地址正确
- ✅ 交易可以正常构建
- ✅ Solana 运行时能识别 System Program
- ✅ 初始化指令可以正常执行

---

## 🔄 完整修复历程

1. **Invalid Hook Call** ✅
2. **Address Validation (空字符串)** ✅
3. **Hook 参数模式** ✅
4. **指令格式不兼容** ✅
5. **System Program 地址错误** ✅ ← **当前修复**

---

## 📝 经验教训

### 1. 仔细检查硬编码的地址
手动输入长地址时容易出错，应该：
- ✅ 使用常量定义
- ✅ 从官方库导入
- ✅ 复制粘贴后验证
- ❌ 避免手动输入

### 2. 使用代码验证
```typescript
// 开发时可以添加验证
console.assert(
  SYSTEM_PROGRAM_ADDRESS === '11111111111111111111111111111111',
  'System Program address is incorrect!'
);
```

### 3. 单元测试覆盖
```typescript
it('should use correct system program address', () => {
  const instruction = createInitInstruction(...);
  const systemProgramAccount = instruction.accounts[3];
  expect(systemProgramAccount.address).toBe('11111111111111111111111111111111');
});
```

---

**✅ 修复完成**: 2025-01-XX  
**✅ 构建状态**: 成功 (2.73s)  
**🐛 问题**: System Program 地址最后一位错误（'2' 应该是 '1'）  
**🔧 解决**: 修正为正确的地址 `'11111111111111111111111111111111'`  
