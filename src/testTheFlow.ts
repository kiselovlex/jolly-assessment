/* eslint-disable @typescript-eslint/no-explicit-any */
import fetch from 'node-fetch';
import chalk from 'chalk';

const SERVER_URL = 'http://localhost:3000';
const EMPLOYEE_ID = '2daadc6e-22d1-4c54-b67b-a0db668c6585';

const rules = [
  {
    name: 'Correct Clock-In Bonus',
    eventType: 'visit',
    condition: { type: 'eq', path: 'correctClockInMethod', value: true },
    points: 5,
  },
  {
    name: 'Late Clock-In Penalty (Date)',
    eventType: 'visit',
    condition: { type: 'gt', path: 'clockInTime', value: '2023-09-17T15:44:55.733Z' },
    points: 10,
  },
  {
    name: 'Long Visit Bonus (Number)',
    eventType: 'visit',
    condition: { type: 'gt', path: 'durationMinutes', value: 60 },
    points: 10,
  },
  {
    name: 'Early Clock-In Bonus (Date)',
    eventType: 'visit',
    condition: { type: 'lt', path: 'clockInTime', value: '2023-09-17T15:44:55.733Z' },
    points: 15,
  },
  {
    name: 'Short Visit Bonus (Number)',
    eventType: 'visit',
    condition: { type: 'lt', path: 'durationMinutes', value: 60 },
    points: 15,
  },
  {
    name: 'Helpful Note Bonus',
    eventType: 'visit',
    condition: { type: 'contains', path: 'documentation', value: 'helpful' },
    points: 20,
  },
  {
    name: 'Correct and Early Bonus',
    eventType: 'visit',
    condition: {
      type: 'and',
      conditions: [
        { type: 'eq', path: 'correctClockInMethod', value: true },
        { type: 'lt', path: 'clockInTime', value: '2023-09-17T15:44:55.733Z' },
      ],
    },
    points: 25,
  },
  {
    name: 'Early or Correct Bonus',
    eventType: 'visit',
    condition: {
      type: 'or',
      conditions: [
        { type: 'lt', path: 'clockInTime', value: '2023-09-17T15:44:55.733Z' },
        { type: 'eq', path: 'correctClockInMethod', value: true },
      ],
    },
    points: 30,
  },
  {
    name: 'AI Judged Helpful Documentation',
    eventType: 'visit',
    condition: {
      type: 'llm_judge',
      path: 'documentation',
      prompt: 'Is this documentation helpful and detailed? Respond with true or false.',
    },
    points: 25,
  },
];

const events = [
  {
    id: 'test-eq',
    employeeId: EMPLOYEE_ID,
    type: 'visit',
    timestamp: '2025-04-28T13:17:28.657Z',
    metadata: { correctClockInMethod: true },
  },
  {
    id: 'test-gt-date',
    employeeId: EMPLOYEE_ID,
    type: 'visit',
    timestamp: '2025-04-28T13:17:28.657Z',
    metadata: { clockInTime: '2023-09-17T16:00:00.000Z' },
  },
  {
    id: 'test-gt-number',
    employeeId: EMPLOYEE_ID,
    type: 'visit',
    timestamp: '2025-04-28T13:17:28.657Z',
    metadata: { durationMinutes: 70 },
  },
  {
    id: 'test-lt-date',
    employeeId: EMPLOYEE_ID,
    type: 'visit',
    timestamp: '2025-04-28T13:17:28.657Z',
    metadata: { clockInTime: '2023-09-17T15:00:00.000Z' },
  },
  {
    id: 'test-lt-number',
    employeeId: EMPLOYEE_ID,
    type: 'visit',
    timestamp: '2025-04-28T13:17:28.657Z',
    metadata: { durationMinutes: 50 },
  },
  {
    id: 'test-contains',
    employeeId: EMPLOYEE_ID,
    type: 'visit',
    timestamp: '2025-04-28T13:17:28.657Z',
    metadata: { documentation: 'This is a helpful note.' },
  },
  {
    id: 'test-and',
    employeeId: EMPLOYEE_ID,
    type: 'visit',
    timestamp: '2025-04-28T13:17:28.657Z',
    metadata: { correctClockInMethod: true, clockInTime: '2023-09-17T15:00:00.000Z' },
  },
  {
    id: 'test-or',
    employeeId: EMPLOYEE_ID,
    type: 'visit',
    timestamp: '2025-04-28T13:17:28.657Z',
    metadata: { clockInTime: '2023-09-17T15:00:00.000Z', correctClockInMethod: false },
  },
  {
    id: 'test-llm-judge',
    employeeId: EMPLOYEE_ID,
    type: 'visit',
    timestamp: '2025-04-28T13:17:28.657Z',
    metadata: { documentation: 'This is a very detailed and helpful note about the visit.' },
  },
];

async function main() {
  console.log(chalk.bold.blue('Starting test flow...'));

  console.log(chalk.bold.green('\nCreating rules:'));
  for (const rule of rules) {
    try {
      const response = await fetch(`${SERVER_URL}/rules`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(rule),
      });
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const data: any = await response.json();
      console.log(chalk.green(`✓ Created rule "${rule.name}" with ID: ${data.id}`));
    } catch (error: any) {
      console.log(chalk.red(`✗ Failed to create rule "${rule.name}": ${error.message}`));
    }
  }

  console.log(chalk.bold.green('\nIngesting events and checking points:'));
  for (const event of events) {
    console.log(chalk.yellow(`\nIngesting event "${event.id}":`));
    try {
      const resp = await fetch(`${SERVER_URL}/events`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(event),
      });
      if (!resp.ok) {
        throw new Error(`HTTP ${resp.status}`);
      }
      console.log(chalk.green('✓ Event ingested successfully.'));

      const empResp = await fetch(`${SERVER_URL}/employees/${EMPLOYEE_ID}`);
      if (!empResp.ok) {
        throw new Error(`HTTP ${empResp.status}`);
      }
      const emp: any = await empResp.json();
      console.log(chalk.blue(`Updated points for employee ${EMPLOYEE_ID}: ${emp.points}`));
    } catch (error: any) {
      console.log(chalk.red(`✗ Error processing event "${event.id}": ${error.message}`));
    }
  }

  console.log(chalk.bold.blue('\nTest flow completed.'));
}

main().catch((err) => {
  console.error(chalk.red('Error in test flow:', err));
  process.exit(1);
});
