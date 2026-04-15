import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { VideoService } from './video.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('视频')
@Controller('videos')
export class VideoController {
  constructor(private videoService: VideoService) {}

  // ==================== 视频播放凭证 ====================

  @Get(':id/play')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取视频播放凭证' })
  @ApiResponse({ status: 200, description: '视频播放凭证' })
  async getPlayToken(@Param('id') videoId: string) {
    return this.videoService.getPlayToken(videoId);
  }

  // ==================== 视频元信息 ====================

  @Get(':id/meta')
  @ApiOperation({ summary: '获取视频元信息' })
  @ApiResponse({ status: 200, description: '视频元信息' })
  async getVideoMeta(@Param('id') videoId: string) {
    return this.videoService.getVideoMeta(videoId);
  }

  // ==================== 校验视频有效性 ====================

  @Get(':id/validate')
  @ApiOperation({ summary: '校验视频是否有效' })
  @ApiResponse({ status: 200, description: '校验结果' })
  async validateVideo(@Param('id') videoId: string) {
    const isValid = await this.videoService.validateVideo(videoId);
    return { videoId, isValid };
  }
}
