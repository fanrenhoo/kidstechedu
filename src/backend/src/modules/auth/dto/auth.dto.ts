import { IsString, IsNotEmpty, IsOptional, IsEmail, MinLength, MaxLength, IsIn, IsDateString, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

// ==================== 家长注册 ====================

export class ParentRegisterDto {
  @ApiProperty({ description: '手机号', example: '13800138000' })
  @IsString()
  @IsNotEmpty()
  phone: string;

  @ApiPropertyOptional({ description: '邮箱', example: 'parent@example.com' })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ description: '密码', minLength: 8, maxLength: 20 })
  @IsString()
  @MinLength(8)
  @MaxLength(20)
  password: string;

  @ApiProperty({ description: '验证码', minLength: 6, maxLength: 6 })
  @IsString()
  @MinLength(6)
  @MaxLength(6)
  verifyCode: string;

  @ApiProperty({ description: '家长姓名' })
  @IsString()
  @IsNotEmpty()
  name: string;
}

// ==================== 创建儿童账号 ====================

export class LearningGoalsDto {
  @ApiPropertyOptional({ description: '兴趣领域', enum: ['AI', 'english', 'history', 'logic', 'science'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  interests?: string[];

  @ApiPropertyOptional({ description: '学习目标', enum: ['interest', 'improvement', 'competition'] })
  @IsOptional()
  @IsIn(['interest', 'improvement', 'competition'])
  target?: string;

  @ApiPropertyOptional({ description: '自定义目标' })
  @IsOptional()
  @IsString()
  customGoal?: string;
}

export class ChildCreateDto {
  @ApiProperty({ description: '昵称', minLength: 2, maxLength: 20 })
  @IsString()
  @MinLength(2)
  @MaxLength(20)
  nickname: string;

  @ApiProperty({ description: '出生日期', example: '2018-05-15' })
  @IsDateString()
  birthDate: string;

  @ApiPropertyOptional({ description: '性别', enum: ['male', 'female'] })
  @IsOptional()
  @IsIn(['male', 'female'])
  gender?: string;

  @ApiPropertyOptional({ description: '头像ID' })
  @IsOptional()
  @IsString()
  avatarId?: string;

  @ApiPropertyOptional({ description: '学习目标' })
  @IsOptional()
  learningGoals?: LearningGoalsDto;
}

// ==================== 家长登录 ====================

export class ParentLoginDto {
  @ApiProperty({ description: '登录标识（手机号或邮箱）' })
  @IsString()
  @IsNotEmpty()
  identifier: string;

  @ApiProperty({ description: '密码' })
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiPropertyOptional({ description: '设备ID' })
  @IsOptional()
  @IsString()
  deviceId?: string;
}

// ==================== 儿童登录 ====================

export class ChildLoginDto {
  @ApiProperty({ description: '儿童用户ID' })
  @IsString()
  @IsNotEmpty()
  childId: string;

  @ApiProperty({ description: '凭证类型', enum: ['password', 'pattern', 'voice'] })
  @IsIn(['password', 'pattern', 'voice'])
  credentialType: string;

  @ApiProperty({ description: '凭证（密码/图形/语音）' })
  @IsString()
  @IsNotEmpty()
  credential: string;

  @ApiPropertyOptional({ description: '设备ID' })
  @IsOptional()
  @IsString()
  deviceId?: string;
}

// ==================== 设置儿童密码 ====================

export class SetChildPasswordDto {
  @ApiProperty({ description: '儿童ID' })
  @IsString()
  @IsNotEmpty()
  childId: string;

  @ApiProperty({ description: '密码', minLength: 4, maxLength: 20 })
  @IsString()
  @MinLength(4)
  @MaxLength(20)
  password: string;
}

export class SetChildPatternDto {
  @ApiProperty({ description: '儿童ID' })
  @IsString()
  @IsNotEmpty()
  childId: string;

  @ApiProperty({ description: '图形密码（点位序列）' })
  @IsString()
  @IsNotEmpty()
  pattern: string;
}

// ==================== 登录响应 ====================

export class LoginResponseDto {
  @ApiProperty({ description: '用户ID' })
  userId: string;

  @ApiProperty({ description: '用户类型', enum: ['child', 'parent', 'teacher'] })
  userType: string;

  @ApiProperty({ description: '访问令牌' })
  accessToken: string;

  @ApiProperty({ description: '刷新令牌' })
  refreshToken: string;

  @ApiPropertyOptional({ description: '会话ID' })
  sessionId?: string;

  @ApiProperty({ description: '用户资料' })
  profile: object;

  @ApiPropertyOptional({ description: '年龄组配置' })
  ageGroupConfig?: object;
}