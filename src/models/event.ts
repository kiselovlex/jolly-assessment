import { z } from 'zod';

export type EventType = 'visit';

export interface Event {
  id: string;
  profileId: string;
  type: EventType;
  timestamp: Date; // Parsed from createdAt or updatedAt
  metadata: Partial<{
    clockInTime: Date | null;
    clockOutTime: Date | null;
    scheduledStartTime: Date | null;
    scheduledEndTime: Date | null;
    correctClockInMethod: boolean | null;
    documentation: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  }> & Record<string, any>; // Allow additional fields
}

export const EventSchema = z.object({
  id: z.string(),
  profileId: z.string(),
  type: z.union([z.literal('visit')]),
  timestamp: z.date(),
  metadata: z.record(z.string(), z.any()),
});