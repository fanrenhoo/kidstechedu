# 少儿素质教育平台技术架构设计说明书

## 文档信息

| 项目 | 内容 |
|------|------|
| 项目名称 | 未来星学堂 (FutureStar Academy) |
| 文档版本 | v1.1 (数据层简化版) |
| 创建日期 | 2026-04-12 |
| 更新日期 | 2026-04-13 |
| 作者 | Jimie-dev1, Wendy-Arch1 |
| 基础文档 | education-platform-functional-design.md v1.0 |
| 文档状态 | 已更新 - 待审核 |

---

## 一、架构概述

### 1.1 设计目标

本技术架构设计旨在为"未来星学堂"少儿素质教育平台提供：

1. **高可用性**：确保平台7×24小时稳定运行，核心功能可用性≥99.9%
2. **可扩展性**：支持用户规模从1万到100万的平滑扩展
3. **安全性**：符合儿童隐私保护法规（COPPA），保障用户数据安全
4. **性能优良**：页面加载时间<2秒，视频播放流畅，无卡顿
5. **适龄体验**：支持年龄自适应界面切换，响应时间<500ms
6. **AI智能化**：集成AI推荐、评估、答疑等智能功能

### 1.2 系统架构总览

采用**微服务架构 + 云原生部署**的技术方案：

```
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              客户端层 (Client Layer)                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  Web应用     │  │  儿童App    │  │  家长App    │  │  教师端     │            │
│  │  (React)    │  │ (React      │  │ (React      │  │ (React      │            │
│  │             │  │  Native)    │  │  Native)   │  │  Native)    │            │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘            │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                              接入层 (Gateway Layer)                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────────────────────────────┐│
│  │                        API Gateway (Kong/APISIX)                            ││
│  │   - 路由分发  - 负载均衡  - 限流熔断  - 认证鉴权  - 日志追踪                  ││
│  └─────────────────────────────────────────────────────────────────────────────┘│
│  ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐              │
│  │  CDN (视频/静态)   │  │  WAF (安全防护)  │  │  DDoS防护        │              │
│  └──────────────────┘  └──────────────────┘  └──────────────────┘              │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           业务服务层 (Service Layer)                             │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐           │
│ │ 用户服务   │ │ 课程服务   │ │ 学习服务   │ │ 社交服务   │ │ 计划服务   │           │
│ │user-svc   │ │course-svc │ │learn-svc  │ │social-svc │ │plan-svc   │           │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘           │
│ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐ ┌───────────┐           │
│ │ 考核服务   │ │ 监护服务   │ │ 支付服务   │ │ 通知服务   │ │ 直播服务   │           │
│ │assess-svc │ │guardian-svc│ │payment-svc│ │notify-svc │ │live-svc   │           │
│ └───────────┘ └───────────┘ └───────────┘ └───────────┘ └───────────┘           │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                           AI服务层 (AI Service Layer)                            │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ┌───────────────────┐  ┌───────────────────┐  ┌───────────────────┐             │
│ │  推荐引擎服务      │  │  能力评估服务      │  │  智能答疑服务      │             │
│ │recommendation-svc │  │assessment-svc     │  │qa-assistant-svc   │             │
│ └───────────────────┘  └───────────────────┘  └───────────────────┘             │
│ ┌───────────────────┐  ┌───────────────────┐                                  │
│ │  报告生成服务      │  │  内容审核服务      │                                  │
│ │report-svc        │  │content-moderation │                                  │
│ └───────────────────┘  └───────────────────┘                                  │
└─────────────────────────────────────────────────────────────────────────────────┘
                                        │
                                        ▼
┌─────────────────────────────────────────────────────────────────────────────────┐
│                     数据层 (Data Layer) - MVP简化版                              │
├─────────────────────────────────────────────────────────────────────────────────┤
│ ┌─────────────────────┐  ┌─────────────────────┐  ┌─────────────────────┐       │
│ │     PostgreSQL      │  │       Redis         │  │     对象存储OSS      │       │
│ │   (全部业务数据)     │  │ (缓存/会话/轻量队列) │  │    (视频/图片)      │       │
│ │ - 用户/课程/订单    │  │ - 热点数据缓存      │  │ - 课程视频          │       │
│ │ - 学习记录/进度     │  │ - 会话管理          │  │ - 用户头像          │       │
│ │ - 社交内容/考核     │  │ - 简单异步队列      │  │ - 课程资料          │       │
│ │ - 全文搜索(JSONB)   │  │ - 分布式锁          │  │                     │       │
│ └─────────────────────┘  └─────────────────────┘  └─────────────────────┘       │
│                                                                                 │
│ ┌─────────────────────────────────────────────────────────────────────────────┐│
│ │                          升级路径（按需引入）                                ││
│ │  用户量>5万 → Elasticsearch(搜索)  用户量>10万 → MongoDB(日志)              ││
│ │  用户量>20万 → RabbitMQ/Kafka(消息) 用户量>50万 → TimescaleDB(时序)        ││
│ └─────────────────────────────────────────────────────────────────────────────┘│
└─────────────────────────────────────────────────────────────────────────────────┘
```

---

## 二、技术栈选型

### 2.1 前端技术栈

| 层次 | 技术选型 | 选型理由 |
|------|---------|---------|
| **Web框架** | React 18 + TypeScript | 生态成熟，组件化开发，类型安全 |
| **状态管理** | Zustand / Redux Toolkit | 轻量级，适合复杂状态管理 |
| **UI组件库** | Ant Design + 自定义主题 | 企业级组件，支持主题定制 |
| **动画库** | Framer Motion | 适合儿童友好的动画效果 |
| **视频播放** | Video.js + HLS.js | 支持多种视频格式，流畅播放 |
| **实时通信** | Socket.io-client | 直播互动、群聊实时通信 |
| **构建工具** | Vite | 快速开发体验，热更新 |

### 2.2 移动端技术栈

| 层次 | 技术选型 | 选型理由 |
|------|---------|---------|
| **框架** | React Native 0.73+ | 跨平台，复用React技术栈 |
| **状态管理** | Zustand | 与Web端统一 |
| **导航** | React Navigation 6 | 成熟的导航解决方案 |
| **本地存储** | AsyncStorage + SQLite | 离线数据存储 |
| **推送** | Firebase Cloud Messaging | 跨平台推送通知 |

### 2.3 后端技术栈

| 层次 | 技术选型 | 选型理由 |
|------|---------|---------|
| **语言** | Node.js (TypeScript) / Python | Node.js用于API服务，Python用于AI服务 |
| **Web框架** | NestJS (Node.js) / FastAPI (Python) | 企业级框架，支持依赖注入、装饰器 |
| **ORM** | Prisma (Node.js) | 类型安全，迁移管理方便 |
| **API协议** | REST + GraphQL | REST用于简单CRUD，GraphQL用于复杂数据查询 |
| **实时通信** | Socket.io | 直播弹幕、群聊、实时通知 |

### 2.4 数据存储技术栈（MVP简化版）

| 类型 | 技术选型 | 用途 | 说明 |
|------|---------|------|------|
| **关系型数据库** | PostgreSQL 15+ | 全部业务数据 | 用户、课程、订单、学习记录、社交内容等 |
| **缓存** | Redis 7+ | 缓存+会话+轻量队列 | 会话管理、热点数据缓存、分布式锁、简单异步队列 |
| **对象存储** | 阿里云OSS / AWS S3 | 视频、图片、文档存储 | 课程视频、用户头像、课程资料 |

