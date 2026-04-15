import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class LearningService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // ==================== 更新学习进度 ====================

  async updateProgress(childId: string, data: {
    courseId: string;
    chapterId: string;
    videoProgress?: number;
    interactionsCompleted?: string[];
  }) {
    const { courseId, chapterId, videoProgress, interactionsCompleted } = data;

    // 更新章节进度
    const existing = await this.prisma.chapterProgress.findUnique({
      where: { childId_chapterId: { childId, chapterId } },
    });

    const progress = await this.prisma.chapterProgress.upsert({
      where: { childId_chapterId: { childId, chapterId } },
      create: {
        childId,
        chapterId,
        videoProgress: videoProgress || 0,
        interactionCompleted: interactionsCompleted || [],
        lastAccessedAt: new Date(),
      },
      update: {
        videoProgress: videoProgress !== undefined ? videoProgress : existing?.videoProgress,
        interactionCompleted: interactionsCompleted ?? (existing?.interactionCompleted ?? undefined),
        lastAccessedAt: new Date(),
        ...(videoProgress === 100 ? { isCompleted: true, completedAt: new Date() } : {}),
      },
    });

    // 更新课程整体进度
    await this.updateCourseProgress(childId, courseId);

    // 记录学习行为
    await this.logLearningEvent(childId, {
      eventType: 'video_progress',
      courseId,
      chapterId,
      eventData: { videoProgress },
    });

    // 清除缓存
    await this.redis.del(`progress:user:${childId}:course:${courseId}`);

    return progress;
  }

  // ==================== 完成章节 ====================

  async completeChapter(childId: string, chapterId: string): Promise<any> {
    const chapter = await this.prisma.courseChapter.findUnique({
      where: { id: chapterId },
      include: { course: true },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    // 更新 ChapterProgress
    await this.prisma.chapterProgress.upsert({
      where: { childId_chapterId: { childId, chapterId } },
      create: {
        childId,
        chapterId,
        videoProgress: 100,
        isCompleted: true,
        completedAt: new Date(),
        lastAccessedAt: new Date(),
      },
      update: {
        videoProgress: 100,
        isCompleted: true,
        completedAt: new Date(),
        lastAccessedAt: new Date(),
      },
    });

    // 更新 CourseProgress
    const progressPercentage = await this.updateCourseProgressInternal(childId, chapter.courseId, chapterId);

    // 解锁下一章节
    await this.unlockNextChapter(childId, chapter.courseId, chapter.sequence);

    // 记录学习事件
    await this.logLearningEvent(childId, {
      eventType: 'chapter_complete',
      courseId: chapter.courseId,
      chapterId,
    });

    return {
      completed: true,
      courseProgress: progressPercentage,
    };
  }

  // ==================== 获取学习进度 ====================

  async getProgress(childId: string, courseId?: string) {
    if (courseId) {
      // 获取特定课程进度
      const cached = await this.redis.getCachedUserProgress(childId, courseId);
      if (cached) return cached;

      const enrollment = await this.prisma.enrollment.findUnique({
        where: { courseId_childId: { courseId, childId } },
        include: {
          course: {
            include: { chapters: { orderBy: { sequence: 'asc' } } },
          },
        },
      });

      if (!enrollment) {
        throw new NotFoundException('未报名此课程');
      }

      const chapterProgress = await this.prisma.chapterProgress.findMany({
        where: { childId, chapterId: { in: enrollment.course.chapters.map(c => c.id) } },
      });

      const result = {
        courseId,
        totalProgress: enrollment.progressPercentage,
        chapters: enrollment.course.chapters.map(ch => {
          const cp = chapterProgress.find(p => p.chapterId === ch.id);
          return {
            chapterId: ch.id,
            sequence: ch.sequence,
            title: ch.title,
            progress: cp?.videoProgress || 0,
            isCompleted: cp?.isCompleted || false,
          };
        }),
        lastAccessedAt: enrollment.lastAccessedAt,
      };

      await this.redis.cacheUserProgress(childId, courseId, result);
      return result;
    }

    // 获取所有课程进度
    const enrollments = await this.prisma.enrollment.findMany({
      where: { childId },
      include: { course: true },
    });

    return enrollments.map(e => ({
      courseId: e.courseId,
      title: e.course?.title,
      progress: e.progressPercentage,
      enrolledAt: e.enrolledAt,
      lastAccessedAt: e.lastAccessedAt,
    }));
  }

  // ==================== 记录学习时长 ====================

  async recordDuration(childId: string, courseId: string, durationSeconds: number) {
    // 更新每日学习时长（Redis）
    const minutes = Math.floor(durationSeconds / 60);
    const dailyTime = await this.redis.incrementDailyTime(childId, minutes);

    // 记录学习行为
    await this.logLearningEvent(childId, {
      eventType: 'learning_duration',
      courseId,
      eventData: { durationSeconds },
    });

    // 检查是否超过限制
    const settings = await this.prisma.guardianSetting.findFirst({
      where: { childId },
    });

    const exceeded = settings && dailyTime > settings.dailyTimeLimit;

    return {
      dailyTime,
      limit: settings?.dailyTimeLimit || 120,
      exceeded,
    };
  }

  // ==================== 创建学习计划 ====================

  async createLearningPlan(childId: string, data: {
    name: string;
    goals: any[];
    startDate: Date;
    endDate?: Date;
  }) {
    const plan = await this.prisma.learningPlan.create({
      data: {
        childId,
        name: data.name,
        goals: data.goals,
        startDate: data.startDate,
        endDate: data.endDate,
        status: 'active',
      },
    });

    return plan;
  }

  // ==================== 添加计划课程 ====================

  async addPlanCourse(planId: string, courseId: string, sequence: number) {
    return this.prisma.planCourse.create({
      data: {
        planId,
        courseId,
        sequence,
        status: 'pending',
      },
    });
  }

  // ==================== 辅助方法 ====================

  private async updateCourseProgress(childId: string, courseId: string): Promise<number> {
    // 获取课程所有章节
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { chapters: true },
    });

    if (!course) return 0;

    // 计算完成章节数
    const completed = await this.prisma.chapterProgress.count({
      where: {
        childId,
        chapterId: { in: course.chapters.map(c => c.id) },
        isCompleted: true,
      },
    });

    const percentage = Math.round((completed / course.chapters.length) * 100);

    // 更新报名记录
    await this.prisma.enrollment.update({
      where: { courseId_childId: { courseId, childId } },
      data: {
        progressPercentage: percentage,
        lastAccessedAt: new Date(),
        ...(percentage === 100 ? { completedAt: new Date() } : {}),
      },
    });

    return percentage;
  }

  private async addPoints(userId: string, points: number, source: string, sourceId?: string) {
    // 记录积分
    await this.prisma.pointsLog.create({
      data: {
        userId,
        points,
        source,
        sourceId,
        description: `完成章节获得${points}积分`,
      },
    });

    // 更新儿童积分
    await this.prisma.child.update({
      where: { userId },
      data: { totalPoints: { increment: points } },
    });

    // 更新等级积分
    await this.prisma.userLevel.update({
      where: { userId },
      data: { currentPoints: { increment: points } },
    });
  }

  private async logLearningEvent(childId: string, event: {
    eventType: string;
    courseId?: string;
    chapterId?: string;
    eventData?: any;
  }) {
    await this.prisma.learningEvent.create({
      data: {
        childId,
        eventType: event.eventType,
        courseId: event.courseId,
        chapterId: event.chapterId,
        eventData: event.eventData || {},
        createdAt: new Date(),
      },
    });
  }

  // ==================== Sprint 3: 进度上报（支持断点续看）====================

  /**
   * 上报视频播放进度
   * - 进度 = watchedSeconds / duration
   * - 90%以上标记章节完成
   * - 支持断点续看（取最大watchedSeconds）
   */
  async reportProgress(childId: string, dto: {
    chapterId: string;
    watchedSeconds: number;
    duration: number;
    durationSeconds?: number;
  }): Promise<any> {
    const { chapterId, watchedSeconds, duration, durationSeconds } = dto;

    // 获取章节信息（包含课程ID）
    const chapter = await this.prisma.courseChapter.findUnique({
      where: { id: chapterId },
      include: { course: true },
    });

    if (!chapter) {
      throw new NotFoundException('章节不存在');
    }

    const courseId = chapter.courseId;
    const progress = Math.min(watchedSeconds / duration, 1.0); // 0.0-1.0
    const isCompleted = progress >= 0.9;

    // 1. Upsert LearningRecord（记录每次学习行为）
    // 使用 childId_chapterId 作为唯一键进行 upsert
    const existingRecord = await this.prisma.learningRecord.findUnique({
      where: { childId_chapterId: { childId, chapterId } },
    });

    // 取最大观看秒数（支持断点续看）
    const maxWatchedSeconds = existingRecord
      ? Math.max(existingRecord.watchedSeconds || 0, watchedSeconds)
      : watchedSeconds;

    await this.prisma.learningRecord.upsert({
      where: { childId_chapterId: { childId, chapterId } },
      create: {
        childId,
        courseId,
        chapterId,
        actionType: 'video_play',
        durationSeconds: durationSeconds || 0,
        watchedSeconds: maxWatchedSeconds,
        progress,
        completedAt: isCompleted ? new Date() : null,
      },
      update: {
        durationSeconds: durationSeconds || 0,
        watchedSeconds: maxWatchedSeconds,
        progress,
        completedAt: isCompleted ? new Date() : null,
      },
    });

    // 2. Update ChapterProgress
    const chapterProgress = await this.prisma.chapterProgress.upsert({
      where: { childId_chapterId: { childId, chapterId } },
      create: {
        childId,
        chapterId,
        videoProgress: Math.round(progress * 100),
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        lastAccessedAt: new Date(),
      },
      update: {
        videoProgress: Math.round(progress * 100),
        isCompleted,
        completedAt: isCompleted ? new Date() : null,
        lastAccessedAt: new Date(),
      },
    });

    // 3. Update CourseProgress
    await this.updateCourseProgressInternal(childId, courseId, chapterId);

    // 4. 检查章节解锁（如果当前章节完成，解锁下一章节）
    if (isCompleted) {
      await this.unlockNextChapter(childId, courseId, chapter.sequence);
    }

    return {
      chapterId,
      progress: Math.round(progress * 100),
      isCompleted,
      unlockedNext: isCompleted,
    };
  }

  /**

  /**
   * 获取课程进度（含各章节状态和是否解锁）
   */
  async getCourseProgress(childId: string, courseId: string): Promise<any> {
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        chapters: { orderBy: { sequence: 'asc' } },
      },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    // 获取所有章节进度
    const chapterProgressList = await this.prisma.chapterProgress.findMany({
      where: {
        childId,
        chapterId: { in: course.chapters.map(c => c.id) },
      },
    });

    // 获取课程总进度
    const courseProgress = await this.prisma.courseProgress.findUnique({
      where: { childId_courseId: { childId, courseId } },
    });

    // 获取已完成的章节
    const completedChapters = chapterProgressList
      .filter(cp => cp.isCompleted)
      .map(cp => cp.chapterId);

    // 计算当前章节（最后一个有进度的未完成章节）
    const lastAccessed = chapterProgressList
      .filter(cp => !cp.isCompleted && cp.videoProgress > 0)
      .sort((a, b) => (b.lastAccessedAt?.getTime() || 0) - (a.lastAccessedAt?.getTime() || 0))[0];

    const currentChapter = lastAccessed
      ? course.chapters.find(c => c.id === lastAccessed.chapterId)
      : course.chapters[0];

    // 构建各章节解锁状态（必须前一章节完成才解锁）
    const chapterStates = course.chapters.map((ch, idx) => {
      const progress = chapterProgressList.find(cp => cp.chapterId === ch.id);
      const prevCompleted = idx === 0 || (idx > 0 && chapterProgressList.some(cp =>
        cp.chapterId === course.chapters[idx - 1].id && cp.isCompleted
      ));

      return {
        chapterId: ch.id,
        sequence: ch.sequence,
        title: ch.title,
        progress: progress?.videoProgress || 0,
        isCompleted: progress?.isCompleted || false,
        isUnlocked: idx === 0 || prevCompleted,
      };
    });

    return {
      courseId,
      childId,
      progressPercentage: courseProgress?.progressPercentage || 0,
      completedChapters,
      currentChapter: currentChapter ? {
        id: currentChapter.id,
        title: currentChapter.title,
        progress: chapterProgressList.find(cp => cp.chapterId === currentChapter.id)?.videoProgress || 0,
      } : null,
      lastAccessAt: courseProgress?.lastAccessAt || null,
      chapters: chapterStates,
    };
  }

  /**
   * 获取孩子学习汇总
   */
  async getChildSummary(childId: string): Promise<any> {
    // 获取所有报名课程
    const enrollments = await this.prisma.enrollment.findMany({
      where: { childId },
      include: { course: true },
    });

    // 获取已完成课程
    const completedCourses = enrollments.filter(e => e.completedAt !== null).length;

    // 获取进行中课程
    const inProgressCourses = enrollments.filter(e => e.completedAt === null && e.progressPercentage > 0).length;

    // 获取本周学习天数（查询最近7天的学习事件）
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    const recentEvents = await this.prisma.learningEvent.findMany({
      where: {
        childId,
        eventType: { in: ['video_progress', 'chapter_complete'] },
        createdAt: { gte: weekAgo },
      },
      distinct: ['createdAt'],
    });

    const weeklyLearningDays = new Set(
      recentEvents.map(e => e.createdAt.toISOString().split('T')[0])
    ).size;

    // 最近学习的课程（取最新的3个）
    const recentEnrollments = await this.prisma.enrollment.findMany({
      where: { childId },
      orderBy: { lastAccessedAt: 'desc' },
      take: 3,
      include: { course: true },
    });

    const recentCourses = recentEnrollments.map(e => ({
      courseId: e.courseId,
      title: e.course?.title || '',
      progress: e.progressPercentage,
    }));

    return {
      childId,
      totalLearningMinutes: 0, // TODO: 从learning_events聚合计算
      completedCourses,
      inProgressCourses,
      weeklyLearningDays,
      recentCourses,
    };
  }

  // ==================== 私有辅助方法 ====================

  /**
   * 更新课程总进度
   */
  private async updateCourseProgressInternal(
    childId: string,
    courseId: string,
    lastChapterId: string
  ): Promise<number> {
    // 获取课程所有章节
    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: { chapters: true },
    });

    if (!course || course.chapters.length === 0) return 0;

    // 获取所有章节进度
    const progressList = await this.prisma.chapterProgress.findMany({
      where: {
        childId,
        chapterId: { in: course.chapters.map(c => c.id) },
      },
    });

    // 计算进度（已完成章节数 / 总章节数）
    const completedCount = progressList.filter(p => p.isCompleted).length;
    const progressPercentage = Math.round((completedCount / course.chapters.length) * 100);
    const isAllCompleted = completedCount === course.chapters.length;

    // Upsert CourseProgress
    await this.prisma.courseProgress.upsert({
      where: { childId_courseId: { childId, courseId } },
      create: {
        childId,
        courseId,
        progressPercentage,
        lastChapterId,
        lastAccessAt: new Date(),
        completedAt: isAllCompleted ? new Date() : null,
      },
      update: {
        progressPercentage,
        lastChapterId,
        lastAccessAt: new Date(),
        completedAt: isAllCompleted ? new Date() : null,
      },
    });

    // 同时更新 Enrollment 的进度
    await this.prisma.enrollment.updateMany({
      where: { childId, courseId },
      data: {
        progressPercentage,
        lastAccessedAt: new Date(),
        completedAt: isAllCompleted ? new Date() : null,
      },
    });

    return progressPercentage;
  }

  /**
   * 解锁下一章节（如果存在）
   */
  private async unlockNextChapter(
    childId: string,
    courseId: string,
    currentSequence: number
  ): Promise<void> {
    // 查找下一章节
    const nextChapter = await this.prisma.courseChapter.findFirst({
      where: {
        courseId,
        sequence: currentSequence + 1,
      },
    });

    if (nextChapter) {
      // 确保下一章节有进度记录（表示已解锁）
      await this.prisma.chapterProgress.upsert({
        where: { childId_chapterId: { childId, chapterId: nextChapter.id } },
        create: {
          childId,
          chapterId: nextChapter.id,
          videoProgress: 0,
          isCompleted: false,
          lastAccessedAt: new Date(),
        },
        update: {
          lastAccessedAt: new Date(),
        },
      });
    }
  }
}