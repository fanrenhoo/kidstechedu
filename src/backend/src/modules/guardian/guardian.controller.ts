import { Controller, Get, Post, Patch, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { GuardianService } from './guardian.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { UpdateControlSettingsDto, HeartbeatDto, StartSessionDto } from './dto/parental-control.dto';

@ApiTags('家长监护')
@Controller('guardian')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class GuardianController {
  constructor(private guardianService: GuardianService) {}

  // ==================== 监护设置 ====================

  @Get('settings')
  @ApiOperation({ summary: '获取监护设置' })
  async getSettings(@Request() req: any, @Query('childId') childId?: string) {
    return this.guardianService.getGuardianSettings(req.user.sub, childId);
  }

  @Patch('settings')
  @ApiOperation({ summary: '更新监护设置' })
  async updateSettings(
    @Request() req: any,
    @Body('childId') childId: string,
    @Body() data: any,
  ) {
    return this.guardianService.updateGuardianSetting(req.user.sub, childId, data);
  }

  // ==================== Sprint 4: 时间控制 ====================

  @Get('parental/control/:childId/settings')
  @ApiOperation({ summary: '获取监护设置（Sprint 4）' })
  async getControlSettings(@Param('childId') childId: string) {
    return this.guardianService.getGuardianSettings(childId, childId);
  }

  @Put('parental/control/:childId/settings')
  @ApiOperation({ summary: '更新监护设置（Sprint 4）' })
  async updateControlSettings(
    @Param('childId') childId: string,
    @Body() dto: UpdateControlSettingsDto,
    @Request() req: any,
  ) {
    // 使用请求用户的 parentId
    const parentId = req.user.sub;
    return this.guardianService.updateGuardianSetting(parentId, childId, {
      dailyTimeLimit: dto.dailyLimitMins,
      allowedTimeSlots: dto.timeSlots,
    });
  }

  @Get('parental/control/:childId/check-time')
  @ApiOperation({ summary: '检查是否允许学习（Sprint 4）' })
  async checkTimeLimit(@Param('childId') childId: string) {
    return this.guardianService.checkTimeLimit(childId);
  }

  @Post('parental/control/:childId/heartbeat')
  @ApiOperation({ summary: '学习心跳上报（Sprint 4）' })
  async reportHeartbeat(
    @Param('childId') childId: string,
    @Body() dto: HeartbeatDto,
  ) {
    await this.guardianService.reportHeartbeat(childId, dto.sessionId, dto.watchedMins);
    return { success: true };
  }

  @Post('parental/control/:childId/session/start')
  @ApiOperation({ summary: '开始学习会话（Sprint 4）' })
  async startSession(
    @Param('childId') childId: string,
    @Body() dto: StartSessionDto,
  ) {
    return this.guardianService.startSession(childId, dto.courseId, dto.chapterId);
  }

  @Post('parental/control/:childId/session/end')
  @ApiOperation({ summary: '结束学习会话（Sprint 4）' })
  async endSession(@Body('sessionId') sessionId: string) {
    return this.guardianService.endSession(sessionId);
  }

  // ==================== Sprint 4: 监控 API ====================

  @Get('parental/monitor/:childId/current')
  @ApiOperation({ summary: '获取孩子实时状态（Sprint 4）' })
  async getCurrentStatus(@Param('childId') childId: string) {
    return this.guardianService.getCurrentStatus(childId);
  }

  @Get('parental/monitor/:childId/history')
  @ApiOperation({ summary: '获取孩子学习历史（Sprint 4）' })
  async getHistory(
    @Param('childId') childId: string,
    @Query('range') range?: 'week' | 'month',
  ) {
    return this.guardianService.getHistory(childId, range || 'week');
  }

  @Get('parental/monitor/:childId/courses')
  @ApiOperation({ summary: '获取各课程进度（Sprint 4）' })
  async getCourseProgressList(@Param('childId') childId: string) {
    return this.guardianService.getCourseProgressList(childId);
  }

  @Get('parental/monitor/:childId/assessments')
  @ApiOperation({ summary: '获取测验历史（Sprint 4）' })
  async getAssessmentHistory(@Param('childId') childId: string) {
    return this.guardianService.getAssessmentHistory(childId);
  }

  // ==================== 原有API ====================

  @Get('live-status')
  @ApiOperation({ summary: '获取儿童实时学习状态' })
  async getLiveStatus(@Request() req: any, @Query('childId') childId?: string) {
    return this.guardianService.getLiveStatus(req.user.sub, childId);
  }

  @Get('reports')
  @ApiOperation({ summary: '获取学习报告' })
  async getReport(
    @Request() req: any,
    @Query('childId') childId: string,
    @Query('reportType') reportType?: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    return this.guardianService.getLearningReport(req.user.sub, childId, {
      reportType,
      startDate,
      endDate,
    });
  }

  @Get('alerts')
  @ApiOperation({ summary: '获取异常预警' })
  async getAlerts(@Request() req: any, @Query('childId') childId?: string) {
    return this.guardianService.getAlerts(req.user.sub, childId);
  }
}