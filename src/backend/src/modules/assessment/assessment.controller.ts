import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AssessmentService } from './assessment.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { SubmitAssessmentDto } from './dto/submit-assessment.dto';

@ApiTags('考核')
@Controller('assessments')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class AssessmentController {
  constructor(private assessmentService: AssessmentService) {}

  // ==================== Sprint 3: 章节测验 ====================

  @Get('chapter/:chapterId')
  @ApiOperation({ summary: '获取章节测验题目（不含答案）' })
  @ApiResponse({ status: 200, description: '测验题目' })
  async getChapterAssessment(@Param('chapterId') chapterId: string) {
    return this.assessmentService.getChapterAssessment(chapterId);
  }

  @Post(':id/submit')
  @ApiOperation({ summary: '提交测验答案（服务端评分）' })
  @ApiResponse({ status: 200, description: '评分结果' })
  async submitAssessment(
    @Param('id') assessmentId: string,
    @Request() req: any,
    @Body() dto: SubmitAssessmentDto,
  ) {
    return this.assessmentService.submitAssessment(assessmentId, req.user.sub, dto.answers);
  }

  @Get(':id/result')
  @ApiOperation({ summary: '获取测验结果' })
  @ApiResponse({ status: 200, description: '测验结果' })
  async getAssessmentResult(@Param('id') assessmentId: string, @Request() req: any) {
    return this.assessmentService.getAssessmentResult(assessmentId, req.user.sub);
  }

  @Get('child/:childId/history')
  @ApiOperation({ summary: '获取孩子的测验历史' })
  @ApiResponse({ status: 200, description: '测验历史' })
  async getChildAssessmentHistory(
    @Param('childId') childId: string,
    @Query('courseId') courseId?: string,
  ) {
    return this.assessmentService.getAssessmentHistory(childId, courseId);
  }

  // ==================== 原有API（保留兼容）====================

  @Post(':id/start')
  @ApiOperation({ summary: '开始考核（旧版）' })
  async startAssessment(@Param('id') assessmentId: string, @Request() req: any) {
    return this.assessmentService.startAssessment(assessmentId, req.user.sub);
  }

  @Post(':id/complete')
  @ApiOperation({ summary: '完成考核（旧版）' })
  async completeAssessment(
    @Param('id') assessmentId: string,
    @Request() req: any,
    @Body() data: { score: number; passed: boolean; answers: any; timeSpent?: number },
  ) {
    return this.assessmentService.completeAssessment(assessmentId, req.user.sub, data);
  }

  @Get('history')
  @ApiOperation({ summary: '获取考核历史（旧版）' })
  async getHistory(
    @Request() req: any,
    @Query('courseId') courseId?: string,
  ) {
    return this.assessmentService.getAssessmentHistory(req.user.sub, courseId);
  }
}