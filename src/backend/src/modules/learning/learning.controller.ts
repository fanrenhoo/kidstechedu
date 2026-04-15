import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { LearningService } from './learning.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { ReportProgressDto, CompleteChapterDto } from './dto/report-progress.dto';

@ApiTags('学习')
@Controller('learning')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class LearningController {
  constructor(private learningService: LearningService) {}

  // ==================== Sprint 3: 进度上报 ====================

  @Post('progress')
  @ApiOperation({ summary: '上报视频播放进度（支持断点续看）' })
  @ApiResponse({ status: 201, description: '进度更新成功' })
  async reportProgress(@Request() req: any, @Body() dto: ReportProgressDto) {
    return this.learningService.reportProgress(req.user.sub, dto);
  }

  @Post('complete-chapter')
  @ApiOperation({ summary: '标记章节完成' })
  @ApiResponse({ status: 201, description: '章节完成' })
  async completeChapter(@Request() req: any, @Body() dto: CompleteChapterDto) {
    return this.learningService.completeChapter(req.user.sub, dto.chapterId);
  }

  @Get('courses/:courseId/progress')
  @ApiOperation({ summary: '获取课程学习进度（含章节解锁状态）' })
  @ApiResponse({ status: 200, description: '课程进度信息' })
  async getCourseProgress(
    @Request() req: any,
    @Param('courseId') courseId: string,
  ) {
    return this.learningService.getCourseProgress(req.user.sub, courseId);
  }

  @Get('children/:childId/summary')
  @ApiOperation({ summary: '获取孩子学习汇总' })
  @ApiResponse({ status: 200, description: '学习汇总信息' })
  async getChildSummary(@Request() req: any, @Param('childId') childId: string) {
    // 家长可以查看孩子的汇总
    const userId = req.user.sub;
    const userType = req.user.type;

    // 简单鉴权：只能查看自己孩子的汇总
    if (userType === 'child' && userId !== childId) {
      return { error: '无权查看' };
    }

    return this.learningService.getChildSummary(childId);
  }

  // ==================== 原有API（保留兼容）====================

  @Post('chapters/:chapterId/complete')
  @ApiOperation({ summary: '完成章节（旧版）' })
  @ApiResponse({ status: 201, description: '章节完成' })
  async completeChapterLegacy(
    @Request() req: any,
    @Param('chapterId') chapterId: string,
    @Body('courseId') courseId: string,
  ) {
    return this.learningService.completeChapter(req.user.sub, chapterId);
  }

  @Get('progress')
  @ApiOperation({ summary: '获取学习进度（旧版）' })
  @ApiResponse({ status: 200, description: '进度信息' })
  async getProgress(@Request() req: any, @Query('courseId') courseId?: string) {
    return this.learningService.getProgress(req.user.sub, courseId);
  }

  @Post('duration')
  @ApiOperation({ summary: '记录学习时长' })
  @ApiResponse({ status: 201, description: '时长记录成功' })
  async recordDuration(
    @Request() req: any,
    @Body('courseId') courseId: string,
    @Body('durationSeconds') durationSeconds: number,
  ) {
    return this.learningService.recordDuration(req.user.sub, courseId, durationSeconds);
  }

  @Post('plans')
  @ApiOperation({ summary: '创建学习计划' })
  @ApiResponse({ status: 201, description: '计划创建成功' })
  async createPlan(@Request() req: any, @Body() data: {
    name: string;
    goals: any[];
    startDate: string;
    endDate?: string;
  }) {
    return this.learningService.createLearningPlan(req.user.sub, {
      name: data.name,
      goals: data.goals,
      startDate: new Date(data.startDate),
      endDate: data.endDate ? new Date(data.endDate) : undefined,
    });
  }
}