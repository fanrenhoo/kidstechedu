<template>
  <div class="points-page">
    <div class="page-header kid-header">
      <el-button @click="$router.back()" class="back-btn">← 返回</el-button>
      <h2>我的积分</h2>
      <div class="coins-display">
        <span class="coin-icon">&#9733;</span>
        <span class="coin-amount">{{ balance }}</span>
      </div>
    </div>

    <el-main>
      <div class="balance-card kid-card">
        <div class="balance-amount">
          <span class="coin-icon large">&#9733;</span>
          <span class="balance-number">{{ balance }}</span>
        </div>
        <div class="balance-detail">
          <div class="detail-item">
            <span class="label">Total Earned:</span>
            <span class="value earn">+{{ totalEarned }}</span>
          </div>
          <div class="detail-item">
            <span class="label">Total Redeemed:</span>
            <span class="value redeem">-{{ totalRedeemed }}</span>
          </div>
        </div>
      </div>

      <div class="history-section">
        <h3>Points History</h3>
        <div class="history-list">
          <div v-for="item in history" :key="item.id" class="history-item kid-card">
            <div class="history-icon" :class="item.type">
              <span v-if="item.type === 'earn'">+</span>
              <span v-else>-</span>
            </div>
            <div class="history-content">
              <div class="history-desc">{{ item.description }}</div>
              <div class="history-date">{{ formatDate(item.createdAt) }}</div>
            </div>
            <div class="history-amount" :class="item.type">
              {{ item.type === 'earn' ? '+' : '' }}{{ item.amount }}
            </div>
          </div>
        </div>
      </div>
    </el-main>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { getPointsBalance, getPointsHistory } from '../../api/points'
import type { PointsBalance, PointsHistoryItem } from '../../types'

const balance = ref(0)
const totalEarned = ref(0)
const totalRedeemed = ref(0)
const history = ref<PointsHistoryItem[]>([])

const formatDate = (dateStr: string) => {
  return new Date(dateStr).toLocaleDateString()
}

const fetchPoints = async () => {
  try {
    const [balanceRes, historyRes] = await Promise.all([
      getPointsBalance('child-001'),
      getPointsHistory('child-001')
    ])
    const b: PointsBalance = balanceRes.data
    balance.value = b.balance
    totalEarned.value = b.totalEarned
    totalRedeemed.value = b.totalRedeemed
    history.value = historyRes.data.items || historyRes.data
  } catch (error) {
    ElMessage.error('Failed to load points')
  }
}

onMounted(() => {
  fetchPoints()
})
</script>

<style scoped>
.points-page {
  min-height: 100vh;
  background: linear-gradient(135deg, #FFF9F0 0%, #FFE8D6 100%);
}

.page-header {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
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

.coin-icon.large {
  font-size: 36px;
}

.coin-amount {
  color: white;
  font-weight: 600;
  font-size: 18px;
}

.balance-card {
  padding: 24px;
  margin: 24px 0;
  text-align: center;
}

.balance-amount {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 20px;
}

.balance-number {
  font-size: 48px;
  font-weight: 700;
  color: #FF6B6B;
}

.balance-detail {
  display: flex;
  justify-content: center;
  gap: 40px;
}

.detail-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.detail-item .label {
  font-size: 12px;
  color: #666;
}

.detail-item .value {
  font-size: 18px;
  font-weight: 600;
}

.value.earn {
  color: #4ECDC4;
}

.value.redeem {
  color: #FF6B6B;
}

.history-section {
  margin-top: 24px;
}

.history-section h3 {
  font-size: 18px;
  color: #333;
  margin-bottom: 16px;
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.history-item {
  display: flex;
  align-items: center;
  padding: 16px;
  gap: 16px;
}

.history-icon {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 700;
}

.history-icon.earn {
  background: linear-gradient(135deg, #4ECDC4 0%, #6EE7DE 100%);
  color: white;
}

.history-icon.redeem {
  background: linear-gradient(135deg, #FF6B6B 0%, #FF8E8E 100%);
  color: white;
}

.history-content {
  flex: 1;
}

.history-desc {
  font-weight: 500;
  color: #333;
}

.history-date {
  font-size: 12px;
  color: #999;
  margin-top: 4px;
}

.history-amount {
  font-size: 18px;
  font-weight: 700;
}

.history-amount.earn {
  color: #4ECDC4;
}

.history-amount.redeem {
  color: #FF6B6B;
}
</style>
