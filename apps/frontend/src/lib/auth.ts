import { http } from "./http";

export interface Me {
  id: number;
  email: string;
  role: "ADMIN" | "MANAGER" | "WORKER";
}

export async function login(input: { email: string; password: string }) {
  return http<{ ok: true; user: Me; token: string }>("/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function me() {
  return http<{ ok: true; user: Me }>("/me");
}

// Optionnel : inscription
export async function register(input: {
  email: string;
  password: string;
  role?: "ADMIN" | "MANAGER" | "WORKER";
}) {
  return http<{ ok: true; user: Me; token: string }>("/auth/register", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
