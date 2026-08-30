const { z } = require('zod');

const gameTypeEnum = z.enum([
  'CALCULATION_HEIST',
  'QUANTUM_ARCHITECT',
  'GRID_RECONSTRUCTION',
  'HYDROGEN_REACTOR',
  'METAL_SORTING',
  'GAS_SIMULATOR',
  'ENERGY_CORE',
  'EQUILIBRIUM_STABILIZER',
  'PRECISION_MIXING',
  'MOLECULAR_BUILDER',
  'CARBON_DETECTIVE',
  'REACTION_CIPHER',
  'PETROCHEMICAL_PIPELINE',
  'STEREOCHEMICAL_VAULT',
  'ECOLOGICAL_STRATEGY',
]);

const roomTypeEnum = z.enum(['INTRO', 'PUZZLE', 'CHALLENGE', 'BOSS']);
const difficultyEnum = z.enum(['EASY', 'MEDIUM', 'HARD', 'EXPERT']);

const createRoomSchema = z.object({
  chapterId: z.string().min(1, 'chapterId is required').trim(),
  roomNumber: z.number().int().min(1, 'roomNumber must be a positive integer').optional(),
  name: z.string().min(1, 'name is required').trim(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  roomType: roomTypeEnum.optional().default('PUZZLE'),
  gameType: gameTypeEnum.optional().default('CALCULATION_HEIST'),
  gameConfig: z.record(z.any()).optional().nullable(),
  difficulty: difficultyEnum.optional().default('MEDIUM'),
  estimatedMinutes: z.number().int().min(1).optional().default(15),
  estimatedTime: z.number().int().min(1).optional(),
  xpReward: z.number().int().min(0).optional().default(100),
  coinReward: z.number().int().min(0).optional().default(25),
  orderNumber: z.number().int().min(1).optional(),
  isActive: z.boolean().optional().default(true),
});

const updateRoomSchema = z.object({
  roomNumber: z.number().int().min(1).optional(),
  name: z.string().min(1).trim().optional(),
  title: z.string().optional().nullable(),
  description: z.string().optional().nullable(),
  roomType: roomTypeEnum.optional(),
  gameType: gameTypeEnum.optional(),
  gameConfig: z.record(z.any()).optional().nullable(),
  difficulty: difficultyEnum.optional(),
  estimatedMinutes: z.number().int().min(1).optional(),
  estimatedTime: z.number().int().min(1).optional(),
  xpReward: z.number().int().min(0).optional(),
  coinReward: z.number().int().min(0).optional(),
  orderNumber: z.number().int().min(1).optional(),
  isActive: z.boolean().optional(),
});

module.exports = {
  createRoomSchema,
  updateRoomSchema,
  gameTypeEnum,
};