**简化说明**：MVP阶段仅使用3个核心组件，大幅降低运维复杂度。

| 功能 | MVP方案 | 未来升级方案 | 升级触发条件 |
|------|---------|-------------|-------------|
| 课程搜索 | PG全文搜索 + Redis缓存 | Elasticsearch | 用户量>5万 |
| 学习日志 | PG JSONB字段存储 | MongoDB | 用户量>10万 |
| 异步任务 | Redis List队列 | RabbitMQ/Kafka | 用户量>20万 |
| 学习时长统计 | PG普通表 + 定期聚合 | TimescaleDB | 用户量>50万 |

### 2.5 AI服务技术栈

| 功能 | 技术选型 | 说明 |
|------|---------|------|
| **大语言模型** | Claude API (Anthropic) | 智能答疑、报告生成 |
| **推荐系统** | Python + Scikit-learn + PyTorch | 课程推荐、学习路径规划 |
| **向量数据库** | Milvus / Pinecone | 知识库向量检索 |
| **内容审核** | 阿里云内容安全 + 自研模型 | 敏感内容过滤 |

### 2.6 DevOps技术栈（MVP简化版）

| 类别 | 技术选型 | 说明 |
|------|---------|------|
| **容器化** | Docker + Docker Compose | MVP阶段单机部署，后期升级K8s |
| **CI/CD** | GitHub Actions | 自动化构建部署 |
| **监控告警** | Prometheus + Grafana | 服务监控、性能指标 |
| **日志系统** | Loki + Grafana | 轻量级日志，替代ELK |

**升级路径**：用户量>10万时，引入Kubernetes集群部署和完整ELK日志系统。

---

## 三、微服务架构设计

### 3.1 服务划分

根据业务域和数据边界，划分以下微服务：

```
┌─────────────────────────────────────────────────────────────────────┐
│                         微服务架构图                                 │
├─────────────────────────────────────────────────────────────────────┤
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    用户域 (User Domain)                       │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐              │   │
│  │  │ 用户服务    │  │ 认证服务    │  │ 权限服务    │              │   │
│  │  │user-service│  │auth-service│  │rbac-service│              │   │
│  │  └────────────┘  └────────────┘  └────────────┘              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    课程域 (Course Domain)                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐              │   │
│  │  │ 课程服务    │  │ 内容服务    │  │ 直播服务    │              │   │
│  │  │course-svc  │  │content-svc │  │live-svc    │              │   │
│  │  └────────────┘  └────────────┘  └────────────┘              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    学习域 (Learning Domain)                   │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐              │   │
│  │  │ 学习服务    │  │ 进度服务    │  │ 计划服务    │              │   │
│  │  │learn-svc   │  │progress-svc│  │plan-svc    │              │   │
│  │  └────────────┘  └────────────┘  └────────────┘              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    社交域 (Social Domain)                     │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐              │   │
│  │  │ 评论服务    │  │ 群组服务    │  │ 内容发布    │              │   │
│  │  │comment-svc │  │group-svc   │  │publish-svc │              │   │
│  │  └────────────┘  └────────────┘  └────────────┘              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    评估域 (Assessment Domain)                 │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐              │   │
│  │  │ 考核服务    │  │ 能力评估    │  │ 报告服务    │              │   │
│  │  │assess-svc  │  │ability-svc │  │report-svc  │              │   │
│  │  └────────────┘  └────────────┘  └────────────┘              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │                    支撑域 (Support Domain)                    │   │
│  │  ┌────────────┐  ┌────────────┐  ┌────────────┐              │   │
│  │  │ 支付服务    │  │ 通知服务    │  │ 文件服务    │              │   │
│  │  │payment-svc │  │notify-svc  │  │file-svc    │              │   │
│  │  └────────────┘  └────────────┘  └────────────┘              │   │
│  └──────────────────────────────────────────────────────────────┘   │
│                                                                      │
└─────────────────────────────────────────────────────────────────────┘
```

### 3.2 服务通信方式（MVP简化版）

| 通信场景 | 方式 | 技术实现 |
|----------|------|---------|
| 同步调用 | REST API / gRPC | 服务间通过API Gateway或直接调用 |
| 异步消息 | Redis队列（MVP） | 简单任务队列，后期升级RabbitMQ/Kafka |
| 实时通信 | WebSocket | Socket.io（直播、群聊） |

### 3.3 服务发现与配置

| 组件 | 技术选型 | 说明 |
|------|---------|------|
| 服务注册发现 | Kubernetes Service + DNS | K8s内置服务发现 |
| 配置中心 | Consul / Nacos | 动态配置管理 |
| 服务网关 | Kong / APISIX | API路由、限流、鉴权 |

---

## 四、数据库详细设计

### 4.1 PostgreSQL 数据库设计

#### 4.1.1 用户域表结构

```sql
-- 用户基表
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_type VARCHAR(20) NOT NULL CHECK (user_type IN ('child', 'parent', 'teacher', 'admin')),
    status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'suspended')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 儿童用户表
CREATE TABLE children (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    nickname VARCHAR(50) NOT NULL,
    birth_date DATE NOT NULL,
    gender VARCHAR(10),
    avatar_id UUID,
    age_group VARCHAR(20) NOT NULL CHECK (age_group IN ('4-6', '7-9', '10-12')),
    level_id UUID,
    total_points INTEGER DEFAULT 0,
    preferences JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 家长用户表
CREATE TABLE parents (
    user_id UUID PRIMARY KEY REFERENCES users(id),
    phone VARCHAR(20) UNIQUE,
    email VARCHAR(100) UNIQUE,
    name VARCHAR(50),
    avatar_url VARCHAR(500),
    verification_status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 儿童家长关联表
CREATE TABLE child_parent_relations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(user_id),
    parent_id UUID NOT NULL REFERENCES parents(user_id),
    relation_type VARCHAR(20) DEFAULT 'parent',
    permissions JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(child_id, parent_id)
);

-- 用户认证表
CREATE TABLE user_credentials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    credential_type VARCHAR(20) NOT NULL CHECK (credential_type IN ('password', 'pattern', 'voice', 'oauth')),
    credential_hash VARCHAR(255),
    salt VARCHAR(100),
    is_primary BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户会话表
CREATE TABLE user_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    device_type VARCHAR(20),
    device_id VARCHAR(100),
    ip_address VARCHAR(45),
    user_agent TEXT,
    expires_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.1.2 课程域表结构

```sql
-- 课程分类表
CREATE TABLE course_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    parent_id UUID REFERENCES course_categories(id),
    icon_url VARCHAR(500),
    sort_order INTEGER DEFAULT 0,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 课程表
CREATE TABLE courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200) NOT NULL,
    description TEXT,
    category_id UUID REFERENCES course_categories(id),
    teacher_id UUID REFERENCES users(id),
    cover_image_url VARCHAR(500),
    age_range VARCHAR(20) NOT NULL,
    difficulty_level INTEGER DEFAULT 1 CHECK (difficulty_level BETWEEN 1 AND 5),
    total_duration INTEGER, -- 秒
    total_chapters INTEGER DEFAULT 0,
    pricing_type VARCHAR(20) DEFAULT 'free' CHECK (pricing_type IN ('free', 'paid', 'subscription')),
    price DECIMAL(10,2),
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),
    view_count INTEGER DEFAULT 0,
    enrollment_count INTEGER DEFAULT 0,
    average_rating DECIMAL(3,2) DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 课程章节表
