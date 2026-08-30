const { z } = require('zod');

const createSubjectSchema = z.object({
  name: z.string().min(1, 'Subject name is required').trim(),
  code: z.string().min(1, 'Subject code is required').trim().toUpperCase(),
  description: z.string().optional().nullable(),
  icon: z.string().optional().default('🧪'),
  displayOrder: z.number().int().min(0, 'Display order must be a non-negative integer').optional().default(0),
  isActive: z.boolean().optional().default(true),
});

const updateSubjectSchema = z.object({
  name: z.string().min(1).trim().optional(),
  code: z.string().min(1).trim().toUpperCase().optional(),
  description: z.string().optional().nullable(),
  icon: z.string().optional(),
  displayOrder: z.number().int().min(0).optional(),
  isActive: z.boolean().optional(),
});

const mapStandardSubjectSchema = z.object({
  standardId: z.string().min(1, 'Standard ID is required').trim(),
  subjectId: z.string().min(1, 'Subject ID is required').trim(),
  displayOrder: z.number().int().min(0).optional().default(0),
});

const unmapStandardSubjectSchema = z.object({
  standardId: z.string().min(1, 'Standard ID is required').trim(),
  subjectId: z.string().min(1, 'Subject ID is required').trim(),
});

module.exports = {
  createSubjectSchema,
  updateSubjectSchema,
  mapStandardSubjectSchema,
  unmapStandardSubjectSchema,
};
