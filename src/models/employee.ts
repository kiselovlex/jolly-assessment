import { z } from 'zod';

export interface Employee {
  id: string;
  name: string;
  points: number;
  pointBalance: number;
  onboarded?: boolean;
}

export const EmployeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  points: z.number().default(0),
  pointBalance: z.number(),
  onboarded: z.boolean().optional(),
});
