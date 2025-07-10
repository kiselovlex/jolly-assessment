import { Condition } from './models/condition';
import { Event } from './models/event';
import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

type Metadata = Event['metadata'];
type Path = keyof Metadata;

type NumberOrDateKey = { [K in Path]: Metadata[K] extends number | Date | null ? K : never }[Path];

export function eq<K extends Path>(path: K, value: Metadata[K]): Condition {
  return { type: 'eq', path, value };
}

export function gt<K extends NumberOrDateKey>(path: K, value: NonNullable<Metadata[K]>): Condition {
  return { type: 'gt', path, value };
}

export function lt<K extends NumberOrDateKey>(path: K, value: NonNullable<Metadata[K]>): Condition {
  return { type: 'lt', path, value };
}

export function contains<K extends Path>(path: K, value: string): Condition {
  return { type: 'contains', path, value };
}

export function and(...conditions: Condition[]): Condition {
  return { type: 'and', conditions };
}

export function or(...conditions: Condition[]): Condition {
  return { type: 'or', conditions };
}

export function llmJudge<K extends Path>(path: K, prompt: string): Condition {
  return { type: 'llm_judge', path, prompt };
}

export async function evaluate(condition: Condition, event: Event): Promise<boolean> {
  const getValue = <K extends Path>(path: K): Metadata[K] => event.metadata[path];

  switch (condition.type) {
    case 'eq':
      return getValue(condition.path) === condition.value;
    case 'gt': {
      const val = getValue(condition.path);
      if (val == null || condition.value == null) return false;
      if (val instanceof Date && condition.value instanceof Date) return val > condition.value;
      if (typeof val === 'number' && typeof condition.value === 'number')
        return val > condition.value;
      return false;
    }
    case 'lt': {
      const val = getValue(condition.path);
      if (val == null || condition.value == null) return false;
      if (val instanceof Date && condition.value instanceof Date) return val < condition.value;
      if (typeof val === 'number' && typeof condition.value === 'number')
        return val < condition.value;
      return false;
    }
    case 'contains': {
      const val = getValue(condition.path);
      return typeof val === 'string' && val.includes(condition.value);
    }
    case 'and':
      return (await Promise.all(condition.conditions.map((c) => evaluate(c, event)))).every(
        Boolean
      );
    case 'or':
      return (await Promise.all(condition.conditions.map((c) => evaluate(c, event)))).some(Boolean);
    case 'llm_judge': {
      const text = getValue(condition.path);
      if (typeof text !== 'string') return false;
      const { object } = await generateObject<{ isSatisfied: boolean }>({
        model: openai('gpt-4o-mini'),
        schema: z.object({ isSatisfied: z.boolean() }),
        prompt: `${condition.prompt} Text: ${text}`,
      });
      return object.isSatisfied;
    }
    default:
      return false;
  }
}
