<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useCourseStore } from '../../stores/course'
import { COURSE_CATEGORIES, type CourseCategory } from '../../constants'

const courseStore = useCourseStore()

const selectedCategory = ref<CourseCategory>('all')
const douyinAccountId = '72829129075'
const douyinUrl = `https://www.douyin.com/user/${douyinAccountId}`

const filteredCourses = computed(() => {
  if (selectedCategory.value === 'all') {
    return courseStore.courses
  }
  return courseStore.courses.filter(course =>
    course.category === selectedCategory.value
  )
})

onMounted(async () => {
  await courseStore.fetchCourses()
})

const goToCourse = (courseId: string) => {
  window.location.href = '/child/course/' + courseId
}

const openDouyin = () => {
  window.open(douyinUrl, '_blank')
}
</script>

<template>
  <el-container>
    <el-header>
      <div class="header-content">
        <h2>课程列表</h2>
        <el-button @click="$router.push('/child/dashboard')">返回</el-button>
      </div>
    </el-header>
    <el-main>
      <!-- Category Tabs -->
      <div class="category-tabs">
        <el-radio-group v-model="selectedCategory" size="large">
          <el-radio-button
            v-for="cat in COURSE_CATEGORIES"
            :key="cat.value"
            :value="cat.value"
          >
            {{ cat.label }}
          </el-radio-button>
          <el-radio-button value="douyin">
            🎵 抖音课程
          </el-radio-button>
        </el-radio-group>
      </div>

      <!-- Douyin Entry Card -->
      <el-card v-if="selectedCategory === 'douyin'" class="douyin-card" shadow="hover" @click="openDouyin">
        <div class="douyin-content">
          <div class="douyin-icon">🎬</div>
          <div class="douyin-info">
            <h3>抖音课程中心</h3>
            <p>账号：{{ douyinAccountId }}</p>
            <p class="description">点击前往抖音观看课程视频，包含 AI、逻辑思维、科学、历史等内容</p>
          </div>
          <el-button type="danger" size="large">
            前往抖音 →
          </el-button>
        </div>
      </el-card>

      <!-- Course Grid -->
      <el-row :gutter="20" class="course-grid">
        <el-col :span="8" v-for="course in filteredCourses" :key="course.id">
          <el-card shadow="hover" class="course-card" @click="goToCourse(course.id)">
            <template #header>
              <div class="card-header">{{ course.title }}</div>
            </template>
            <img :src="course.coverImage" class="cover-image" />
            <p class="description">{{ course.description }}</p>
            <el-divider />
            <div class="course-info">
              <span>教师：{{ course.teacher.name }}</span>
              <span>章节：{{ course.totalChapters }}</span>
            </div>
            <div class="course-tags">
              <el-tag type="success">{{ course.category }}</el-tag>
            </div>
          </el-card>
        </el-col>
      </el-row>
      <el-empty v-if="filteredCourses.length === 0" description="暂无课程" />
    </el-main>
  </el-container>
</template>

<style scoped>
.header-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
.category-tabs {
  margin-bottom: 20px;
  padding: 10px 0;
}
.course-grid {
  margin-top: 10px;
}
.course-card {
  cursor: pointer;
  margin-bottom: 20px;
}
.cover-image {
  width: 100%;
  height: 150px;
  object-fit: cover;
}
.description {
  margin: 10px 0;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.course-info {
  display: flex;
  justify-content: space-between;
  font-size: 14px;
  color: #666;
}
.course-tags {
  margin-top: 10px;
}
.douyin-card {
  cursor: pointer;
  margin: 20px 0;
  background: linear-gradient(135deg, #FEE2E2 0%, #DBEAFE 100%);
  border: 2px solid #FF6B6B;
}
.douyin-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 16px rgba(255, 107, 107, 0.3);
}
.douyin-content {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 10px;
}
.douyin-icon {
  font-size: 48px;
}
.douyin-info {
  flex: 1;
}
.douyin-info h3 {
  margin: 0 0 4px 0;
  font-size: 20px;
}
.douyin-info p {
  margin: 4px 0;
  color: #666;
}
.douyin-info .description {
  font-size: 14px;
  color: #888;
}
</style>