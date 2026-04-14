<script setup lang="ts">
import { useAuthStore } from '../stores/auth'
import { useRouter } from 'vue-router'
import { onMounted } from 'vue'

const authStore = useAuthStore()
const router = useRouter()

onMounted(() => {
  if (authStore.isAuthenticated) {
    if (authStore.isParent) {
      router.push('/parent/dashboard')
    } else {
      router.push('/child/dashboard')
    }
  }
})
</script>

<template>
  <div class="home">
    <el-container>
      <el-header>
        <h1>少儿未来素质教育平台</h1>
      </el-header>
      <el-main>
        <el-row :gutter="20">
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>家长端</span>
                </div>
              </template>
              <p>管理孩子的学习进度，设置时间限制，监控学习情况</p>
              <el-button type="primary" @click="$router.push('/login')">
                登录
              </el-button>
              <el-button @click="$router.push('/register/parent')">
                注册
              </el-button>
            </el-card>
          </el-col>
          <el-col :span="12">
            <el-card shadow="hover">
              <template #header>
                <div class="card-header">
                  <span>儿童端</span>
                </div>
              </template>
              <p>浏览课程，观看视频，完成测验，记录学习进度</p>
              <el-button type="primary" @click="$router.push('/login')">
                登录
              </el-button>
            </el-card>
          </el-col>
        </el-row>
      </el-main>
    </el-container>
  </div>
</template>

<style scoped>
.home {
  padding: 20px;
}
.card-header {
  font-size: 18px;
  font-weight: bold;
}
</style>
