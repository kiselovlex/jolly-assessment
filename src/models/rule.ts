import { z } from 'zod';
import { Condition } from './condition';
import { EventType } from './event';

export interface Rule {
  id: string;
  name: string;
  eventType: EventType;
  condition: Condition;
  points: number;
}

export const RuleSchema = z.object({
  id: z.string(),
  name: z.string(),
  eventType: z.string(),
  condition: z.any(), // For simplicity; can be made recursive if needed
  points: z.number(),
});