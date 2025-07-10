import { z } from 'zod';

export interface Grant {
  id: string;
  employeeId: string;
  ruleId: string;
  eventId: string;
  points: number;
  timestamp: Date;
}

export const GrantSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  ruleId: z.string(),
  eventId: z.string(),
  points: z.number(),
  timestamp: z.date(),
});
