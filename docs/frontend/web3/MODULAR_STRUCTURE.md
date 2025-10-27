# Oath Contract Utils 模块化结构

## 📁 文件结构

```
frontend/web/src/utils/oath/
├── index.ts           # 统一导出入口
├── config.ts          # 配置和程序初始化
├── pda.ts             # PDA 派生函数
├── initialize.ts      # 合约初始化
├── createOath.ts      # 创建 Oath 功能
├── actions.ts         # Oath 操作 (完成/惩罚)
└── queries.ts         # Oath 查询功能
```

## 🎯 模块职责

### 1. config.ts - 配置和程序初始化
**职责**: 管理合约配置、RPC 连接、Program 实例创建

**导出**:
- `OATH_CONTRACT_CONFIG` - 合约配置对象
  - `PROGRAM_ID`: 合约地址
  - `RPC_URL`: RPC 端点
- `connection` - Solana 连接实例
- `getOathProgram(wallet)` - 创建带钱包的 Program 实例
- `getReadOnlyOathProgram()` - 创建只读 Program 实例

**使用场景**:
- 需要访问合约地址时
- 需要自定义 Program 实例时

---

### 2. pda.ts - PDA 派生函数
**职责**: 提供所有 PDA (Program Derived Address) 的派生函数

**导出**:
- `deriveGlobalStatePDA(programId)` - 派生全局状态 PDA
- `deriveOathPDA(oathId, programId)` - 派生 Oath 账户 PDA
- `deriveCollateralPoolPDA(programId)` - 派生抵押池 PDA

**使用场景**:
- 需要手动构造 PDA 地址时
- 调试 PDA 相关问题时

---

### 3. initialize.ts - 合约初始化
**职责**: 处理合约的初始化状态检查和初始化操作

**导出**:
- `initializeOathGlobal(wallet)` - 初始化全局状态
- `isOathGlobalInitialized()` - 检查是否已初始化

**使用场景**:
- 首次使用合约前
- InitializeOathContract 组件中

---

### 4. createOath.ts - 创建 Oath 功能
**职责**: 处理 Oath 的创建逻辑,包含自动初始化检查

**导出**:
- `createOath(params, wallet)` - 创建新的 Oath

**参数结构**:
```typescript
{
  content: string,           // Oath 内容
  category: string,          // 分类名称
  categoryId: string,        // 分类 ID
  startTime: number,         // 开始时间戳  
  endTime: number,           // 结束时间戳
  stableCollateral: number,  // 稳定币抵押额
  collateralTokens: [],      // 代币抵押列表
  isOverCollateralized: boolean,
  tokenAddress: string | null,
  targetApy: number | null
}
```

**特性**:
- ✅ 自动检查并初始化合约
- ✅ 自动获取下一个 Oath ID
- ✅ 完整的错误处理

**使用场景**:
- CreateOathFlow.jsx 创建表单提交时

---

### 5. actions.ts - Oath 操作
**职责**: 处理 Oath 的状态变更操作

**导出**:
- `completeOath(oathId, evidence, wallet)` - 完成 Oath
- `slashOath(oathId, reason, wallet)` - 惩罚 Oath (仅管理员)

**使用场景**:
- OathDetail.jsx 完成 Oath 按钮
- 管理员惩罚功能

---

### 6. queries.ts - Oath 查询
**职责**: 处理所有 Oath 相关的数据查询

**导出**:
- `getOath(oathId, wallet?)` - 获取单个 Oath 详情
- `getOathCount(wallet?)` - 获取 Oath 总数
- `getOathList(limit?, wallet?)` - 获取 Oath 列表
- `getOathsByCreator(creatorAddress, wallet?)` - 获取指定创建者的 Oath

**特性**:
- ✅ 支持无钱包查询(只读模式)
- ✅ 自动处理未初始化状态
- ✅ 数据格式化和类型转换

**使用场景**:
- OathList.jsx 列表展示
- OathDetail.jsx 详情加载
- 用户个人 Oath 列表

---

### 7. index.ts - 统一导出
**职责**: 作为包的入口,统一导出所有公共 API

**使用方式**:
```javascript
// ✅ 推荐: 从包入口导入
import { createOath, getOathList, completeOath } from '@/utils/oath';

// ❌ 不推荐: 直接导入子模块
import { createOath } from '@/utils/oath/createOath';
```

---

## 📦 使用示例

