import { Employee, EmployeeSchema } from './models/employee';
import { Event, EventSchema } from './models/event';
import { Rule } from './models/rule';
import { Grant } from './models/grant';
import fs from 'fs/promises';
import path from 'path';

export let employees: Employee[] = [];

export let events: Event[] = [];

export let rules: Rule[] = [];

export let grants: Grant[] = [];

export async function populateStorage(filePath: string): Promise<void> {
  try {
    const fullPath = path.join(process.cwd(), filePath);
    const fileContent = await fs.readFile(fullPath, 'utf-8');
    const { profiles, visits } = JSON.parse(fileContent);

    employees = profiles.map((p: any) => {
      const parsed = EmployeeSchema.safeParse(p);
      if (!parsed.success) {
        throw new Error(`Invalid profile: ${JSON.stringify(p)}`);
      }
      return parsed.data;
    });

    events = visits.map((v: any) => {
      const metadata = {
        ...v,
        clockInTime: v.clockInTime ? new Date(v.clockInTime) : null,
        clockOutTime: v.clockOutTime ? new Date(v.clockOutTime) : null,
        scheduledStartTime: v.scheduledStartTime ? new Date(v.scheduledStartTime) : null,
        scheduledEndTime: v.scheduledEndTime ? new Date(v.scheduledEndTime) : null,
        createdAt: v.createdAt ? new Date(v.createdAt) : null,
        updatedAt: v.updatedAt ? new Date(v.updatedAt) : null,
      };
      const eventData = {
        id: v.id,
        profileId: v.profileId,
        type: 'visit',
        timestamp: new Date(v.createdAt || v.updatedAt || Date.now()),
        metadata,
      };
      const parsed = EventSchema.safeParse(eventData);
      if (!parsed.success) {
        throw new Error(`Invalid visit: ${JSON.stringify(v)}`);
      }
      return parsed.data;
    });

    console.log(
      `Populated ${employees.length} employees and ${events.length} events from ${filePath}`
    );
  } catch (error) {
    console.error('Error populating storage:', error);
  }
}
