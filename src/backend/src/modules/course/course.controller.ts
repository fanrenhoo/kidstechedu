import { Controller, Get, Post, Param, Query, UseGuards, Request, Body } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { CourseService } from './course.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/jwt-auth.guard';

@ApiTags('课程')
@Controller('courses')
export class CourseController {
  constructor(private courseService: CourseService) {}

  // ==================== 课程列表 ====================

  @Get()
  @ApiOperation({ summary: '获取课程列表' })
  @ApiQuery({ name: 'category', required: false })
  @ApiQuery({ name: 'ageGroup', required: false, enum: ['4-6', '7-9', '10-12'] })
  @ApiQuery({ name: 'difficulty', required: false })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'pageSize', required: false, type: Number })
  @ApiResponse({ status: 200, description: '课程列表' })
  async getCourses(
    @Query('category') category?: string,
    @Query('ageGroup') ageGroup?: string,
    @Query('difficulty') difficulty?: number,
    @Query('page') page?: number,
    @Query('pageSize') pageSize?: number,
  ) {
    return this.courseService.getCourses({
      category,
      ageGroup,
      difficulty: difficulty ? parseInt(difficulty as any) : undefined,
      page: page ? parseInt(page as any) : 1,
      pageSize: pageSize ? parseInt(pageSize as any) : 20,
    });
  }

  // ==================== 课程详情 ====================

  @Get(':id')
  @UseGuards(OptionalJwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取课程详情' })
  @ApiResponse({ status: 200, description: '课程详情' })
  async getCourse(@Param('id') courseId: string, @Request() req: any) {
    return this.courseService.getCourseById(courseId, req.user?.sub);
  }

  // ==================== 章节内容 ====================

  @Get(':courseId/chapters/:chapterId')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取章节内容' })
  @ApiResponse({ status: 200, description: '章节内容' })
  async getChapter(
    @Param('courseId') courseId: string,
    @Param('chapterId') chapterId: string,
    @Request() req: any,
  ) {
    return this.courseService.getChapterContent(courseId, chapterId, req.user.sub);
  }

  // ==================== 报名课程 ====================

  @Post(':id/enroll')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '报名课程' })
  @ApiResponse({ status: 201, description: '报名成功' })
  async enrollCourse(
    @Param('id') courseId: string,
    @Body('childId') childId: string,
    @Request() req: any,
  ) {
    // 如果用户是儿童，直接用其ID
    // 如果用户是家长，使用传入的childId
    const targetChildId = req.user.type === 'child' ? req.user.sub : childId;
    return this.courseService.enrollCourse(courseId, targetChildId);
  }

  // ==================== 课程搜索 ====================

  @Get('search')
  @ApiOperation({ summary: '搜索课程' })
  @ApiResponse({ status: 200, description: '搜索结果' })
  async searchCourses(
    @Query('q') query: string,
    @Query('ageGroup') ageGroup?: string,
  ) {
    return this.courseService.searchCourses(query, ageGroup);
  }

  // ==================== 推荐课程 ====================

  @Get('recommended')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取推荐课程' })
  @ApiResponse({ status: 200, description: '推荐课程' })
  async getRecommended(@Request() req: any, @Query('limit') limit?: number) {
    return this.courseService.getRecommendedCourses(
      req.user.sub,
      limit ? parseInt(limit as any) : 10,
    );
  }

  // ==================== 热门课程 ====================

  @Get('hot')
  @ApiOperation({ summary: '获取热门课程' })
  @ApiResponse({ status: 200, description: '热门课程' })
  async getHotCourses(@Query('limit') limit?: number) {
    return this.courseService.getHotCourses(limit ? parseInt(limit as any) : 10);
  }

  // ==================== 课程分类 ====================

  @Get('categories')
  @ApiOperation({ summary: '获取课程分类' })
  @ApiResponse({ status: 200, description: '分类列表' })
  async getCategories() {
    return this.courseService.getCategories();
  }
}