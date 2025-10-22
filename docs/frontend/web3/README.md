# PumpFun Oath Contract - 前端模块

这是为 PumpFun Oath Contract 创建的完整前端模块，包含所有必要的页面和合约调用工具。

## 📁 文件结构

```
frontend/web/src/
├── oath/                           # Oath 模块目录
│   ├── OathList.jsx               # 誓言列表页面
│   ├── CreateOathFlow.jsx         # 创建誓言流程页面
│   ├── OathDetail.jsx             # 誓言详情页面
│   └── InitializeOathContract.jsx # 合约初始化组件
├── utils/
│   └── oathContractUtils.ts       # Oath 合约调用工具
└── idl/
    └── pumpfun_oath_contract_idl.js # IDL 导出文件
```

## 🚀 功能特性

### 1. 合约工具 (`oathContractUtils.ts`)

提供完整的合约交互功能：

- ✅ `initializeOathGlobal()` - 初始化合约全局状态
- ✅ `isOathGlobalInitialized()` - 检查合约是否已初始化
- ✅ `createOath()` - 创建新誓言
- ✅ `completeOath()` - 完成誓言
- ✅ `slashOath()` - 削减誓言（管理员功能）
- ✅ `getOath()` - 获取单个誓言详情
- ✅ `getOathCount()` - 获取誓言总数
- ✅ `getOathList()` - 获取誓言列表
- ✅ `getOathsByCreator()` - 获取用户创建的誓言

### 2. 页面组件

#### OathList.jsx - 誓言列表页面
- 显示所有誓言的卡片列表
- 显示统计信息（总誓言数、我的誓言、活跃誓言）
- 支持点击查看详情
- 创建新誓言按钮

#### CreateOathFlow.jsx - 创建誓言页面
- 单页表单设计，简洁易用
- 支持输入誓言内容、选择分类
- 设置开始和结束时间
- 配置抵押金额和可选的目标 APY
- 实时显示摘要信息
- 完整的表单验证

#### OathDetail.jsx - 誓言详情页面
- 显示誓言的完整信息
- 创建者可以提交完成证明
- 显示抵押信息、状态、时间等
- 支持查看削减信息（如果有）
- 美观的渐变设计

#### InitializeOathContract.jsx - 合约初始化组件
- 自动检查合约初始化状态
- 提供一键初始化功能
- 适合在首页或管理页面使用

## 🔧 使用方法

### 1. 路由配置

在你的路由文件中添加以下路由（例如 `App.jsx` 或 `main.jsx`）：

```jsx
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import OathList from './oath/OathList';
import CreateOathFlow from './oath/CreateOathFlow';
import OathDetail from './oath/OathDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Oath 相关路由 */}
        <Route path="/oaths" element={<OathList />} />
        <Route path="/oaths/create" element={<CreateOathFlow />} />
        <Route path="/oaths/:oathId" element={<OathDetail />} />
        
        {/* 其他路由... */}
      </Routes>
    </BrowserRouter>
  );
}
```

### 2. 在主页添加入口链接

```jsx
<Link to="/oaths" className="...">
  🤝 Oath
</Link>
```

### 3. 使用合约初始化组件

在需要的地方（如管理页面或首页）引入：

```jsx
import InitializeOathContract from './oath/InitializeOathContract';

function AdminPage() {
  return (
    <div>
      <h1>Admin Panel</h1>
      <InitializeOathContract />
    </div>
  );
}
```

## 📝 合约配置

合约配置在 `oathContractUtils.ts` 中：

```typescript
export const OATH_CONTRACT_CONFIG = {
  PROGRAM_ID: 'Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ',
  SEEDS: {
    GLOBAL_STATE: 'global_state',
    OATH: 'oath',
    COLLATERAL_POOL: 'collateral_pool'
  }
};
```

如果需要修改，请更新 `PROGRAM_ID` 为你的实际合约地址。

## 🎨 设计风格

- 使用紫色/粉色渐变主题（与 Vault 的蓝色主题区分）
- 响应式设计，支持移动端
- 使用 Tailwind CSS 样式
- 包含动画和过渡效果
- 与现有 Vault 模块风格统一

## 🔑 关键功能说明

### 创建誓言流程

1. 用户输入誓言内容
2. 选择分类（健康、学习、职业等）
3. 设置时间范围
4. 配置抵押金额
5. 提交到区块链

### 完成誓言流程

1. 只有创建者可以完成自己的誓言
2. 提供完成证明（文字、链接等）
3. 提交到区块链
4. 状态更新为"已完成"

### 查看誓言

- 所有人都可以查看誓言列表和详情
- 创建者会看到特殊标识
- 活跃状态的誓言可以被完成

## 🛠 技术栈

- React
- TypeScript
- Solana Web3.js
- Anchor Framework
- Tailwind CSS
- React Router
- Solana Wallet Adapter

## 📦 依赖项

确保 `package.json` 中包含以下依赖：

```json
{
  "dependencies": {
    "@solana/web3.js": "^1.x.x",
    "@solana/wallet-adapter-react": "^0.15.x",
    "@solana/wallet-adapter-react-ui": "^0.9.x",
    "@coral-xyz/anchor": "^0.29.x",
    "react": "^18.x.x",
    "react-router-dom": "^6.x.x"
  }
}
```

## 🎯 使用示例

### 创建誓言

```typescript
import { createOath } from '../utils/oathContractUtils';

const oathData = {
  content: 'I will exercise 5 times a week',
  category: 'Health & Fitness',
  categoryId: 'health',
  startTime: Math.floor(Date.now() / 1000),
  endTime: Math.floor(Date.now() / 1000) + 86400 * 30,
  stableCollateral: 100,
  collateralTokens: [],
  isOverCollateralized: false,
  tokenAddress: null,
  targetApy: null
};

const result = await createOath(wallet, oathData);
console.log('Oath created:', result.oathId);
```

### 获取誓言列表

```typescript
import { getOathList } from '../utils/oathContractUtils';

const oaths = await getOathList(10);
console.log('Oaths:', oaths);
```

### 完成誓言

```typescript
import { completeOath } from '../utils/oathContractUtils';

const result = await completeOath(wallet, oathId, 'I completed 150 workout sessions!');
console.log('Oath completed:', result.transactionSignature);
```

## 🐛 调试提示

1. 确保 RPC URL 在 `config.js` 中正确配置
2. 检查钱包是否连接
3. 查看浏览器控制台的日志输出
4. 确认合约已初始化
5. 验证钱包有足够的 SOL 支付 gas fee

## 📄 参考文档

- [Solana Documentation](https://docs.solana.com/)
- [Anchor Framework](https://www.anchor-lang.com/)
- [Solana Wallet Adapter](https://github.com/solana-labs/wallet-adapter)

## 🤝 贡献

如需添加新功能或修复问题，请参考现有代码风格进行开发。

## 📧 支持

如有问题，请查看代码注释或联系开发团队。
