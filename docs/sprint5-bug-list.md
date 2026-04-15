# Sprint 5 Bug 清单

**日期**: 2026-04-13
**状态**: ✅ 全部关闭

---

## Bug #1: getLiveStatus 与 checkTimeLimit 数据源不一致

- **描述**: `getLiveStatus` 使用 Redis 获取每日时长，而 `checkTimeLimit` 使用 LearningSession，导致同一用户在同一时间显示的今日学习时长不一致
- **复现步骤**:
  1. 家长登录系统
  2. 调用 `checkTimeLimit` 检查时间限制（使用 LearningSession）
  3. 调用 `getLiveStatus` 获取实时状态（使用 Redis）
  4. 对比两个接口返回的 dailyTime，数值不一致
- **影响模块**: GuardianService
- **优先级**: P1
- **状态**: ✅ 已修复
- **修复人**: @Jimie-dev1
- **修复详情**: `guardian.service.ts` 第89行改为 `await this.getTodayLearningMins(child.userId)`，注释明确标注"使用与 checkTimeLimit 一致的数据源：LearningSession"

---

## Bug #2: Assessment 及格后未自动解锁下一章节

- **描述**: `submitAssessment` 测验及格后仅更新能力画像和积分，未自动标记章节完成并解锁下一章节，导致解锁逻辑不完整
- **复现步骤**:
  1. 儿童完成章节学习
  2. 参加章节测验并及格
  3. 检查下一章节是否自动解锁
  4. 发现下一章节仍未解锁
- **影响模块**: AssessmentService
- **优先级**: P2
- **状态**: ✅ 已修复
- **修复人**: @Jimie-dev1
- **修复详情**:
  - `assessment.service.ts` 第355-384行添加及格后章节完成逻辑
  - 第363-375行：upsert ChapterProgress 标记 isCompleted=true
  - 第382行：调用 `unlockNextChapter(childId, chapter.courseId, chapter.sequence)`
  - 新增私有方法 `unlockNextChapter` (第537-566行)

---

## Bug #3: getCourseProgressList completedChapters 统计不准确

- **描述**: `getCourseProgressList` 中 completedChapters 的计算直接用 filter 判断章节 ID 是否存在，而不是检查 ChapterProgress 的 isCompleted 字段
- **复现步骤**:
  1. 儿童完成某课程的2个章节
  2. 调用 `getCourseProgressList`
  3. 查看 completedChapters 数量不正确
- **影响模块**: GuardianService
- **优先级**: P3
- **状态**: ✅ 已修复
- **修复人**: @Jimie-dev1
- **修复详情**: 改用 `prisma.chapterProgress.count({ where: { childId, chapterId: { in: chapterIds }, isCompleted: true } })`

---

## 历史遗留 Bug（已在本 Sprint 修复）

### Sprint 3 Bug 1: LearningRecord 缺少字段

- **描述**: `reportProgress` 写入 watchedSeconds/progress/completedAt 但 LearningRecord 模型缺少这些字段
- **修复**: 在 schema.prisma 中扩展 LearningRecord 模型添加这些字段

### Sprint 3 Bug 2: CompleteChapterDto 缺少 chapterId

- **描述**: DTO 只有 courseId 但 controller 调用 dto.chapterId
- **修复**: 在 CompleteChapterDto 添加 chapterId 字段

### Sprint 3 Bug 3: LearningRecord upsert 条件错误

- **描述**: where 子句使用 `id: ''` 永远无法匹配
- **修复**: 添加 `@@unique([childId, chapterId])` 并使用该约束进行 upsert

### Sprint 4 Bug 1: updateControlSettings 返回错误对象

- **描述**: 返回 `{ error: '监护设置不存在' }` 带 HTTP 200
- **修复**: 使用 req.user.sub 作为 parentId，让 service 抛出 NotFoundException

### Sprint 4 Bug 2: parentId 来源错误

- **描述**: 使用 setting[0].parentId 可能导致权限问题
- **修复**: 直接使用 req.user.sub

### Sprint 4 Bug 3: startSession 缺少存在性校验

- **描述**: 未验证 courseId/chapterId 是否存在
- **修复**: 添加 findUnique 检查

---

## 统计

| 优先级 | 发现数 | 修复数 | 关闭数 |
|--------|--------|--------|--------|
| P0 | 0 | 0 | 0 |
| P1 | 1 | 1 | 1 |
| P2 | 1 | 1 | 1 |
| P3 | 1 | 1 | 1 |
| **总计** | **3** | **3** | **3** |
