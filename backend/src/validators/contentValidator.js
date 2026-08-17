const { z } = require('zod');
const { validate } = require('./authValidator');

const createChapterSchema = z.object({
  standardId: z.string({ required_error: 'standardId is required' }),
  subjectId: z.string({ required_error: 'subjectId is required' }),
  chapterNumber: z.number({ required_error: 'chapterNumber is required' }),
  title: z.string({ required_error: 'title is required' }).min(2),
  description: z.string().optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
  estimatedMinutes: z.number().optional(),
  xpReward: z.number().optional(),
  coinReward: z.number().optional(),
  badgeName: z.string().optional(),
});

const createTopicSchema = z.object({
  chapterId: z.string({ required_error: 'chapterId is required' }),
  title: z.string({ required_error: 'title is required' }).min(2),
  description: z.string().optional(),
  orderNumber: z.number({ required_error: 'orderNumber is required' }),
});

const createRoomSchema = z.object({
  chapterId: z.string({ required_error: 'chapterId is required' }),
  roomNumber: z.number({ required_error: 'roomNumber is required' }),
  name: z.string({ required_error: 'name is required' }).min(2),
  description: z.string().optional(),
  roomType: z.enum(['INTRO', 'PUZZLE', 'CHALLENGE', 'BOSS']).optional(),
  orderNumber: z.number({ required_error: 'orderNumber is required' }),
});

const createQuestionSchema = z.object({
  chapterId: z.string({ required_error: 'chapterId is required' }),
  topicId: z.string().optional(),
  roomId: z.string().optional(),
  questionText: z.string({ required_error: 'questionText is required' }).min(5),
  questionType: z.enum(['MCQ', 'DRAG_DROP', 'MATCHING', 'ORDERING', 'IDENTIFY', 'ELECTRON_CONFIGURATION', 'CALCULATION', 'BOSS']),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
  points: z.number().optional(),
  hint: z.string().optional(),
  explanation: z.string().optional(),
  timeLimit: z.number().optional(),
  puzzleData: z.any().optional(),
  options: z.array(z.object({
    optionText: z.string(),
    optionValue: z.string().optional(),
    isCorrect: z.boolean(),
    orderNumber: z.number(),
  })).optional(),
});

module.exports = {
  createChapterSchema,
  createTopicSchema,
  createRoomSchema,
  createQuestionSchema,
  validate,
};