CREATE TABLE course_chapters (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id),
    sequence INTEGER NOT NULL,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    video_id UUID,
    duration INTEGER, -- 秒
    interaction_data JSONB,
    has_assessment BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 视频资源表
CREATE TABLE videos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(200),
    original_url VARCHAR(500),
    transcoded_urls JSONB DEFAULT '{}', -- 不同清晰度
    thumbnail_url VARCHAR(500),
    subtitle_urls JSONB DEFAULT '{}',
    duration INTEGER,
    file_size BIGINT,
    status VARCHAR(20) DEFAULT 'processing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 课程报名表
CREATE TABLE course_enrollments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID NOT NULL REFERENCES courses(id),
    child_id UUID NOT NULL REFERENCES children(user_id),
    enrolled_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP WITH TIME ZONE,
    progress_percentage DECIMAL(5,2) DEFAULT 0,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(course_id, child_id)
);
```

#### 4.1.3 学习域表结构

```sql
-- 学习记录表
CREATE TABLE learning_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(user_id),
    course_id UUID NOT NULL REFERENCES courses(id),
    chapter_id UUID REFERENCES course_chapters(id),
    session_id UUID,
    action_type VARCHAR(50) NOT NULL, -- 'video_play', 'video_pause', 'quiz_answer', 'note_create' 等
    action_data JSONB DEFAULT '{}',
    duration_seconds INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 章节进度表
CREATE TABLE chapter_progress (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(user_id),
    chapter_id UUID NOT NULL REFERENCES course_chapters(id),
    video_progress INTEGER DEFAULT 0, -- 百分比
    interaction_completed JSONB DEFAULT '{}',
    is_completed BOOLEAN DEFAULT false,
    completed_at TIMESTAMP WITH TIME ZONE,
    last_accessed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(child_id, chapter_id)
);

-- 学习计划表
CREATE TABLE learning_plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(user_id),
    name VARCHAR(100),
    goals JSONB DEFAULT '[]',
    start_date DATE NOT NULL,
    end_date DATE,
    milestones JSONB DEFAULT '[]',
    status VARCHAR(20) DEFAULT 'active',
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 计划课程安排表
CREATE TABLE plan_courses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id UUID NOT NULL REFERENCES learning_plans(id),
    course_id UUID NOT NULL REFERENCES courses(id),
    sequence INTEGER,
    scheduled_date DATE,
    scheduled_time TIME,
    status VARCHAR(20) DEFAULT 'pending',
    completed_at TIMESTAMP WITH TIME ZONE
);

-- 能力画像表
CREATE TABLE ability_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(user_id),
    domain VARCHAR(50) NOT NULL, -- 'ai', 'english', 'history', 'logic', 'science'
    score DECIMAL(5,2) DEFAULT 0,
    level INTEGER DEFAULT 1,
    details JSONB DEFAULT '{}',
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(child_id, domain)
);

-- 能力历史表
CREATE TABLE ability_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(user_id),
    domain VARCHAR(50) NOT NULL,
    score DECIMAL(5,2),
    level INTEGER,
    source VARCHAR(50), -- 'assessment', 'learning', 'interaction'
    recorded_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.1.4 社交域表结构

```sql
-- 评论表
CREATE TABLE comments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    target_type VARCHAR(50) NOT NULL, -- 'course', 'chapter', 'blog', 'note'
    target_id UUID NOT NULL,
    parent_id UUID REFERENCES comments(id),
    content TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'deleted')),
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 笔记表
CREATE TABLE notes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(user_id),
    note_type VARCHAR(20) DEFAULT 'learning' CHECK (note_type IN ('learning', 'mood', 'milestone')),
    title VARCHAR(200),
    content TEXT,
    images JSONB DEFAULT '[]',
    related_course_id UUID REFERENCES courses(id),
    related_chapter_id UUID REFERENCES course_chapters(id),
    video_timestamp INTEGER, -- 视频时间点（秒）
    is_public BOOLEAN DEFAULT false,
    like_count INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 博客文章表
CREATE TABLE blogs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(user_id),
    title VARCHAR(200) NOT NULL,
    content TEXT NOT NULL,
    cover_image_url VARCHAR(500),
    images JSONB DEFAULT '[]',
    tags TEXT[],
    status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'pending_review', 'published', 'archived')),
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0,
    comment_count INTEGER DEFAULT 0,
    published_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 学习群组表
CREATE TABLE groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    group_type VARCHAR(20) NOT NULL CHECK (group_type IN ('course', 'interest', 'class', 'partner')),
    description TEXT,
    cover_image_url VARCHAR(500),
    creator_id UUID NOT NULL REFERENCES users(id),
    related_course_id UUID REFERENCES courses(id),
    member_count INTEGER DEFAULT 0,
    max_members INTEGER,
    is_public BOOLEAN DEFAULT false,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 群组成员表
CREATE TABLE group_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id),
    user_id UUID NOT NULL REFERENCES users(id),
    role VARCHAR(20) DEFAULT 'member' CHECK (role IN ('member', 'admin', 'creator')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(group_id, user_id)
);

-- 群消息表
CREATE TABLE group_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES groups(id),
    sender_id UUID NOT NULL REFERENCES users(id),
    content TEXT NOT NULL,
    message_type VARCHAR(20) DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'system')),
    metadata JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.1.5 考核域表结构

```sql
-- 考核定义表
CREATE TABLE assessments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    course_id UUID REFERENCES courses(id),
    title VARCHAR(200) NOT NULL,
    assessment_type VARCHAR(20) NOT NULL CHECK (assessment_type IN ('chapter', 'course', 'periodic', 'upgrade', 'special')),
    questions JSONB NOT NULL, -- 题目数据
    total_score INTEGER DEFAULT 100,
    passing_score INTEGER DEFAULT 60,
    time_limit INTEGER, -- 秒
    attempt_limit INTEGER DEFAULT 3,
    status VARCHAR(20) DEFAULT 'active',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 考核结果表
CREATE TABLE assessment_results (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assessment_id UUID NOT NULL REFERENCES assessments(id),
    child_id UUID NOT NULL REFERENCES children(user_id),
    score INTEGER,
    passed BOOLEAN DEFAULT false,
    answers JSONB DEFAULT '{}',
    time_spent INTEGER,
    attempt_number INTEGER DEFAULT 1,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 勋章定义表
CREATE TABLE badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    description TEXT,
    image_url VARCHAR(500),
    category VARCHAR(50),
    condition_type VARCHAR(50), -- 'course_complete', 'assessment_pass', 'streak', 'social' 等
    condition_data JSONB DEFAULT '{}',
    points INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 用户勋章表
CREATE TABLE user_badges (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    badge_id UUID NOT NULL REFERENCES badges(id),
    user_id UUID NOT NULL REFERENCES users(id),
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(badge_id, user_id)
);

-- 等级定义表
CREATE TABLE levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(50) NOT NULL,
    min_points INTEGER NOT NULL,
    max_points INTEGER NOT NULL,
    icon_url VARCHAR(500),
    benefits JSONB DEFAULT '{}',
    sequence INTEGER
);

-- 用户等级表
CREATE TABLE user_levels (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) UNIQUE,
    level_id UUID NOT NULL REFERENCES levels(id),
    current_points INTEGER DEFAULT 0,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 积分记录表
CREATE TABLE points_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id),
    points INTEGER NOT NULL,
    source VARCHAR(50), -- 'course_complete', 'assessment', 'daily_login', 'social' 等
    source_id UUID,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

#### 4.1.6 监护域表结构

