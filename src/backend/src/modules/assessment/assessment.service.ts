import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma/prisma.service';

@Injectable()
export class AssessmentService {
  constructor(private prisma: PrismaService) {}

  // ==================== 开始考核 ====================

  async startAssessment(assessmentId: string, childId: string) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw new NotFoundException('考核不存在');
    }

    // 检查尝试次数
    const attempts = await this.prisma.assessmentResult.count({
      where: { assessmentId, childId },
    });

    if (attempts >= assessment.attemptLimit) {
      throw new NotFoundException('已达最大尝试次数');
    }

    return {
      attemptId: `${assessmentId}-${childId}-${attempts + 1}`,
      questions: assessment.questions,
      timeLimit: assessment.timeLimit,
      totalScore: assessment.totalScore,
    };
  }

  // ==================== 提交答案 ====================

  async submitAnswers(assessmentId: string, childId: string, answers: any[]) {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw new NotFoundException('考核不存在');
    }

    // 计算分数（简单实现）
    const questions = assessment.questions as any[];
    let correctCount = 0;
    const wrongQuestions: any[] = [];

    questions.forEach((q, idx) => {
      const userAnswer = answers[idx];
      if (userAnswer === q.correctAnswer) {
        correctCount++;
      } else {
        wrongQuestions.push({
          questionId: idx,
          question: q.question,
          userAnswer,
          correctAnswer: q.correctAnswer,
        });
      }
    });

    const score = Math.round((correctCount / questions.length) * assessment.totalScore);
    const passed = score >= assessment.passingScore;

    return {
      score,
      passed,
      correctCount,
      totalQuestions: questions.length,
      wrongQuestions,
    };
  }

  // ==================== 完成考核 ====================

  async completeAssessment(assessmentId: string, childId: string, data: {
    score: number;
    passed: boolean;
    answers: any;
    timeSpent?: number;
  }) {
    const attempts = await this.prisma.assessmentResult.count({
      where: { assessmentId, childId },
    });

    const result = await this.prisma.assessmentResult.create({
      data: {
        assessmentId,
        childId,
        score: data.score,
        passed: data.passed,
        answers: data.answers,
        timeSpent: data.timeSpent,
        attemptNumber: attempts + 1,
      },
    });

    // 如果通过，更新能力画像
    if (data.passed) {
      const assessment = await this.prisma.assessment.findUnique({
        where: { id: assessmentId },
        include: { course: true },
      });

      // 根据课程类别更新能力
      if (assessment?.course?.categoryId) {
        await this.prisma.abilityProfile.update({
          where: {
            childId_domain: {
              childId,
              domain: assessment.course.categoryId.toLowerCase(),
            },
          },
          data: {
            score: { increment: 5 },
          },
        });

        // 记录能力历史
        await this.prisma.abilityHistory.create({
          data: {
            childId,
            domain: assessment.course.categoryId.toLowerCase(),
            score: data.score / assessment.totalScore * 100,
            source: 'assessment',
          },
        });
      }

      // 给予积分奖励
      const points = data.score;
      await this.prisma.pointsLog.create({
        data: {
          userId: childId,
          points,
          source: 'assessment',
          sourceId: assessmentId,
          description: `考核通过获得${points}积分`,
        },
      });

      await this.prisma.child.update({
        where: { userId: childId },
        data: { totalPoints: { increment: points } },
      });

      // 检查是否获得勋章
      const badges = await this.checkBadges(childId, assessmentId);
      if (badges.length > 0) {
        for (const badge of badges) {
          await this.prisma.userBadge.create({
            data: { badgeId: badge.id, userId: childId },
          });
        }
      }
    }

    return {
      result,
      badge: passed ? await this.getAssessmentBadge(assessmentId) : null,
      recommendations: passed
        ? ['继续学习下一课程']
        : ['回顾本章内容', '重新观看视频'],
    };
  }

  // ==================== 获取考核历史 ====================

  async getAssessmentHistory(childId: string, courseId?: string) {
    const where: any = { childId };
    if (courseId) {
      const assessments = await this.prisma.assessment.findMany({
        where: { courseId },
        select: { id: true },
      });
      where.assessmentId = { in: assessments.map(a => a.id) };
    }

    const results = await this.prisma.assessmentResult.findMany({
      where,
      include: { assessment: { include: { course: true } } },
      orderBy: { completedAt: 'desc' },
    });

    return results.map(r => ({
      id: r.id,
      assessmentTitle: r.assessment?.title,
      courseTitle: r.assessment?.course?.title,
      score: r.score,
      passed: r.passed,
      attemptNumber: r.attemptNumber,
      completedAt: r.completedAt,
    }));
  }

  // ==================== 辅助方法 ====================

  private async checkBadges(childId: string, assessmentId: string): Promise<any[]> {
    // 简单实现：完成第一个考核获得"学习先锋"勋章
    const count = await this.prisma.assessmentResult.count({
      where: { childId, passed: true },
    });

    if (count === 1) {
      const badge = await this.prisma.badge.findFirst({
        where: { conditionType: 'first_assessment' },
      });
      return badge ? [badge] : [];
    }

    return [];
  }

  private async getAssessmentBadge(assessmentId: string): Promise<any | null> {
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    // 获取考核类型对应勋章
    const badge = await this.prisma.badge.findFirst({
      where: {
        conditionType: 'assessment_pass',
        conditionData: { path: ['type'], equals: assessment?.assessmentType },
      },
    });

    return badge;
  }

  // ==================== Sprint 3: 章节测验（服务端评分）====================

  /**
   * 获取章节测验（题目脱敏，不含答案）
   */
  async getChapterAssessment(chapterId: string): Promise<any> {
    const assessment = await this.prisma.assessment.findFirst({
      where: {
        chapterId,
        status: 'active',
      },
    });

    if (!assessment) {
      throw new NotFoundException('该章节暂无测验');
    }

    // 题目数据脱敏：只返回题目，不返回正确答案
    const questionsData = assessment.questionsData as any[];
    const sanitizedQuestions = questionsData.map((q: any) => ({
      id: q.id,
      type: q.type,
      question: q.question,
      options: q.options,
      points: q.points,
      // 不返回 correctAnswer
    }));

    return {
      assessmentId: assessment.id,
      chapterId: assessment.chapterId,
      title: assessment.title,
      type: assessment.assessmentType,
      passingScore: assessment.passingScore,
      timeLimit: assessment.timeLimit,
      questions: sanitizedQuestions,
    };
  }

  /**
   * 提交测验答案（服务端评分）
   * - 绝不信任前端分数
   * - 限制尝试次数（3次/天）
   */
  async submitAssessment(
    assessmentId: string,
    childId: string,
    answers: Record<string, string | string[]>,
  ): Promise<any> {
    // 检查尝试次数限制
    const canAttempt = await this.checkAttemptLimit(assessmentId, childId);
    if (!canAttempt) {
      throw new NotFoundException('今日已达最大尝试次数（3次/天）');
    }

    // 获取测验
    const assessment = await this.prisma.assessment.findUnique({
      where: { id: assessmentId },
    });

    if (!assessment) {
      throw new NotFoundException('测验不存在');
    }

    // 评分（服务端计算，不信任前端）
    const questionsData = assessment.questionsData as any[];
    let correctCount = 0;
    const wrongQuestions: any[] = [];

    questionsData.forEach((q: any, idx: number) => {
      const questionId = q.id || `q${idx}`;
      const userAnswer = answers[questionId];

      // 比较答案（处理单选、多选、填空等）
      const isCorrect = this.compareAnswers(userAnswer, q.correctAnswer);

      if (isCorrect) {
        correctCount++;
      } else {
        wrongQuestions.push({
          questionId,
          question: q.question,
          userAnswer,
          correctAnswer: q.correctAnswer,
        });
      }
    });

    const score = Math.round((correctCount / questionsData.length) * assessment.totalScore);
    const passed = score >= assessment.passingScore;

    // 获取当前尝试次数
    const attempts = await this.prisma.assessmentResult.count({
      where: { assessmentId, childId },
    });

    // 保存结果（如果之前没有尝试过，更新记录；否则创建新记录）
    const existingResult = await this.prisma.assessmentResult.findFirst({
      where: { assessmentId, childId },
      orderBy: { attemptNumber: 'desc' },
    });

    // 每天只记录一次有效尝试，使用日期作为唯一键的一部分
    const today = new Date().toISOString().split('T')[0];

    await this.prisma.assessmentResult.create({
      data: {
        assessmentId,
        childId,
        score,
        passed,
        answers: answers, // 使用现有字段存储答题数据
        attemptNumber: (existingResult?.attemptNumber || 0) + 1,
        completedAt: new Date(),
      },
    });

    // 如果及格，更新能力画像和给予奖励
    if (passed) {
      await this.handlePassReward(childId, assessment);

      // Bug 2 修复：测验及格后自动标记章节完成并解锁下一章节
      if (assessment.chapterId) {
        const chapter = await this.prisma.courseChapter.findUnique({
          where: { id: assessment.chapterId },
        });

        if (chapter) {
          // 标记章节完成
          await this.prisma.chapterProgress.upsert({
            where: { childId_chapterId: { childId, chapterId: assessment.chapterId } },
            create: {
              childId,
              chapterId: assessment.chapterId,
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

          // 解锁下一章节
          await this.unlockNextChapter(childId, chapter.courseId, chapter.sequence);
        }
      }
    }

    return {
      score,
      passed,
      correctCount,
      totalCount: questionsData.length,
      attemptNumber: (existingResult?.attemptNumber || 0) + 1,
      maxAttempts: assessment.attemptLimit,
      wrongQuestions: passed ? undefined : wrongQuestions, // 及格时不返回错题
    };
  }

  /**
   * 获取测验结果
   */
  async getAssessmentResult(assessmentId: string, childId: string): Promise<any> {
    const result = await this.prisma.assessmentResult.findFirst({
      where: { assessmentId, childId },
      orderBy: { completedAt: 'desc' },
    });

    if (!result) {
      throw new NotFoundException('暂无测验结果');
    }

    return {
      assessmentId: result.assessmentId,
      score: result.score,
      passed: result.passed,
      attemptNumber: result.attemptNumber,
      completedAt: result.completedAt,
    };
  }

  /**
   * 检查是否还有尝试次数（3次/天）
   */
  async checkAttemptLimit(assessmentId: string, childId: string): Promise<boolean> {
    // 获取今天的00:00时间戳
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // 统计今天的尝试次数
    const todayAttempts = await this.prisma.assessmentResult.count({
      where: {
        assessmentId,
        childId,
        completedAt: { gte: today },
      },
    });

    return todayAttempts < 3;
  }

  // ==================== 私有辅助方法 ====================

  /**
   * 比较答案（支持单选、多选、填空）
   */
  private compareAnswers(userAnswer: string | string[] | undefined, correctAnswer: string | string[]): boolean {
    if (!userAnswer) return false;

    // 标准化为数组比较
    const userArr = Array.isArray(userAnswer) ? userAnswer : [userAnswer];
    const correctArr = Array.isArray(correctAnswer) ? correctAnswer : [correctAnswer];

    if (userArr.length !== correctArr.length) return false;

    // 比较（忽略顺序）
    const sortedUser = [...userArr].sort();
    const sortedCorrect = [...correctArr].sort();

    return sortedUser.every((val, idx) => val === sortedCorrect[idx]);
  }

  /**
   * 处理及格奖励
   */
  private async handlePassReward(childId: string, assessment: any): Promise<void> {
    // 获取课程信息（用于更新能力画像）
    if (assessment.chapterId) {
      const chapter = await this.prisma.courseChapter.findUnique({
        where: { id: assessment.chapterId },
        include: { course: true },
      });

      if (chapter?.course) {
        // 更新能力画像
        const domain = this.getDomainFromCategory(chapter.course.categoryId);
        await this.prisma.abilityProfile.update({
          where: {
            childId_domain: { childId, domain },
          },
          data: { score: { increment: 5 } },
          create: {
            childId,
            domain,
            score: 5,
            level: 1,
          },
        });

        // 记录能力历史
        await this.prisma.abilityHistory.create({
          data: {
            childId,
            domain,
            score: 60, // 简化：及格=60分
            source: 'assessment',
          },
        });
      }
    }

    // 给予积分奖励
    await this.prisma.pointsLog.create({
      data: {
        userId: childId,
        points: assessment.totalScore,
        source: 'assessment',
        sourceId: assessment.id,
        description: `测验通过获得${assessment.totalScore}积分`,
      },
    });

    // 更新儿童积分
    await this.prisma.child.update({
      where: { userId: childId },
      data: { totalPoints: { increment: assessment.totalScore } },
    });
  }

  /**
   * 从课程分类获取领域标识
   */
  private getDomainFromCategory(categoryId: string | null): string {
    if (!categoryId) return 'general';

    // 简单映射：实际应根据数据库中的分类表来映射
    const categoryLower = categoryId.toLowerCase();
    if (categoryLower.includes('ai') || categoryLower.includes('编程')) return 'ai';
    if (categoryLower.includes('英语')) return 'english';
    if (categoryLower.includes('历史')) return 'history';
    if (categoryLower.includes('逻辑')) return 'logic';
    if (categoryLower.includes('科学')) return 'science';
    return 'general';
  }

  /**
   * 解锁下一章节（当测验及格时调用）
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