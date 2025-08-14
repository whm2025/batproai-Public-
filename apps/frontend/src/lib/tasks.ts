import { http } from "./http";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "BLOCKED" | "DONE";
export type Priority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: Priority;
  dueDate: string | null;
  assigneeId: number | null;
  projectId: number;
  siteId: number | null;
  createdAt: string;
  updatedAt: string;
}

export async function listTasks(projectId: number) {
  return http<{ ok: true; items: Task[] }>(`/projects/${projectId}/tasks`);
}

export async function createTask(
  projectId: number,
  input: {
    title: string;
    description?: string;
    priority?: Priority;
    status?: TaskStatus;
    dueDate?: string; // "YYYY-MM-DD" accepté par l'API
    siteId?: number;
    assigneeId?: number;
  },
) {
  return http<{ ok: true; task: Task }>(`/projects/${projectId}/tasks`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
