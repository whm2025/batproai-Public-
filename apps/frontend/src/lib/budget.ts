import { http } from "./http";

export type BudgetType = "MATERIAL" | "LABOR" | "EQUIPMENT" | "OTHER";

export interface BudgetLine {
  id: number;
  label: string;
  type: BudgetType;
  quantity: number;
  unitCost: number;
  note: string | null;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export interface BudgetSummary {
  ok: true;
  total: number;
  byType: Record<string, number>;
}

export async function listBudgetLines(projectId: number) {
  return http<{ ok: true; items: BudgetLine[] }>(
    `/projects/${projectId}/budget`,
  );
}

export async function createBudgetLine(
  projectId: number,
  input: {
    label: string;
    type?: BudgetType;
    quantity?: number;
    unitCost?: number;
    note?: string;
  },
) {
  return http<{ ok: true; line: BudgetLine }>(`/projects/${projectId}/budget`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function getBudgetSummary(projectId: number) {
  return http<BudgetSummary>(`/projects/${projectId}/budget/summary`);
}
