# 🚀 快速开始 - Oath 合约初始化

## 立即测试初始化功能

### 1. 启动开发服务器

```bash
cd frontend/web
npm run dev
```

### 2. 打开浏览器

访问: **http://localhost:5173/oath/initialize**

### 3. 连接钱包

1. 点击右上角 "Connect Wallet"
2. 选择 Phantom 或其他 Solana 钱包
3. 批准连接请求

### 4. 执行初始化

1. 确认钱包有足够的 SOL (~0.003 SOL)
2. 点击 **"执行初始化"** 按钮
3. 在钱包中批准交易
4. 等待交易确认（约 5-10 秒）

### 5. 验证结果

**成功标志**：
- ✅ 显示 "合约初始化成功" toast
- ✅ 页面显示 "合约已初始化"
- ✅ 可以前往创建誓言页面

**失败处理**：
- 查看浏览器控制台的详细错误
- 确认钱包有足够的 SOL
- 检查网络连接

---

## 🔍 在 Solana Explorer 查看

初始化成功后，可以在 Solana Explorer 查看创建的账户：

### Global State PDA
```
https://explorer.solana.com/address/<GLOBAL_STATE_ADDRESS>?cluster=devnet
```

### Collateral Pool PDA
```
https://explorer.solana.com/address/<COLLATERAL_POOL_ADDRESS>?cluster=devnet
```

**提示**: 交易签名会在 toast 通知中显示，点击可跳转到 Explorer

---

## 💰 获取测试 SOL

如果钱包 SOL 不足：

```bash
# 使用 Solana CLI
solana airdrop 1 <YOUR_WALLET_ADDRESS> --url devnet

# 或访问水龙头网站
https://faucet.solana.com/
```

---

## 🐛 常见问题

### Q: 为什么点击按钮没有反应？

**A**: 检查：
1. 钱包是否已连接（右上角显示地址）
2. 浏览器控制台是否有错误
3. 钱包是否切换到 Devnet

### Q: 交易失败 - "余额不足"

**A**: 钱包需要约 0.003 SOL 用于：
- 交易费用：~0.000005 SOL
- 账户租金：~0.002 SOL

### Q: 交易失败 - "账户已存在"

**A**: 合约已经初始化过了！刷新页面应该会显示"合约已初始化"状态。

### Q: 如何重新初始化？

**A**: 需要重新部署合约到新的 Program ID。初始化只能执行一次。

---

## 📊 技术信息

### 合约信息
- **Program ID**: `Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ`
- **网络**: Solana Devnet
- **确认时间**: 通常 5-10 秒

### 创建的账户
1. **Global State PDA**
   - Seeds: `["global_state"]`
   - 大小: ~100 bytes
   - 存储: 全局配置

2. **Collateral Pool PDA**
   - Seeds: `["collateral_pool"]`
   - 大小: ~100 bytes
   - 存储: 抵押资产

---

## 📚 更多文档

- **实现详解**: `OATH_INITIALIZE_IMPLEMENTATION.md`
- **完整报告**: `OATH_COMPLETION_REPORT.md`
- **钱包迁移**: `WALLET_MIGRATION_GUIDE.md`

---

## ✨ 成功！

初始化成功后，您可以：
- 📝 创建誓言
- 👀 查看誓言列表
- ✅ 完成誓言
- ⚠️ 管理违约

**下一步**: 访问 `/oath/create` 创建您的第一个誓言！

---

**需要帮助？** 检查浏览器控制台的详细日志