```sql
-- 监护设置表
CREATE TABLE guardian_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(user_id),
    parent_id UUID NOT NULL REFERENCES parents(user_id),
    daily_time_limit INTEGER DEFAULT 120, -- 分钟
    allowed_time_slots JSONB DEFAULT '[]', -- 允许学习的时间段
    content_filter_level VARCHAR(20) DEFAULT 'standard',
    social_permissions JSONB DEFAULT '{}',
    notification_settings JSONB DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(child_id, parent_id)
);

-- 学习日报配置表
CREATE TABLE report_subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES parents(user_id),
    child_id UUID REFERENCES children(user_id), -- NULL表示所有关联儿童
    report_type VARCHAR(20) NOT NULL CHECK (report_type IN ('daily', 'weekly', 'monthly')),
    delivery_time TIME,
    delivery_method VARCHAR(20) DEFAULT 'push' CHECK (delivery_method IN ('push', 'email', 'sms')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 学习报告表
CREATE TABLE learning_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(user_id),
    parent_id UUID NOT NULL REFERENCES parents(user_id),
    report_type VARCHAR(20) NOT NULL,
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    summary TEXT,
    details JSONB DEFAULT '{}',
    recommendations JSONB DEFAULT '[]',
    generated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 异常行为预警表
CREATE TABLE behavior_alerts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    child_id UUID NOT NULL REFERENCES children(user_id),
    alert_type VARCHAR(50) NOT NULL, -- 'time_exceeded', 'progress_lag', 'content_risk' 等
    severity VARCHAR(20) DEFAULT 'low',
    details JSONB DEFAULT '{}',
    parent_notified BOOLEAN DEFAULT false,
    resolved_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
```

### 4.2 MongoDB 集合设计

```javascript
// 学习行为日志（高频率写入）
db.learning_events.insertOne({
    _id: ObjectId(),
    childId: UUID("..."),
    sessionId: UUID("..."),
    eventType: "video_play", // video_play, video_pause, quiz_answer, interaction, etc.
    courseId: UUID("..."),
    chapterId: UUID("..."),
    videoTimestamp: 120, // 秒
    eventData: {
        // 事件特定数据
    },
    deviceInfo: {
        type: "mobile",
        os: "iOS",
        version: "17.0"
    },
    createdAt: ISODate("...")
});

// 创建索引
db.learning_events.createIndex({ childId: 1, createdAt: -1 });
db.learning_events.createIndex({ courseId: 1, createdAt: -1 });

// 用户会话详细日志
db.session_logs.insertOne({
    _id: ObjectId(),
    userId: UUID("..."),
    sessionId: UUID("..."),
    startTime: ISODate("..."),
    endTime: ISODate("..."),
    duration: 1800, // 秒
    activities: [
        {
            action: "view_course",
            targetId: UUID("..."),
            timestamp: ISODate("...")
        }
    ],
    deviceInfo: {...},
    geoInfo: {...}
});

// AI对话历史
db.ai_conversations.insertOne({
    _id: ObjectId(),
    childId: UUID("..."),
    conversationId: UUID("..."),
    messages: [
        {
            role: "user",
            content: "什么是人工智能？",
            timestamp: ISODate("...")
        },
        {
            role: "assistant",
            content: "人工智能就像一个非常聪明的机器人朋友...",
            timestamp: ISODate("...")
        }
    ],
    context: {
        courseId: UUID("..."),
        chapterId: UUID("...")
    },
    createdAt: ISODate("...")
});
```

### 4.3 Redis 数据结构设计

```
# 用户会话
session:{session_id} -> {user_id, user_type, device, expires_at, ...}
TTL: 根据会话过期时间设置

# 用户登录状态
user:login:{user_id} -> {session_id, device_id, last_activity}
TTL: 7天

# 图形密码尝试次数（防暴力破解）
login:attempts:{user_id} -> count
TTL: 15分钟

# 课程热门排行榜
course:hot:list -> ZSET {course_id: score}
TTL: 1小时

# 课程详情缓存
course:detail:{course_id} -> JSON{course_data}
TTL: 10分钟

# 用户学习进度缓存
progress:user:{user_id}:course:{course_id} -> {percentage, last_chapter, updated_at}
TTL: 30分钟

# 每日学习时长计数器（用于限流）
daily:time:{child_id}:{date} -> total_minutes
TTL: 到当天结束

# 在线用户集合
online:users -> SET {user_id}
实时更新

# 群组在线成员
group:online:{group_id} -> SET {user_id}
实时更新

# 直播观看人数
live:viewers:{live_id} -> count
实时更新

# 限流计数器
ratelimit:{endpoint}:{user_id}:{minute} -> count
TTL: 1分钟

# 分布式锁
lock:resource:{resource_id} -> {owner_id, expires_at}
TTL: 根据业务需要设置
```

---

## 五、API接口设计

### 5.1 API设计规范

#### 5.1.1 URL规范

```
基础URL: https://api.futurestar.com/v1

资源命名:
- 使用名词复数形式: /users, /courses, /children
- 使用小写字母和连字符: /learning-plans, /course-categories
- 层级关系用路径表示: /courses/{courseId}/chapters/{chapterId}

查询参数:
- 分页: ?page=1&pageSize=20
- 排序: ?sort=-createdAt (负号表示降序)
- 过滤: ?status=published&ageGroup=7-9
- 字段选择: ?fields=id,title,description
```

#### 5.1.2 请求响应规范

```json
// 成功响应
{
    "code": 0,
    "message": "success",
    "data": {
        // 响应数据
    }
}

// 分页响应
{
    "code": 0,
    "message": "success",
    "data": {
        "items": [...],
        "pagination": {
            "page": 1,
            "pageSize": 20,
            "total": 100,
            "totalPages": 5
        }
    }
}

// 错误响应
{
    "code": 10001,
    "message": "参数错误",
    "errors": [
        {
            "field": "age",
            "message": "年龄必须在4-12之间"
        }
    ]
}
```

#### 5.1.3 错误码设计

| 错误码范围 | 类别 | 说明 |
|-----------|------|------|
| 0 | 成功 | 请求成功 |
| 10001-10999 | 参数错误 | 请求参数验证失败 |
| 20001-20999 | 认证错误 | 登录、权限相关错误 |
| 30001-30999 | 业务错误 | 业务逻辑错误 |
| 40001-40999 | 资源错误 | 资源不存在、冲突等 |
| 50001-50999 | 系统错误 | 服务器内部错误 |

### 5.2 核心API接口列表

#### 5.2.1 用户模块API

```yaml
# 用户注册（家长）
POST /v1/parents/register
Request:
  phone: string (required)
  email: string (optional)
  password: string (required, 8-20位)
  verifyCode: string (required, 6位)
  name: string (required)
Response:
  parentId: string
  accessToken: string
  refreshToken: string

# 创建儿童账号
POST /v1/children
Request:
  nickname: string (required, 2-20字符)
  birthDate: string (required, YYYY-MM-DD)
  gender: string (optional, male/female)
  avatarId: string (optional)
  learningGoals: object
    interests: string[] (AI, english, history, logic, science)
    target: string (interest, improvement, competition)
    customGoal: string (optional)
Response:
  childId: string
  ageGroup: string
  recommendedCourses: Course[]

# 儿童登录
POST /v1/auth/child-login
Request:
  childId: string
  credentialType: string (password/pattern/voice)
  credential: string
  deviceId: string (optional)
Response:
  accessToken: string
  refreshToken: string
  childProfile: ChildProfile
  ageGroupConfig: AgeGroupConfig

# 获取用户信息
GET /v1/users/{userId}
Response:
  id: string
  type: string
  profile: object
  level: object
  badges: Badge[]

# 更新儿童资料
PATCH /v1/children/{childId}
Request:
  nickname: string (optional)
  avatarId: string (optional)
  preferences: object (optional)
Response:
  childProfile: ChildProfile
```

