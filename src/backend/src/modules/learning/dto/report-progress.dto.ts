import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsOptional, Min, Max } from 'class-validator';

export class ReportProgressDto {
  @ApiProperty({ description: '章节ID' })
  @IsString()
  chapterId: string;

  @ApiProperty({ description: '已观看秒数' })
  @IsNumber()
  @Min(0)
  watchedSeconds: number;

  @ApiProperty({ description: '视频总时长（秒）' })
  @IsNumber()
  @Min(1)
  duration: number;

  @ApiProperty({ description: '本次学习时长（秒）', required: false })
  @IsOptional()
  @IsNumber()
  @Min(0)
  durationSeconds?: number;
}

export class CompleteChapterDto {
  @ApiProperty({ description: '章节ID' })
  @IsString()
  chapterId: string;

  @ApiProperty({ description: '课程ID' })
  @IsString()
  courseId: string;
}
