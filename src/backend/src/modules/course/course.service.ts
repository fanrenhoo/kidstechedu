import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';
import { RedisService } from '../../common/redis/redis.service';

@Injectable()
export class CourseService {
  constructor(
    private prisma: PrismaService,
    private redis: RedisService,
  ) {}

  // ==================== 课程列表 ====================

  async getCourses(params: {
    category?: string;
    ageGroup?: string;
    difficulty?: number;
    page?: number;
    pageSize?: number;
  }) {
    const { category, ageGroup, difficulty, page = 1, pageSize = 20 } = params;

    const where: any = { status: 'published' };
    if (category) where.categoryId = category;
    if (ageGroup) where.ageRange = ageGroup;
    if (difficulty) where.difficultyLevel = difficulty;

    const [courses, total] = await Promise.all([
      this.prisma.course.findMany({
        where,
        include: {
          category: true,
          teacher: true,
        },
        orderBy: { enrollmentCount: 'desc' },
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
      this.prisma.course.count({ where }),
    ]);

    return {
      items: courses.map(c => this.formatCoursePreview(c)),
      pagination: {
        page,
        pageSize,
        total,
        totalPages: Math.ceil(total / pageSize),
      },
    };
  }

  // ==================== 课程详情 ====================

  async getCourseById(courseId: string, userId?: string) {
    // 尝试从缓存获取
    const cached = await this.redis.getCachedCourseDetail(courseId);
    if (cached) {
      return cached;
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
      include: {
        category: true,
        teacher: true,
        chapters: {
          orderBy: { sequence: 'asc' },
          include: { video: true },
        },
      },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    // 检查是否已报名
    let enrollment = null;
    if (userId) {
      enrollment = await this.prisma.enrollment.findUnique({
        where: { courseId_childId: { courseId, childId: userId } },
      });
    }

    // 获取评分
    const reviews = await this.prisma.comment.findMany({
      where: { targetType: 'course', targetId: courseId, status: 'approved' },
      take: 5,
    });

    const result = {
      id: course.id,
      title: course.title,
      description: course.description,
      category: course.category,
      teacher: course.teacher,
      coverImageUrl: course.coverImageUrl,
      ageRange: course.ageRange,
      difficultyLevel: course.difficultyLevel,
      totalDuration: course.totalDuration,
      totalChapters: course.totalChapters,
      pricingType: course.pricingType,
      price: course.price,
      tags: course.tags,
      viewCount: course.viewCount,
      enrollmentCount: course.enrollmentCount,
      averageRating: course.averageRating,
      chapters: course.chapters.map(ch => ({
        id: ch.id,
        sequence: ch.sequence,
        title: ch.title,
        duration: ch.duration,
        hasAssessment: ch.hasAssessment,
        thumbnailUrl: ch.video?.thumbnailUrl,
      })),
      enrollment: enrollment ? {
        enrolledAt: enrollment.enrolledAt,
        progressPercentage: enrollment.progressPercentage,
        lastAccessedAt: enrollment.lastAccessedAt,
      } : null,
      reviews: reviews.slice(0, 5),
    };

    // 缓存课程详情
    await this.redis.cacheCourseDetail(courseId, result);

    return result;
  }

  // ==================== 章节内容 ====================

  async getChapterContent(courseId: string, chapterId: string, userId?: string) {
    const chapter = await this.prisma.courseChapter.findUnique({
      where: { id: chapterId },
      include: {
        course: true,
        video: true,
      },
    });

    if (!chapter || chapter.courseId !== courseId) {
      throw new NotFoundException('章节不存在');
    }

    // 获取用户进度
    let progress = null;
    if (userId) {
      progress = await this.prisma.chapterProgress.findUnique({
        where: { childId_chapterId: { childId: userId, chapterId } },
      });
    }

    return {
      id: chapter.id,
      sequence: chapter.sequence,
      title: chapter.title,
      description: chapter.description,
      video: chapter.video ? {
        id: chapter.video.id,
        transcodedUrls: chapter.video.transcodedUrls,
        thumbnailUrl: chapter.video.thumbnailUrl,
        subtitleUrls: chapter.video.subtitleUrls,
        duration: chapter.video.duration,
      } : null,
      interactionData: chapter.interactionData,
      hasAssessment: chapter.hasAssessment,
      progress: progress ? {
        videoProgress: progress.videoProgress,
        isCompleted: progress.isCompleted,
      } : { videoProgress: 0, isCompleted: false },
    };
  }

  // ==================== 报名课程 ====================

  async enrollCourse(courseId: string, childId: string) {
    // 检查是否已报名
    const existing = await this.prisma.enrollment.findUnique({
      where: { courseId_childId: { courseId, childId } },
    });

    if (existing) {
      return { enrollment: existing, message: '已报名' };
    }

    const course = await this.prisma.course.findUnique({
      where: { id: courseId },
    });

    if (!course) {
      throw new NotFoundException('课程不存在');
    }

    // 创建报名记录
    const enrollment = await this.prisma.enrollment.create({
      data: {
        courseId,
        childId,
        progressPercentage: 0,
      },
    });

    // 更新课程报名数
    await this.prisma.course.update({
      where: { id: courseId },
      data: { enrollmentCount: { increment: 1 } },
    });

    return {
      enrollment,
      message: '报名成功',
    };
  }

  // ==================== 课程搜索 ====================

  async searchCourses(query: string, ageGroup?: string) {
    // MVP使用PostgreSQL全文搜索
    const courses = await this.prisma.course.findMany({
      where: {
        status: 'published',
        OR: [
          { title: { contains: query, mode: 'insensitive' } },
          { description: { contains: query, mode: 'insensitive' } },
          { tags: { has: query } },
        ],
        ...(ageGroup ? { ageRange: ageGroup } : {}),
      },
      include: { category: true, teacher: true },
      take: 20,
    });

    return courses.map(c => this.formatCoursePreview(c));
  }

  // ==================== 推荐课程 ====================

  async getRecommendedCourses(childId: string, limit: number = 10) {
    // 获取儿童能力画像
    const abilities = await this.prisma.abilityProfile.findMany({
      where: { childId },
    });

    // 基于能力推荐（简单算法）
    const weakDomains = abilities
      .filter(a => a.score < 50)
      .map(a => a.domain);

    // 将领域转换为分类ID（需要根据实际分类映射）
    const courses = await this.prisma.course.findMany({
      where: {
        status: 'published',
      },
      include: { category: true },
      take: limit,
    });

    return courses.map(c => ({
      item: this.formatCoursePreview(c),
      reason: '适合您的学习水平',
      matchScore: 80,
    }));
  }

  // ==================== 热门课程 ====================

  async getHotCourses(limit: number = 10) {
    const courses = await this.prisma.course.findMany({
      where: { status: 'published' },
      orderBy: { enrollmentCount: 'desc' },
      include: { category: true },
      take: limit,
    });

    return courses.map(c => this.formatCoursePreview(c));
  }

  // ==================== 课程分类 ====================

  async getCategories() {
    const categories = await this.prisma.courseCategory.findMany({
      where: { status: 'active' },
      orderBy: { sortOrder: 'asc' },
    });

    return categories.map(c => ({
      id: c.id,
      name: c.name,
      parentId: c.parentId,
      iconUrl: c.iconUrl,
    }));
  }

  // ==================== 辅助方法 ====================

  private formatCoursePreview(course: any) {
    return {
      id: course.id,
      title: course.title,
      description: course.description?.substring(0, 100),
      category: course.category?.name,
      teacher: course.teacher?.name,
      coverImageUrl: course.coverImageUrl,
      ageRange: course.ageRange,
      difficultyLevel: course.difficultyLevel,
      totalDuration: course.totalDuration,
      totalChapters: course.totalChapters,
      pricingType: course.pricingType,
      price: course.price,
      tags: course.tags,
      enrollmentCount: course.enrollmentCount,
      averageRating: course.averageRating,
    };
  }
}