#### 5.2.2 课程模块API

```yaml
# 获取课程列表
GET /v1/courses
Query:
  category: string (optional)
  ageGroup: string (optional)
  difficulty: number (optional, 1-5)
  status: string (optional, published)
  page: number
  pageSize: number
  sort: string
Response:
  items: Course[]
  pagination: Pagination

# 获取课程详情
GET /v1/courses/{courseId}
Response:
  id: string
  title: string
  description: string
  category: Category
  teacher: Teacher
  chapters: ChapterPreview[]
  enrollment: Enrollment (if enrolled)
  progress: number (if enrolled)
  rating: number
  reviews: Review[]

# 报名课程
POST /v1/courses/{courseId}/enroll
Request:
  childId: string (required)
Response:
  enrollment: Enrollment

# 获取章节内容
GET /v1/courses/{courseId}/chapters/{chapterId}
Response:
  id: string
  title: string
  video: Video
  interactions: Interaction[]
  assessment: Assessment (optional)

# 更新学习进度
POST /v1/progress
Request:
  courseId: string
  chapterId: string
  videoProgress: number (0-100)
  interactionsCompleted: string[]
Response:
  progress: Progress
  achievements: Achievement[]

# 课程评价
POST /v1/courses/{courseId}/reviews
Request:
  rating: number (1-5)
  content: string (optional)
Response:
  review: Review
```

#### 5.2.3 学习模块API

```yaml
# 获取学习统计
GET /v1/children/{childId}/statistics
Query:
  period: string (daily/weekly/monthly)
  startDate: string
  endDate: string
Response:
  totalTime: number
  coursesCompleted: number
  chaptersCompleted: number
  averageScore: number
  streak: number
  domainBreakdown: object

# 获取能力画像
GET /v1/children/{childId}/abilities
Response:
  abilities: Ability[]
    - domain: string
    - score: number
    - level: number
    - trend: string
    - details: object
  history: AbilityHistory[]

# 创建学习计划
POST /v1/learning-plans
Request:
  childId: string
  name: string
  goals: Goal[]
  startDate: string
  endDate: string (optional)
Response:
  plan: LearningPlan
  aiSuggestions: Suggestion[]

# 获取学习计划进度
GET /v1/learning-plans/{planId}/progress
Response:
  plan: LearningPlan
  progress: number
  milestones: Milestone[]
  deviations: Deviation[]

# 获取AI推荐
GET /v1/recommendations
Query:
  childId: string
  type: string (course/path/practice)
  limit: number
Response:
  recommendations: Recommendation[]
    - item: Course/Path
    - reason: string
    - matchScore: number
```

#### 5.2.4 社交模块API

```yaml
# 发布笔记
POST /v1/notes
Request:
  noteType: string (learning/mood/milestone)
  title: string (optional)
  content: string (required, 20-500字符)
  images: string[] (optional, max 4)
  relatedCourseId: string (optional)
  videoTimestamp: number (optional)
  isPublic: boolean
Response:
  note: Note

# 获取笔记列表
GET /v1/notes
Query:
  childId: string (optional)
  noteType: string (optional)
  courseId: string (optional)
  page: number
  pageSize: number
Response:
  items: Note[]
  pagination: Pagination

# 发布博客
POST /v1/blogs
Request:
  title: string (required, 5-100字符)
  content: string (required, 100-10000字符)
  coverImage: string (optional)
  images: string[] (optional, max 10)
  tags: string[] (optional)
Response:
  blog: Blog
  status: string (draft/pending_review)

# 获取群组消息
GET /v1/groups/{groupId}/messages
Query:
  before: string (message id, optional)
  limit: number (default 50)
Response:
  messages: Message[]
  hasMore: boolean

# 发送群组消息
POST /v1/groups/{groupId}/messages
Request:
  content: string (required, max 500字符)
  messageType: string (text/image)
  metadata: object (optional)
Response:
  message: Message

# 课程评论
POST /v1/comments
Request:
  targetType: string (course/chapter/blog/note)
  targetId: string
  content: string (required, max 300字符)
Response:
  comment: Comment
```

#### 5.2.5 考核模块API

```yaml
# 开始考核
POST /v1/assessments/{assessmentId}/start
Request:
  childId: string
Response:
  attemptId: string
  questions: Question[]
  timeLimit: number

# 提交答案
POST /v1/attempts/{attemptId}/submit
Request:
  answers: Answer[]
    - questionId: string
    - answer: string | string[]
    - timeSpent: number
Response:
  result: AttemptResult
  correctAnswers: number
  wrongAnswers: Question[]

# 完成考核
POST /v1/attempts/{attemptId}/complete
Response:
  result: AssessmentResult
  passed: boolean
  score: number
  badge: Badge (optional)
  recommendations: string[]

# 获取考核历史
GET /v1/children/{childId}/assessment-history
Query:
  courseId: string (optional)
  type: string (optional)
  page: number
  pageSize: number
Response:
  items: AssessmentResult[]
  pagination: Pagination
```

#### 5.2.6 家长监护模块API

```yaml
# 获取监护设置
GET /v1/guardian/settings
Query:
  childId: string
Response:
  settings: GuardianSettings

# 更新监护设置
PATCH /v1/guardian/settings
Request:
  childId: string
  dailyTimeLimit: number (optional)
  allowedTimeSlots: TimeSlot[] (optional)
  contentFilterLevel: string (optional)
  socialPermissions: object (optional)
Response:
  settings: GuardianSettings

# 获取学习报告
GET /v1/guardian/reports
Query:
  childId: string (optional, null for all children)
  reportType: string (daily/weekly/monthly)
  startDate: string
  endDate: string
Response:
  reports: LearningReport[]

# 获取实时学习状态
GET /v1/guardian/live-status
Query:
  childId: string (optional)
Response:
  children: ChildLiveStatus[]
    - childId: string
    - isOnline: boolean
    - currentActivity: object
    - todayDuration: number

# 获取异常预警列表
GET /v1/guardian/alerts
Query:
  childId: string (optional)
  status: string (optional)
  severity: string (optional)
Response:
  alerts: BehaviorAlert[]
```

#### 5.2.7 AI智能模块API

```yaml
# 智能问答
POST /v1/ai/qa
Request:
  childId: string
  question: string
  context: object (optional)
    - courseId: string
    - chapterId: string
    - videoTimestamp: number
Response:
  answer: string
  relatedTopics: string[]

# 获取个性化学习路径
POST /v1/ai/learning-path
Request:
  childId: string
  goal: string
  constraints: object (optional)
    - dailyTime: number
    - preferredDomains: string[]
    - excludeCourses: string[]
Response:
  path: LearningPath
  milestones: Milestone[]

# 生成能力报告
POST /v1/ai/generate-report
Request:
  childId: string
  reportType: string (daily/weekly/monthly)
  period: object
    - startDate: string
    - endDate: string
Response:
  report: GeneratedReport
```

### 5.3 GraphQL Schema设计（部分）

