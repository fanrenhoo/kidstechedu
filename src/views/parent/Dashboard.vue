<script setup lang="ts">
import { useAuthStore } from '../../stores/auth'

const authStore = useAuthStore()

const handleLogout = () => {
  authStore.logout()
}
</script>

<template>
  <el-container>
    <el-header>
      <div class="header-content">
        <h2>家长端</h2>
        <div class="header-actions">
          <span>欢迎，{{ authStore.user?.profile?.name || '家长' }}</span>
          <el-button @click="handleLogout">退出登录</el-button>
        </div>
      </div>
    </el-header>
    <el-main>
      <el-row :gutter="20">
        <el-col :span="8">
          <el-card shadow="hover" @click="$router.push('/parent/children')">
            <template #header>
              <div class="card-header">管理孩子</div>
            </template>
            <p>查看和管理孩子的账号、设置学习时间</p>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">实时监控</div>
            </template>
            <p>查看孩子的实时学习状态和进度</p>
          </el-card>
        </el-col>
        <el-col :span="8">
          <el-card shadow="hover">
            <template #header>
              <div class="card-header">学习报告</div>
            </template>
            <p>查看孩子的学习历史和课程完成情况</p>
          </el-card>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.header-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}
.card-header {
  font-size: 18px;
  font-weight: bold;
}
</style>
