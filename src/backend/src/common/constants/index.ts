// 年龄分组常量
export enum AgeGroup {
  YOUNG = '4-6',
  MIDDLE = '7-9',
  OLDER = '10-12',
}

// 用户类型常量
export enum UserType {
  CHILD = 'child',
  PARENT = 'parent',
  TEACHER = 'teacher',
  ADMIN = 'admin',
}

// 用户状态常量
export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

// 课程状态常量
export enum CourseStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

// 评论状态常量
export enum CommentStatus {
  PENDING = 'pending',
  APPROVED = 'approved',
  REJECTED = 'rejected',
  DELETED = 'deleted',
}

// 学习领域能力评分
export enum AbilityDomain {
  AI = 'ai',
  ENGLISH = 'english',
  HISTORY = 'history',
  LOGIC = 'logic',
  SCIENCE = 'science',
}

// 考核类型
export enum AssessmentType {
  CHAPTER = 'chapter',
  COURSE = 'course',
  PERIODIC = 'periodic',
  UPGRADE = 'upgrade',
  SPECIAL = 'special',
}

// 勋章类别
export enum BadgeCategory {
  LEARNING = 'learning',
  SOCIAL = 'social',
  CHALLENGE = 'challenge',
  MILESTONE = 'milestone',
}

// 群组类型
export enum GroupType {
  COURSE = 'course',
  INTEREST = 'interest',
  CLASS = 'class',
  PARTNER = 'partner',
}

// 群组角色
export enum GroupRole {
  MEMBER = 'member',
  ADMIN = 'admin',
  CREATOR = 'creator',
}

// 学习行为类型
export enum LearningActionType {
  VIDEO_PLAY = 'video_play',
  VIDEO_PAUSE = 'video_pause',
  VIDEO_SEEK = 'video_seek',
  VIDEO_COMPLETE = 'video_complete',
  QUIZ_ANSWER = 'quiz_answer',
  INTERACTION_COMPLETE = 'interaction_complete',
  NOTE_CREATE = 'note_create',
  COMMENT_CREATE = 'comment_create',
}

// 默认配置
export const DEFAULT_CONFIG = {
  // 学习时长限制（分钟）
  DAILY_TIME_LIMIT: 120,
  // 会话过期时间（秒）
  SESSION_EXPIRE: 3600,
  // JWT过期时间
  JWT_EXPIRE_CHILD: '4h',
  JWT_EXPIRE_PARENT: '2h',
  // 内容长度限制
  MAX_CONTENT_LENGTH_4_6: 200,
  MAX_CONTENT_LENGTH_7_9: 300,
  MAX_CONTENT_LENGTH_10_12: 500,
};

// 年龄组配置
export const AGE_GROUP_CONFIG = {
  [AgeGroup.YOUNG]: {
    maxContentLength: DEFAULT_CONFIG.MAX_CONTENT_LENGTH_4_6,
    interactionStyle: 'voice',
    navigationStyle: 'large-icon',
    animationLevel: 'high',
    feedbackStyle: 'emoji',
    features: ['video', 'interaction'],
    jwtExpire: DEFAULT_CONFIG.JWT_EXPIRE_CHILD,
  },
  [AgeGroup.MIDDLE]: {
    maxContentLength: DEFAULT_CONFIG.MAX_CONTENT_LENGTH_7_9,
    interactionStyle: 'text-voice',
    navigationStyle: 'icon-text',
    animationLevel: 'medium',
    feedbackStyle: 'emoji-text',
    features: ['video', 'interaction', 'quiz', 'note', 'comment'],
    jwtExpire: DEFAULT_CONFIG.JWT_EXPIRE_CHILD,
  },
  [AgeGroup.OLDER]: {
    maxContentLength: DEFAULT_CONFIG.MAX_CONTENT_LENGTH_10_12,
    interactionStyle: 'text',
    navigationStyle: 'full',
    animationLevel: 'low',
    feedbackStyle: 'text',
    features: ['video', 'interaction', 'quiz', 'note', 'comment', 'blog', 'group'],
    jwtExpire: DEFAULT_CONFIG.JWT_EXPIRE_CHILD,
  },
};