```graphql
type User {
  id: ID!
  type: UserType!
  createdAt: DateTime!
  profile: Profile
  level: UserLevel
  badges: [Badge!]!
}

type Child implements User {
  nickname: String!
  birthDate: Date!
  ageGroup: AgeGroup!
  avatar: Avatar
  abilities: [Ability!]!
  learningPlans: [LearningPlan!]!
  enrollments: [Enrollment!]!
}

type Parent implements User {
  phone: String
  email: String
  name: String
  children: [Child!]!
  guardianSettings: [GuardianSettings!]!
}

type Course {
  id: ID!
  title: String!
  description: String
  category: Category!
  teacher: Teacher!
  chapters: [Chapter!]!
  ageRange: String!
  difficulty: Int!
  pricing: Pricing!
  enrollmentCount: Int!
  averageRating: Float!
}

type Query {
  # 用户查询
  me: User
  child(id: ID!): Child
  children(ids: [ID!]): [Child!]!

  # 课程查询
  courses(filter: CourseFilter, page: Int, pageSize: Int): CourseConnection!
  course(id: ID!): Course
  recommendedCourses(childId: ID!, limit: Int): [Course!]!

  # 学习进度查询
  progress(childId: ID!, courseId: ID): Progress
  learningStatistics(childId: ID!, period: PeriodInput!): LearningStatistics!

  # 社交查询
  notes(filter: NoteFilter, page: Int, pageSize: Int): NoteConnection!
  blogs(filter: BlogFilter, page: Int, pageSize: Int): BlogConnection!
  groupMessages(groupId: ID!, limit: Int, before: ID): [Message!]!
}

type Mutation {
  # 用户操作
  createChildProfile(input: CreateChildInput!): Child!
  updateChildProfile(id: ID!, input: UpdateChildInput!): Child!

  # 课程操作
  enrollCourse(courseId: ID!, childId: ID!): Enrollment!
  updateProgress(input: ProgressInput!): Progress!

  # 社交操作
  createNote(input: NoteInput!): Note!
  createBlog(input: BlogInput!): Blog!
  createComment(input: CommentInput!): Comment!

  # 学习计划操作
  createLearningPlan(input: LearningPlanInput!): LearningPlan!
  updateLearningPlan(id: ID!, input: LearningPlanInput!): LearningPlan!
}

type Subscription {
  # 实时更新
  groupMessageSent(groupId: ID!): Message!
  liveStreamStarted(courseId: ID!): LiveSession!
  progressUpdated(childId: ID!): Progress!
}
```

---

## 六、安全设计

### 6.1 认证与授权

#### 6.1.1 认证方案

```
┌─────────────────────────────────────────────────────────────────┐
│                        认证流程图                                │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  家长登录:                                                        │
│  手机号/邮箱 + 密码 + 短信/邮件验证码                              │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │ JWT Token签发    │                                            │
│  │ accessToken: 2h  │                                            │
│  │ refreshToken: 7d│                                            │
│  └─────────────────┘                                            │
│                                                                  │
│  儿童登录:                                                        │
│  儿童ID + 图形密码/语音密码/简单密码                               │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐     ┌─────────────────┐                    │
│  │ 设备绑定验证     │────►│ 家长授权确认    │ (新设备)            │
│  └─────────────────┘     └─────────────────┘                    │
│           │                                                      │
│           ▼                                                      │
│  ┌─────────────────┐                                            │
│  │ JWT Token签发    │                                            │
│  │ accessToken: 4h  │                                            │
│  │ refreshToken: 7d │                                            │
│  └─────────────────┘                                            │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

#### 6.1.2 JWT Token结构

```json
{
  "header": {
    "alg": "RS256",
    "typ": "JWT",
    "kid": "key-id-2026"
  },
  "payload": {
    "sub": "user-uuid",
    "type": "child",
    "ageGroup": "7-9",
    "permissions": ["learn", "comment", "note"],
    "iat": 1712956800,
    "exp": 1712964000,
    "iss": "futurestar.com",
    "aud": "api.futurestar.com"
  }
}
```

#### 6.1.3 权限控制

```yaml
# 儿童权限矩阵（按年龄段）
permissions:
  "4-6":
    - learn:video
    - learn:interaction
    - comment:read
    - note:create:private
  "7-9":
    - learn:video
    - learn:interaction
    - learn:quiz
    - comment:read
    - comment:create
    - note:create
    - note:create:public
    - group:join
    - group:message
  "10-12":
    - learn:*
    - comment:*
    - note:*
    - blog:create
    - blog:publish
    - group:create
    - friend:add

# API权限检查示例
/api/v1/blogs:
  POST:
    roles: [child]
    ageGroups: [10-12]
    permissions: [blog:create]
```

### 6.2 数据安全

#### 6.2.1 敏感数据加密

| 数据类型 | 加密方式 | 说明 |
|----------|---------|------|
| 用户密码 | bcrypt (cost=12) | 单向哈希 |
| 手机号 | AES-256-GCM | 可逆加密，脱敏显示 |
| 身份证号 | AES-256-GCM | 可逆加密，脱敏显示 |
| 支付信息 | HSM加密 | 硬件安全模块 |
| 会话Token | SHA-256签名 | JWT签名 |

#### 6.2.2 传输安全

- 全站强制HTTPS（TLS 1.2+）
- API请求签名防篡改
- 敏感操作二次验证
- CORS严格白名单控制

#### 6.2.3 儿童隐私保护（COPPA合规）

```yaml
合规措施:
  数据收集:
    - 仅收集必要信息
    - 家长明确授权同意
    - 不收集地理位置
    - 不进行行为广告投放

  数据存储:
    - 儿童数据单独隔离
    - 加密存储个人标识
    - 自动化数据过期删除

  数据访问:
    - 家长完全访问权
    - 家长删除权
    - 数据导出功能

  第三方服务:
    - 禁止向第三方出售数据
    - 服务商需签署隐私协议
    - 定期审计第三方合规性
```

### 6.3 内容安全

#### 6.3.1 内容审核流程

```
儿童发布内容
      │
      ▼
┌─────────────┐
│ 机器审核     │ ──► 敏感词/图片检测
│ (实时)      │
└─────────────┘
      │
      ▼
┌─────────────┐
│ 家长确认     │ ──► 家长APP收到审核请求
│ (异步)      │     家长批准后正式发布
└─────────────┘
      │
      ▼
