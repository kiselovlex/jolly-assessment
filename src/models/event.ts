import { z } from 'zod';

export type EventType = 'visit';

export interface Event {
  id: string;
  employeeId: string;
  type: EventType;
  timestamp: Date;
  metadata: Partial<{
    clockInTime: Date | null;
    clockOutTime: Date | null;
    scheduledStartTime: Date | null;
    scheduledEndTime: Date | null;
    correctClockInMethod: boolean | null;
    documentation: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
  }> &
    // TODO: Consider fixing if time allows
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    Record<string, any>;
}

export const EventSchema = z.object({
  id: z.string(),
  employeeId: z.string(),
  type: z.union([z.literal('visit')]),
  timestamp: z.coerce.date(),
  metadata: z.record(z.string(), z.any()),
});
