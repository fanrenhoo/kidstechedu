<script setup lang="ts">
import { useRouter } from 'vue-router'

defineProps<{
  title: string
  showBack?: boolean
  loading?: boolean
}>()

const router = useRouter()

const goBack = () => {
  router.back()
}
</script>

<template>
  <el-container>
    <el-header class="kid-header">
      <div class="header-content">
        <div class="header-left">
          <el-button v-if="showBack" text @click="goBack">
            ← 返回
          </el-button>
          <h2>{{ title }}</h2>
        </div>
        <div class="header-right">
          <slot name="header-actions" />
        </div>
      </div>
    </el-header>
    <el-main v-loading="loading">
      <slot />
    </el-main>
  </el-container>
</template>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  height: 100%;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.header-left h2 {
  margin: 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}
</style>
