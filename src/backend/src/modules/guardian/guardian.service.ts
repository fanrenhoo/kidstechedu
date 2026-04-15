import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class GuardianService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // ==================== 获取监护设置 ====================

  async getGuardianSettings(parentId: string, childId?: string) {
    const where: any = { parentId };
    if (childId) where.childId = childId;

    const settings = await this.prisma.guardianSetting.findMany({
      where,
      include: { child: { select: { nickname: true, ageGroup: true } } },
    });

    return settings;
  }

  // ==================== 更新监护设置 ====================

  async updateGuardianSetting(parentId: string, childId: string, data: {
    dailyTimeLimit?: number;
    allowedTimeSlots?: any[];
    contentFilterLevel?: string;
    socialPermissions?: any;
    notificationSettings?: any;
  }) {
    const setting = await this.prisma.guardianSetting.findFirst({
      where: { childId, parentId },
    });

    if (!setting) {
      throw new NotFoundException('监护关系不存在');
    }

    return this.prisma.guardianSetting.update({
      where: { id: setting.id },
      data: {
        dailyTimeLimit: data.dailyTimeLimit,
        allowedTimeSlots: data.allowedTimeSlots,
        contentFilterLevel: data.contentFilterLevel,
        socialPermissions: data.socialPermissions,
        notificationSettings: data.notificationSettings,
        updatedAt: new Date(),
      },
    });
  }

  // ==================== 获取实时学习状态 ====================

  async getLiveStatus(parentId: string, childId?: string) {
    // 验证监护关系
    const relations = await this.prisma.childParentRelation.findMany({
      where: { parentId },
      select: { childId: true },
    });

    const childrenIds = childId
      ? [childId]
      : relations.map(r => r.childId);

    const children = await this.prisma.child.findMany({
      where: { userId: { in: childrenIds } },
      select: {
        userId: true,
        nickname: true,
        ageGroup: true,
        avatarId: true,
      },
    });

    const result: any[] = [];

    for (const child of children) {
      // 检查是否在线（通过活跃的 LearningSession）
      const activeSession = await this.prisma.learningSession.findFirst({
        where: { childId: child.userId, status: 'ACTIVE' },
      });
      const isOnline = !!activeSession;

      // 获取今日学习时长（使用与 checkTimeLimit 一致的数据源：LearningSession）
      const dailyTime = await this.getTodayLearningMins(child.userId);

      // 获取最近学习记录
      const lastRecord = await this.prisma.learningRecord.findFirst({
        where: { childId: child.userId },
        include: { course: true },
        orderBy: { createdAt: 'desc' },
      });

      result.push({
        childId: child.userId,
        nickname: child.nickname,
        avatarId: child.avatarId,
        isOnline,
        dailyTime,
        currentActivity: lastRecord
          ? {
              courseId: lastRecord.courseId,
              courseTitle: lastRecord.course?.title,
              actionType: lastRecord.actionType,
              startTime: lastRecord.createdAt,
            }
          : null,
      });
    }

    return result;
  }

  // ==================== 获取学习报告 ====================

  async getLearningReport(parentId: string, childId: string, params: {
    reportType?: string;
    startDate?: string;
    endDate?: string;
  }) {
    // 验证监护关系
    const relation = await this.prisma.childParentRelation.findFirst({
      where: { childId, parentId },
    });

    if (!relation) {
      throw new ForbiddenException('无权限查看此儿童报告');
    }

    const start = params.startDate
      ? new Date(params.startDate)
      : new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);

    const end = params.endDate
      ? new Date(params.endDate)
      : new Date();

    // 学习时长统计
    const records = await this.prisma.learningRecord.findMany({
      where: {
        childId,
        createdAt: { gte: start, lte: end },
      },
    });

    const totalTime = records.reduce((sum, r) => sum + (r.durationSeconds || 0), 0);

    // 完成课程数
    const coursesCompleted = await this.prisma.enrollment.count({
      where: {
        childId,
        progressPercentage: 100,
        completedAt: { gte: start, lte: end },
      },
    });

    // 完成章节数
    const chaptersCompleted = await this.prisma.chapterProgress.count({
      where: {
        childId,
        isCompleted: true,
        completedAt: { gte: start, lte: end },
      },
    });

    // 考核通过数
    const assessmentsPassed = await this.prisma.assessmentResult.count({
      where: {
        childId,
        passed: true,
        completedAt: { gte: start, lte: end },
      },
    });

    // 能力变化
    const abilities = await this.prisma.abilityProfile.findMany({
      where: { childId },
    });

    return {
      childId,
      period: { start, end },
      summary: {
        totalTime: Math.floor(totalTime / 60),
        coursesCompleted,
        chaptersCompleted,
        assessmentsPassed,
      },
      abilities: abilities.map(a => ({
        domain: a.domain,
        score: a.score,
        level: a.level,
      })),
      recommendations: [
        '继续保持学习习惯',
        '可以尝试更多互动练习',
      ],
    };
  }

  // ==================== 获取异常预警 ====================

  async getAlerts(parentId: string, childId?: string) {
    const where: any = {};
    if (childId) where.childId = childId;

    // 验证监护关系
    const relations = await this.prisma.childParentRelation.findMany({
      where: { parentId },
      select: { childId: true },
    });

    where.childId = { in: relations.map(r => r.childId) };

    // 检查超时预警
    for (const rel of relations) {
      const settings = await this.prisma.guardianSetting.findFirst({
        where: { childId: rel.childId, parentId },
      });

      const dailyTime = await this.redis.getDailyTime(rel.childId);

      if (settings && dailyTime > settings.dailyTimeLimit) {
        // 创建超时预警
        await this.prisma.behaviorAlert.upsert({
          where: {
            id: `timeout-${rel.childId}-${new Date().toISOString().split('T')[0]}`,
          },
          create: {
            id: `timeout-${rel.childId}-${new Date().toISOString().split('T')[0]}`,
            childId: rel.childId,
            alertType: 'time_exceeded',
            severity: 'high',
            details: { limit: settings.dailyTimeLimit, actual: dailyTime },
          },
          update: {},
        });
      }
    }

    const alerts = await this.prisma.behaviorAlert.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return alerts;
  }

  // ==================== Sprint 4: 时间控制 ====================

  /**
   * 检查是否允许学习（播放前调用）
   * - 检查每日时长限制
   * - 检查学习时段限制
   */
  async checkTimeLimit(childId: string): Promise<{
    allowed: boolean;
    remainingMins: number;
    reason?: string;
  }> {
    // 获取监护设置
    const setting = await this.prisma.guardianSetting.findFirst({
      where: { childId },
    });

    // 如果没有设置或未启用，允许学习
    if (!setting || !setting.isActive) {
      return { allowed: true, remainingMins: -1, reason: undefined }; // -1 表示不限
    }

    // 检查每日时长
    const todayMins = await this.getTodayLearningMins(childId);
    const dailyLimitMins = setting.dailyTimeLimit;

    if (dailyLimitMins > 0 && todayMins >= dailyLimitMins) {
      return {
        allowed: false,
        remainingMins: 0,
        reason: 'DAILY_LIMIT_REACHED',
      };
    }

    // 检查时段限制
    const timeSlots = setting.allowedTimeSlots as any[] || [];
    if (timeSlots.length > 0) {
      const now = new Date();
      const currentTime = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}`;
      const currentDay = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'][now.getDay()];

      const isInTimeSlot = timeSlots.some((slot: any) => {
        const days = slot.days || [];
        const isDayMatch = days.length === 0 || days.includes(currentDay);
        const isTimeMatch = currentTime >= slot.start && currentTime <= slot.end;
        return isDayMatch && isTimeMatch;
      });

      if (!isInTimeSlot) {
        return {
          allowed: false,
          remainingMins: Math.max(0, dailyLimitMins - todayMins),
          reason: 'OUT_OF_TIME_SLOT',
        };
      }
    }

    return {
      allowed: true,
      remainingMins: dailyLimitMins > 0 ? Math.max(0, dailyLimitMins - todayMins) : -1,
      reason: undefined,
    };
  }

  /**
   * 心跳上报（学习中心每分钟调用）
   */
  async reportHeartbeat(childId: string, sessionId: string, watchedMins: number): Promise<void> {
    // 更新会话时长
    const session = await this.prisma.learningSession.findUnique({
      where: { id: sessionId },
    });

    if (session && session.status === 'ACTIVE') {
      await this.prisma.learningSession.update({
        where: { id: sessionId },
        data: {
          durationMins: (session.durationMins || 0) + watchedMins,
        },
      });
    }
  }

  /**
   * 开始学习会话
   */
  async startSession(childId: string, courseId?: string, chapterId?: string) {
    // 先结束之前的活跃会话
    await this.prisma.learningSession.updateMany({
      where: { childId, status: 'ACTIVE' },
      data: { status: 'ENDED', endTime: new Date() },
    });

    // 校验课程/章节存在性（如传入）
    if (courseId) {
      const course = await this.prisma.course.findUnique({ where: { id: courseId } });
      if (!course) {
        throw new NotFoundException('课程不存在');
      }
    }

    if (chapterId) {
      const chapter = await this.prisma.courseChapter.findUnique({ where: { id: chapterId } });
      if (!chapter) {
        throw new NotFoundException('章节不存在');
      }
    }

    // 创建新会话
    return this.prisma.learningSession.create({
      data: {
        childId,
        courseId,
        chapterId,
        startTime: new Date(),
        status: 'ACTIVE',
        durationMins: 0,
      },
    });
  }

  /**
   * 结束学习会话
   */
  async endSession(sessionId: string) {
    return this.prisma.learningSession.update({
      where: { id: sessionId },
      data: {
        status: 'ENDED',
        endTime: new Date(),
      },
    });
  }

  /**
   * 计算今日学习时长（分钟）
   */
  async getTodayLearningMins(childId: string): Promise<number> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 从 LearningSession 汇总今日时长
    const sessions = await this.prisma.learningSession.findMany({
      where: {
        childId,
        status: { in: ['ACTIVE', 'ENDED'] },
        startTime: { gte: today },
      },
    });

    return sessions.reduce((sum, s) => sum + (s.durationMins || 0), 0);
  }

  // ==================== Sprint 4: 监控 API ====================

  /**
   * 获取孩子实时状态
   */
  async getCurrentStatus(childId: string) {
    // 获取活跃会话
    const activeSession = await this.prisma.learningSession.findFirst({
      where: { childId, status: 'ACTIVE' },
    });

    // 获取今日学习时长
    const todayMins = await this.getTodayLearningMins(childId);

    // 获取监护设置
    const setting = await this.prisma.guardianSetting.findFirst({
      where: { childId },
    });

    const dailyLimitMins = setting?.dailyTimeLimit || 0;

    // 如果有活跃会话，获取课程信息
    let currentCourse = null;
    if (activeSession?.courseId) {
      const course = await this.prisma.course.findUnique({
        where: { id: activeSession.courseId },
        select: { id: true, title: true },
      });
      currentCourse = course ? { id: course.id, title: course.title } : null;
    }

    return {
      isOnline: !!activeSession,
      currentCourse,
      currentSession: activeSession ? {
        startTime: activeSession.startTime,
        watchedMins: activeSession.durationMins || 0,
      } : null,
      todayTotalMins: todayMins,
      dailyLimitMins,
      remainingMins: dailyLimitMins > 0 ? Math.max(0, dailyLimitMins - todayMins) : -1,
    };
  }

  /**
   * 获取学习历史
   */
  async getHistory(childId: string, range: 'week' | 'month' = 'week') {
    const now = new Date();
    const start = new Date(now);
    if (range === 'week') {
      start.setDate(start.getDate() - 7);
    } else {
      start.setMonth(start.getMonth() - 1);
    }
    start.setHours(0, 0, 0, 0);

    // 获取学习会话记录（按天分组）
    const sessions = await this.prisma.learningSession.findMany({
      where: {
        childId,
        status: { in: ['ACTIVE', 'ENDED'] },
        startTime: { gte: start },
      },
      orderBy: { startTime: 'asc' },
    });

    // 按日期分组
    const recordsByDate = new Map<string, any>();
    sessions.forEach(session => {
      const date = session.startTime.toISOString().split('T')[0];
      if (!recordsByDate.has(date)) {
        recordsByDate.set(date, { date, totalMins: 0, courses: new Map() });
      }
      const record = recordsByDate.get(date);
      record.totalMins += session.durationMins || 0;
      if (session.courseId) {
        const course = record.courses.get(session.courseId) || { courseId: session.courseId, title: '', watchedMins: 0, chaptersCompleted: 0 };
        course.watchedMins += session.durationMins || 0;
        record.courses.set(session.courseId, course);
      }
    });

    // 转换为数组
    const records = Array.from(recordsByDate.values()).map(r => ({
      date: r.date,
      totalMins: r.totalMins,
      courses: Array.from(r.courses.values()),
    }));

    // 获取测验历史
    const assessmentResults = await this.prisma.assessmentResult.findMany({
      where: {
        childId,
        completedAt: { gte: start },
      },
      include: {
        assessment: { include: { course: true } },
      },
      orderBy: { completedAt: 'desc' },
    });

    const quizResults = assessmentResults.map(r => ({
      assessmentId: r.assessmentId,
      title: r.assessment?.title || '',
      courseTitle: r.assessment?.course?.title,
      score: r.score || 0,
      passed: r.passed,
      completedAt: r.completedAt,
      attemptNumber: r.attemptNumber,
    }));

    return { records, quizResults };
  }

  /**
   * 获取各课程进度列表
   */
  async getCourseProgressList(childId: string) {
    const enrollments = await this.prisma.enrollment.findMany({
      where: { childId },
      include: {
        course: {
          include: { chapters: true },
        },
      },
    });

    const result = [];

    for (const e of enrollments) {
      const chapterIds = e.course?.chapters.map(ch => ch.id) || [];

      // 统计已完成章节数（从 ChapterProgress 表查 isCompleted=true）
      const completedCount = await this.prisma.chapterProgress.count({
        where: {
          childId,
          chapterId: { in: chapterIds },
          isCompleted: true,
        },
      });

      result.push({
        courseId: e.courseId,
        title: e.course?.title || '',
        progressPercentage: e.progressPercentage,
        completedChapters: completedCount,
        totalChapters: e.course?.chapters.length || 0,
      });
    }

    return result;
  }

  /**
   * 获取测验历史
   */
  async getAssessmentHistory(childId: string) {
    const results = await this.prisma.assessmentResult.findMany({
      where: { childId },
      include: {
        assessment: { include: { course: true } },
      },
      orderBy: { completedAt: 'desc' },
      take: 50,
    });

    return results.map(r => ({
      assessmentId: r.assessmentId,
      title: r.assessment?.title || '',
      courseTitle: r.assessment?.course?.title,
      score: r.score || 0,
      passed: r.passed,
      completedAt: r.completedAt,
      attemptNumber: r.attemptNumber,
    }));
  }
}