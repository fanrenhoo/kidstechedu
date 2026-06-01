/**
 * 抖音资源同步服务 - Playwright API 拦截版本
 * 使用 Playwright 拦截网络请求来获取视频数据
 */

const { chromium } = require('playwright');
const { Pool } = require('pg');

// 数据库配置
const DB_CONFIG = {
  host: 'localhost',
  port: 5432,
  user: 'postgres',
  password: '04bc2791da2443faaf9ea95b614083ab',
  database: 'futurestar'
};

const DOUYIN_ACCOUNT_ID = '72829129075';
const DOUYIN_URL = `https://www.douyin.com/user/${DOUYIN_ACCOUNT_ID}`;

const CATEGORY_KEYWORDS = {
  'AI': ['人工智能', 'AI', '机器学习', '深度学习', 'ChatGPT', '编程', '代码', '算法', 'Python'],
  '逻辑思维': ['逻辑', '思维', '思考', '推理', '奥数', '数学思维', '益智'],
  '科学': ['科学', '物理', '化学', '生物', '实验', 'STEAM', '自然'],
  '历史': ['历史', '古代', '朝代', '人物', '故事', '成语', '文化'],
  '其它': []
};

const pool = new Pool(DB_CONFIG);

async function query(sql, params = []) {
  const client = await pool.connect();
  try {
    return await client.query(sql, params);
  } finally {
    client.release();
  }
}

function autoClassify(title, desc) {
  const text = `${title} ${desc}`.toLowerCase();
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (category === '其它') continue;
    for (const keyword of keywords) {
      if (text.includes(keyword.toLowerCase())) {
        console.log(`   🔍 匹配: "${keyword}" -> ${category}`);
        return category;
      }
    }
  }
  return '其它';
}

