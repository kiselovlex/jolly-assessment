import express from 'express';
import dotenv from 'dotenv';
import crypto from 'crypto';
import { rules } from './storage';
import { Rule, RuleSchema } from './models/rule';
import { evaluate } from './dsl';
import { Event, EventSchema } from './models/event';
import { Grant } from './models/grant';
import { employees, grants, populateStorage } from './storage';

dotenv.config();

const app = express();
app.use(express.json());

app.get('/rules', (req, res) => {
  res.json(rules);
});

app.post('/rules', (req, res) => {
  const parsed = RuleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const newRule: Rule = { ...parsed.data, id: crypto.randomUUID(), eventType: 'visit' };
  rules.push(newRule);
  res.status(201).json(newRule);
});

app.get('/rules/:id', (req, res) => {
  const rule = rules.find((r) => r.id === req.params.id);
  if (!rule) return res.status(404).json({ error: 'Rule not found' });
  res.json(rule);
});

app.put('/rules/:id', (req, res) => {
  const index = rules.findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Rule not found' });
  const parsed = RuleSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  rules[index] = { ...parsed.data, id: req.params.id, eventType: 'visit' };
  res.json(rules[index]);
});

app.delete('/rules/:id', (req, res) => {
  const index = rules.findIndex((r) => r.id === req.params.id);
  if (index === -1) return res.status(404).json({ error: 'Rule not found' });
  rules.splice(index, 1);
  res.status(204).send();
});

app.get('/employees', (req, res) => {
  res.json(employees.map(({ id, name, points }) => ({ id, name, points })));
});

app.get('/employees/:id', (req, res) => {
  const employee = employees.find((e) => e.id === req.params.id);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });
  res.json({ id: employee.id, name: employee.name, points: employee.points });
});

app.post('/events', (req, res) => {
  const parsed = EventSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error });
  const event: Event = parsed.data;
  const employee = employees.find((e) => e.id === event.metadata.employee_id);
  if (!employee) return res.status(404).json({ error: 'Employee not found' });
  const matchingRules = rules.filter((r) => r.eventType === event.type);
  const awarded: string[] = [];
  for (const rule of matchingRules) {
    if (evaluate(rule.condition, event)) {
      const existingGrant = grants.find((g) => g.ruleId === rule.id && g.eventId === event.id);
      if (!existingGrant) {
        const grant: Grant = {
          id: crypto.randomUUID(),
          ruleId: rule.id,
          eventId: event.id,
          employeeId: employee.id,
          points: rule.points,
          timestamp: new Date(),
        };
        grants.push(grant);
        employee.points = (employee.points || 0) + rule.points;
        awarded.push(rule.id);
      }
    }
  }
  res.json({ message: 'Event processed', awardedRules: awarded });
});

const PORT = process.env.PORT || 3000;

populateStorage('data.json')
  .then(() => {
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.error('Failed to populate storage:', err));
