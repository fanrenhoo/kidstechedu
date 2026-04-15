import { Module } from '@nestjs/common';
import { VideoService } from './video.service';
import { VideoController } from './video.controller';
import { BilibiliProvider } from './providers/bilibili.provider';
import { PrismaModule } from '../../common/prisma/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [VideoController],
  providers: [VideoService, BilibiliProvider],
  exports: [VideoService],
})
export class VideoModule {}
