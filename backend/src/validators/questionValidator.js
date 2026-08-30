const { z } = require('zod');

const questionTypeEnum = z.enum([
  'MCQ',
  'DRAG_DROP',
  'MATCHING',
  'ORDERING',
  'IDENTIFY',
  'ELECTRON_CONFIGURATION',
  'CALCULATION',
  'BOSS',
  'SIMULATION',
]);

const difficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']);
const questionStatusEnum = z.enum(['DRAFT', 'PUBLISHED', 'ARCHIVED']);

const questionOptionSchema = z.object({
  id: z.string().optional(),
  optionKey: z.string().optional().nullable(),
  optionText: z.string().min(1, 'optionText is required').trim(),
  optionValue: z.string().optional().nullable(),
  isCorrect: z.boolean().optional().default(false),
  orderNumber: z.number().int().min(0).optional().default(0),
  displayOrder: z.number().int().min(0).optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const createQuestionSchema = z.object({
  roomId: z.string().min(1).optional().nullable(),
  chapterId: z.string().min(1).optional().nullable(),
  topicId: z.string().min(1).optional().nullable(),
  questionNumber: z.number().int().min(1, 'questionNumber must be a positive integer').optional().default(1),
  displayOrder: z.number().int().min(0).optional().default(0),
  questionType: questionTypeEnum.optional().default('MCQ'),
  questionText: z.string().min(1, 'questionText is required').trim(),
  description: z.string().optional().nullable(),
  difficulty: difficultyEnum.optional().default('MEDIUM'),
  points: z.number().int().min(0).optional().default(100),
  timeLimit: z.number().int().min(1).optional().default(60),
  hint: z.string().optional().nullable(),
  explanation: z.string().optional().nullable(),
  puzzleData: z.record(z.any()).optional().nullable(),
  options: z.array(questionOptionSchema).optional(),
  status: questionStatusEnum.optional().default('PUBLISHED'),
  isActive: z.boolean().optional().default(true),
}).superRefine((data, ctx) => {
  if (data.status === 'PUBLISHED') {
    if (data.questionType === 'MCQ') {
      if (!data.options || data.options.length < 2) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Published MCQ questions must have at least 2 options',
          path: ['options'],
        });
      } else {
        const correctCount = data.options.filter(o => o.isCorrect === true).length;
        if (correctCount === 0) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Published MCQ questions must have at least 1 correct option',
            path: ['options'],
          });
        }
      }
    }
  }
});

const updateQuestionSchema = z.object({
  roomId: z.string().min(1).optional().nullable(),
  chapterId: z.string().min(1).optional().nullable(),
  topicId: z.string().min(1).optional().nullable(),
  questionNumber: z.number().int().min(1).optional(),
  displayOrder: z.number().int().min(0).optional(),
  questionType: questionTypeEnum.optional(),
  questionText: z.string().min(1).trim().optional(),
  description: z.string().optional().nullable(),
  difficulty: difficultyEnum.optional(),
  points: z.number().int().min(0).optional(),
  timeLimit: z.number().int().min(1).optional(),
  hint: z.string().optional().nullable(),
  explanation: z.string().optional().nullable(),
  puzzleData: z.record(z.any()).optional().nullable(),
  options: z.array(questionOptionSchema).optional(),
  status: questionStatusEnum.optional(),
  isActive: z.boolean().optional(),
}).superRefine((data, ctx) => {
  if (data.status === 'PUBLISHED' && data.questionType === 'MCQ' && data.options) {
    if (data.options.length < 2) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Published MCQ questions must have at least 2 options',
        path: ['options'],
      });
    } else {
      const correctCount = data.options.filter(o => o.isCorrect === true).length;
      if (correctCount === 0) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: 'Published MCQ questions must have at least 1 correct option',
          path: ['options'],
        });
      }
    }
  }
});

module.exports = {
  createQuestionSchema,
  updateQuestionSchema,
  questionTypeEnum,
  difficultyEnum,
  questionStatusEnum,
};
