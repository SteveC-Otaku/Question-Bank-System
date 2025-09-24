# MongoDB 连接配置指南

## 方法一：本地 MongoDB 安装

### 1. 安装 MongoDB
- 访问 [MongoDB 官网](https://www.mongodb.com/try/download/community) 下载 MongoDB Community Server
- 按照安装向导完成安装
- 启动 MongoDB 服务

### 2. 验证安装
```bash
mongod --version
mongo --version
```

### 3. 启动 MongoDB 服务
```bash
# Windows
net start MongoDB

# macOS/Linux
sudo systemctl start mongod
```

## 方法二：使用 MongoDB Atlas（推荐）

### 1. 创建 Atlas 账户
- 访问 [MongoDB Atlas](https://www.mongodb.com/atlas)
- 注册免费账户

### 2. 创建集群
- 选择 "Build a Database"
- 选择免费套餐 (M0)
- 选择地区（建议选择离您最近的地区）
- 创建集群

### 3. 配置数据库访问
- 创建数据库用户
- 设置网络访问（添加您的 IP 地址或 0.0.0.0/0 允许所有 IP）

### 4. 获取连接字符串
- 点击 "Connect"
- 选择 "Connect your application"
- 复制连接字符串

### 5. 设置环境变量
创建 `.env` 文件：
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/question_bank?retryWrites=true&w=majority
PORT=3000
JWT_SECRET=your_jwt_secret_key_here
```

## 方法三：使用 Docker

### 1. 安装 Docker
- 下载并安装 [Docker Desktop](https://www.docker.com/products/docker-desktop)

### 2. 使用提供的 docker-compose.yml
```bash
docker-compose up -d
```

### 3. 验证容器运行
```bash
docker ps
```

## 启动项目

### 1. 安装依赖
```bash
npm install
```

### 2. 启动应用
```bash
# 生产模式
npm start

# 开发模式（需要 nodemon）
npm run dev
```

### 3. 验证连接
启动后应该看到：
```
Connected to MongoDB
Server running on port 3000
```

## 常见问题

### 连接失败
1. 检查 MongoDB 服务是否运行
2. 检查连接字符串是否正确
3. 检查网络连接和防火墙设置

### 权限问题
1. 确保数据库用户有正确的权限
2. 检查网络访问设置（Atlas）

### 端口冲突
1. 确保 27017 端口（MongoDB）和 3000 端口（应用）没有被占用
2. 可以修改 PORT 环境变量来更改应用端口

## 数据库结构

项目使用以下集合：
- `questions` - 存储题目信息
- `users` - 存储用户信息
- `answers` - 存储答案信息

数据库名称：`question_bank`

