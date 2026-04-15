import { ApiProperty } from '@nestjs/swagger';

export class ChapterProgressVo {
  @ApiProperty({ description: '章节ID' })
  chapterId: string;

  @ApiProperty({ description: '章节序号' })
  sequence: number;

  @ApiProperty({ description: '章节标题' })
  title: string;

  @ApiProperty({ description: '观看进度（0-100）' })
  progress: number;

  @ApiProperty({ description: '是否已完成' })
  isCompleted: boolean;

  @ApiProperty({ description: '是否已解锁' })
  isUnlocked: boolean;
}

export class CourseProgressVo {
  @ApiProperty({ description: '课程ID' })
  courseId: string;

  @ApiProperty({ description: '孩子ID' })
  childId: string;

  @ApiProperty({ description: '课程进度百分比' })
  progressPercentage: number;

  @ApiProperty({ description: '已完成的章节列表' })
  completedChapters: string[];

  @ApiProperty({ description: '当前章节' })
  currentChapter: {
    id: string;
    title: string;
    progress: number;
  };

  @ApiProperty({ description: '最后访问时间' })
  lastAccessAt: Date;
}

export class LearningSummaryVo {
  @ApiProperty({ description: '孩子ID' })
  childId: string;

  @ApiProperty({ description: '总学习时长（分钟）' })
  totalLearningMinutes: number;

  @ApiProperty({ description: '已完成课程数' })
  completedCourses: number;

  @ApiProperty({ description: '进行中课程数' })
  inProgressCourses: number;

  @ApiProperty({ description: '本周学习天数' })
  weeklyLearningDays: number;

  @ApiProperty({ description: '最近学习的课程' })
  recentCourses: {
    courseId: string;
    title: string;
    progress: number;
  }[];
}
