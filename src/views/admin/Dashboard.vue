<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { getCourses } from '@/api/course'
import { useAuthStore } from '@/stores/auth'
import BaseLayout from '@/components/BaseLayout.vue'
import { ElMessage } from 'element-plus'

const authStore = useAuthStore()

const stats = ref({
  totalCourses: 0,
  totalChildren: 0,
  activeParents: 0
})

const loading = ref(false)

onMounted(async () => {
  loading.value = true
  try {
    const coursesRes = await getCourses()
    if (coursesRes.data?.items) {
      stats.value.totalCourses = coursesRes.data.items.length
    }
  } catch (e) {
    ElMessage.error('加载统计数据失败')
  } finally {
    loading.value = false
  }
})

function handleLogout() {
  authStore.logout()
}
</script>

<template>
  <BaseLayout title="管理后台">
    <template #header-actions>
      <el-button @click="handleLogout">退出登录</el-button>
    </template>
    <el-row :gutter="20">
      <el-col :span="8">
        <el-card v-loading="loading" class="stat-card" shadow="hover">
          <div class="stat-icon courses-icon">📚</div>
          <div class="stat-value">{{ stats.totalCourses }}</div>
          <div class="stat-label">课程总数</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card v-loading="loading" class="stat-card" shadow="hover">
          <div class="stat-icon children-icon">👶</div>
          <div class="stat-value">{{ stats.totalChildren }}</div>
          <div class="stat-label">在册儿童</div>
        </el-card>
      </el-col>
      <el-col :span="8">
        <el-card v-loading="loading" class="stat-card" shadow="hover">
          <div class="stat-icon parents-icon">👨‍👩‍👧</div>
          <div class="stat-value">{{ stats.activeParents }}</div>
          <div class="stat-label">活跃家长</div>
        </el-card>
      </el-col>
    </el-row>

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
.stat-card {
  text-align: center;
  padding: 20px;
}

.stat-icon {
  font-size: 48px;
  margin-bottom: 10px;
}

.stat-value {
  font-size: 36px;
  font-weight: bold;
  color: var(--kid-primary, #FF6B6B);
}

.stat-label {
  font-size: 14px;
  color: #666;
  margin-top: 5px;
}

.card-header {
  font-weight: bold;
}
</style>
