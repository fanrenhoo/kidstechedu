<script setup lang="ts">
import { ref } from 'vue'
import BaseLayout from '@/components/BaseLayout.vue'

const douyinAccountId = '72829129075'
const douyinUrl = `https://www.douyin.com/user/${douyinAccountId}`

const openDouyin = () => {
  window.open(douyinUrl, '_blank')
}
</script>

<template>
  <BaseLayout title="管理后台">
    <template #header-actions>
      <el-button @click="$router.push('/admin/dashboard')">← 返回</el-button>
    </template>

    <!-- 抖音资源链接 -->
    <el-card shadow="hover" class="douyin-card" @click="openDouyin">
      <div class="douyin-content">
        <div class="douyin-icon">🎬</div>
        <div class="douyin-info">
          <h2>抖音课程资源</h2>
          <p>账号：{{ douyinAccountId }}</p>
          <p class="description">点击打开抖音账号，在抖音 App 或网页版观看课程视频</p>
        </div>
        <el-button type="primary" size="large">
          前往抖音 →
        </el-button>
      </div>
    </el-card>

    <el-card style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>资源说明</span>
        </div>
      </template>
      <el-alert type="info" :closable="false">
        <template #title>
          <p><strong>抖音课程方案：</strong></p>
          <ul style="margin: 10px 0 0 0; padding-left: 20px;">
            <li>点击上方卡片直接跳转到抖音账号页面</li>
            <li>在抖音 App 或网页版观看视频内容</li>
            <li>内容实时更新，无需同步</li>
            <li>支持 AI / 逻辑思维 / 科学 / 历史 等分类视频</li>
          </ul>
        </template>
      </el-alert>
    </el-card>

    <!-- 快捷操作 -->
    <el-card class="quick-actions" style="margin-top: 20px;">
      <template #header>
        <div class="card-header">
          <span>快捷操作</span>
        </div>
      </template>
      <el-space wrap>
        <el-button type="primary" @click="$router.push('/admin/courses')">
          课程管理
        </el-button>
        <el-button type="primary" @click="$router.push('/admin/resources')">
          资源管理
        </el-button>
      </el-space>
    </el-card>
  </BaseLayout>
</template>

<style scoped>
.douyin-card {
  cursor: pointer;
  transition: all 0.3s;
}
.douyin-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.15);
}
.douyin-content {
  display: flex;
  align-items: center;
  gap: 24px;
  padding: 20px;
}
.douyin-icon {
  font-size: 64px;
}
.douyin-info {
  flex: 1;
}
.douyin-info h2 {
  margin: 0 0 8px 0;
  font-size: 24px;
}
.douyin-info p {
  margin: 4px 0;
  color: #666;
}
.douyin-info .description {
  font-size: 14px;
  color: #999;
}
.card-header {
  font-weight: bold;
}
</style>