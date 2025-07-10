import { eq, gt, lt, contains, and, or, evaluate, llmJudge } from './dsl';
import { Event } from './models/event';

jest.mock('ai', () => ({
  generateObject: jest.fn(),
}));

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

  test('llmJudge creates correct condition', () => {
    expect(llmJudge('path', 'Is this helpful?')).toEqual({
      type: 'llm_judge',
      path: 'path',
      prompt: 'Is this helpful?',
    });
  });
});

// Make all evaluate tests async
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

  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('eq true', async () => {
    await expect(evaluate(eq('str', 'hello world'), mockEvent)).resolves.toBe(true);
  });

  test('eq false', async () => {
    await expect(evaluate(eq('str', 'no'), mockEvent)).resolves.toBe(false);
  });

  test('gt number true', async () => {
    await expect(evaluate(gt('num', 5), mockEvent)).resolves.toBe(true);
  });

  test('gt number false', async () => {
    await expect(evaluate(gt('num', 15), mockEvent)).resolves.toBe(false);
  });

  test('gt date true', async () => {
    await expect(evaluate(gt('date', new Date('2022-01-01')), mockEvent)).resolves.toBe(true);
  });

  test('gt date false', async () => {
    await expect(evaluate(gt('date', new Date('2024-01-01')), mockEvent)).resolves.toBe(false);
  });

  test('gt with null false', async () => {
    await expect(evaluate(gt('nullVal', 0), mockEvent)).resolves.toBe(false);
  });

  test('lt similar tests', async () => {
    // Add similar for lt
    await expect(evaluate(lt('num', 15), mockEvent)).resolves.toBe(true);
    await expect(evaluate(lt('num', 5), mockEvent)).resolves.toBe(false);
  });

  test('contains true', async () => {
    await expect(evaluate(contains('str', 'hello'), mockEvent)).resolves.toBe(true);
  });

  test('contains false', async () => {
    await expect(evaluate(contains('str', 'bye'), mockEvent)).resolves.toBe(false);
  });

  test('and true', async () => {
    await expect(evaluate(and(eq('str', 'hello world'), gt('num', 5)), mockEvent)).resolves.toBe(
      true
    );
  });

  test('and false', async () => {
    await expect(evaluate(and(eq('str', 'hello world'), gt('num', 15)), mockEvent)).resolves.toBe(
      false
    );
  });

  test('or true', async () => {
    await expect(evaluate(or(eq('str', 'no'), gt('num', 5)), mockEvent)).resolves.toBe(true);
  });

  test('or false', async () => {
    await expect(evaluate(or(eq('str', 'no'), gt('num', 15)), mockEvent)).resolves.toBe(false);
  });

  test('nested conditions', async () => {
    const nested = and(or(eq('str', 'hello world'), gt('num', 20)), lt('num', 15));
    await expect(evaluate(nested, mockEvent)).resolves.toBe(true);
  });
});
