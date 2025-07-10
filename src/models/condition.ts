type Path = string;

// TODO: Consider fixing if time allows
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type Eq = { type: 'eq'; path: Path; value: any };
export type Gt = { type: 'gt'; path: Path; value: number | Date };
export type Lt = { type: 'lt'; path: Path; value: number | Date };
export type Contains = { type: 'contains'; path: Path; value: string };
export type And = { type: 'and'; conditions: Condition[] };
export type Or = { type: 'or'; conditions: Condition[] };
export type LLMJudge = { type: 'llm_judge'; path: Path; prompt: string };

export type Condition = Eq | Gt | Lt | Contains | And | Or | LLMJudge;
