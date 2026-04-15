# 未来星学堂 (FutureStar Academy) - Backend

## 项目概述

少儿素质教育平台后端服务，基于 NestJS + TypeScript + PostgreSQL + Redis 构建。

## 技术栈

- **框架**: NestJS 10
- **语言**: TypeScript 5
- **ORM**: Prisma 5
- **数据库**: PostgreSQL 15
- **缓存**: Redis 7
- **认证**: JWT + Passport

## 快速开始

### 1. 安装依赖

```bash
cd src/backend
npm install
```

### 2. 配置环境变量

```bash
cp .env.example .env
# 编辑 .env 文件，配置数据库和Redis连接
```

### 3. 数据库迁移

```bash
npx prisma generate
npx prisma migrate dev
```

### 4. 启动服务

```bash
npm run start:dev
```

### 5. 查看API文档

访问 http://localhost:3000/api/docs

## 模块说明

| 模块 | 功能 |
|------|------|
| Auth | 家长注册、儿童账号创建、登录认证 |
| User | 用户资料管理、能力画像、勋章等级 |
| Course | 课程浏览、详情、章节内容、报名 |
| Learning | 学习进度、章节完成、学习计划 |
| Social | 笔记、评论、博客、学习群组 |
| Assessment | 考核测验、评分、能力更新 |
| Guardian | 家长监护设置、学习报告、异常预警 |

## Ground Rules合规

- **年龄自适应**: 4-6/7-9/10-12分组配置
- **内容审核**: 评论、博客需审核机制
- **时长限制**: Redis实时监控每日学习时长
- **正向激励**: 积分、勋章、等级系统

## 开发命令

```bash
npm run build       # 构建
npm run start:dev   # 开发模式
npm run start:prod  # 生产模式
npm run lint        # 代码检查
npm run test        # 测试
```