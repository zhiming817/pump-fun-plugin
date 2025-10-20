# 合约初始化检查 - 快速参考

## 🎯 核心功能

创建誓言前会自动检查合约是否已初始化，未初始化时会引导用户完成初始化。

## 📍 关键页面

| 路由 | 说明 | 状态检查 |
|------|------|----------|
| `/oath` | 誓言列表 | ✅ 显示状态横幅 |
| `/oath/create` | 创建誓言 | ✅ 未初始化时阻止 |
| `/oath/initialize` | 初始化合约 | ✅ 新增页面 |

## 🔍 状态判断

```tsx
const { globalState, loading, error } = useGlobalState();

// 4 种状态：
loading          → 🔄 检查中
error            → ❌ 连接错误
globalState 有值 → ✅ 已初始化
globalState 为空 → ⚠️ 未初始化
```

## 🛠️ 新增 API

### Hook
```tsx
import { useInitializeContract } from '@/lib/contract';

const { initialize, loading, error } = useInitializeContract();
await initialize(); // 执行初始化
```

### 组件
```tsx
import { InitializeContract } from '@/components/oath';

<InitializeContract />
```

## 💡 使用示例

### 检查并显示状态
```tsx
import { useGlobalState } from '@/lib/contract';

function MyComponent() {
  const { globalState, loading } = useGlobalState();

  if (loading) return <div>加载中...</div>;
  if (!globalState) return <div>请先初始化合约</div>;
  
  return <div>合约已就绪！</div>;
}
```

### 提交前验证
```tsx
const handleSubmit = async () => {
  if (!globalState) {
    alert('合约未初始化');
    return;
  }
  // 继续提交...
};
```

## 🎨 UI 反馈

- 🟢 **已初始化**: 绿色横幅 "合约已就绪"
- 🟡 **未初始化**: 黄色警告框 + "前往初始化" 按钮
- 🔴 **错误**: 红色错误框 + 错误详情
- 🔵 **加载**: 蓝色提示 + 旋转动画

## 🚀 用户流程

```
访问 /oath 
  → 看到"未初始化"警告
  → 点击"前往初始化"
  → 进入 /oath/initialize
  → 点击"执行初始化"
  → 钱包确认
  → 成功！页面刷新
  → 可以创建誓言了
```

## ⚙️ 技术细节

- **检查时机**: 组件挂载时自动检查
- **数据源**: GlobalState PDA 账户
- **刷新机制**: 初始化后 2 秒自动刷新
- **费用**: 约 0.01 SOL (账户租金)
- **权限**: 仅管理员可初始化

## 📝 重要提示

1. ⚠️ 合约只能初始化一次
2. 🔒 只有管理员有权限初始化
3. 💰 需要准备少量 SOL 支付租金
4. 🔄 初始化后页面会自动刷新

## 🔗 相关文档

- 详细说明: `INITIALIZE_CHECK_GUIDE.md`
- 菜单配置: `OATH_MENU_GUIDE.md`
- 类型定义: `src/lib/contract/types.ts`
- 合约交互: `src/lib/contract/oath-contract.ts`
