# Jolly Rewards Rules Engine

This is a dynamic rules engine for awarding points to employees based on visit events, built with Node.js, Express, TypeScript, and Zod for validation. It supports creating rules with a DSL for conditions, ingesting events, evaluating rules idempotently via grants, and updating employee points.

## Setup

1. Install dependencies: `yarn install`
2. Start the server: `yarn start` (runs on port 3000 by default; set PORT in .env if needed)

The server populates employees from `data.json` on startup. Events, rules, and grants start empty for fresh testing.

## API Endpoints

- **GET /rules**: List all rules
- **POST /rules**: Create a rule (body: {name: string, eventType: 'visit', condition: object, points: number})
- **GET /rules/:id**: Get rule by ID
- **PUT /rules/:id**: Update rule
- **DELETE /rules/:id**: Delete rule
- **POST /events**: Ingest an event (body: {id: string, employeeId: string, type: 'visit', timestamp: string|Date, metadata: object})
- **GET /employees**: List employees with points (debug)
- **GET /employees/:id**: Get employee with points (debug)
- **GET /grants**: List all grants (debug)

Conditions are JSON objects matching the DSL (e.g., {type: 'eq', path: 'correctClockInMethod', value: true}).

## Manual Testing with Curl

For automated testing, you can run the script in `src/testTheFlow.ts` using `ts-node src/testTheFlow.ts`. This script creates the sample rules and ingests the test events programmatically.

Assume server is running at http://localhost:3000.

### 1. Create Sample Rules for Each Condition Type

Below are curl commands for creating rules covering each condition type in the evaluate() method (eq, gt, lt, contains, and, or). All use eventType: 'visit'. Adjust values as needed for testing.

#### Equality (eq)

Award 5 points if correctClockInMethod is true.

```bash
curl -X POST http://localhost:3000/rules \
  -H 'Content-Type: application/json' \
  -d '{"name": "Correct Clock-In Bonus", "eventType": "visit", "condition": {"type": "eq", "path": "correctClockInMethod", "value": true}, "points": 5}'
```

#### Greater Than (gt) - Date

Award 10 points if clockInTime > '2023-09-17T15:44:55.733Z' (late clock-in).

```bash
curl -X POST http://localhost:3000/rules \
  -H 'Content-Type: application/json' \
  -d '{"name": "Late Clock-In Penalty (Date)", "eventType": "visit", "condition": {"type": "gt", "path": "clockInTime", "value": "2023-09-17T15:44:55.733Z"}, "points": 10}'
```

#### Greater Than (gt) - Number

Award 10 points if durationMinutes > 60 (long visit).

```bash
curl -X POST http://localhost:3000/rules \
  -H 'Content-Type: application/json' \
  -d '{"name": "Long Visit Bonus (Number)", "eventType": "visit", "condition": {"type": "gt", "path": "durationMinutes", "value": 60}, "points": 10}'
```

#### Less Than (lt) - Date

Award 15 points if clockInTime < '2023-09-17T15:44:55.733Z' (early clock-in).

```bash
curl -X POST http://localhost:3000/rules \
  -H 'Content-Type: application/json' \
  -d '{"name": "Early Clock-In Bonus (Date)", "eventType": "visit", "condition": {"type": "lt", "path": "clockInTime", "value": "2023-09-17T15:44:55.733Z"}, "points": 15}'
```

#### Less Than (lt) - Number

Award 15 points if durationMinutes < 60 (short visit).

```bash
curl -X POST http://localhost:3000/rules \
  -H 'Content-Type: application/json' \
  -d '{"name": "Short Visit Bonus (Number)", "eventType": "visit", "condition": {"type": "lt", "path": "durationMinutes", "value": 60}, "points": 15}'
```

#### Contains (string)

Award 20 points if documentation contains 'helpful'.

```bash
curl -X POST http://localhost:3000/rules \
  -H 'Content-Type: application/json' \
  -d '{"name": "Helpful Note Bonus", "eventType": "visit", "condition": {"type": "contains", "path": "documentation", "value": "helpful"}, "points": 20}'
```

#### Complex: And

Award 25 points if correctClockInMethod is true AND clockInTime < '2023-09-17T15:44:55.733Z' (correct and early).

```bash
curl -X POST http://localhost:3000/rules \
  -H 'Content-Type: application/json' \
  -d '{"name": "Correct and Early Bonus", "eventType": "visit", "condition": {"type": "and", "conditions": [{"type": "eq", "path": "correctClockInMethod", "value": true}, {"type": "lt", "path": "clockInTime", "value": "2023-09-17T15:44:55.733Z"}]}, "points": 25}'
```

#### Complex: Or

Award 30 points if clockInTime < '2023-09-17T15:44:55.733Z' OR correctClockInMethod is true (early or correct).

