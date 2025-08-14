import { Router } from "express";
import { PrismaClient, TaskStatus, Priority } from "@prisma/client";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

const TaskCreate = z.object({
  title: z.string().min(2),
  description: z.string().optional(),
  status: z.nativeEnum(TaskStatus).optional(),
  priority: z.nativeEnum(Priority).optional(),
  dueDate: z.coerce.date().optional(),
  siteId: z.number().int().optional(),
  assigneeId: z.number().int().optional(),
});

const TaskUpdate = TaskCreate.partial();

router.use(requireAuth);

// Liste des tâches d'un projet (si manager)
router.get("/", async (req, res) => {
  const uid = req.auth!.uid;
  const projectId = Number(req.params.projectId);
  const project = await prisma.project.findFirst({
    where: { id: projectId, managerId: uid },
  });
  if (!project)
    return res.status(404).json({ ok: false, error: "project_not_found" });

  const items = await prisma.task.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  res.json({ ok: true, items });
});

// Créer une tâche dans un projet
router.post("/", async (req, res) => {
  try {
    const uid = req.auth!.uid;
    const projectId = Number(req.params.projectId);
    const project = await prisma.project.findFirst({
      where: { id: projectId, managerId: uid },
    });
    if (!project)
      return res.status(404).json({ ok: false, error: "project_not_found" });

    const data = TaskCreate.parse(req.body);
    const task = await prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        status: data.status ?? "TODO",
        priority: data.priority ?? "MEDIUM",
        dueDate: data.dueDate,
        assigneeId: data.assigneeId,
        siteId: data.siteId,
        projectId,
      },
    });
    res.status(201).json({ ok: true, task });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message || "bad_request" });
  }
});

export default router;
