const { z } = require('zod');

const createChapterSchema = z.object({
  standardId: z.string().min(1, 'standardId is required').trim(),
  subjectId: z.string().min(1, 'subjectId is required').trim(),
  chapterNumber: z.number().int().min(1, 'chapterNumber must be a positive integer'),
  title: z.string().min(1, 'title is required').trim(),
  description: z.string().optional().nullable(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional().default('MEDIUM'),
  estimatedMinutes: z.number().int().min(1).optional().default(30),
  xpReward: z.number().int().min(0).optional().default(500),
  coinReward: z.number().int().min(0).optional().default(100),
  badgeName: z.string().optional().nullable(),
  isLocked: z.boolean().optional().default(false),
  isActive: z.boolean().optional().default(true),
  displayOrder: z.number().int().min(0).optional().default(0),
});

const updateChapterSchema = z.object({
  title: z.string().min(1).trim().optional(),
  description: z.string().optional().nullable(),
  chapterNumber: z.number().int().min(1).optional(),
  difficulty: z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']).optional(),
  estimatedMinutes: z.number().int().min(1).optional(),
  xpReward: z.number().int().min(0).optional(),
  coinReward: z.number().int().min(0).optional(),
  badgeName: z.string().optional().nullable(),
  isLocked: z.boolean().optional(),
  isActive: z.boolean().optional(),
  displayOrder: z.number().int().min(0).optional(),
});

module.exports = {
  createChapterSchema,
  updateChapterSchema,
};