┌─────────────┐
│ 人工抽检     │ ──► 运营人员定期抽检
│ (定期)      │     发现问题可下架
└─────────────┘
```

#### 6.3.2 敏感词过滤

- 实时敏感词库更新
- 多层级过滤（政治、暴力、色情、广告）
- 自适应年龄的敏感度调整

---

## 七、部署架构

### 7.1 云原生部署架构

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              Kubernetes集群                                  │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                         Ingress Layer                                │    │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                  │    │
│  │  │   Ingress   │  │ Cert Manager│  │   Traefik   │                  │    │
│  │  │ Controller  │  │   (TLS)     │  │  (路由)      │                  │    │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                  │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                      Service Mesh (Istio)                            │    │
│  │  ┌─────────────────────────────────────────────────────────────┐    │    │
│  │  │                    API Gateway                                │    │    │
│  │  │  ┌───────────┐  ┌───────────┐  ┌───────────┐                │    │    │
│  │  │  │  Kong/    │  │ 限流熔断   │  │ 认证鉴权  │                │    │    │
│  │  │  │  APISIX   │  │           │  │           │                │    │    │
│  │  │  └───────────┘  └───────────┘  └───────────┘                │    │    │
│  │  └─────────────────────────────────────────────────────────────┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        微服务 Pods                                    │    │
│  │                                                                      │    │
│  │  用户服务(3)  课程服务(3)  学习服务(5)  社交服务(3)  AI服务(3)         │    │
│  │  ┌───┐┌───┐   ┌───┐┌───┐   ┌───┐┌───┐┌───┐   ┌───┐┌───┐   ┌───┐┌───┐│    │
│  │  │   ││   │   │   ││   │   │   ││   ││   │   │   ││   │   │   ││   ││    │
│  │  └───┘└───┘   └───┘└───┘   └───┘└───┘└───┘   └───┘└───┘   └───┘└───┘│    │
│  │                                                                      │    │
│  │  考核服务(3)  监护服务(3)  支付服务(2)  通知服务(2)  直播服务(3)       │    │
│  │  ┌───┐┌───┐   ┌───┐┌───┐   ┌───┐┌───┐   ┌───┐┌───┐   ┌───┐┌───┐    │    │
│  │  │   ││   │   │   ││   │   │   ││   │   │   ││   │   │   ││   │    │    │
│  │  └───┘└───┘   └───┘└───┘   └───┘└───┘   └───┘└───┘   └───┘└───┘    │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        中间件层                                      │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │    │
│  │  │PostgreSQL│  │  Redis  │  │ RabbitMQ│  │Elastic  │  │ MongoDB │   │    │
│  │  │ Cluster │  │ Cluster │  │ Cluster │  │search   │  │ Cluster│   │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
│  ┌─────────────────────────────────────────────────────────────────────┐    │
│  │                        监控运维层                                    │    │
│  │  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐   │    │
│  │  │Prometheus│  │ Grafana │  │  Jaeger │  │   ELK   │  │ ArgoCD  │   │    │
│  │  │         │  │         │  │(链路追踪)│  │ (日志)  │  │  (CD)   │   │    │
│  │  └─────────┘  └─────────┘  └─────────┘  └─────────┘  └─────────┘   │    │
│  └─────────────────────────────────────────────────────────────────────┘    │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

### 7.2 环境规划

| 环境 | 用途 | 部署方式 | 数据策略 |
|------|------|---------|---------|
| **开发环境** | 日常开发测试 | 本地K8s/Minikube | 模拟数据 |
| **测试环境** | 功能测试、集成测试 | 测试K8s集群 | 测试数据 |
| **预发布环境** | 上线前验证 | 生产同等配置 | 生产数据脱敏副本 |
| **生产环境** | 正式服务 | 生产K8s集群 | 生产数据多副本 |

### 7.3 弹性伸缩策略

```yaml
# Horizontal Pod Autoscaler 配置示例
apiVersion: autoscaling/v2
kind: HorizontalPodAutoscaler
metadata:
  name: learning-service-hpa
spec:
  scaleTargetRef:
    apiVersion: apps/v1
    kind: Deployment
    name: learning-service
  minReplicas: 3
  maxReplicas: 20
  metrics:
  - type: Resource
    resource:
      name: cpu
      target:
        type: Utilization
        averageUtilization: 70
  - type: Resource
    resource:
      name: memory
      target:
        type: Utilization
        averageUtilization: 80
  behavior:
    scaleUp:
      stabilizationWindowSeconds: 60
      policies:
      - type: Pods
        value: 4
        periodSeconds: 60
    scaleDown:
      stabilizationWindowSeconds: 300
      policies:
      - type: Percent
        value: 10
        periodSeconds: 60
```

### 7.4 容灾备份策略

| 组件 | 备份策略 | RPO | RTO |
|------|---------|-----|-----|
| PostgreSQL | 每日全量 + WAL实时 | 5分钟 | 30分钟 |
| MongoDB | 每日全量 + Oplog | 1小时 | 1小时 |
| Redis | AOF + RDB | 1分钟 | 5分钟 |
| 对象存储 | 跨区域复制 | 0 | 0 |
| 配置数据 | Git版本控制 | 0 | 10分钟 |

---

## 八、性能设计

### 8.1 性能目标

| 指标 | 目标值 | 测量方法 |
|------|-------|---------|
| 页面首屏加载时间 | < 2秒 | Lighthouse |
| API响应时间（P95） | < 500ms | Prometheus |
| 视频起播时间 | < 3秒 | 播放器监控 |
| 视频卡顿率 | < 1% | 播放器监控 |
| 并发用户数 | 10000 | 压力测试 |
| 系统可用性 | 99.9% | 监控系统 |

### 8.2 缓存策略

```
┌─────────────────────────────────────────────────────────────────┐
│                        多级缓存架构                              │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────────┐                                                │
│  │  浏览器缓存  │ ──► 静态资源、课程列表                          │
│  │ (CDN边缘)   │     Cache-Control: max-age=31536000            │
│  └─────────────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │  CDN缓存    │ ──► 视频、图片、JS/CSS                          │
│  │  (全球节点) │     减少源站压力                                 │
│  └─────────────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │ API Gateway │ ──► 热门课程、分类数据                          │
│  │   缓存      │     TTL: 1-5分钟                                │
│  └─────────────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │ 应用层缓存  │ ──► 用户会话、权限数据                          │
│  │  (Redis)    │     本地缓存: Caffeine (热点数据)                 │
│  └─────────────┘                                                │
│         │                                                        │
│         ▼                                                        │
│  ┌─────────────┐                                                │
│  │  数据库缓存 │ ──► 查询结果缓存                                │
│  │ (PostgreSQL)│     物化视图                                    │
│  └─────────────┘                                                │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### 8.3 视频流媒体优化

```yaml
视频处理流程:
  1. 上传:
    - 分片上传（支持断点续传）
    - 并行上传加速
    - 上传限速保护

  2. 转码:
    - 多清晰度转码（1080p, 720p, 480p, 360p）
    - H.264/H.265编码
    - 自适应码率（ABR）

  3. 分发:
    - HLS切片（m3u8 + ts）
    - CDN就近分发
    - 边缘节点预热

  4. 播放:
    - 懒加载切片
    - 预缓冲优化
    - 断点续播
    - 倍速播放（高龄用户）
```

### 8.4 数据库优化

```sql
-- 关键查询索引设计

-- 课程搜索优化
CREATE INDEX idx_courses_search ON courses(category_id, status, age_range)
    WHERE status = 'published';
CREATE INDEX idx_courses_rating ON courses(average_rating DESC)
    WHERE status = 'published' AND enrollment_count > 100;

-- 学习进度查询优化
CREATE INDEX idx_progress_child_course ON chapter_progress(child_id, chapter_id);
CREATE INDEX idx_progress_completed ON chapter_progress(child_id, is_completed)
    WHERE is_completed = true;

-- 评论查询优化
CREATE INDEX idx_comments_target ON comments(target_type, target_id, status)
    WHERE status = 'approved';
CREATE INDEX idx_comments_user ON comments(user_id, created_at DESC);

-- 学习记录分区（按时间）
CREATE TABLE learning_records_2026_01 PARTITION OF learning_records
    FOR VALUES FROM ('2026-01-01') TO ('2026-02-01');
CREATE TABLE learning_records_2026_02 PARTITION OF learning_records
    FOR VALUES FROM ('2026-02-01') TO ('2026-03-01');
```

---

## 九、第三方服务集成

### 9.1 支付服务集成

```yaml
支付渠道:
  - 微信支付
  - 支付宝
  - 银联支付

集成方案:
  沙箱环境:
    app_id: sandbox_app_id
    notify_url: https://api.futurestar.com/v1/payments/notify

  生产环境:
    app_id: production_app_id
    notify_url: https://api.futurestar.com/v1/payments/notify
    cert_path: /certs/payment/

回调处理:
  - 验证签名
  - 幂等处理
  - 订单状态更新
  - 发送通知
```

