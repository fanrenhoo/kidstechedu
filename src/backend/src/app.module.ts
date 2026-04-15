import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { PrismaModule } from './common/prisma/prisma.module';
import { RedisModule } from './common/redis/redis.module';
import { AuthModule } from './modules/auth/auth.module';
import { UserModule } from './modules/user/user.module';
import { CourseModule } from './modules/course/course.module';
import { VideoModule } from './modules/video/video.module';
import { LearningModule } from './modules/learning/learning.module';
import { SocialModule } from './modules/social/social.module';
import { AssessmentModule } from './modules/assessment/assessment.module';
import { GuardianModule } from './modules/guardian/guardian.module';

@Module({
  imports: [
    // 配置模块
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env.local', '.env'],
    }),

    // 数据库模块
    PrismaModule,
    RedisModule,

    // 业务模块
    AuthModule,
    UserModule,
    CourseModule,
    VideoModule,
    LearningModule,
    SocialModule,
    AssessmentModule,
    GuardianModule,
  ],
})
export class AppModule {}