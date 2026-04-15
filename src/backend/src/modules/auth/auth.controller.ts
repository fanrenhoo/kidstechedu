import { Controller, Post, Body, UseGuards, Request, Get, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {
  ParentRegisterDto,
  ChildCreateDto,
  ParentLoginDto,
  ChildLoginDto,
  SetChildPasswordDto,
  SetChildPatternDto,
  LoginResponseDto,
} from './dto/auth.dto';

@ApiTags('认证')
@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  // ==================== 家长注册 ====================

  @Post('register/parent')
  @ApiOperation({ summary: '家长注册' })
  @ApiResponse({ status: 201, description: '注册成功', type: LoginResponseDto })
  @ApiResponse({ status: 400, description: '手机号/邮箱已存在' })
  async registerParent(@Body() dto: ParentRegisterDto): Promise<LoginResponseDto> {
    return this.authService.registerParent(dto);
  }

  // ==================== 创建儿童账号 ====================

  @Post('children')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '创建儿童账号（家长操作）' })
  @ApiResponse({ status: 201, description: '创建成功' })
  @ApiResponse({ status: 401, description: '未授权' })
  async createChild(@Request() req: any, @Body() dto: ChildCreateDto) {
    return this.authService.createChild(req.user.sub, dto);
  }

  // ==================== 家长登录 ====================

  @Post('login/parent')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '家长登录' })
  @ApiResponse({ status: 200, description: '登录成功', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: '账号不存在或密码错误' })
  async loginParent(@Body() dto: ParentLoginDto): Promise<LoginResponseDto> {
    return this.authService.loginParent(dto);
  }

  // ==================== 儿童登录 ====================

  @Post('login/child')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '儿童登录' })
  @ApiResponse({ status: 200, description: '登录成功', type: LoginResponseDto })
  @ApiResponse({ status: 401, description: '账号不存在或凭证错误' })
  async loginChild(@Body() dto: ChildLoginDto): Promise<LoginResponseDto> {
    return this.authService.loginChild(dto);
  }

  // ==================== 刷新Token ====================

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: '刷新访问令牌' })
  @ApiResponse({ status: 200, description: '刷新成功' })
  @ApiResponse({ status: 401, description: 'Refresh Token无效' })
  async refreshToken(@Body('refreshToken') refreshToken: string) {
    return this.authService.refreshToken(refreshToken);
  }

  // ==================== 设置儿童密码 ====================

  @Post('children/password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '设置儿童密码（家长操作）' })
  @ApiResponse({ status: 200, description: '设置成功' })
  async setChildPassword(@Request() req: any, @Body() dto: SetChildPasswordDto) {
    await this.authService.setChildPassword(dto.childId, dto.password, req.user.sub);
    return { message: '密码设置成功' };
  }

  @Post('children/pattern')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '设置儿童图形密码（家长操作）' })
  @ApiResponse({ status: 200, description: '设置成功' })
  async setChildPattern(@Request() req: any, @Body() dto: SetChildPatternDto) {
    await this.authService.setChildPatternPassword(dto.childId, dto.pattern, req.user.sub);
    return { message: '图形密码设置成功' };
  }

  // ==================== 获取当前用户信息 ====================

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '获取当前用户信息' })
  @ApiResponse({ status: 200, description: '用户信息' })
  async getCurrentUser(@Request() req: any) {
    return {
      userId: req.user.sub,
      userType: req.user.type,
      iat: req.user.iat,
      exp: req.user.exp,
    };
  }
}