import { http } from "./http";

export interface Site {
  id: number;
  name: string;
  address: string | null;
  startDate: string | null;
  endDate: string | null;
  projectId: number;
  createdAt: string;
  updatedAt: string;
}

export async function listSites(projectId: number) {
  return http<{ ok: true; items: Site[] }>(`/projects/${projectId}/sites`);
}

export async function createSite(
  projectId: number,
  input: {
    name: string;
    address?: string;
    startDate?: string; // "YYYY-MM-DD" accepté par l'API
  },
) {
  return http<{ ok: true; site: Site }>(`/projects/${projectId}/sites`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
