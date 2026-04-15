import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class UserService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // ==================== 获取用户信息 ====================

  async getUserById(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        child: true,
        parent: true,
        teacher: true,
        userLevel: { include: { level: true } },
        badges: { include: { badge: true } },
      },
    });

    if (!user) {
      throw new NotFoundException('用户不存在');
    }

    return this.formatUserResponse(user);
  }

  // ==================== 获取儿童信息 ====================

  async getChildById(childId: string) {
    const child = await this.prisma.child.findUnique({
      where: { userId: childId },
      include: {
        parentRelations: { include: { parent: true } },
        abilities: true,
        user: { include: { userLevel: { include: { level: true } } } },
      },
    });

    if (!child) {
      throw new NotFoundException('儿童账号不存在');
    }

    return {
      id: child.userId,
      nickname: child.nickname,
      birthDate: child.birthDate,
      ageGroup: child.ageGroup,
      avatarId: child.avatarId,
      totalPoints: child.totalPoints,
      level: child.user?.userLevel?.level?.name || 'Lv.1',
      currentPoints: child.user?.userLevel?.currentPoints || 0,
      abilities: child.abilities.map(a => ({
        domain: a.domain,
        score: a.score,
        level: a.level,
      })),
      parents: child.parentRelations.map(r => ({
        id: r.parentId,
        name: r.parent?.name,
        relationType: r.relationType,
      })),
    };
  }

  // ==================== 获取家长信息 ====================

  async getParentById(parentId: string) {
    const parent = await this.prisma.parent.findUnique({
      where: { userId: parentId },
      include: {
        user: true,
        childRelations: {
          include: {
            child: {
              include: {
                user: { include: { userLevel: { include: { level: true } } } },
                abilities: true,
              },
            },
          },
        },
      },
    });

    if (!parent) {
      throw new NotFoundException('家长账号不存在');
    }

    return {
      id: parent.userId,
      phone: parent.phone,
      email: parent.email,
      name: parent.name,
      avatarUrl: parent.avatarUrl,
      verificationStatus: parent.verificationStatus,
      children: parent.childRelations.map(r => ({
        id: r.childId,
        nickname: r.child?.nickname,
        ageGroup: r.child?.ageGroup,
        avatarId: r.child?.avatarId,
        totalPoints: r.child?.totalPoints,
        level: r.child?.user?.userLevel?.level?.name || 'Lv.1',
        abilities: r.child?.abilities?.map(a => ({
          domain: a.domain,
          score: a.score,
          level: a.level,
        })),
      })),
    };
  }

  // ==================== 更新儿童资料 ====================

  async updateChildProfile(childId: string, data: { nickname?: string; avatarId?: string; preferences?: object }) {
    const child = await this.prisma.child.findUnique({
      where: { userId: childId },
    });

    if (!child) {
      throw new NotFoundException('儿童账号不存在');
    }

    const updated = await this.prisma.child.update({
      where: { userId: childId },
      data: {
        nickname: data.nickname,
        avatarId: data.avatarId,
        preferences: data.preferences,
        updatedAt: new Date(),
      },
    });

    return {
      id: updated.userId,
      nickname: updated.nickname,
      avatarId: updated.avatarId,
      preferences: updated.preferences,
    };
  }

  // ==================== 获取儿童学习统计 ====================

  async getChildStatistics(childId: string, period?: { startDate: Date; endDate: Date }) {
    const start = period?.startDate || new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const end = period?.endDate || new Date();

    // 学习时长统计
    const records = await this.prisma.learningRecord.findMany({
      where: {
        childId,
        createdAt: { gte: start, lte: end },
      },
    });

    const totalTime = records.reduce((sum, r) => sum + (r.durationSeconds || 0), 0);
    const coursesCompleted = await this.prisma.enrollment.count({
      where: {
        childId,
        completedAt: { gte: start, lte: end },
      },
    });

    const chaptersCompleted = await this.prisma.chapterProgress.count({
      where: {
        childId,
        isCompleted: true,
        completedAt: { gte: start, lte: end },
      },
    });

    // 连续学习天数
    const streak = await this.calculateLearningStreak(childId);

    // 能力分领域
    const abilities = await this.prisma.abilityProfile.findMany({
      where: { childId },
    });

    return {
      totalTime: Math.floor(totalTime / 60), // 分钟
      coursesCompleted,
      chaptersCompleted,
      streak,
      domainBreakdown: abilities.map(a => ({
        domain: a.domain,
        score: a.score,
        progress: a.score / 100, // 百分比进度
      })),
    };
  }

  // ==================== 获取能力画像 ====================

  async getChildAbilities(childId: string) {
    const abilities = await this.prisma.abilityProfile.findMany({
      where: { childId },
    });

    const history = await this.prisma.abilityHistory.findMany({
      where: { childId },
      orderBy: { recordedAt: 'desc' },
      take: 30,
    });

    return {
      abilities: abilities.map(a => ({
        domain: a.domain,
        score: a.score,
        level: a.level,
        details: a.details,
      })),
      history: history.map(h => ({
        domain: h.domain,
        score: h.score,
        level: h.level,
        source: h.source,
        date: h.recordedAt,
      })),
    };
  }

  // ==================== 获取学习计划 ====================

  async getLearningPlans(childId: string) {
    const plans = await this.prisma.learningPlan.findMany({
      where: { childId, status: 'active' },
      include: {
        planCourses: {
          orderBy: { sequence: 'asc' },
        },
      },
    });

    return plans.map(p => ({
      id: p.id,
      name: p.name,
      goals: p.goals,
      startDate: p.startDate,
      endDate: p.endDate,
      milestones: p.milestones,
      status: p.status,
      courses: p.planCourses.map((pc: any) => ({
        courseId: pc.courseId,
        sequence: pc.sequence,
        scheduledDate: pc.scheduledDate,
        status: pc.status,
      })),
    }));
  }

  // ==================== 获取勋章 ====================

  async getUserBadges(userId: string) {
    const badges = await this.prisma.userBadge.findMany({
      where: { userId },
      include: { badge: true },
      orderBy: { earnedAt: 'desc' },
    });

    return badges.map(b => ({
      id: b.badgeId,
      name: b.badge?.name,
      description: b.badge?.description,
      imageUrl: b.badge?.imageUrl,
      category: b.badge?.category,
      earnedAt: b.earnedAt,
    }));
  }

  // ==================== 获取等级信息 ====================

  async getUserLevel(userId: string) {
    const userLevel = await this.prisma.userLevel.findUnique({
      where: { userId },
      include: { level: true },
    });

    if (!userLevel) {
      return { level: 'Lv.1', currentPoints: 0, nextLevelPoints: 100 };
    }

    const nextLevel = await this.prisma.level.findFirst({
      where: { sequence: { gt: userLevel.level?.sequence || 0 } },
      orderBy: { sequence: 'asc' },
    });

    return {
      level: userLevel.level?.name || 'Lv.1',
      currentPoints: userLevel.currentPoints,
      nextLevelPoints: nextLevel?.minPoints || null,
      iconUrl: userLevel.level?.iconUrl,
    };
  }

  // ==================== 辅助方法 ====================

  private formatUserResponse(user: any) {
    const base = {
      id: user.id,
      type: user.userType,
      status: user.status,
      createdAt: user.createdAt,
    };

    if (user.userType === 'child' && user.child) {
      return {
        ...base,
        profile: {
          nickname: user.child.nickname,
          birthDate: user.child.birthDate,
          ageGroup: user.child.ageGroup,
          avatarId: user.child.avatarId,
          totalPoints: user.child.totalPoints,
        },
        level: user.userLevel?.level?.name || 'Lv.1',
        badges: user.badges?.map((b: any) => b.badge?.name) || [],
      };
    }

    if (user.userType === 'parent' && user.parent) {
      return {
        ...base,
        profile: {
          phone: user.parent.phone,
          email: user.parent.email,
          name: user.parent.name,
          avatarUrl: user.parent.avatarUrl,
        },
      };
    }

    return base;
  }

  private async calculateLearningStreak(childId: string): Promise<number> {
    // 查询过去30天的学习记录
    const records = await this.prisma.learningRecord.findMany({
      where: {
        childId,
        createdAt: { gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      },
      select: { createdAt: true },
    });

    // 按日期分组
    const dates = new Set(
      records.map(r => r.createdAt.toISOString().split('T')[0])
    );

    // 计算连续天数
    let streak = 0;
    const today = new Date().toISOString().split('T')[0];
    let currentDay = new Date();

    while (dates.has(currentDay.toISOString().split('T')[0])) {
      streak++;
      currentDay.setDate(currentDay.getDate() - 1);
    }

    return streak;
  }
}