async function syncWithPlaywright(dryRun = false) {
  console.log('🚀 抖音资源同步服务 (Playwright API 拦截版)');
  console.log(`📋 同步账号: ${DOUYIN_ACCOUNT_ID}`);
  console.log(`🔧 模式: ${dryRun ? '模拟运行' : '实际同步'}`);
  console.log('');

  let browser;
  let capturedVideos = [];
  let syncLogId, channelId;

  try {
    console.log('🌐 启动浏览器...');
    browser = await chromium.launch({
      headless: true,
      args: [
        '--no-sandbox',
        '--disable-setuid-sandbox',
        '--disable-dev-shm-usage',
        '--disable-gpu',
        '--disable-web-security'
      ]
    });

    const context = await browser.newContext({
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      viewport: { width: 1920, height: 1080 }
    });

    const page = await context.newPage();

    // 拦截 API 请求
    console.log('🔍 设置请求拦截...');
    await page.route('**/aweme/v1/web/aweme/post/**', (route, request) => {
      const url = request.url();
      console.log(`📡 拦截请求: ${url.substring(0, 80)}...`);
    });

    // 监听响应
    page.on('response', async (response) => {
      const url = response.url();
      if (url.includes('aweme/v1/web/aweme/post')) {
        try {
          const json = await response.json();
          if (json.aweme_list && json.aweme_list.length > 0) {
            console.log(`✅ 捕获到 ${json.aweme_list.length} 个视频`);
            capturedVideos = json.aweme_list;
          }
        } catch (e) {}
      }
    });

    // 设置 Cookie
    const cookieValue = process.env.DOUYIN_COOKIE || 'JTBfydIfO-T-uRBCzOtm5mRoy5nTqPTlObMd4DXcAWvUsro3PB1qUvG-VBt5b65Il_uJC5TY6vWDCHPgqmGevBlZ24mh2MeQX5TB5XvLlFFvtE6aKTsPGJTNdiK2ERq2E2s_odz_nTWOVuP_8M4EaZ7cnw7IvRlq5GEyAlcCL7_-jinVghmt6w==';

    await context.addCookies([
      { name: 'sessionid', value: cookieValue, domain: '.douyin.com', path: '/' }
    ]);

    // 访问页面
    console.log(`📱 访问 ${DOUYIN_URL}...`);
    await page.goto(DOUYIN_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });

    // 等待数据加载
    console.log('⏳ 等待数据...');
    await page.waitForTimeout(5000);

    // 如果没有捕获到，尝试从页面提取
    if (capturedVideos.length === 0) {
      console.log('📄 尝试从页面提取数据...');
      capturedVideos = await page.evaluate(() => {
        // 查找页面上的视频数据
        const dataMatch = document.body.innerHTML.match(/"aweme_list":\[(.*?)\]/);
        if (dataMatch) {
          try {
            return JSON.parse('[' + dataMatch[1] + ']');
          } catch (e) {}
        }
        return [];
      });
    }

    console.log(`\n📊 获取到 ${capturedVideos.length} 个视频`);

    // 获取或创建渠道记录
    let channelResult = await query(
      'SELECT id FROM resource_channels WHERE platform = $1 AND account_id = $2',
      ['douyin', DOUYIN_ACCOUNT_ID]
    );

    if (channelResult.rows.length === 0) {
      const insertResult = await query(
        `INSERT INTO resource_channels (platform, account_id, account_name, status, channel_url)
         VALUES ($1, $2, $3, $4, $5) RETURNING id`,
        ['douyin', DOUYIN_ACCOUNT_ID, '未来星学堂', 'active', DOUYIN_URL]
      );
      channelId = insertResult.rows[0].id;
    } else {
      channelId = channelResult.rows[0].id;
    }

    // 创建同步日志
    const syncLogResult = await query(
      `INSERT INTO sync_logs (channel_id, sync_type, status, started_at)
       VALUES ($1, $2, $3, NOW()) RETURNING id`,
      [channelId, 'full', 'started']
    );
    syncLogId = syncLogResult.rows[0].id;

    await query('UPDATE resource_channels SET status = $1 WHERE id = $2', ['syncing', channelId]);

    let totalAdded = 0;
    let totalUpdated = 0;
    let totalSkipped = 0;

    // 处理每个视频
    for (const video of capturedVideos) {
      const sourceId = video.aweme_id;
      const title = video.desc || '无标题';
      const category = autoClassify(title, '');

      if (dryRun) {
        console.log(`   ⏩ [DRY-RUN] ${title.substring(0, 40)}... -> ${category}`);
        totalSkipped++;
      } else {
        const existing = await query(
          'SELECT id FROM course_resources WHERE source_platform = $1 AND source_id = $2',
          ['douyin', sourceId]
        );

        if (existing.rows.length > 0) {
          console.log(`   🔄 更新: ${title.substring(0, 40)}...`);
          totalUpdated++;
        } else {
          const coverUrl = video.video?.cover?.url_list?.[0] || '';
          const contentUrl = `https://www.douyin.com/video/${sourceId}`;

          await query(
            `INSERT INTO course_resources
              (channel_id, source_type, source_platform, source_id, title, description,
               cover_url, content_url, category, visible_to, status, synced_at)
             VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
            [channelId, 'builtin', 'douyin', sourceId, title, video.desc || '',
             coverUrl, contentUrl, category, ['admin', 'parent', 'child'], 'active']
          );
          console.log(`   ✅ 新增: ${title.substring(0, 40)}...`);
          totalAdded++;
        }
      }
    }

    // 更新日志
    await query(
      `UPDATE sync_logs SET
        status = $1, items_total = $2, items_added = $3,
        items_updated = $4, items_skipped = $5, completed_at = NOW()
       WHERE id = $6`,
      ['success', totalAdded + totalUpdated + totalSkipped, totalAdded, totalUpdated, totalSkipped, syncLogId]
    );

    await query(
      'UPDATE resource_channels SET status = $1, last_sync_at = NOW() WHERE id = $2',
      ['active', channelId]
    );

    console.log('\n📊 同步完成:');
    console.log(`   - 新增: ${totalAdded}`);
    console.log(`   - 更新: ${totalUpdated}`);
    console.log(`   - 跳过: ${totalSkipped}`);

  } catch (error) {
    console.error('\n❌ 同步失败:', error.message);

    if (syncLogId) {
      await query(`UPDATE sync_logs SET status = $1, error_message = $2, completed_at = NOW() WHERE id = $3`,
        ['failed', error.message, syncLogId]).catch(() => {});
    }
    if (channelId) {
      await query(`UPDATE resource_channels SET status = $1, last_error = $2 WHERE id = $3`,
        ['error', error.message, channelId]).catch(() => {});
    }

    throw error;
  } finally {
    if (browser) await browser.close();
  }
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');

  try {
    await syncWithPlaywright(dryRun);
  } catch (error) {
    console.error('❌ 退出:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

main();
