# 🚀 项目启动指南

本文档记录了所有项目的启动方式和开发流程。

## 📋 项目概览

| 项目 | 路径 | 类型 | 端口 | 启动命令 |
|------|------|------|------|----------|
| **Web3 前端** | `frontend/web3/` | React + Vite | 5173 | `npm run dev` |
| **Web 前端** | `frontend/web/` | React + Vite | 5173 | `npm run dev` |
| **Chrome 插件** | `plugin/` | Chrome Extension | - | `npm run dev` |
| **Rust 后端** | `backend/rust_backend/` | Rust API | 8080 | `cargo run` |

---

## 🌐 Web3 前端 (frontend/web3/)

### 启动方式
```bash
cd frontend/web3
npm install
npm run dev
```

### 访问地址
- **开发服务器**: http://localhost:5173
- **Oath 功能**: http://localhost:5173/oaths

### 功能特性
- ✅ Solana 钱包连接
- ✅ Oath 合约交互
- ✅ 誓言创建和管理
- ✅ 响应式设计

### 可用命令
```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览构建结果
npm run lint     # 代码检查
```

---

## 🌐 Web 前端 (frontend/web/)

### 启动方式
```bash
cd frontend/web
npm install
npm run dev
```

### 访问地址
- **开发服务器**: http://localhost:5173

### 功能特性
- ✅ Gill Solana SDK
- ✅ Shadcn UI 组件
- ✅ Wallet UI 集成
- ✅ Tailwind CSS 样式

### 可用命令
```bash
npm run dev      # 启动开发服务器
npm run build    # 构建生产版本
npm run preview  # 预览构建结果
npm run lint     # 代码检查
```

---

## 🔌 Chrome 插件 (plugin/)

### 开发模式启动
```bash
cd plugin
npm install
npm run dev
```

### 生产构建
```bash
cd plugin
npm run build
```

### 安装到 Chrome
1. 打开 Chrome 浏览器
2. 访问 `chrome://extensions/`
3. 开启"开发者模式"
4. 点击"加载已解压的扩展程序"
5. 选择 `plugin/dist/` 文件夹

### 功能特性
- ✅ 自动扫描 pump.fun 页面
- ✅ 显示誓言状态徽章
- ✅ 实时风险评估
- ✅ 非侵入式设计

### 可用命令
```bash
npm run dev      # 开发模式 (热重载)
npm run build    # 生产构建
npm run preview  # 预览构建结果
npm run lint     # 代码检查
npm run format   # 代码格式化
```

---

## 🦀 Rust 后端 (backend/rust_backend/)

### 启动方式
```bash
cd backend/rust_backend
cargo run
```

### 配置选项
```bash
# 使用不同配置文件
cargo run -- --config config.yaml          # 默认配置
cargo run -- --config config.trade_only.yaml  # 仅交易模式
cargo run -- --config config.websocket.yaml   # WebSocket 模式
```

### 访问地址
- **API 服务器**: http://localhost:8080
- **WebSocket**: ws://localhost:8080/ws

### 功能特性
- ✅ Pump.fun 数据监控
- ✅ 誓言状态查询 API
- ✅ WebSocket 实时推送
- ✅ MySQL 数据存储

### 可用命令
```bash
cargo run                    # 运行程序
cargo build                  # 构建项目
cargo test                   # 运行测试
cargo run --release          # 发布模式运行
```

---

## 🔧 开发环境设置

### 前置要求
- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **Rust**: >= 1.70.0
- **Chrome**: 最新版本

### 环境变量
创建 `.env` 文件在各项目根目录：

#### Web3 前端 (.env)
```env
VITE_SOLANA_RPC_URL=https://api.devnet.solana.com
VITE_SOLANA_NETWORK=devnet
VITE_OATH_CONTRACT_ADDRESS=Ad4ac7oFBgHA9NZ7jkvhUurj5iytxHighGtTRokbrLbQ
```

#### 插件 (.env)
```env
VITE_API_ENDPOINT=http://localhost:8080/v1/memes/check-pledge
VITE_WEBSITE_URL=http://localhost:5173
```

#### Rust 后端 (.env)
```env
RPC_URL=https://api.devnet.solana.com
MYSQL_URL=mysql://user:password@localhost:3306/pumpfun
```

---

## 🚀 快速启动所有服务

### 方式一：分别启动
```bash
# 终端 1: 启动 Rust 后端
cd backend/rust_backend
cargo run

# 终端 2: 启动 Web3 前端
cd frontend/web3
npm run dev

# 终端 3: 启动 Web 前端
cd frontend/web
npm run dev

# 终端 4: 启动插件开发
cd plugin
npm run dev
```

