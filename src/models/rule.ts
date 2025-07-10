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
  name: z.string(),
  eventType: z.literal('visit'),
  condition: z.any(),
  points: z.number().positive(),
});
