import { ApiProperty } from '@nestjs/swagger';

export class CurrentStatusVo {
  @ApiProperty({ description: '是否在线' })
  isOnline: boolean;

  @ApiProperty({ description: '当前课程', required: false })
  currentCourse?: {
    id: string;
    title: string;
    chapterTitle?: string;
  };

  @ApiProperty({ description: '当前会话', required: false })
  currentSession?: {
    startTime: Date;
    watchedMins: number;
  };

  @ApiProperty({ description: '今日已学习分钟数' })
  todayTotalMins: number;

  @ApiProperty({ description: '每日限制分钟数' })
  dailyLimitMins: number;

  @ApiProperty({ description: '剩余可学习分钟数' })
  remainingMins: number;
}

export class CourseProgressSummaryVo {
  @ApiProperty({ description: '课程ID' })
  courseId: string;

  @ApiProperty({ description: '课程标题' })
  title: string;

  @ApiProperty({ description: '课程进度百分比' })
  progressPercentage: number;

  @ApiProperty({ description: '已完成章节数' })
  completedChapters: number;

  @ApiProperty({ description: '总章节数' })
  totalChapters: number;
}

export class AssessmentHistoryVo {
  @ApiProperty({ description: '考核ID' })
  assessmentId: string;

  @ApiProperty({ description: '考核标题' })
  title: string;

  @ApiProperty({ description: '课程标题' })
  courseTitle?: string;

  @ApiProperty({ description: '得分' })
  score: number;

  @ApiProperty({ description: '是否及格' })
  passed: boolean;

  @ApiProperty({ description: '完成时间' })
  completedAt: Date;

  @ApiProperty({ description: '尝试次数' })
  attemptNumber: number;
}

export class HistoryRecordVo {
  @ApiProperty({ description: '日期' })
  date: string;

  @ApiProperty({ description: '当日总学习分钟数' })
  totalMins: number;

  @ApiProperty({ description: '课程列表' })
  courses: {
    courseId: string;
    title: string;
    watchedMins: number;
    chaptersCompleted: number;
  }[];
}

export class LearningHistoryVo {
  @ApiProperty({ description: '学习记录', type: [HistoryRecordVo] })
  records: HistoryRecordVo[];

  @ApiProperty({ description: '测验结果', type: [AssessmentHistoryVo] })
  quizResults: AssessmentHistoryVo[];
}