### 方式二：使用脚本 (推荐)
创建 `start-all.sh` 脚本：

```bash
#!/bin/bash
# 启动所有服务

# 启动 Rust 后端
cd backend/rust_backend
cargo run &
RUST_PID=$!

# 等待后端启动
sleep 5

# 启动 Web3 前端
cd ../../frontend/web3
npm run dev &
WEB3_PID=$!

# 启动 Web 前端
cd ../web
npm run dev &
WEB_PID=$!

# 启动插件开发
cd ../../plugin
npm run dev &
PLUGIN_PID=$!

echo "所有服务已启动:"
echo "Rust 后端: PID $RUST_PID"
echo "Web3 前端: PID $WEB3_PID"
echo "Web 前端: PID $WEB_PID"
echo "插件开发: PID $PLUGIN_PID"

# 等待用户中断
wait
```

---

## 🔍 调试和故障排除

### 常见问题

#### 1. 端口冲突
```bash
# 检查端口占用
netstat -ano | findstr :5173
netstat -ano | findstr :8080

# 杀死占用进程
taskkill /PID <PID> /F
```

#### 2. 依赖安装失败
```bash
# 清理缓存重新安装
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
```

#### 3. Rust 编译错误
```bash
# 更新 Rust 工具链
rustup update
cargo clean
cargo build
```

#### 4. 插件无法加载
- 检查 `manifest.json` 配置
- 确认 `dist/` 文件夹存在
- 查看 Chrome 扩展错误日志

### 日志查看

#### Web 前端
- 浏览器控制台 (F12)
- 网络请求 (Network 标签)

#### Rust 后端
```bash
# 查看详细日志
RUST_LOG=debug cargo run
```

#### Chrome 插件
- 扩展页面: `chrome://extensions/`
- 点击插件的"检查视图"
- 查看控制台输出

---

## 📝 开发流程

### 1. 日常开发
```bash
# 1. 启动后端
cd backend/rust_backend && cargo run

# 2. 启动前端
cd frontend/web3 && npm run dev

# 3. 开发插件
cd plugin && npm run dev
```

### 2. 测试流程
```bash
# 1. 运行所有测试
cd frontend/web3 && npm run test
cd frontend/web && npm run test
cd plugin && npm run test
cd backend/rust_backend && cargo test

# 2. 构建所有项目
cd frontend/web3 && npm run build
cd frontend/web && npm run build
cd plugin && npm run build
cd backend/rust_backend && cargo build --release
```

### 3. 部署流程
```bash
# 1. 构建生产版本
npm run build  # 各前端项目
cargo build --release  # Rust 后端

# 2. 打包插件
cd plugin && npm run build
# 将 dist/ 文件夹打包为 .zip

# 3. 部署到服务器
# 上传构建文件到服务器
```

---

## 🎯 访问地址汇总

| 服务 | 地址 | 说明 |
|------|------|------|
| Web3 前端 | http://localhost:5173 | 主要前端应用 |
| Web 前端 | http://localhost:5173 | Gill 模板应用 |
| Rust API | http://localhost:8080 | 后端 API |
| WebSocket | ws://localhost:8080/ws | 实时数据推送 |
| Chrome 插件 | chrome://extensions/ | 浏览器扩展 |

---

## ✅ 检查清单

### 开发前检查
- [ ] Node.js 版本 >= 18.0.0
- [ ] Rust 版本 >= 1.70.0
- [ ] Chrome 浏览器已安装
- [ ] 所有依赖已安装 (`npm install` / `cargo build`)

### 启动后检查
- [ ] 后端 API 可访问 (http://localhost:8080)
- [ ] 前端页面正常加载 (http://localhost:5173)
- [ ] 插件可在 Chrome 中加载
- [ ] 钱包连接功能正常
- [ ] 数据库连接正常

### 功能测试
- [ ] 创建誓言功能
- [ ] 查看誓言列表
- [ ] 完成誓言功能
- [ ] 插件徽章显示
- [ ] API 数据查询

---

## 🆘 获取帮助

- **技术文档**: 查看各项目的 `docs/` 文件夹
- **问题报告**: 在 GitHub Issues 中提交
- **代码审查**: 提交 Pull Request
- **功能建议**: 在 Discussions 中讨论

---

**最后更新**: 2024年10月
**维护者**: PumpFun Plugin Team
