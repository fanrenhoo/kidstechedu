<template>
  <div class="badges-page">
    <div class="page-header kid-header">
      <el-button @click="$router.back()" class="back-btn">← 返回</el-button>
      <h2>我的徽章</h2>
      <div class="coins-display">
        <span class="coin-icon">&#9733;</span>
        <span class="coin-amount">{{ balance }}</span>
      </div>
    </div>

    <el-main>
      <el-tabs v-model="activeTab" class="kid-tabs">
        <el-tab-pane label="All Badges" name="all">
          <div class="badges-grid">
            <div v-for="badge in allBadges" :key="badge.type" class="badge-card kid-card">
              <div class="badge-icon-wrapper">
                <img :src="badge.iconUrl" :alt="badge.name" class="badge-icon" />
              </div>
              <div class="badge-name">{{ badge.name }}</div>
              <div class="badge-desc">{{ badge.description }}</div>
              <div v-if="isEarned(badge.type)" class="badge-earned">
                <span class="earned-check">&#10003;</span> Earned
              </div>
              <div v-else class="badge-locked">Locked</div>
            </div>
          </div>
        </el-tab-pane>

        <el-tab-pane label="My Badges" name="mine">
          <div class="badges-grid" v-if="myBadges.length > 0">
            <div v-for="badge in myBadges" :key="badge.type" class="badge-card kid-card earned">
              <div class="badge-icon-wrapper">
                <img :src="badge.iconUrl" :alt="badge.name" class="badge-icon" />
              </div>
              <div class="badge-name">{{ badge.name }}</div>
              <div class="badge-desc">{{ badge.description }}</div>
              <div class="badge-earned-date">
                Earned: {{ formatDate(badge.earnedAt) }}
              </div>
            </div>
          </div>
          <div v-else class="empty-state kid-card">
            <p>No badges earned yet. Keep learning!</p>
          </div>
        </el-tab-pane>
      </el-tabs>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getAllBadges, getMyBadges, earnBadge } from '../../api/badges'
import type { Badge, EarnedBadge } from '../../types'

const activeTab = ref('all')
const allBadges = ref<Badge[]>([])
const myBadges = ref<(EarnedBadge & Badge)[]>([])
const balance = ref(0)

const isEarned = (type: string) => {
  return myBadges.value.some(b => b.type === type)
}

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString()
}

const fetchBadges = async () => {
  try {
    const [allRes, mineRes] = await Promise.all([
      getAllBadges(),
      getMyBadges('child-001')
    ])
    allBadges.value = allRes.data
    myBadges.value = mineRes.data
  } catch (error) {
    ElMessage.error('Failed to load badges')
  }
}

onMounted(() => {
  fetchBadges()
})
</script>

<style scoped>
.badges-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFF9F0 0%, #FFE8D6 100%);
}

.page-header {
  background: linear-gradient(135deg, #4ECDC4 0%, #6EE7DE 100%);
  border-radius: 0 0 24px 24px;
  padding: 24px 32px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.back-btn {
  background: rgba(255,255,255,0.3);
  border: none;
  color: white;
  font-weight: 600;
  border-radius: 20px;
  padding: 8px 16px;
}

.back-btn:hover {
  background: rgba(255,255,255,0.4);
}

.page-header h2 {
  color: white;
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.coins-display {
  display: flex;
  align-items: center;
  gap: 8px;
  background: rgba(255,255,255,0.2);
  padding: 8px 16px;
  border-radius: 20px;
}

.coin-icon {
  color: #FFE66D;
  font-size: 20px;
}

.coin-amount {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.badges-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 20px;
  padding: 20px 0;
}

.badge-card {
  padding: 20px;
  text-align: center;
  transition: transform 0.3s;
}

.badge-card:hover {
  transform: translateY(-4px);
}

.badge-card.earned {
  border: 3px solid #4ECDC4;
}

.badge-icon-wrapper {
  width: 80px;
  height: 80px;
  margin: 0 auto 12px;
  border-radius: 50%;
  overflow: hidden;
  background: linear-gradient(135deg, #FFE66D 0%, #FFF0A0 100%);
  padding: 8px;
}

.badge-icon {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.badge-name {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 8px;
}

.badge-desc {
  font-size: 12px;
  color: #666;
  margin-bottom: 12px;
}

.badge-earned {
  color: #4ECDC4;
  font-weight: 600;
}

.badge-locked {
  color: #999;
  font-size: 12px;
}

.badge-earned-date {
  font-size: 11px;
  color: #999;
  margin-top: 8px;
}

.empty-state {
  padding: 40px;
  text-align: center;
  color: #666;
}

.kid-tabs :deep(.el-tabs__item) {
  font-weight: 600;
}

.kid-tabs :deep(.el-tabs__item.is-active) {
  color: #4ECDC4;
}

.kid-tabs :deep(.el-tabs__active-bar) {
  background-color: #4ECDC4;
}
</style>
