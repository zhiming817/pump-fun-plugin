# 🚀 PumpFun Oath Contract - 快速开始指南

## 📦 已生成的文件清单

```
frontend/web/src/
├── oath/                                    [新建目录]
│   ├── OathList.jsx                        ✅ 誓言列表页面
│   ├── CreateOathFlow.jsx                  ✅ 创建誓言页面
│   ├── OathDetail.jsx                      ✅ 誓言详情页面
│   ├── InitializeOathContract.jsx          ✅ 合约初始化组件
│   ├── README.md                           ✅ 详细使用文档
│   └── SUMMARY.md                          ✅ 生成总结文档
├── utils/
│   └── oathContractUtils.ts               ✅ Oath 合约工具 (16KB)
└── idl/
    └── pumpfun_oath_contract_idl.js       ✅ IDL 导出文件
```

## ⚡ 5 分钟快速集成

### 步骤 1: 添加路由 (2分钟)

在 `src/App.jsx` 或 `src/main.jsx` 中添加路由：

```jsx
import OathList from './oath/OathList';
import CreateOathFlow from './oath/CreateOathFlow';
import OathDetail from './oath/OathDetail';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* 现有路由... */}
        
        {/* 新增 Oath 路由 */}
        <Route path="/oaths" element={<OathList />} />
        <Route path="/oaths/create" element={<CreateOathFlow />} />
        <Route path="/oaths/:oathId" element={<OathDetail />} />
      </Routes>
    </BrowserRouter>
  );
}
```

### 步骤 2: 添加导航链接 (1分钟)

在 `Navbar.jsx` 中添加入口链接：

```jsx
<Link 
  to="/oaths" 
  className="text-gray-700 hover:text-purple-600 px-3 py-2 rounded-md text-sm font-medium"
>
  🤝 Oaths
</Link>
```

### 步骤 3: 初始化合约 (2分钟)

访问 `/oaths` 页面，如果合约未初始化，会看到初始化提示。

或者在管理页面添加初始化组件：

```jsx
import InitializeOathContract from './oath/InitializeOathContract';

function AdminPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Admin Panel</h1>
      <InitializeOathContract />
    </div>
  );
}
```

## 🎯 使用流程

### 1️⃣ 用户访问列表页
```
访问: http://localhost:5173/oaths
功能: 查看所有誓言，显示统计信息
```

### 2️⃣ 创建新誓言
```
点击: "Create New Oath" 按钮
路径: /oaths/create
填写: 誓言内容、分类、时间、抵押金额
提交: 发送到区块链
```

### 3️⃣ 查看誓言详情
```
点击: 任意誓言卡片
路径: /oaths/{id}
功能: 查看完整信息，创建者可完成誓言
```

### 4️⃣ 完成誓言
```
条件: 必须是创建者
操作: 点击 "Complete Oath"
输入: 完成证明
提交: 更新状态到区块链
```

## 🎨 页面预览

### 列表页 (OathList)
```
┌─────────────────────────────────────────┐
│  🤝 PumpFun Oaths                       │
│  Create and track your commitments      │
│                    [+ Create New Oath]  │
├─────────────────────────────────────────┤
│  📜 Total: 5  👤 My: 2  ⚡ Active: 3   │
├─────────────────────────────────────────┤
│  ┌──────┐  ┌──────┐  ┌──────┐          │
│  │Oath 1│  │Oath 2│  │Oath 3│          │
│  │Active│  │Done ✅│  │Active│          │
│  └──────┘  └──────┘  └──────┘          │
└─────────────────────────────────────────┘
```

### 创建页 (CreateOathFlow)
```
┌─────────────────────────────────────────┐
│  ← Create New Oath                      │
├─────────────────────────────────────────┤
│  Your Oath / Commitment *               │
│  ┌─────────────────────────────────┐   │
│  │ I will exercise 5 times a week  │   │
│  └─────────────────────────────────┘   │
│                                         │
│  Category * [Health] [Learning] ...    │
│  Start Date [2024-10-22]               │
│  End Date   [2024-11-22]               │
│  Collateral $100 USDC                  │
│                                         │
│  [Cancel]  [Create Oath]               │
└─────────────────────────────────────────┘
```

