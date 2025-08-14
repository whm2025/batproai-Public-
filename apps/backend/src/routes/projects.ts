import { Router } from "express";
import { PrismaClient, ProjectStatus } from "@prisma/client";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router();

// Accepte "YYYY-MM-DD" ou ISO -> converti en Date
const CreateSchema = z.object({
  name: z.string().min(2),
  code: z.string().min(2).optional(),
  description: z.string().optional(),
  status: z.nativeEnum(ProjectStatus).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

const UpdateSchema = CreateSchema.partial();

router.use(requireAuth);

// LISTE des projets du manager connecté
router.get("/", async (req, res) => {
  const uid = req.auth!.uid;
  const items = await prisma.project.findMany({
    where: { managerId: uid },
    orderBy: { createdAt: "desc" },
  });
  res.json({ ok: true, items });
});

// CRÉER un projet
router.post("/", async (req, res) => {
  try {
    const body = CreateSchema.parse(req.body);
    const uid = req.auth!.uid;
    const project = await prisma.project.create({
      data: {
        name: body.name,
        code: body.code,
        description: body.description,
        status: body.status ?? "DRAFT",
        startDate: body.startDate,
        endDate: body.endDate,
        managerId: uid,
      },
    });
    res.status(201).json({ ok: true, project });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message || "bad_request" });
  }
});

// OBTENIR un projet par id (si manager)
router.get("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const uid = req.auth!.uid;
  const project = await prisma.project.findFirst({
    where: { id, managerId: uid },
  });
  if (!project) return res.status(404).json({ ok: false, error: "not_found" });
  res.json({ ok: true, project });
});

// METTRE À JOUR (si manager)
router.patch("/:id", async (req, res) => {
  try {
    const id = Number(req.params.id);
    const uid = req.auth!.uid;
    const data = UpdateSchema.parse(req.body);

    const exists = await prisma.project.findFirst({
      where: { id, managerId: uid },
    });
    if (!exists) return res.status(404).json({ ok: false, error: "not_found" });

    const updated = await prisma.project.update({
      where: { id },
      data: {
        name: data.name,
        code: data.code,
        description: data.description,
        status: data.status,
        startDate: data.startDate,
        endDate: data.endDate,
      },
    });
    res.json({ ok: true, project: updated });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message || "bad_request" });
  }
});

// SUPPRIMER (si manager)
router.delete("/:id", async (req, res) => {
  const id = Number(req.params.id);
  const uid = req.auth!.uid;
  const exists = await prisma.project.findFirst({
    where: { id, managerId: uid },
  });
  if (!exists) return res.status(404).json({ ok: false, error: "not_found" });

  await prisma.project.delete({ where: { id } });
  res.json({ ok: true });
});

export default router;