### 示例 1: 创建 Oath
```javascript
import { createOath } from '@/utils/oath';
import { useWallet } from '@solana/wallet-adapter-react';

function CreateOathButton() {
  const wallet = useWallet();
  
  const handleCreate = async () => {
    const result = await createOath({
      content: 'I will exercise 3 times per week',
      category: 'Health & Fitness',
      categoryId: 'health',
      startTime: Math.floor(Date.now() / 1000),
      endTime: Math.floor(Date.now() / 1000) + 86400 * 30,
      stableCollateral: 100,
      collateralTokens: [],
      isOverCollateralized: false,
      tokenAddress: null,
      targetApy: null
    }, wallet);
    
    if (result.success) {
      console.log('Created Oath ID:', result.oathId);
    }
  };
  
  return <button onClick={handleCreate}>Create Oath</button>;
}
```

### 示例 2: 查询 Oath 列表
```javascript
import { getOathList, getOathCount } from '@/utils/oath';

function OathListComponent() {
  const [oaths, setOaths] = useState([]);
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    async function load() {
      const count = await getOathCount();
      const list = await getOathList(20);
      setCount(count);
      setOaths(list);
    }
    load();
  }, []);
  
  return (
    <div>
      <p>Total Oaths: {count}</p>
      {oaths.map(oath => <OathCard key={oath.id} oath={oath} />)}
    </div>
  );
}
```

### 示例 3: 完成 Oath
```javascript
import { completeOath } from '@/utils/oath';
import { useWallet } from '@solana/wallet-adapter-react';

function CompleteButton({ oathId }) {
  const wallet = useWallet();
  
  const handleComplete = async () => {
    const result = await completeOath(
      oathId,
      'Workout completed! See my fitness tracker: https://...',
      wallet
    );
    
    if (result.success) {
      alert('Oath completed successfully!');
    } else {
      alert('Error: ' + result.error);
    }
  };
  
  return <button onClick={handleComplete}>Complete Oath</button>;
}
```

---

## 🔄 迁移指南

### 从旧的 oathContractUtils.ts 迁移

**旧代码**:
```javascript
import { 
  createOath, 
  getOathList, 
  completeOath 
} from '../utils/oathContractUtils.ts';
```

**新代码**:
```javascript
import { 
  createOath, 
  getOathList, 
  completeOath 
} from '../utils/oath';
```

**变化**:
- ✅ 去掉 `.ts` 扩展名
- ✅ 导入路径更简洁
- ✅ 所有函数 API 保持不变

---

## 🎨 设计原则

1. **单一职责**: 每个文件只负责一类功能
2. **高内聚**: 相关功能放在同一文件
3. **低耦合**: 文件之间依赖最小化
4. **易测试**: 每个模块可独立测试
5. **易维护**: 修改某个功能只需编辑对应文件

---

## 🛠️ 开发指南

### 添加新功能
1. 确定功能所属模块(config/pda/initialize/create/actions/queries)
2. 在对应文件中添加函数
3. 在 `index.ts` 中导出
4. 更新此文档

### 修改现有功能
1. 找到对应的模块文件
2. 修改函数实现
3. 确保导出接口不变(避免破坏性变更)
4. 测试相关组件

### 调试问题
1. 查看此文档确定功能所在模块
2. 打开对应文件查看实现
3. 使用 `console.log` 或断点调试
4. 检查函数返回的错误信息

---

## ⚡ 性能优化

- **只读查询**: `queries.ts` 中的函数自动使用只读 Program(无需钱包)
- **PDA 缓存**: PDA 派生函数可以被缓存复用
- **按需加载**: 通过模块化,Webpack 可以实现更好的代码分割

---

## 🐛 常见问题

### Q: 为什么要拆分成多个文件?
A: 
- 旧的 570 行文件难以维护
- 模块化后每个文件 100-150 行,更易阅读
- 多人协作时减少代码冲突
- 更好的代码组织和复用

### Q: 可以直接导入子模块吗?
A: 可以,但不推荐。建议统一从 `@/utils/oath` 导入,保持一致性。

### Q: 如何处理类型错误?
A: 已使用 `(program.account as any)` 规避 TypeScript 类型问题,实际运行正常。

### Q: 旧的 oathContractUtils.ts 还能用吗?
A: 已删除。所有导入已更新为新的模块化结构。

---

## 📝 更新日志

### 2024-01-XX - 模块化重构
- ✅ 将 570 行单文件拆分为 7 个模块
- ✅ 创建统一导出入口 `index.ts`
- ✅ 更新所有组件的导入语句
- ✅ 删除旧的 `oathContractUtils.ts`
- ✅ 编写模块化文档

---

## 🔗 相关文件

- 组件: `frontend/web/src/oath/`
  - `OathList.jsx` - 使用 queries
  - `CreateOathFlow.jsx` - 使用 createOath
  - `OathDetail.jsx` - 使用 queries + actions
  - `InitializeOathContract.jsx` - 使用 initialize

- 配置: `frontend/web/src/config.js`
- IDL: `frontend/web/src/idl/pumpfun_oath_contract_idl.js`

---

**注意**: 本文档需要与代码同步维护。添加/修改功能时请同时更新此文档。
