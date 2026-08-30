const { z } = require('zod');

const createStandardSchema = z.object({
  grade: z.number().int().min(4, 'Grade must be at least 4').max(12, 'Grade must be at most 12').optional(),
  name: z.string().min(1, 'Name is required').trim(),
  displayName: z.string().min(1, 'Display name is required').trim(),
  description: z.string().optional().nullable(),
  displayOrder: z.number().int().min(0, 'Display order must be a non-negative integer').optional(),
  isActive: z.boolean().optional(),
});

const updateStandardSchema = z.object({
  grade: z.number().int().min(4).max(12).optional(),
  name: z.string().min(1).trim().optional(),
  displayName: z.string().min(1).trim().optional(),
  description: z.string().optional().nullable(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

module.exports = {
  createStandardSchema,
  updateStandardSchema,
};
