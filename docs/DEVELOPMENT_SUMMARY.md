# 🚀 开发启动方式总结

## 📋 项目启动方式一览

### 🌐 Web3 前端 (frontend/web3/)
```bash
cd frontend/web3
npm install
npm run dev
```
- **访问地址**: http://localhost:5173
- **启动命令**: `npm run dev` (开发模式)
- **构建命令**: `npm run build` (生产构建)

### 🌐 Web 前端 (frontend/web/)
```bash
cd frontend/web
npm install
npm run dev
```
- **访问地址**: http://localhost:5173
- **启动命令**: `npm run dev` (开发模式)
- **构建命令**: `npm run build` (生产构建)

### 🔌 Chrome 插件 (plugin/)
```bash
cd plugin
npm install
npm run dev    # 开发模式 (热重载)
npm run build  # 生产构建
```
- **开发模式**: `npm run dev` (支持热重载)
- **生产构建**: `npm run build` (生成 dist/ 文件夹)
- **安装方式**: 在 Chrome 中加载 `dist/` 文件夹

### 🦀 Rust 后端 (backend/rust_backend/)
```bash
cd backend/rust_backend
cargo run
```
- **访问地址**: http://localhost:8080
- **启动命令**: `cargo run` (开发模式)
- **发布构建**: `cargo run --release`

---

## 🎯 回答您的问题

**是的，都是 dev build run！**

### 开发模式 (推荐)
- **Web3 前端**: `npm run dev` ✅
- **Web 前端**: `npm run dev` ✅  
- **Chrome 插件**: `npm run dev` ✅ (支持热重载)
- **Rust 后端**: `cargo run` ✅

### 生产模式 (部署时)
- **Web3 前端**: `npm run build` → 生成 `dist/` 文件夹
- **Web 前端**: `npm run build` → 生成 `dist/` 文件夹
- **Chrome 插件**: `npm run build` → 生成 `dist/` 文件夹
- **Rust 后端**: `cargo run --release` → 优化版本

---

## 🚀 快速启动所有服务

### Windows 用户
```bash
# 双击运行
start-dev.bat

# 或命令行运行
.\start-dev.bat
```

### Linux/Mac 用户
```bash
# 运行脚本
./start-dev.sh

# 或手动启动
bash start-dev.sh
```

### 手动启动 (推荐用于调试)
```bash
# 终端 1: 启动后端
cd backend/rust_backend && cargo run

# 终端 2: 启动 Web3 前端  
cd frontend/web3 && npm run dev

# 终端 3: 启动 Web 前端
cd frontend/web && npm run dev

# 终端 4: 启动插件开发
cd plugin && npm run dev
```

---

## 📝 开发流程建议

### 1. 日常开发
- 使用 `npm run dev` 和 `cargo run` 进行开发
- 所有服务都支持热重载，代码修改后自动更新

### 2. 测试功能
- 在浏览器中访问 http://localhost:5173
- 在 Chrome 中加载插件进行测试
- 使用 API 测试工具测试后端接口

### 3. 生产部署
- 运行 `npm run build` 构建前端
- 运行 `cargo run --release` 构建后端
- 将构建文件部署到服务器

---

## 🔧 常见问题

### 端口冲突
如果 5173 端口被占用，Vite 会自动使用下一个可用端口 (如 5174)

### 依赖问题
```bash
# 清理并重新安装
rm -rf node_modules package-lock.json
npm install
```

### 插件无法加载
1. 确保运行了 `npm run build`
2. 在 Chrome 中加载 `plugin/dist/` 文件夹
3. 检查 `manifest.json` 配置

---

## ✅ 总结

**所有项目都使用开发模式启动：**
- ✅ Web3 前端: `npm run dev`
- ✅ Web 前端: `npm run dev`  
- ✅ Chrome 插件: `npm run dev`
- ✅ Rust 后端: `cargo run`

**生产部署时使用构建命令：**
- ✅ 前端项目: `npm run build`
- ✅ Rust 后端: `cargo run --release`

这样既保证了开发效率，又确保了生产环境的性能优化！
