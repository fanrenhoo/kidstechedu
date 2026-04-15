import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional, Min, Max, IsBoolean, IsArray, ValidateNested, IsString } from 'class-validator';
import { Type } from 'class-transformer';

// 时间段
export class TimeSlotDto {
  @ApiProperty({ description: '开始时间 (HH:mm)', example: '09:00' })
  @IsString()
  start: string;

  @ApiProperty({ description: '结束时间 (HH:mm)', example: '21:00' })
  @IsString()
  end: string;

  @ApiProperty({ description: '适用星期', example: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'] })
  @IsArray()
  days: string[]; // 空数组表示每天
}

export class UpdateControlSettingsDto {
  @ApiProperty({ description: '每日学习时长上限（分钟），0=不限', required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  dailyLimitMins?: number;

  @ApiProperty({ description: '学习时段限制', type: [TimeSlotDto], required: false })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimeSlotDto)
  timeSlots?: TimeSlotDto[];

  @ApiProperty({ description: '是否启用', required: false })
  @IsOptional()
  @IsBoolean()
  isActive?: boolean;
}

export class TimeCheckResultDto {
  @ApiProperty({ description: '是否允许学习' })
  allowed: boolean;

  @ApiProperty({ description: '剩余可学习分钟数' })
  remainingMins: number;

  @ApiProperty({ description: '不允许的原因', required: false, enum: ['DAILY_LIMIT_REACHED', 'OUT_OF_TIME_SLOT'] })
  reason?: string;
}

export class HeartbeatDto {
  @ApiProperty({ description: '学习会话ID' })
  @IsString()
  sessionId: string;

  @ApiProperty({ description: '本次观看的分钟数' })
  @IsInt()
  @Min(0)
  watchedMins: number;
}

export class StartSessionDto {
  @ApiProperty({ description: '课程ID', required: false })
  @IsOptional()
  @IsString()
  courseId?: string;

  @ApiProperty({ description: '章节ID', required: false })
  @IsOptional()
  @IsString()
  chapterId?: string;
}
