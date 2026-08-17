const { z } = require('zod');
const { validate } = require('./authValidator');

const saveGameSchema = z.object({
  score: z.number().min(0).optional(),
  livesRemaining: z.number().min(0).max(10).optional(),
  gameState: z.any().optional(),
});

const completeGameSchema = z.object({
  score: z.number({ required_error: 'score is required' }).min(0),
  stars: z.number({ required_error: 'stars is required' }).min(0).max(3),
  timeSpentSec: z.number().min(0).optional(),
  gameState: z.any().optional(),
});

const failGameSchema = z.object({
  score: z.number().min(0).optional(),
  timeSpentSec: z.number().min(0).optional(),
  gameState: z.any().optional(),
});

module.exports = {
  saveGameSchema,
  completeGameSchema,
  failGameSchema,
  validate,
};
