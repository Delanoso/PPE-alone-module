import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  const depts = await prisma.department.findMany({
    include: { subDepartments: true },
  });
  const data = depts.map((d) => ({
    ...d,
    sub_departments: d.subDepartments,
  }));
  res.json({ success: true, data });
});

router.post('/', async (req, res) => {
  const { name, code } = req.body;
  if (!name) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name required' } });
  const dept = await prisma.department.create({
    data: { id: uuid(), name, code: code || null, is_active: true },
  });
  res.status(201).json({ success: true, data: { id: dept.id } });
});

router.patch('/:id', async (req, res) => {
  try {
    const dept = await prisma.department.update({
      where: { id: req.params.id },
      data: req.body,
    });
    res.json({ success: true, data: dept });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    throw e;
  }
});

router.delete('/:id', async (req, res) => {
  try {
    await prisma.department.delete({ where: { id: req.params.id } });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    throw e;
  }
  res.json({ success: true });
});

router.get('/:id/sub-departments', async (req, res) => {
  const subs = await prisma.subDepartment.findMany({
    where: { department_id: req.params.id },
  });
  res.json({ success: true, data: subs });
});

router.post('/:id/sub-departments', async (req, res) => {
  const { name, code } = req.body;
  if (!name) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name required' } });
  const sub = await prisma.subDepartment.create({
    data: {
      id: uuid(),
      department_id: req.params.id,
      name,
      code: code || null,
      is_active: true,
    },
  });
  res.status(201).json({ success: true, data: { id: sub.id } });
});

export { router as departmentsRouter };
