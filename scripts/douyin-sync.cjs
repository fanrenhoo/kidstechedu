/**
 * 抖音资源同步服务
 * 使用 Cookie 方案获取抖音账号视频列表并同步到数据库
 *
 * 使用方式:
 *   node scripts/douyin-sync.cjs              # 同步所有资源（定时）
 *   node scripts/douyin-sync.cjs --dry-run    # 模拟运行
 *   node scripts/douyin-sync.cjs --once        # 单次运行（非定时）
 */

const https = require('https');
const { Pool } = require('pg');

// 数据库配置
const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '04bc2791da2443faaf9ea95b614083ab',
  database: 'futurestar'
};

// 配置
const DOUYIN_COOKIE = process.env.DOUYIN_COOKIE || 'SyHF0TIk7-9GarqgLafRvqJykL2f7E2v9UuQgjhbPY5q5oj8Vox7nNW7yPirsqWG788_XLv64StXi49B6gxwnJsyOCWH18_WbDVONu1K4pVIZpAugLC4_icDJxeXf4OiQjuiRKeCKzM_TdD_Uw_-AZ6GMIF3m7WzoWCQSiCwj-ysao90pdIxHg==';
const DOUYIN_ACCOUNT_ID = '72829129075';
const API_BASE = 'www.douyin.com';

// 系统分类
const CATEGORIES = ['AI', '逻辑思维', '科学', '历史', '其它'];

// 分类关键词映射（用于自动分类）
const CATEGORY_KEYWORDS = {
  'AI': ['人工智能', 'AI', '机器学习', '深度学习', 'ChatGPT', '编程', '代码', '算法', 'Python', 'JavaScript'],
  '逻辑思维': ['逻辑', '思维', '思考', '推理', '奥数', '数学思维', '益智', 'puzzle', '逻辑思维'],
  '科学': ['科学', '物理', '化学', '生物', '实验', 'STEAM', '自然', '天文', '地理'],
  '历史': ['历史', '古代', '朝代', '人物', '故事', '成语', '文化', '传承'],
  '其它': []
};

// 数据库连接池
const pool = new Pool(DB_CONFIG);

/**
 * 执行 SQL 查询
 */
async function query(sql, params = []) {
  const client = await pool.connect();
  try {
    const result = await client.query(sql, params);
    return result;
  } finally {
    client.release();
  }
}

/**
 * 发送 HTTP 请求
 */
function httpRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        try {
          resolve(JSON.parse(body));
        } catch (e) {
          resolve(body);
        }
      });
    });
    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

/**
 * 获取抖音视频列表
 */
async function fetchDouyinVideos(cursor = 0, count = 18) {
  console.log(`📡 获取抖音视频列表... (cursor: ${cursor}, count: ${count})`);

  const options = {
    hostname: API_BASE,
    path: `/aweme/v1/web/aweme/post/?open_id=${DOUYIN_ACCOUNT_ID}&count=${count}&cursor=${cursor}&max_cursor=0&publish_video_strategy_type=2`,
    method: 'GET',
    headers: {
      'Cookie': DOUYIN_COOKIE,
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Referer': 'https://www.douyin.com/',
      'Accept': 'application/json',
    }
  };

  try {
    const response = await httpRequest(options);

    if (response.status_code !== undefined && response.status_code !== 0) {
      throw new Error(`抖音 API 错误: ${response.status_code} - ${response.status_msg || 'Unknown error'}`);
    }

    return {
      videos: response.aweme_list || [],
      hasMore: response.has_more === 1,
      cursor: response.cursor,
      total: response.total || 0
    };
  } catch (error) {
    console.error('❌ 获取视频列表失败:', error.message);
    throw error;
  }
}

/**
 * 根据标题/描述自动分类
 */
function autoClassify(title, desc) {
  const text = `${title} ${desc}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === '其它') continue;

    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        console.log(`   🔍 关键词匹配: "${keyword}" -> ${category}`);
        return category;
      }
    }
  }

  return '其它';
}

/**
 * 同步单个视频到数据库
 */
async function syncVideo(video, channelId) {
  const sourceId = video.aweme_id || video.id;
  const title = video.desc || video.title || '无标题';
  const desc = video.desc || '';
  const coverUrl = video.video?.cover?.url_list?.[0] || video.cover_url || '';
  const contentUrl = `https://www.douyin.com/video/${sourceId}`;
  const duration = video.video?.duration ? Math.floor(video.video.duration / 1000) : null;
  const publishedAt = video.create_time ? new Date(video.create_time * 1000) : null;
  const statistics = video.statistics || {};

  // 自动分类
  const category = autoClassify(title, desc);

  // 检查是否已存在
  const existingResult = await query(
    'SELECT id FROM course_resources WHERE source_platform = $1 AND source_id = $2',
    ['douyin', sourceId]
  );

  if (existingResult.rows.length > 0) {
    // 更新
    await query(
      `UPDATE course_resources SET
        title = $1, description = $2, cover_url = $3, category = $4,
        view_count = $5, like_count = $6, synced_at = NOW(), updated_at = NOW()
       WHERE id = $7`,
      [title, desc, coverUrl, category, statistics.play_count || 0, statistics.digg_count || 0, existingResult.rows[0].id]
    );
    return { action: 'updated', id: existingResult.rows[0].id };
  } else {
    // 创建
    const insertResult = await query(
      `INSERT INTO course_resources
        (channel_id, source_type, source_platform, source_id, title, description,
         cover_url, content_url, category, visible_to, status, duration,
         view_count, like_count, published_at, synced_at, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, NOW(), NOW(), NOW())
       RETURNING id`,
      [
        channelId, 'builtin', 'douyin', sourceId, title, desc,
        coverUrl, contentUrl, category, ['admin', 'parent', 'child'], 'active', duration,
        statistics.play_count || 0, statistics.digg_count || 0, publishedAt
      ]
    );
    return { action: 'created', id: insertResult.rows[0].id };
  }
}

