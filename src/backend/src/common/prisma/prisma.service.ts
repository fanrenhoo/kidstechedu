import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super({
      log: process.env.NODE_ENV === 'development'
        ? ['query', 'info', 'warn', 'error']
        : ['error'],
    });
  }

  async onModuleInit() {
    await this.$connect();
    console.log('✅ Database connected (PostgreSQL via Prisma)');
  }

  async onModuleDestroy() {
    await this.$disconnect();
    console.log('❌ Database disconnected');
  }

  // 清理测试数据（仅用于测试环境）
  async cleanDatabase() {
    if (process.env.NODE_ENV === 'test') {
      // 按依赖顺序删除
      await this.learningEvent.deleteMany();
      await this.chapterProgress.deleteMany();
      await this.learningRecord.deleteMany();
      await this.assessmentResult.deleteMany();
      await this.enrollment.deleteMany();
      await this.courseChapter.deleteMany();
      await this.course.deleteMany();
      await this.abilityHistory.deleteMany();
      await this.abilityProfile.deleteMany();
      await this.planCourse.deleteMany();
      await this.learningPlan.deleteMany();
      await this.note.deleteMany();
      await this.blog.deleteMany();
      await this.groupMessage.deleteMany();
      await this.groupMember.deleteMany();
      await this.group.deleteMany();
      await this.comment.deleteMany();
      await this.guardianSetting.deleteMany();
      await this.childParentRelation.deleteMany();
      await this.child.deleteMany();
      await this.parent.deleteMany();
      await this.userCredential.deleteMany();
      await this.userSession.deleteMany();
      await this.userBadge.deleteMany();
      await this.userLevel.deleteMany();
      await this.pointsLog.deleteMany();
      await this.user.deleteMany();
    }
  }
}