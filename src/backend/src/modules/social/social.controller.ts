import { Controller, Get, Post, Body, Param, Query, UseGuards, Request } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { SocialService } from './social.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('社交')
@Controller('social')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth()
export class SocialController {
  constructor(private socialService: SocialService) {}

  // ==================== 笔记 ====================

  @Post('notes')
  @ApiOperation({ summary: '创建笔记' })
  async createNote(@Request() req: any, @Body() data: any) {
    return this.socialService.createNote(req.user.sub, data);
  }

  @Get('notes')
  @ApiOperation({ summary: '获取笔记列表' })
  async getNotes(
    @Query('childId') childId?: string,
    @Query('noteType') noteType?: string,
    @Query('courseId') courseId?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.socialService.getNotes({
      childId,
      noteType,
      courseId,
      page: page ? parseInt(page as any) : 1,
      pageSize: pageSize ? parseInt(pageSize as any) : 20,
    });
  }

  // ==================== 评论 ====================

  @Post('comments')
  @ApiOperation({ summary: '发表评论' })
  async createComment(@Request() req: any, @Body() data: any) {
    return this.socialService.createComment(req.user.sub, data);
  }

  @Get('comments')
  @ApiOperation({ summary: '获取评论列表' })
  async getComments(
    @Query('targetType') targetType: string,
    @Query('targetId') targetId: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.socialService.getComments(
      targetType,
      targetId,
      page ? parseInt(page as any) : 1,
      pageSize ? parseInt(pageSize as any) : 20,
    );
  }

  // ==================== 博客 ====================

  @Post('blogs')
  @ApiOperation({ summary: '创建博客（10岁以上）' })
  async createBlog(@Request() req: any, @Body() data: any) {
    return this.socialService.createBlog(req.user.sub, data);
  }

  @Get('blogs')
  @ApiOperation({ summary: '获取博客列表' })
  async getBlogs(
    @Query('childId') childId?: string,
    @Query('status') status?: string,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.socialService.getBlogs({
      childId,
      status,
      page: page ? parseInt(page as any) : 1,
      pageSize: pageSize ? parseInt(pageSize as any) : 20,
    });
  }

  // ==================== 群组 ====================

  @Post('groups')
  @ApiOperation({ summary: '创建群组' })
  async createGroup(@Request() req: any, @Body() data: any) {
    return this.socialService.createGroup(req.user.sub, data);
  }

  @Post('groups/:id/join')
  @ApiOperation({ summary: '加入群组' })
  async joinGroup(@Param('id') groupId: string, @Request() req: any) {
    return this.socialService.joinGroup(groupId, req.user.sub);
  }

  @Get('groups/:id/messages')
  @ApiOperation({ summary: '获取群组消息' })
  async getGroupMessages(
    @Param('id') groupId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ) {
    return this.socialService.getGroupMessages(
      groupId,
      limit ? parseInt(limit as any) : 50,
      before,
    );
  }

  @Post('groups/:id/messages')
  @ApiOperation({ summary: '发送群组消息' })
  async sendGroupMessage(
    @Param('id') groupId: string,
    @Request() req: any,
    @Body('content') content: string,
    @Body('messageType') messageType?: string,
  ) {
    return this.socialService.sendGroupMessage(groupId, req.user.sub, content, messageType);
  }
}