/**
 * 同步所有视频
 */
async function syncAllVideos(dryRun = false) {
  console.log('🚀 抖音资源同步服务启动');
  console.log(`📋 同步账号: ${DOUYIN_ACCOUNT_ID}`);
  console.log(`🔧 模式: ${dryRun ? '模拟运行' : '实际同步'}`);
  console.log('');

  try {
    // 获取或创建渠道记录
    let channelResult = await query(
      'SELECT id FROM resource_channels WHERE platform = $1 AND account_id = $2',
      ['douyin', DOUYIN_ACCOUNT_ID]
    );

    let channelId;
    if (channelResult.rows.length === 0) {
      const insertResult = await query(
        `INSERT INTO resource_channels (platform, account_id, account_name, status, channel_url)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        ['douyin', DOUYIN_ACCOUNT_ID, '未来星学堂', 'active', `https://www.douyin.com/user/${DOUYIN_ACCOUNT_ID}`]
      );
      channelId = insertResult.rows[0].id;
      console.log('✅ 创建渠道记录:', channelId);
    } else {
      channelId = channelResult.rows[0].id;
    }

    // 创建同步日志
    const syncLogResult = await query(
      `INSERT INTO sync_logs (channel_id, sync_type, status, started_at)
       VALUES ($1, $2, $3, NOW()) RETURNING id`,
      [channelId, 'full', 'started']
    );
    const syncLogId = syncLogResult.rows[0].id;

    // 更新渠道状态
    await query(
      'UPDATE resource_channels SET status = $1 WHERE id = $2',
      ['syncing', channelId]
    );

    let totalAdded = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;
    let cursor = 0;
    const count = 18;
    let hasMore = true;

    while (hasMore) {
      const result = await fetchDouyinVideos(cursor, count);
      const videos = result.videos;

      console.log(`\n📦 获取到 ${videos.length} 个视频`);

      for (const video of videos) {
        const title = video.desc?.substring(0, 50) || '无标题';

        if (dryRun) {
          console.log(`   ⏩ [DRY-RUN] 将同步: ${title}...`);
          totalSkipped++;
        } else {
          try {
            const syncResult = await syncVideo(video, channelId);
            if (syncResult.action === 'created') {
              console.log(`   ✅ 新增: ${title}...`);
              totalAdded++;
            } else if (syncResult.action === 'updated') {
              console.log(`   🔄 更新: ${title}...`);
              totalUpdated++;
            }
          } catch (error) {
            console.error(`   ❌ 同步失败: ${error.message}`);
            totalSkipped++;
          }
        }
      }

      hasMore = result.hasMore;
      cursor += videos.length;
      console.log(`   进度: ${cursor} / ${result.total || '?'} | hasMore: ${hasMore}`);

      if (videos.length === 0) break;
    }

    // 更新同步日志
    await query(
      `UPDATE sync_logs SET
        status = $1, items_total = $2, items_added = $3,
        items_updated = $4, items_skipped = $5, completed_at = NOW()
       WHERE id = $6`,
      ['success', totalAdded + totalUpdated + totalSkipped, totalAdded, totalUpdated, totalSkipped, syncLogId]
    );

    // 更新渠道状态
    await query(
      'UPDATE resource_channels SET status = $1, last_sync_at = NOW() WHERE id = $2',
      ['active', channelId]
    );

    console.log('\n📊 同步完成:');
    console.log(`   - 新增: ${totalAdded}`);
    console.log(`   - 更新: ${totalUpdated}`);
    console.log(`   - 跳过: ${totalSkipped}`);
    console.log(`   - 日志: ${syncLogId}`);

  } catch (error) {
    console.error('\n❌ 同步失败:', error.message);
    throw error;
  }
}

/**
 * 主函数
 */
async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  const once = args.includes('--once');

  try {
    await syncAllVideos(dryRun);

    if (!once) {
      // 定时同步（每小时一次）
      console.log('\n⏰ 设置定时同步（每小时）...');
      setInterval(() => {
        syncAllVideos(dryRun).catch(console.error);
      }, 60 * 60 * 1000);
    }
  } catch (error) {
    console.error('❌ 同步服务异常退出:', error);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

// 运行
main();