### 9.2 直播服务集成

```yaml
直播服务商: 腾讯云直播 / 声网

功能集成:
  - 推流端: OBS / 腾讯云推流SDK
  - 拉流端: 腾讯云播放器SDK
  - 互动: 弹幕、连麦、举手
  - 录制: 自动录制回放

推流配置:
  resolution: 1080p
  bitrate: 4000kbps
  fps: 30

播放配置:
  protocol: HLS / FLV
  adaptive_bitrate: true
  low_latency: true
```

### 9.3 AI服务集成

```yaml
大语言模型: Claude API (Anthropic)

配置:
  model: claude-sonnet-4-6
  max_tokens: 4096
  temperature: 0.7

适龄化提示词模板:
  system_prompt: |
    你是未来星学堂的AI助教，正在回答{age_group}岁小朋友的问题。
    请使用简单易懂的语言，适当使用比喻和故事来解释复杂概念。
    语气要友好、鼓励，避免使用负面词汇。
    如果问题超出教育范畴，请礼貌引导小朋友咨询老师或家长。

请求示例:
  POST /v1/messages
  {
    "model": "claude-sonnet-4-6",
    "system": "{{system_prompt}}",
    "messages": [
      {"role": "user", "content": "什么是人工智能？"}
    ],
    "max_tokens": 1024
  }
```

### 9.4 消息推送集成

```yaml
推送服务:
  - 极光推送 (App)
  - 阿里云短信 (短信)
  - SendGrid (邮件)

推送场景:
  学习提醒:
    template_id: LEARNING_REMINDER_001
    timing: 每日设定时间前5分钟

  进度报告:
    template_id: PROGRESS_REPORT_001
    timing: 每日22:00汇总推送

  异常预警:
    template_id: ALERT_001
    timing: 实时
```

---

## 十、开发计划建议

### 10.1 MVP阶段（第一阶段）- 3个月

| 迭代 | 周期 | 核心功能 |
|------|------|---------|
| Sprint 1 | 2周 | 用户系统（家长注册、儿童账号、登录） |
| Sprint 2 | 2周 | 课程系统（课程浏览、详情、视频播放） |
| Sprint 3 | 2周 | 学习系统（进度记录、章节测验） |
| Sprint 4 | 2周 | 家长监护（基础监控、时间限制） |
| Sprint 5 | 2周 | 集成测试、Bug修复、上线准备 |

### 10.2 第二阶段 - 3个月

| 迭代 | 周期 | 核心功能 |
|------|------|---------|
| Sprint 6 | 2周 | 学习计划系统 |
| Sprint 7 | 2周 | 社交系统（评论、笔记、群组） |
| Sprint 8 | 2周 | AI推荐引擎 |
| Sprint 9 | 2周 | 直播系统 |
| Sprint 10 | 2周 | 优化迭代 |

### 10.3 第三阶段 - 3个月

| 迭代 | 周期 | 核心功能 |
|------|------|---------|
| Sprint 11 | 2周 | 博客系统、年龄自适应 |
| Sprint 12 | 2周 | AI智能答疑 |
| Sprint 13 | 2周 | 能力评估引擎、定期考核 |
| Sprint 14 | 2周 | AI报告生成 |
| Sprint 15 | 2周 | 全面优化、性能调优 |

---

## 十一、风险评估与应对

### 11.1 技术风险

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|---------|
| 视频服务不稳定 | 高 | 中 | 多CDN备份、降级方案 |
| AI服务响应慢 | 中 | 中 | 本地缓存、异步处理 |
| 数据库性能瓶颈 | 高 | 中 | 读写分离、分库分表预案 |
| 第三方服务变更 | 中 | 低 | 抽象层封装、多服务商备份 |

### 11.2 安全风险

| 风险 | 影响 | 概率 | 应对措施 |
|------|------|------|---------|
| 儿童数据泄露 | 极高 | 低 | 加密存储、访问控制、安全审计 |
| 恶意内容攻击 | 高 | 中 | 内容审核、实时监控、快速响应 |
| DDoS攻击 | 高 | 中 | WAF、CDN防护、弹性扩容 |

### 11.3 合规风险

| 风险 | 影响 | 应对措施 |
|------|------|---------|
| COPPA违规 | 极高 | 法务审核、隐私设计、定期审计 |
| 支付合规 | 高 | 持牌支付渠道、合规流程 |
| 内容监管 | 高 | 内容审核机制、备案合规 |

---

## 附录A：技术选型对比

### A.1 前端框架对比

| 框架 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| React | 生态丰富、组件化、TypeScript支持 | 学习曲线 | 采用 |
| Vue | 易上手、性能好 | 生态相对小 | 备选 |
| Angular | 完整方案、企业级 | 过重 | 不采用 |

### A.2 后端语言对比

| 语言 | 优点 | 缺点 | 结论 |
|------|------|------|------|
| Node.js | 前后端统一、异步IO | CPU密集弱 | API服务采用 |
| Python | AI生态、易开发 | 性能一般 | AI服务采用 |
| Go | 高性能、并发强 | 生态相对新 | 不采用 |

### A.3 数据库对比

| 数据库 | 优点 | 缺点 | 结论 |
|--------|------|------|------|
| PostgreSQL | 功能丰富、扩展性强 | 配置复杂 | 核心数据采用 |
| MySQL | 生态成熟、简单 | 功能较少 | 不采用 |
| MongoDB | 灵活、文档存储 | 事务弱 | 日志数据采用 |

---

## 附录B：API接口文档模板

```yaml
openapi: 3.0.0
info:
  title: 未来星学堂API
  version: 1.0.0
  description: 少儿素质教育平台API接口文档

servers:
  - url: https://api.futurestar.com/v1
    description: 生产环境
  - url: https://api-test.futurestar.com/v1
    description: 测试环境

paths:
  /courses:
    get:
      summary: 获取课程列表
      tags:
        - 课程
      parameters:
        - name: category
          in: query
          schema:
            type: string
        - name: ageGroup
          in: query
          schema:
            type: string
            enum: ['4-6', '7-9', '10-12']
        - name: page
          in: query
          schema:
            type: integer
            default: 1
        - name: pageSize
          in: query
          schema:
            type: integer
            default: 20
      responses:
        '200':
          description: 成功
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/CourseListResponse'
```

---

## 附录C：监控指标定义

| 指标名称 | 类型 | 说明 | 告警阈值 |
|----------|------|------|---------|
| http_request_duration_seconds | Histogram | HTTP请求延迟 | P95 > 500ms |
| http_requests_total | Counter | HTTP请求总数 | - |
| http_request_errors_total | Counter | HTTP错误数 | 错误率 > 1% |
| db_query_duration_seconds | Histogram | 数据库查询延迟 | P95 > 100ms |
| redis_command_duration_seconds | Histogram | Redis命令延迟 | P95 > 10ms |
| video_buffer_seconds | Gauge | 视频缓冲时长 | > 2秒 |
| active_users | Gauge | 活跃用户数 | - |
| learning_duration_seconds | Counter | 学习时长统计 | - |

---

**文档结束**

本技术架构设计说明书基于Wendy-Arch1的功能设计文档编写，涵盖系统架构、技术选型、数据库设计、API设计、安全设计、部署架构等完整内容。请审核后确认是否进入代码开发阶段。
