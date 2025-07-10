import { eq, gt, lt, contains, and, or, evaluate } from './dsl';
import { Event } from './models/event';

describe('DSL builders', () => {
  test('eq creates correct condition', () => {
    expect(eq('path', 'value')).toEqual({ type: 'eq', path: 'path', value: 'value' });
  });

  test('gt creates correct condition', () => {
    expect(gt('path', 10)).toEqual({ type: 'gt', path: 'path', value: 10 });
  });

  test('lt creates correct condition', () => {
    expect(lt('path', new Date())).toEqual({ type: 'lt', path: 'path', value: expect.any(Date) });
  });

  test('contains creates correct condition', () => {
    expect(contains('path', 'substr')).toEqual({ type: 'contains', path: 'path', value: 'substr' });
  });

  test('and creates correct condition', () => {
    const cond1 = eq('p1', 1);
    const cond2 = gt('p2', 2);
    expect(and(cond1, cond2)).toEqual({ type: 'and', conditions: [cond1, cond2] });
  });

  test('or creates correct condition', () => {
    const cond1 = eq('p1', 1);
    const cond2 = gt('p2', 2);
    expect(or(cond1, cond2)).toEqual({ type: 'or', conditions: [cond1, cond2] });
  });
});

describe('evaluate', () => {
  const mockEvent: Event = {
    id: '1',
    employeeId: '1',
    type: 'visit',
    timestamp: new Date(),
    metadata: {
      num: 10,
      str: 'hello world',
      date: new Date('2023-01-01'),
      nullVal: null,
    },
  };

  test('eq true', () => {
    expect(evaluate(eq('str', 'hello world'), mockEvent)).toBe(true);
  });

  test('eq false', () => {
    expect(evaluate(eq('str', 'no'), mockEvent)).toBe(false);
  });

  test('gt number true', () => {
    expect(evaluate(gt('num', 5), mockEvent)).toBe(true);
  });

  test('gt number false', () => {
    expect(evaluate(gt('num', 15), mockEvent)).toBe(false);
  });

  test('gt date true', () => {
    expect(evaluate(gt('date', new Date('2022-01-01')), mockEvent)).toBe(true);
  });

  test('gt date false', () => {
    expect(evaluate(gt('date', new Date('2024-01-01')), mockEvent)).toBe(false);
  });

  test('gt with null false', () => {
    expect(evaluate(gt('nullVal', 0), mockEvent)).toBe(false);
  });

  test('lt similar tests', () => {
    // Add similar for lt
    expect(evaluate(lt('num', 15), mockEvent)).toBe(true);
    expect(evaluate(lt('num', 5), mockEvent)).toBe(false);
  });

  test('contains true', () => {
    expect(evaluate(contains('str', 'hello'), mockEvent)).toBe(true);
  });

  test('contains false', () => {
    expect(evaluate(contains('str', 'bye'), mockEvent)).toBe(false);
  });

  test('and true', () => {
    expect(evaluate(and(eq('str', 'hello world'), gt('num', 5)), mockEvent)).toBe(true);
  });

  test('and false', () => {
    expect(evaluate(and(eq('str', 'hello world'), gt('num', 15)), mockEvent)).toBe(false);
  });

  test('or true', () => {
    expect(evaluate(or(eq('str', 'no'), gt('num', 5)), mockEvent)).toBe(true);
  });

  test('or false', () => {
    expect(evaluate(or(eq('str', 'no'), gt('num', 15)), mockEvent)).toBe(false);
  });

  test('nested conditions', () => {
    const complex = and(
      or(eq('str', 'hello world'), lt('num', 0)),
      gt('date', new Date('2022-01-01'))
    );
    expect(evaluate(complex, mockEvent)).toBe(true);
  });
});
