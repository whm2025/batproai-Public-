import { Router } from "express";
import { PrismaClient, BudgetType } from "@prisma/client";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

const LineCreate = z.object({
  label: z.string().min(2),
  type: z.nativeEnum(BudgetType).optional(),
  quantity: z.coerce.number().min(0.0001).default(1),
  unitCost: z.coerce.number().min(0).default(0),
  note: z.string().optional(),
});

router.use(requireAuth);

// Liste des lignes
router.get("/", async (req, res) => {
  const uid = req.auth!.uid;
  const projectId = Number(req.params.projectId);
  const project = await prisma.project.findFirst({
    where: { id: projectId, managerId: uid },
  });
  if (!project)
    return res.status(404).json({ ok: false, error: "project_not_found" });

  const items = await prisma.budgetLine.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  res.json({ ok: true, items });
});

// Ajouter une ligne
router.post("/", async (req, res) => {
  try {
    const uid = req.auth!.uid;
    const projectId = Number(req.params.projectId);
    const project = await prisma.project.findFirst({
      where: { id: projectId, managerId: uid },
    });
    if (!project)
      return res.status(404).json({ ok: false, error: "project_not_found" });

    const data = LineCreate.parse(req.body);
    const line = await prisma.budgetLine.create({
      data: {
        label: data.label,
        type: data.type ?? "OTHER",
        quantity: data.quantity,
        unitCost: data.unitCost,
        note: data.note,
        projectId,
      },
    });
    res.status(201).json({ ok: true, line });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message || "bad_request" });
  }
});

// Résumé (total général + par type)
router.get("/summary", async (req, res) => {
  const uid = req.auth!.uid;
  const projectId = Number(req.params.projectId);
  const project = await prisma.project.findFirst({
    where: { id: projectId, managerId: uid },
  });
  if (!project)
    return res.status(404).json({ ok: false, error: "project_not_found" });

  const lines = await prisma.budgetLine.findMany({ where: { projectId } });
  const total = lines.reduce((acc, l) => acc + l.quantity * l.unitCost, 0);
  const byType = lines.reduce<Record<string, number>>((acc, l) => {
    acc[l.type] = (acc[l.type] || 0) + l.quantity * l.unitCost;
    return acc;
  }, {});
  res.json({ ok: true, total, byType });
});

export default router;