```bash
curl -X POST http://localhost:3000/rules \
  -H 'Content-Type: application/json' \
  -d '{"name": "Early or Correct Bonus", "eventType": "visit", "condition": {"type": "or", "conditions": [{"type": "lt", "path": "clockInTime", "value": "2023-09-17T15:44:55.733Z"}, {"type": "eq", "path": "correctClockInMethod", "value": true}]}, "points": 30}'
```

Note the returned rule IDs for reference.

### 2. Ingest Sample Events to Test Rules

Below are dummy events designed to match each rule example above. Use a consistent employeeId (e.g., '2daadc6e-22d1-4c54-b67b-a0db668c6585') and adjust as needed. Each should trigger its corresponding rule when sent after creating the rule.

#### Event for eq (correctClockInMethod: true)

```bash
curl -X POST http://localhost:3000/events \
  -H 'Content-Type: application/json' \
  -d '{"id": "test-eq", "employeeId": "2daadc6e-22d1-4c54-b67b-a0db668c6585", "type": "visit", "timestamp": "2025-04-28T13:17:28.657Z", "metadata": {"correctClockInMethod": true}}'
```

#### Event for gt (Date): clockInTime > '2023-09-17T15:44:55.733Z'

```bash
curl -X POST http://localhost:3000/events \
  -H 'Content-Type: application/json' \
  -d '{"id": "test-gt-date", "employeeId": "2daadc6e-22d1-4c54-b67b-a0db668c6585", "type": "visit", "timestamp": "2025-04-28T13:17:28.657Z", "metadata": {"clockInTime": "2023-09-17T16:00:00.000Z"}}'
```

#### Event for gt (Number): durationMinutes > 60

```bash
curl -X POST http://localhost:3000/events \
  -H 'Content-Type: application/json' \
  -d '{"id": "test-gt-number", "employeeId": "2daadc6e-22d1-4c54-b67b-a0db668c6585", "type": "visit", "timestamp": "2025-04-28T13:17:28.657Z", "metadata": {"durationMinutes": 70}}'
```

#### Event for lt (Date): clockInTime < '2023-09-17T15:44:55.733Z'

```bash
curl -X POST http://localhost:3000/events \
  -H 'Content-Type: application/json' \
  -d '{"id": "test-lt-date", "employeeId": "2daadc6e-22d1-4c54-b67b-a0db668c6585", "type": "visit", "timestamp": "2025-04-28T13:17:28.657Z", "metadata": {"clockInTime": "2023-09-17T15:00:00.000Z"}}'
```

#### Event for lt (Number): durationMinutes < 60

```bash
curl -X POST http://localhost:3000/events \
  -H 'Content-Type: application/json' \
  -d '{"id": "test-lt-number", "employeeId": "2daadc6e-22d1-4c54-b67b-a0db668c6585", "type": "visit", "timestamp": "2025-04-28T13:17:28.657Z", "metadata": {"durationMinutes": 50}}'
```

#### Event for contains: documentation contains 'helpful'

```bash
curl -X POST http://localhost:3000/events \
  -H 'Content-Type: application/json' \
  -d '{"id": "test-contains", "employeeId": "2daadc6e-22d1-4c54-b67b-a0db668c6585", "type": "visit", "timestamp": "2025-04-28T13:17:28.657Z", "metadata": {"documentation": "This is a helpful note."}}'
```

#### Event for and: correctClockInMethod true AND clockInTime < '2023-09-17T15:44:55.733Z'

```bash
curl -X POST http://localhost:3000/events \
  -H 'Content-Type: application/json' \
  -d '{"id": "test-and", "employeeId": "2daadc6e-22d1-4c54-b67b-a0db668c6585", "type": "visit", "timestamp": "2025-04-28T13:17:28.657Z", "metadata": {"correctClockInMethod": true, "clockInTime": "2023-09-17T15:00:00.000Z"}}'
```

#### Event for or: clockInTime < '2023-09-17T15:44:55.733Z' OR correctClockInMethod true (this matches on early clock-in)

```bash
curl -X POST http://localhost:3000/events \
  -H 'Content-Type: application/json' \
  -d '{"id": "test-or", "employeeId": "2daadc6e-22d1-4c54-b67b-a0db668c6585", "type": "visit", "timestamp": "2025-04-28T13:17:28.657Z", "metadata": {"clockInTime": "2023-09-17T15:00:00.000Z", "correctClockInMethod": false}}'
```

These events should trigger their matching rules and award points (idempotent on re-ingest). To test non-matches, modify the metadata accordingly.

### 3. Verify Results

Check employee points (replace with actual employeeId):

```bash
curl http://localhost:3000/employees/2daadc6e-22d1-4c54-b67b-a0db668c6585
```

List all employees:

```bash
curl http://localhost:3000/employees
```

List grants:

```bash
curl http://localhost:3000/grants
```

## Notes

- Dates in metadata are parsed as Date objects internally; timestamps can be strings (coerced to Date).
- Expand rules/conditions as needed (e.g., for gt/lt on durations).
- For production, replace in-memory storage with a database.
