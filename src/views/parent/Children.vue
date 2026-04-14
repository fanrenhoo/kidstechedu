<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'

// Placeholder - children data would come from API
const children = ref([
  { id: '1', username: 'child1', createdAt: '2024-01-01' }
])

const router = useRouter()

const goToMonitor = (childId: string) => {
  router.push(`/parent/monitor/${childId}`)
}

const goToSettings = (childId: string) => {
  router.push(`/parent/settings/${childId}`)
}
</script>

<template>
  <el-container>
    <el-header>
      <div class="header-content">
        <h2>管理孩子</h2>
        <div>
          <el-button type="primary" @click="$router.push('/register/child')">
            添加孩子
          </el-button>
          <el-button @click="$router.push('/parent/dashboard')">返回</el-button>
        </div>
      </div>
    </el-header>
    <el-main>
      <el-table :data="children" style="width: 100%">
        <el-table-column prop="username" label="用户名" />
        <el-table-column prop="createdAt" label="创建时间" />
        <el-table-column label="操作" width="200">
          <template #default="{ row }">
            <el-button type="primary" size="small" @click="goToMonitor(row.id)">
              监控
            </el-button>
            <el-button size="small" @click="goToSettings(row.id)">
              设置
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-main>
  </el-container>
</template>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>
