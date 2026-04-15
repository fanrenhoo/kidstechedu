import { Controller, Get, Patch, Body, UseGuards, Request, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { UserService } from './user.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('用户')
@Controller('users')
export class UserController {
  constructor(private userService: UserService) {}

  // ==================== 获取当前用户 ====================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '用户信息' })
  async getCurrentUser(@Request() req: any) {
    return this.userService.getUserById(req.user.sub);
  }

  // ==================== 获取儿童信息 ====================

  @Get('children/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取儿童详细信息' })
  @ApiResponse({ status: 200, description: '儿童信息' })
  async getChild(@Param('id') childId: string, @Request() req: any) {
    // 验证权限（家长或本人）
    return this.userService.getChildById(childId);
  }

  // ==================== 获取家长信息 ====================

  @Get('parents/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取家长详细信息' })
  @ApiResponse({ status: 200, description: '家长信息' })
  async getParent(@Param('id') parentId: string) {
    return this.userService.getParentById(parentId);
  }

  // ==================== 更新儿童资料 ====================

  @Patch('children/:id')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '更新儿童资料' })
  @ApiResponse({ status: 200, description: '更新成功' })
  async updateChildProfile(
    @Param('id') childId: string,
    @Body() data: { nickname?: string; avatarId?: string; preferences?: object },
    @Request() req: any,
  ) {
    return this.userService.updateChildProfile(childId, data);
  }

  // ==================== 获取学习统计 ====================

  @Get('children/:id/statistics')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取儿童学习统计' })
  @ApiResponse({ status: 200, description: '学习统计' })
  async getChildStatistics(
    @Param('id') childId: string,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
  ) {
    const period = startDate && endDate
      ? { startDate: new Date(startDate), endDate: new Date(endDate) }
      : undefined;
    return this.userService.getChildStatistics(childId, period);
  }

  // ==================== 获取能力画像 ====================

  @Get('children/:id/abilities')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取儿童能力画像' })
  @ApiResponse({ status: 200, description: '能力画像' })
  async getChildAbilities(@Param('id') childId: string) {
    return this.userService.getChildAbilities(childId);
  }

  // ==================== 获取学习计划 ====================

  @Get('children/:id/plans')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取儿童学习计划' })
  @ApiResponse({ status: 200, description: '学习计划' })
  async getLearningPlans(@Param('id') childId: string) {
    return this.userService.getLearningPlans(childId);
  }

  // ==================== 获取勋章 ====================

  @Get('me/badges')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的勋章' })
  @ApiResponse({ status: 200, description: '勋章列表' })
  async getMyBadges(@Request() req: any) {
    return this.userService.getUserBadges(req.user.sub);
  }

  // ==================== 获取等级 ====================

  @Get('me/level')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取我的等级' })
  @ApiResponse({ status: 200, description: '等级信息' })
  async getMyLevel(@Request() req: any) {
    return this.userService.getUserLevel(req.user.sub);
  }
}