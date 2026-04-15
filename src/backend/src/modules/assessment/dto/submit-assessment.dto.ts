import { ApiProperty } from '@nestjs/swagger';
import { IsObject, IsOptional, IsNumber, Min, Max } from 'class-validator';

export class SubmitAssessmentDto {
  @ApiProperty({
    description: '答题数据',
    example: { q1: 'B', q2: 'A', q3: ['A', 'C'] }
  })
  @IsObject()
  answers: Record<string, string | string[]>;
}

export class AssessmentQuestionVo {
  @ApiProperty({ description: '题目ID' })
  id: string;

  @ApiProperty({ description: '题目类型' })
  type: 'SINGLE_CHOICE' | 'MULTIPLE_CHOICE' | 'TRUE_FALSE' | 'FILL_BLANK';

  @ApiProperty({ description: '题目内容' })
  question: string;

  @ApiProperty({ description: '选项列表' })
  options?: string[];

  @ApiProperty({ description: '分值' })
  points: number;
}

export class ChapterAssessmentVo {
  @ApiProperty({ description: '测验ID' })
  assessmentId: string;

  @ApiProperty({ description: '章节ID' })
  chapterId: string;

  @ApiProperty({ description: '测验标题' })
  title: string;

  @ApiProperty({ description: '测验类型' })
  type: string;

  @ApiProperty({ description: '及格分数' })
  passingScore: number;

  @ApiProperty({ description: '时间限制（秒）', required: false })
  timeLimit?: number;

  @ApiProperty({ description: '题目列表（不含答案）', type: [AssessmentQuestionVo] })
  questions: AssessmentQuestionVo[];
}

export class AssessmentResultVo {
  @ApiProperty({ description: '得分' })
  score: number;

  @ApiProperty({ description: '是否及格' })
  passed: boolean;

  @ApiProperty({ description: '正确题数' })
  correctCount: number;

  @ApiProperty({ description: '总题数' })
  totalCount: number;

  @ApiProperty({ description: '本次尝试次数' })
  attemptNumber: number;

  @ApiProperty({ description: '最大尝试次数' })
  maxAttempts: number;

  @ApiProperty({ description: '答错题目列表', required: false })
  wrongQuestions?: {
    questionId: string;
    question: string;
    userAnswer: string | string[];
    correctAnswer: string | string[];
  }[];
}
