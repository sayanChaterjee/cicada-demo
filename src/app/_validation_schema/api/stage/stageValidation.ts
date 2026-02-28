import { z } from 'zod';

export const CreateStageSchema = z.object({
  gameId: z.string().min(3),
  question: z.string().optional(),
  answer: z.union([z.string().min(1).max(200), z.number().int().positive()]),
  points: z.number().int().positive(),
  hint: z.string().optional(),
  stageId: z.number().int().positive(),
  image: z.array(z.string()).optional(),
});

export const CheckAnswerSchema = z.object({
  id: z.string().min(3),
  answer: z.union([z.string().min(1).max(200), z.number().int().positive()]),
});
