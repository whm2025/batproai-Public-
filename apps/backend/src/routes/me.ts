import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { requireAuth } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

router.get("/", requireAuth, async (req, res) => {
  try {
    const uid = req.auth!.uid;
    const user = await prisma.user.findUnique({
      where: { id: uid },
      select: { id: true, email: true, role: true, createdAt: true },
    });
    if (!user)
      return res.status(404).json({ ok: false, error: "user_not_found" });
    res.json({ ok: true, user });
  } catch (e: any) {
    res.status(500).json({ ok: false, error: e?.message || "server_error" });
  }
});

export default router;
