import { Router } from "express";
import { PrismaClient, Role } from "@prisma/client";
import { z } from "zod";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const prisma = new PrismaClient();
const router = Router();

const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  role: z.enum(["ADMIN", "MANAGER", "WORKER"]).optional().default("WORKER"),
});

const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
});

function signToken(payload: object) {
  const secret = process.env.JWT_SECRET || "devsecret";
  return jwt.sign(payload, secret, { expiresIn: "7d" });
}

router.post("/register", async (req, res) => {
  try {
    const { email, password, role } = RegisterSchema.parse(req.body);
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists)
      return res.status(409).json({ ok: false, error: "email_exists" });

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, role: role as Role },
      select: { id: true, email: true, role: true, createdAt: true },
    });

    const token = signToken({ uid: user.id, role: user.role });
    res.status(201).json({ ok: true, user, token });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message || "bad_request" });
  }
});

router.post("/login", async (req, res) => {
  try {
    const { email, password } = LoginSchema.parse(req.body);
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user)
      return res.status(401).json({ ok: false, error: "invalid_credentials" });

    const match = await bcrypt.compare(password, user.passwordHash);
    if (!match)
      return res.status(401).json({ ok: false, error: "invalid_credentials" });

    const token = signToken({ uid: user.id, role: user.role });
    res.json({
      ok: true,
      user: { id: user.id, email: user.email, role: user.role },
      token,
    });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message || "bad_request" });
  }
});

export default router;
