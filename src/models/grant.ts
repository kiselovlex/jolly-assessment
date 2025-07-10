import { z } from 'zod';

export interface Grant {
  id: string;
  eventId: string;
  ruleId: string;
  points: number;
  timestamp: Date;
}

export const GrantSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  ruleId: z.string(),
  points: z.number(),
  timestamp: z.date(),
}); 