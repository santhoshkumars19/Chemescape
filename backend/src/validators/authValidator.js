const { z } = require('zod');

const registerSchema = z.object({
  name: z
    .string({ required_error: 'Name is required' })
    .trim()
    .min(2, { message: 'Name must be at least 2 characters' }),
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .email({ message: 'Invalid email address format' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(8, { message: 'Password must be at least 8 characters' }),
  role: z
    .enum(['STUDENT', 'TEACHER', 'ADMIN'])
    .optional(),
});

const loginSchema = z.object({
  email: z
    .string({ required_error: 'Email is required' })
    .trim()
    .min(3, { message: 'Email or login identifier is required' }),
  password: z
    .string({ required_error: 'Password is required' })
    .min(1, { message: 'Password is required' }),
});

/**
 * Middleware factory for Zod schema validation
 */
const validate = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.body);

  if (!result.success) {
    const formattedErrors = {};
    result.error.issues.forEach((issue) => {
      const field = issue.path.join('.') || 'general';
      formattedErrors[field] = issue.message;
    });

    return res.status(400).json({
      success: false,
      message: 'Validation failed',
      errors: formattedErrors,
    });
  }

  req.body = result.data;
  next();
};

module.exports = {
  registerSchema,
  loginSchema,
  validate,
};
