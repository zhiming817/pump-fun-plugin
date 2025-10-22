# PumpFun Oath 前端集成指南

本文档说明如何在前端项目中集成和使用 PumpFun Oath 智能合约。

## 目录结构

```
src/
  lib/contract/                 # 合约集成模块
    types.ts                    # TypeScript 类型定义
    oath-contract.ts            # 合约交互类
    hooks.ts                    # React Hooks
    index.ts                    # 导出文件
  components/oath/              # UI 组件
    CreateOathForm.tsx          # 创建誓言表单
    OathList.tsx                # 誓言列表
    OathCard.tsx                # 誓言卡片
    index.ts                    # 导出文件
```

## 安装依赖

首先需要安装必要的依赖包：

```bash
npm install @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-wallets
npm install @coral-xyz/anchor
npm install bn.js
```

## 使用方法

### 1. 配置钱包适配器

在应用的根组件中设置钱包连接：

```tsx
import { ConnectionProvider, WalletProvider } from '@solana/wallet-adapter-react';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { PhantomWalletAdapter } from '@solana/wallet-adapter-wallets';
import { clusterApiUrl } from '@solana/web3.js';

// 导入钱包样式
import '@solana/wallet-adapter-react-ui/styles.css';

function App() {
  const network = 'devnet'; // 或 'mainnet-beta'
  const endpoint = clusterApiUrl(network);
  const wallets = [new PhantomWalletAdapter()];

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          {/* 你的应用组件 */}
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
}
```

### 2. 使用合约 Hooks

#### 查询全局状态

```tsx
import { useGlobalState } from '@/lib/contract';

function GlobalStateView() {
  const { globalState, loading, error, refresh } = useGlobalState();

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  if (!globalState) return <div>未初始化</div>;

  return (
    <div>
      <p>总誓言数: {globalState.totalOaths.toString()}</p>
      <p>下一个ID: {globalState.nextOathId.toString()}</p>
      <button onClick={refresh}>刷新</button>
    </div>
  );
}
```

#### 查询用户的誓言列表

```tsx
import { useUserOaths } from '@/lib/contract';

function MyOaths() {
  const { oaths, loading, error } = useUserOaths();

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;

  return (
    <div>
      <h2>我的誓言 ({oaths.length})</h2>
      {oaths.map(oath => (
        <div key={oath.id.toString()}>
          <h3>{oath.title}</h3>
          <p>{oath.description}</p>
        </div>
      ))}
    </div>
  );
}
```

#### 创建誓言

```tsx
import { useCreateOath } from '@/lib/contract';
import { BN } from '@coral-xyz/anchor';

function CreateOath() {
  const { createOath, loading } = useCreateOath();

  const handleCreate = async () => {
    try {
      const args = {
        title: '每天学习',
        description: '承诺每天学习至少2小时',
        deadline: new BN(Date.now() / 1000 + 86400 * 30), // 30天后
        collateralAmount: new BN(1e9), // 1 SOL
        tokenMint: '', // 可选
      };

      const signature = await createOath(args);
      console.log('创建成功:', signature);
    } catch (error) {
      console.error('创建失败:', error);
    }
  };

  return (
    <button onClick={handleCreate} disabled={loading}>
      {loading ? '创建中...' : '创建誓言'}
    </button>
  );
}
```

#### 完成誓言

```tsx
import { useCompleteOath } from '@/lib/contract';
import { BN } from '@coral-xyz/anchor';

function CompleteOathButton({ oathId }: { oathId: BN }) {
  const { completeOath, loading } = useCompleteOath();

  const handleComplete = async () => {
    try {
      const args = {
        proofData: '完成证明数据',
      };

      const signature = await completeOath(oathId, args);
      console.log('完成成功:', signature);
    } catch (error) {
      console.error('完成失败:', error);
    }
  };

  return (
    <button onClick={handleComplete} disabled={loading}>
      {loading ? '处理中...' : '完成誓言'}
    </button>
  );
}
```

### 3. 使用 UI 组件

#### 创建誓言表单

```tsx
import { CreateOathForm } from '@/components/oath';

function CreateOathPage() {
  return (
    <div>
      <h1>创建新誓言</h1>
      <CreateOathForm />
    </div>
  );
}
```

#### 誓言列表

```tsx
import { OathList } from '@/components/oath';

function MyOathsPage() {
  return (
    <div>
      <h1>我的誓言</h1>
      <OathList />
    </div>
  );
}
```

## API 参考

### Types

#### `OathStatus`
- `Active = 0`: 活跃中
- `Completed = 1`: 已完成
- `Slashed = 2`: 已削减

#### `Oath`
```typescript
interface Oath {
  id: BN;
  creator: PublicKey;
  title: string;
  description: string;
  collateralAmount: BN;
  status: OathStatus;
  createdAt: BN;
  deadline: BN;
  completedAt?: BN;
  slashedAt?: BN;
  tokenMint?: string;
}
```

### Hooks

#### `useOathContract()`
返回合约实例，用于底层操作。

#### `useGlobalState()`
返回:
- `globalState`: 全局状态数据
- `loading`: 加载状态
- `error`: 错误信息
- `refresh()`: 刷新函数

#### `useUserOaths(creator?: PublicKey)`
返回:
- `oaths`: 誓言数组
- `loading`: 加载状态
- `error`: 错误信息
- `refresh()`: 刷新函数

#### `useCreateOath()`
返回:
- `createOath(args)`: 创建誓言函数
- `loading`: 加载状态
- `error`: 错误信息

#### `useCompleteOath()`
返回:
- `completeOath(oathId, args)`: 完成誓言函数
- `loading`: 加载状态
- `error`: 错误信息

#### `useSlashOath()`
返回:
- `slashOath(oathId, args)`: 削减誓言函数
- `loading`: 加载状态
- `error`: 错误信息

## 工具函数

### PDA 派生

```typescript
import { OathContract } from '@/lib/contract';
import { BN } from '@coral-xyz/anchor';

// 获取全局状态 PDA
const [globalStatePDA, bump] = OathContract.getGlobalStatePDA();

// 获取抵押池 PDA
const [poolPDA, bump] = OathContract.getCollateralPoolPDA();

// 获取誓言 PDA
const oathId = new BN(1);
const [oathPDA, bump] = OathContract.getOathPDA(oathId);
```

### 状态辅助函数

```typescript
import { getOathStatusText, getOathStatusColor } from '@/lib/contract/types';

// 获取状态文本
const statusText = getOathStatusText(0); // "活跃中"

// 获取状态颜色类名
const colorClass = getOathStatusColor(1); // "bg-green-100 text-green-800"
```

## 注意事项

1. **依赖安装**: 确保已安装 `@coral-xyz/anchor` 和相关钱包适配器包
2. **IDL 文件**: 需要将合约的 IDL JSON 文件导入到 `oath-contract.ts` 中
3. **数据反序列化**: 当前示例中的数据查询函数返回 `null`，需要根据实际的账户数据结构实现反序列化逻辑
4. **错误处理**: 建议在生产环境中添加更完善的错误处理和用户提示
5. **网络配置**: 根据部署环境选择正确的 RPC endpoint（devnet/mainnet）

## 待完善项

- [ ] 实现完整的账户数据反序列化逻辑
- [ ] 添加交易确认通知
- [ ] 实现事件监听和实时更新
- [ ] 添加更多的错误处理
- [ ] 优化 UI/UX 体验
- [ ] 添加单元测试

## 相关资源

- [Solana Web3.js 文档](https://solana-labs.github.io/solana-web3.js/)
- [Anchor 文档](https://www.anchor-lang.com/)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)
