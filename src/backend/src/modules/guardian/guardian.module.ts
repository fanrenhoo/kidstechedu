import { Module } from '@nestjs/common';
import { GuardianService } from './guardian.service';
import { GuardianController } from './guardian.controller';
import { PrismaModule } from '../../common/prisma/prisma.module';
import { RedisModule } from '../../common/redis/redis.module';

@Module({
  imports: [PrismaModule, RedisModule],
  controllers: [GuardianController],
  providers: [GuardianService],
  exports: [GuardianService],
})
export class GuardianModule {}