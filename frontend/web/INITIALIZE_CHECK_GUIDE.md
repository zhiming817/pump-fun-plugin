# 合约初始化检查功能说明

## 🎯 功能概述

已为 Oath 应用添加了完整的合约初始化检查机制，确保用户在使用前合约已正确初始化。

## ✅ 已实现的功能

### 1. 初始化状态检查

所有关键页面都会自动检查合约初始化状态：

- ✅ **创建誓言表单** - 检查后才允许创建
- ✅ **誓言列表页** - 显示初始化状态横幅
- ✅ **所有 Hooks** - 提供初始化状态数据

### 2. 四种状态显示

#### 🔄 加载中
```
正在检查合约状态...
```
显示加载动画，查询合约的 GlobalState

#### ✅ 已初始化
```
合约已就绪
总誓言数: X | 下一个ID: Y
```
绿色横幅显示合约统计信息

#### ⚠️ 未初始化
```
合约未初始化
需要管理员执行初始化操作
[前往初始化] 按钮
```
黄色警告横幅，提供初始化入口

#### ❌ 连接错误
```
无法连接到合约
[错误信息]
```
红色错误横幅，显示具体错误原因

### 3. 初始化功能

#### 新增页面: `/oath/initialize`
专门的初始化页面，包含：
- 初始化说明
- 权限要求提示
- 费用说明（约 0.01 SOL）
- 一键初始化按钮
- 成功/失败反馈

#### InitializeContract 组件
独立的初始化组件，可复用于任何页面：
```tsx
import { InitializeContract } from '@/components/oath';

<InitializeContract />
```

### 4. 新增 Hook: `useInitializeContract`

```tsx
import { useInitializeContract } from '@/lib/contract';

const { initialize, loading, error } = useInitializeContract();

// 执行初始化
await initialize();
```

## 📁 新增文件

```
frontend/web/src/
├── components/oath/
│   └── InitializeContract.tsx       # ✅ 初始化组件
├── features/oath/
│   └── oath-feature-initialize.tsx  # ✅ 初始化页面
└── lib/contract/
    └── hooks.ts                      # ✅ 新增 useInitializeContract
```

## 🔄 更新文件

```
frontend/web/src/
├── components/oath/
│   ├── CreateOathForm.tsx           # ✅ 添加初始化检查
│   └── index.ts                      # ✅ 导出 InitializeContract
├── features/oath/
│   └── oath-feature-index.tsx       # ✅ 添加状态横幅
├── lib/contract/
│   └── index.ts                      # ✅ 导出 useInitializeContract
└── app-routes.tsx                    # ✅ 添加 /oath/initialize 路由
```

## 🚀 使用流程

### 用户第一次访问

```
1. 点击 "Oath" 菜单
   ↓
2. 看到 "合约未初始化" 黄色提示
   ↓
3. 点击 "前往初始化" 按钮
   ↓
4. 进入初始化页面 (/oath/initialize)
   ↓
5. 阅读说明，点击 "执行初始化"
   ↓
6. 钱包确认交易
   ↓
7. 初始化成功，页面自动刷新
   ↓
8. 返回列表页，看到 "合约已就绪" 绿色提示
   ↓
9. 可以开始创建誓言
```

### 创建誓言时的检查

```
CreateOathForm 组件挂载
   ↓
自动调用 useGlobalState() 检查状态
   ↓
如果未初始化：
  - 显示黄色警告框
  - 隐藏创建表单
  - 提供 "前往初始化" 按钮
   ↓
如果已初始化：
  - 显示绿色状态横幅
  - 显示创建表单
  - 允许提交
```

## 💡 关键特性

### 1. 防御性编程
```tsx
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  
  // 双重检查：表单提交时再次验证
  if (!globalState) {
    alert('合约未初始化，请先初始化合约');
    return;
  }
  
  // 继续创建逻辑...
}
```

### 2. 自动刷新
初始化成功后，自动刷新 GlobalState：
```tsx
setTimeout(() => {
  refresh();
}, 2000);
```

### 3. 实时状态
使用 React Hooks 实时监听状态变化：
- `useGlobalState()` - 获取当前状态
- 自动重试机制
- 错误边界处理

### 4. 用户友好
- 清晰的状态提示
- 明确的操作指引
- 详细的错误信息
- 加载状态反馈

## 🎨 UI 设计

### 颜色方案
- 🔵 蓝色 - 加载中
- 🟢 绿色 - 成功/已就绪
- 🟡 黄色 - 警告/需要操作
- 🔴 红色 - 错误/失败

### 图标使用
- ✓ 勾选 - 成功状态
- ⚠ 警告 - 未初始化
- ⟳ 旋转 - 加载中
- ✕ 叉号 - 错误状态

## 📊 状态流转

```
初始状态
   ↓
加载 GlobalState (loading=true)
   ↓
   ├─→ 成功获取 → globalState 有值 → "已就绪"
   ├─→ 账户不存在 → globalState 为 null → "未初始化"
   └─→ 网络错误 → error 有值 → "连接错误"
```

## 🔒 权限控制

### 谁可以初始化？
- 只有合约 `authority` (管理员) 可以执行初始化
- 其他用户尝试初始化会失败并显示错误

### 安全检查
```rust
// 智能合约中的检查
require!(
    ctx.accounts.authority.key() == EXPECTED_AUTHORITY,
    ErrorCode::Unauthorized
);
```

## 💰 费用说明

### 初始化成本
- GlobalState 账户租金: ~0.005 SOL
- CollateralPool 账户租金: ~0.005 SOL
- **总计**: ~0.01 SOL

### 说明显示
用户在初始化页面会看到：
```
需要支付账户租金（约 0.01 SOL）
```

## 🧪 测试场景

### 测试 1: 首次访问
1. 清除所有账户数据
2. 访问 `/oath`
3. 应该看到 "未初始化" 提示

### 测试 2: 初始化流程
1. 点击 "前往初始化"
2. 点击 "执行初始化"
3. 确认钱包交易
4. 验证成功提示

### 测试 3: 创建检查
1. 直接访问 `/oath/create`
2. 如果未初始化，应该被阻止
3. 如果已初始化，可以正常创建

### 测试 4: 错误处理
1. 断开网络
2. 应该显示连接错误
3. 恢复网络后自动重试

## 📝 代码示例

### 在任何组件中检查初始化状态

```tsx
import { useGlobalState } from '@/lib/contract';

function MyComponent() {
  const { globalState, loading, error } = useGlobalState();

  if (loading) return <div>加载中...</div>;
  if (error) return <div>错误: {error.message}</div>;
  if (!globalState) return <div>未初始化</div>;

  return (
    <div>
      合约已就绪！
      总誓言数: {globalState.totalOaths.toString()}
    </div>
  );
}
```

### 执行初始化

```tsx
import { useInitializeContract } from '@/lib/contract';

function InitButton() {
  const { initialize, loading } = useInitializeContract();

  const handleClick = async () => {
    try {
      const signature = await initialize();
      console.log('成功！签名:', signature);
    } catch (error) {
      console.error('失败:', error);
    }
  };

  return (
    <button onClick={handleClick} disabled={loading}>
      {loading ? '初始化中...' : '初始化合约'}
    </button>
  );
}
```

## 🎯 总结

现在整个应用都有了完善的初始化检查机制：
- ✅ 自动检测合约状态
- ✅ 友好的用户提示
- ✅ 完整的初始化流程
- ✅ 详细的错误处理
- ✅ 实时状态更新

用户体验流畅，不会因为忘记初始化而遇到莫名错误！
