import type { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const hdr = req.headers.authorization || "";
  const token = hdr.startsWith("Bearer ") ? hdr.slice(7) : null;
  if (!token) return res.status(401).json({ ok: false, error: "no_token" });

  try {
    const secret = process.env.JWT_SECRET || "devsecret";
    const payload = jwt.verify(token, secret) as { uid: number; role: string };
    req.auth = { uid: payload.uid, role: payload.role as any };
    next();
  } catch {
    return res.status(401).json({ ok: false, error: "invalid_token" });
  }
}
