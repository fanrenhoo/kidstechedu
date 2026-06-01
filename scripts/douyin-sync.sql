-- 抖音资源同步表结构
-- 执行: psql -U postgres -d futurestar -f scripts/douyin-sync.sql

-- 资源渠道表
CREATE TABLE IF NOT EXISTS resource_channels (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    platform VARCHAR(20) NOT NULL DEFAULT 'douyin',  -- 'douyin', 'bilibili', 'xiaohongshu'
    account_id VARCHAR(100) NOT NULL,                 -- 外部平台账号ID
    account_name VARCHAR(255),                        -- 账号名称
    channel_url VARCHAR(500),                         -- 频道/合集链接
    status VARCHAR(20) NOT NULL DEFAULT 'pending',    -- 'pending', 'active', 'syncing', 'error'
    last_sync_at TIMESTAMP,                           -- 最后同步时间
    last_error TEXT,                                  -- 最后错误信息
    sync_interval INTEGER DEFAULT 86400,              -- 同步间隔（秒），默认24小时
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_platform_account UNIQUE(platform, account_id)
);

-- 课程资源表
CREATE TABLE IF NOT EXISTS course_resources (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    channel_id VARCHAR(36),                           -- 关联的资源渠道
    source_type VARCHAR(20) NOT NULL DEFAULT 'builtin', -- 'builtin', 'admin', 'aggregated'
    source_platform VARCHAR(20) NOT NULL,              -- 来源平台: 'douyin', 'bilibili', 'xiaohongshu'
    source_id VARCHAR(100) NOT NULL,                   -- 外部平台内容ID
    title VARCHAR(500) NOT NULL,                       -- 资源标题
    description TEXT,                                 -- 资源描述
    cover_url VARCHAR(500),                            -- 封面图
    content_url VARCHAR(500) NOT NULL,                 -- 内容链接（视频播放页）
    embed_code TEXT,                                  -- 嵌入代码
    category VARCHAR(50) NOT NULL DEFAULT '其它',      -- 分类: AI, 逻辑思维, 科学, 历史, 其它
    tags VARCHAR(255)[],                               -- 标签
    duration INTEGER,                                  -- 时长（秒）
    view_count INTEGER DEFAULT 0,                      -- 播放量
    like_count INTEGER DEFAULT 0,                      -- 点赞数
    visible_to VARCHAR(20)[] DEFAULT ARRAY['admin', 'parent', 'child'], -- 可见角色
    status VARCHAR(20) DEFAULT 'active',              -- 'active', 'hidden', 'deleted'
    published_at TIMESTAMP,                            -- 原发布时间
    synced_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,    -- 同步到本系统的时间
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_source UNIQUE(source_platform, source_id),
    FOREIGN KEY (channel_id) REFERENCES resource_channels(id) ON DELETE SET NULL
);

-- 分类映射表（抖音合集 -> 系统分类）
CREATE TABLE IF NOT EXISTS category_mappings (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    platform VARCHAR(20) NOT NULL,                    -- 'douyin'
    source_category VARCHAR(100) NOT NULL,            -- 抖音原始分类/合集名
    target_category VARCHAR(50) NOT NULL,             -- 系统分类: AI, 逻辑思维, 科学, 历史, 其它
    keywords VARCHAR(255)[],                           -- 关键词匹配
    priority INTEGER DEFAULT 0,                        -- 优先级
    is_auto_match BOOLEAN DEFAULT false,              -- 是否自动匹配
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT unique_platform_source UNIQUE(platform, source_category)
);

-- 同步日志表
CREATE TABLE IF NOT EXISTS sync_logs (
    id VARCHAR(36) PRIMARY KEY DEFAULT gen_random_uuid()::text,
    channel_id VARCHAR(36),                           -- 关联的资源渠道
    sync_type VARCHAR(20) NOT NULL,                    -- 'full', 'incremental', 'manual'
    status VARCHAR(20) NOT NULL,                      -- 'started', 'success', 'failed'
    items_total INTEGER DEFAULT 0,                     -- 总数
    items_added INTEGER DEFAULT 0,                     -- 新增数
    items_updated INTEGER DEFAULT 0,                   -- 更新数
    items_skipped INTEGER DEFAULT 0,                   -- 跳过数
    error_message TEXT,
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP
);

-- 初始化分类映射
INSERT INTO category_mappings (platform, source_category, target_category, keywords, priority, is_auto_match)
VALUES
    ('douyin', 'AI', 'AI', ARRAY['人工智能', 'AI', '机器学习', '深度学习', 'ChatGPT', '编程'], 10, true),
    ('douyin', '逻辑思维', '逻辑思维', ARRAY['逻辑', '思维', '思考', '推理', '奥数', '数学思维'], 10, true),
    ('douyin', '科学', '科学', ARRAY['科学', '物理', '化学', '生物', '实验', 'STEAM'], 10, true),
    ('douyin', '历史', '历史', ARRAY['历史', '古代', '朝代', '人物', '故事'], 10, true)
ON CONFLICT (platform, source_category) DO NOTHING;

-- 初始化抖音资源渠道
INSERT INTO resource_channels (platform, account_id, account_name, status, channel_url)
VALUES ('douyin', '72829129075', '未来星学堂', 'active', 'https://www.douyin.com/user/72829129075')
ON CONFLICT (platform, account_id) DO NOTHING;

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_course_resources_category ON course_resources(category);
CREATE INDEX IF NOT EXISTS idx_course_resources_channel ON course_resources(channel_id);
CREATE INDEX IF NOT EXISTS idx_course_resources_status ON course_resources(status);
CREATE INDEX IF NOT EXISTS idx_course_resources_visible ON course_resources USING GIN(visible_to);
CREATE INDEX IF NOT EXISTS idx_sync_logs_channel ON sync_logs(channel_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created ON sync_logs(created_at DESC);

COMMENT ON TABLE resource_channels IS '资源渠道表 - 存储外部平台账号信息';
COMMENT ON TABLE course_resources IS '课程资源表 - 存储从外部平台同步的课程/视频';
COMMENT ON TABLE category_mappings IS '分类映射表 - 外部平台分类到系统分类的映射';
COMMENT ON TABLE sync_logs IS '同步日志表 - 记录同步操作历史';
