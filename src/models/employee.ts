import { z } from 'zod';

export interface Employee {
  id: string;
  name: string;
  pointBalance: number;
  onboarded?: boolean;
}

export const EmployeeSchema = z.object({
  id: z.string(),
  name: z.string(),
  pointBalance: z.number(),
  onboarded: z.boolean().optional(),
});