### 详情页 (OathDetail)
```
┌─────────────────────────────────────────┐
│  ← Oath #1               [Active]       │
├─────────────────────────────────────────┤
│  🤝 Commitment                          │
│  I will exercise 5 times a week         │
├─────────────────────────────────────────┤
│  📂 Category: Health & Fitness          │
│  👤 Creator: BqT7M...k5nQ (You)        │
│  📅 2024-10-22 → 2024-11-22            │
│  💰 $100 USDC Collateral                │
│                                         │
│  [✅ Complete Oath]                     │
└─────────────────────────────────────────┘
```

## 🛠 调试技巧

### 检查合约状态
```typescript
import { isOathGlobalInitialized } from './utils/oathContractUtils';

const initialized = await isOathGlobalInitialized();
console.log('Contract initialized:', initialized);
```

### 查看错误日志
```
打开浏览器控制台 (F12)
查看 Console 标签页
搜索 "Error" 或 "Failed"
```

### 常见问题

**Q: 无法创建誓言？**
```
A: 检查：
   1. 钱包是否连接
   2. 合约是否已初始化
   3. 是否有足够的 SOL 支付 gas
   4. 网络连接是否正常
```

**Q: 列表页为空？**
```
A: 可能原因：
   1. 合约未初始化
   2. 还没有人创建誓言
   3. RPC 节点连接问题
```

**Q: 类型错误？**
```
A: 运行以下命令：
   npm install --save-dev @types/node
   或检查 tsconfig.json 配置
```

## 📝 配置说明

### 合约地址
位置: `src/utils/oathContractUtils.ts`
```typescript
export const OATH_CONTRACT_CONFIG = {
  PROGRAM_ID: 'Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ',
  // ...
};
```

### 网络配置
位置: `src/config.js`
```javascript
export const NETWORK_CONFIG = {
  RPC_URL: 'https://api.devnet.solana.com',
  NETWORK: 'devnet',
  COMMITMENT: 'confirmed'
};
```

### 分类配置
位置: `src/oath/CreateOathFlow.jsx`
```javascript
const CATEGORY_OPTIONS = [
  { id: 'health', name: 'Health & Fitness', icon: '💪' },
  { id: 'learning', name: 'Learning & Education', icon: '📚' },
  // 可以添加更多分类...
];
```

## 🔗 参考链接

- **Vault 模块**: `frontend/web/src/components/` (参考设计)
- **合约 IDL**: `frontend/web/src/idl/pumpfun_oath_contract.json`
- **合约代码**: `contract/pumpfun_oath_contract/`
- **详细文档**: `frontend/web/src/oath/README.md`

## ✅ 检查清单

开发前：
- [ ] 确认 Node.js 和 npm 已安装
- [ ] 确认依赖已安装 (`npm install`)
- [ ] 确认合约已部署到 devnet

集成时：
- [ ] 添加路由配置
- [ ] 添加导航链接
- [ ] 测试钱包连接
- [ ] 初始化合约

测试时：
- [ ] 创建誓言
- [ ] 查看列表
- [ ] 查看详情
- [ ] 完成誓言
- [ ] 测试不同状态
- [ ] 测试响应式布局

## 🎉 完成！

你现在拥有一个完整的 PumpFun Oath Contract 前端模块！

**下一步建议：**
1. 启动开发服务器: `npm run dev`
2. 访问: `http://localhost:5173/oaths`
3. 连接钱包并测试功能
4. 根据需要自定义样式和文案

**需要帮助？**
- 查看 `oath/README.md` 获取详细文档
- 参考 `oath/SUMMARY.md` 了解实现细节
- 检查浏览器控制台的错误信息

祝你使用愉快！🚀
