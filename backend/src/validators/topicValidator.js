const { z } = require('zod');

const createTopicSchema = z.object({
  chapterId: z.string().min(1, 'chapterId is required').trim(),
  title: z.string().min(1, 'title is required').trim(),
  description: z.string().optional().nullable(),
  orderNumber: z.number().int().min(1, 'orderNumber must be a positive integer').optional(),
  displayOrder: z.number().int().min(1, 'displayOrder must be a positive integer').optional(),
  isActive: z.boolean().optional().default(true),
}).refine(data => data.orderNumber !== undefined || data.displayOrder !== undefined, {
  message: 'orderNumber or displayOrder must be provided',
});

const updateTopicSchema = z.object({
  title: z.string().min(1).trim().optional(),
  description: z.string().optional().nullable(),
  orderNumber: z.number().int().min(1).optional(),
  displayOrder: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

module.exports = {
  createTopicSchema,
  updateTopicSchema,
};
