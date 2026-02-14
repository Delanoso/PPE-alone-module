import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

router.get('/logs', async (req, res) => {
  const { entity_type, entity_id, limit } = req.query;
  const where = {};
  if (entity_type) where.entity = entity_type;
  if (entity_id) where.entity_id = entity_id;
  let logs = await prisma.auditLog.findMany({
    where,
    orderBy: { id: 'asc' },
  });
  if (limit) logs = logs.slice(-Number(limit));
  const data = logs.map((l) => ({ ...l, entity_type: l.entity }));
  res.json({ success: true, data });
});

router.get('/logs/:entityType/:entityId', async (req, res) => {
  const logs = await prisma.auditLog.findMany({
    where: {
      entity: req.params.entityType,
      entity_id: req.params.entityId,
    },
  });
  const data = logs.map((l) => ({ ...l, entity_type: l.entity }));
  res.json({ success: true, data });
});

export { router as auditRouter };
