import { http } from "./http";

export type ProjectStatus =
  | "DRAFT"
  | "ACTIVE"
  | "ON_HOLD"
  | "DONE"
  | "CANCELLED";

export interface Project {
  id: number;
  name: string;
  code: string | null;
  description: string | null;
  status: ProjectStatus;
  startDate: string | null;
  endDate: string | null;
  managerId: number | null;
  createdAt: string;
  updatedAt: string;
}

export async function listProjects() {
  return http<{ ok: true; items: Project[] }>("/projects");
}

export async function createProject(input: {
  name: string;
  description?: string;
  startDate?: string; // "YYYY-MM-DD" accepté par l'API
}) {
  return http<{ ok: true; project: Project }>("/projects", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
