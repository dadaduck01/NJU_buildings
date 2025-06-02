#!/bin/bash

echo "🏛️ 启动中国建筑信息平台..."

# 检查是否安装了Node.js
if ! command -v node &> /dev/null; then
    echo "❌ 错误：未找到Node.js，请先安装Node.js"
    exit 1
fi

# 检查是否安装了npm
if ! command -v npm &> /dev/null; then
    echo "❌ 错误：未找到npm，请先安装npm"
    exit 1
fi

echo "📦 检查并安装依赖..."

# 安装根目录依赖
if [ ! -d "node_modules" ]; then
    echo "正在安装根目录依赖..."
    npm install
fi

# 安装后端依赖
if [ ! -d "backend/node_modules" ]; then
    echo "正在安装后端依赖..."
    cd backend
    npm install --no-optional
    cd ..
fi

# 安装前端依赖
if [ ! -d "frontend/node_modules" ]; then
    echo "正在安装前端依赖..."
    cd frontend
    npm install
    cd ..
fi

# 初始化数据库
if [ ! -f "backend/database/buildings.db" ]; then
    echo "🗄️ 初始化数据库..."
    cd backend
    npm run init-db
    cd ..
fi

echo "🚀 启动服务器..."
echo "前端地址: http://localhost:3000"
echo "后端地址: http://localhost:5000"
echo "按 Ctrl+C 停止服务器"

# 启动开发服务器
npm run dev 