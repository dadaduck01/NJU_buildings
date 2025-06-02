# 🏛️ 校园建筑信息平台

一个完整的前后端项目，用于展示校园建筑信息，包含AI建筑介绍生成和文字转语音功能。

## 📋 功能特性

- 🏗️ **建筑信息管理**：SQLite数据库存储建筑名称、图片、地址等信息
- 🎨 **现代化UI**：基于React + TypeScript + Styled Components的响应式界面
- ⚙️ **管理后台**：允许管理员添加、删除建筑信息和上传图片
- 🤖 **AI介绍生成**：集成DashScope API，自动生成建筑介绍
- 🔊 **文字转语音**：集成DashScope TTS，将介绍转换为语音
- 📱 **响应式设计**：适配手机、平板和桌面设备
- 📷 **图片上传**：支持建筑图片上传和管理

## 🚀 快速开始

### 1. 环境准备

确保您的系统已安装：
- Node.js (版本 14+)

### 2. 配置环境变量

在 `backend` 目录下创建 `.env` 文件：

```bash
# DashScope API配置
DASHSCOPE_API_KEY=your_dashscope_api_key_here
DASHSCOPE_APP_ID=your_app_id_here

# 服务器配置
PORT=5000
```

### 3. 安装依赖

```bash
# 安装根目录依赖
npm install

# 安装所有项目依赖（推荐）
npm run install-all
```

### 4. 初始化数据库

```bash
cd backend
npm run init-db
```

### 5. 启动开发服务器

```bash
# 同时启动前后端服务器
npm run dev

# 或者分别启动
npm run server  # 后端服务器 (端口 5000)
npm run client  # 前端服务器 (端口 3000)
```

## 📁 项目结构

```
building-info-platform/
├── backend/                 # 后端服务器
│   ├── node/               # Node.js TTS模块
│   ├── routes/             
│   │   └── buildings.js    # 建筑信息API路由
│   ├── scripts/            
│   │   └── initDatabase.js # 数据库初始化脚本
│   ├── database/           # SQLite数据库文件
│   ├── uploads/            # 上传的图片和音频文件
│   └── server.js           # Express服务器主文件
├── frontend/               # React前端应用
│   ├── src/
│   │   ├── components/     # React组件
│   │   │   ├── BuildingSelector.tsx
│   │   │   ├── BuildingDetails.tsx
│   │   │   └── AdminPanel.tsx
│   │   ├── types/          # TypeScript类型定义
│   │   │   └── Building.ts
│   │   └── App.tsx         # 主应用组件
└── README.md
```

## 🔧 API接口

### 建筑信息接口

- `GET /api/buildings` - 获取所有建筑信息
- `GET /api/buildings/:id` - 获取单个建筑信息
- `GET /api/buildings/search/:name` - 根据名称搜索建筑
- `POST /api/buildings` - 添加新建筑（支持图片上传）
- `DELETE /api/buildings/:id` - 删除建筑信息

### AI功能接口

- `POST /api/generate-description` - 生成建筑介绍（已集成DashScope）
- `POST /api/text-to-speech` - 文字转语音（已集成DashScope TTS）

## 📱 界面说明

### 用户界面
- **建筑选择**：网格布局展示所有建筑，点击选择
- **建筑详情**：显示建筑图片、基本信息
- **自动生成介绍**：选择建筑后自动调用AI生成介绍
- **语音播放**：点击"文字转语音"按钮生成并播放语音

### 管理后台
- **添加建筑**：输入建筑名称、地址，上传图片
- **建筑列表**：查看所有建筑信息，支持删除操作
- **图片管理**：自动处理图片上传和删除

## ⚙️ 技术实现

### AI建筑介绍生成
- 使用DashScope API
- 校长身份的温和语气
- 150-300字的导览文字
- 基于知识库的准确信息

### 文字转语音
- 使用DashScope TTS API
- 生成MP3格式音频文件
- 自动保存到服务器

## 🗃️ 数据库结构

### buildings表

| 字段名 | 类型 | 说明 |
|--------|------|------|
| id | INTEGER | 主键，自增 |
| name | TEXT | 建筑名称（唯一） |
| image_url | TEXT | 建筑图片路径 |
| address | TEXT | 地址 |
| created_at | DATETIME | 创建时间 |

## 🛠️ 技术栈

### 后端
- Node.js + Express
- SQLite数据库
- Multer（文件上传）
- DashScope API（AI功能）

### 前端
- React 18 + TypeScript
- Styled Components
- 响应式设计

## 📝 开发说明

### 环境变量配置

确保在 `backend/.env` 文件中配置：
- `DASHSCOPE_API_KEY`：您的DashScope API密钥
- `DASHSCOPE_APP_ID`：您的应用ID

### 添加新建筑

1. 通过管理后台界面添加
2. 或直接修改 `backend/scripts/initDatabase.js` 添加示例数据

### 图片上传限制

- 文件大小：最大5MB
- 文件格式：仅支持图片格式（jpg、png、gif等）
- 存储位置：`backend/uploads/` 目录

## 🚦 使用流程

1. **启动项目**：运行 `npm run dev` 启动前后端服务器
2. **访问应用**：浏览器打开 `http://localhost:3000`
3. **用户界面**：选择建筑自动生成介绍，点击语音按钮播放
4. **管理后台**：点击"管理后台"切换到管理界面
5. **添加建筑**：填写建筑信息，上传图片，点击添加
6. **管理建筑**：查看建筑列表，删除不需要的建筑

## 🔒 安全说明

### API密钥保护
1. 永远不要将 `.env` 文件提交到版本控制系统
2. 使用 `.gitignore` 确保敏感文件不会被提交
3. 在生产环境中使用环境变量或安全的密钥管理服务
4. 定期轮换API密钥
5. 设置API使用限制和监控

### 部署安全
1. 使用HTTPS保护所有API通信
2. 实现适当的访问控制和认证机制
3. 定期更新依赖包以修复安全漏洞
4. 实施请求速率限制以防止滥用
5. 监控异常API使用情况

### 数据安全
1. 定期备份数据库
2. 加密敏感数据
3. 实施适当的文件上传限制
4. 使用安全的文件存储服务

## 🤝 贡献

欢迎提交Issue和Pull Request来改进项目！

## �� 许可证

MIT License 