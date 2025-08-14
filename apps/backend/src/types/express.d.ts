import type { Role } from "@prisma/client";

declare global {
  namespace Express {
    interface Request {
      auth?: { uid: number; role: Role };
    }
  }
}

export {};
