// Mock AI API for frontend development
// Simulates MiniMax AI responses for Q&A

// Simulate network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Mock conversation history
const mockConversations: Array<{
  id: string
  childId: string
  courseId?: string
  question: string
  answer: string
  category: 'AI' | '逻辑思维' | '科学' | '历史' | '其它'
  createdAt: string
  answeredAt: string
}> = [
  {
    id: 'conv-001',
    childId: 'child-001',
    question: '什么是人工智能？',
    answer: '人工智能（Artificial Intelligence，简称AI）是指让计算机系统具有模拟人类智能的能力，包括学习、推理、规划、理解语言、识别图像等。它通过算法和大量数据来训练模型，使机器能够完成以前需要人类智能才能完成的任务。\n\n人工智能有很多应用，比如：\n- 语音助手（如Siri、小爱同学）\n- 推荐系统（抖音、淘宝的个性化推荐）\n- 自动驾驶\n- 医疗诊断辅助\n\n你想了解更多关于AI的哪个方面呢？',
    category: 'AI',
    createdAt: '2026-05-04T10:30:00Z',
    answeredAt: '2026-05-04T10:30:15Z'
  },
  {
    id: 'conv-002',
    childId: 'child-001',
    question: '为什么天是蓝色的？',
    answer: '天空呈现蓝色是因为光的散射现象。\n\n太阳光包含多种颜色的光，当它穿过地球大气层时，会与大气中的气体分子碰撞并向各个方向散开。这种现象叫做瑞利散射。\n\n蓝光波长较短，比其他颜色的光更容易被散射，所以我们看到的天空是蓝色的。\n\n早晨和傍晚时，太阳光需要穿过更长的大气层，蓝光被散射得更多，只剩下红光和橙光，所以日出和日落时天空呈现红色或橙色。',
    category: '科学',
    createdAt: '2026-05-03T15:20:00Z',
    answeredAt: '2026-05-03T15:20:30Z'
  },
  {
    id: 'conv-003',
    childId: 'child-001',
    question: '什么是二进制？',
    answer: '二进制（Binary）是计算机使用的一种计数系统，只用0和1两个数字来表示所有数值。\n\n我们平时使用的是十进制，有0-9共10个数字。而二进制只有0和1两个数字。\n\n比如：\n- 十进制的 0 = 二进制的 0\n- 十进制的 1 = 二进制的 1\n- 十进制的 2 = 二进制的 10\n- 十进制的 3 = 二进制的 11\n- 十进制的 10 = 二进制的 1010\n\n计算机用二进制是因为电路只有"开"和"关"两种状态，用0和1表示非常方便。',
    category: '逻辑思维',
    createdAt: '2026-05-02T09:00:00Z',
    answeredAt: '2026-05-02T09:00:20Z'
  }
]

// Mock learning summaries
const mockSummaries: Record<string, {
  id: string
  childId: string
  period: string
  summary: string
  nextRecommendations: string[]
  createdAt: string
}> = {
  'child-001': {
    id: 'summary-001',
    childId: 'child-001',
    period: '2026-04-28 ~ 2026-05-04',
    summary: '本周学习了人工智能基础知识和光的基本原理。完成了2个课程章节的学习，答题正确率达到了85%。在逻辑思维方面表现优秀，二进制知识掌握较好。',
    nextRecommendations: [
      '建议继续深入学习AI的机器学习基础',
      '可以尝试简单的编程练习',
      '推荐观看科普视频了解光的折射现象',
      '可以开始学习更复杂的逻辑运算'
    ],
    createdAt: '2026-05-04T18:00:00Z'
  }
}

// Mock AI answers
const mockAnswers: Record<string, string> = {
  'AI': '人工智能是一个很有趣的话题！它让计算机能够像人类一样学习和思考。你想了解AI的哪些方面呢？比如机器学习、神经网络还是实际应用？',
  '逻辑思维': '这是个很好的逻辑思维问题！让我帮你分析一下...通过练习逻辑推理，你可以提高解决问题的能力。',
  '科学': '这是关于科学的好问题！科学帮助我们理解世界的运作方式。让我们一起来探索这个现象...',
  '历史': '历史是一面镜子，让我们从过去学到经验。这个故事很有意思...',
  '其它': '好的，让我来回答你的问题...如果你有其他疑问，随时可以问我！'
}

// Simulate AI asking question
export const mockAskAi = async (data: { question: string; category?: string; courseId?: string }) => {
  await delay(1500) // Simulate API call delay

  const category = data.category || '其它'
  const answer = mockAnswers[category] || mockAnswers['其它']

  const newConversation = {
    id: `conv-${Date.now()}`,
    childId: 'child-001',
    courseId: data.courseId,
    question: data.question,
    answer,
    category: category as 'AI' | '逻辑思维' | '科学' | '历史' | '其它',
    createdAt: new Date().toISOString(),
    answeredAt: new Date().toISOString()
  }

  return newConversation
}

// Get conversation history
export const mockGetConversations = async (childId: string) => {
  await delay(500)
  return mockConversations.filter(c => c.childId === childId)
}

// Get learning summary
export const mockGetSummary = async (childId: string) => {
  await delay(500)
  return mockSummaries[childId] || mockSummaries['child-001']
}

// Generate new summary
export const mockGenerateSummary = async (childId: string) => {
  await delay(2000) // Simulate processing time

  const newSummary = {
    id: `summary-${Date.now()}`,
    childId,
    period: '2026-04-28 ~ 2026-05-04',
    summary: '根据本周的学习数据，孩子表现良好。课程完成度高，答题准确率较上周提升了5个百分点。继续保持！',
    nextRecommendations: [
      '建议每天坚持学习15-30分钟',
      '可以挑战更高难度的题目',
      '多参与互动式学习体验'
    ],
    createdAt: new Date().toISOString()
  }

  mockSummaries[childId] = newSummary
  return newSummary
}

// Get course categories
export const mockGetCategories = async () => {
  await delay(300)
  return [
    { id: 'ai', name: 'AI', icon: 'robot' },
    { id: 'logic', name: '逻辑思维', icon: 'brain' },
    { id: 'science', name: '科学', icon: 'flask' },
    { id: 'history', name: '历史', icon: 'book' },
    { id: 'other', name: '其它', icon: 'star' }
  ]
}