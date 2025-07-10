import { Condition } from './models/condition';
import { Event } from './models/event';

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
  if (typeof ({} as Metadata)[path] !== 'string') throw new Error('Contains only for string paths');
  return { type: 'contains', path, value };
}

export function and(...conditions: Condition[]): Condition {
  return { type: 'and', conditions };
}

export function or(...conditions: Condition[]): Condition {
  return { type: 'or', conditions };
}

export function evaluate(condition: Condition, event: Event): boolean {
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
      return condition.conditions.every((c) => evaluate(c, event));
    case 'or':
      return condition.conditions.some((c) => evaluate(c, event));
    default:
      return false;
  }
}
