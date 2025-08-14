import { Router } from "express";
import { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { requireAuth } from "../middleware/auth";

const prisma = new PrismaClient();
const router = Router({ mergeParams: true });

const SiteSchema = z.object({
  name: z.string().min(2),
  address: z.string().optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

router.use(requireAuth);

// Liste des sites du projet (si manager)
router.get("/", async (req, res) => {
  const uid = req.auth!.uid;
  const projectId = Number(req.params.projectId);
  const project = await prisma.project.findFirst({
    where: { id: projectId, managerId: uid },
  });
  if (!project)
    return res.status(404).json({ ok: false, error: "project_not_found" });

  const items = await prisma.site.findMany({
    where: { projectId },
    orderBy: { createdAt: "desc" },
  });
  res.json({ ok: true, items });
});

// Créer un site dans le projet (si manager)
router.post("/", async (req, res) => {
  try {
    const uid = req.auth!.uid;
    const projectId = Number(req.params.projectId);
    const project = await prisma.project.findFirst({
      where: { id: projectId, managerId: uid },
    });
    if (!project)
      return res.status(404).json({ ok: false, error: "project_not_found" });

    const body = SiteSchema.parse(req.body);
    const site = await prisma.site.create({
      data: {
        name: body.name,
        address: body.address,
        startDate: body.startDate,
        endDate: body.endDate,
        projectId,
      },
    });
    res.status(201).json({ ok: true, site });
  } catch (e: any) {
    res.status(400).json({ ok: false, error: e?.message || "bad_request" });
  }
});

export default router;
