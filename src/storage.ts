import { Employee, EmployeeSchema } from './models/employee';
import { Event } from './models/event';
import { Rule } from './models/rule';
import { Grant } from './models/grant';
import fs from 'fs/promises';
import path from 'path';

export let employees: Employee[] = [];

export const events: Event[] = [];

export const rules: Rule[] = [];

export const grants: Grant[] = [];

export async function populateStorage(filePath: string): Promise<void> {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    const { profiles } = JSON.parse(fileContent);

    employees = profiles.map((p: unknown) => {
      const parsed = EmployeeSchema.safeParse(p);
      if (!parsed.success) {
        throw new Error(`Invalid profile: ${JSON.stringify(p)}`);
      }
      return parsed.data;
    });

    console.log(`Populated ${employees.length} employees from ${filePath}`);
  } catch (error) {
    console.error('Error populating storage:', error);
  }
}
