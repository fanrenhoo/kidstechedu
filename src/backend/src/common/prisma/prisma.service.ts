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
      await this.learningEvents.deleteMany();
      await this.chapterProgress.deleteMany();
      await this.learningRecords.deleteMany();
      await this.assessmentResults.deleteMany();
      await this.enrollments.deleteMany();
      await this.courseChapters.deleteMany();
      await this.courses.deleteMany();
      await this.abilityHistory.deleteMany();
      await this.abilityProfiles.deleteMany();
      await this.planCourses.deleteMany();
      await this.learningPlans.deleteMany();
      await this.notes.deleteMany();
      await this.blogs.deleteMany();
      await this.groupMessages.deleteMany();
      await this.groupMembers.deleteMany();
      await this.groups.deleteMany();
      await this.comments.deleteMany();
      await this.guardianSettings.deleteMany();
      await this.childParentRelations.deleteMany();
      await this.children.deleteMany();
      await this.parents.deleteMany();
      await this.userCredentials.deleteMany();
      await this.userSessions.deleteMany();
      await this.userBadges.deleteMany();
      await this.userLevels.deleteMany();
      await this.pointsLog.deleteMany();
      await this.users.deleteMany();
    }
  }
}