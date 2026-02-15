import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db.js';
import { requireCompany } from '../middleware/companyScope.js';

const router = Router();
router.use(requireCompany);

router.get('/', async (req, res) => {
  const depts = await prisma.department.findMany({
    where: { company_id: req.companyId },
    include: {
      subDepartments: true,
      departmentPpeItems: {
        orderBy: { display_order: 'asc' },
        include: { ppeItem: true },
      },
    },
  });
  const data = depts.map((d) => ({
    ...d,
    sub_departments: d.subDepartments,
    ppe_items: (d.departmentPpeItems || []).map((dpi) => ({ ...dpi.ppeItem })),
  }));
  res.json({ success: true, data });
});

router.post('/', async (req, res) => {
  const { name, code, ppe_item_ids } = req.body;
  if (!name) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name required' } });
  const dept = await prisma.department.create({
    data: { id: uuid(), name, code: code || null, is_active: true, company_id: req.companyId },
  });
  if (Array.isArray(ppe_item_ids) && ppe_item_ids.length > 0) {
    const validItems = await prisma.ppeItem.findMany({
      where: { id: { in: ppe_item_ids }, company_id: req.companyId },
      select: { id: true },
    });
    for (let i = 0; i < validItems.length; i++) {
      await prisma.departmentPpeItem.create({
        data: {
          id: uuid(),
          department_id: dept.id,
          ppe_item_id: validItems[i].id,
          display_order: i,
        },
      });
    }
  }
  res.status(201).json({ success: true, data: { id: dept.id } });
});

router.patch('/:id', async (req, res) => {
  const { ppe_item_ids, ...rest } = req.body;
  try {
    let dept = await prisma.department.update({
      where: { id: req.params.id, company_id: req.companyId },
      data: rest,
    });
    if (ppe_item_ids !== undefined) {
      await prisma.departmentPpeItem.deleteMany({ where: { department_id: req.params.id } });
      if (Array.isArray(ppe_item_ids) && ppe_item_ids.length > 0) {
        const validItems = await prisma.ppeItem.findMany({
          where: { id: { in: ppe_item_ids }, company_id: req.companyId },
          select: { id: true },
        });
        for (let i = 0; i < validItems.length; i++) {
          await prisma.departmentPpeItem.create({
            data: {
              id: uuid(),
              department_id: req.params.id,
              ppe_item_id: validItems[i].id,
              display_order: i,
            },
          });
        }
      }
      dept = await prisma.department.findFirst({
        where: { id: req.params.id },
        include: { departmentPpeItems: { orderBy: { display_order: 'asc' }, include: { ppeItem: true } } },
      });
    }
    res.json({ success: true, data: dept });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    throw e;
  }
});

router.delete('/:id', async (req, res) => {
  const dept = await prisma.department.findFirst({ where: { id: req.params.id, company_id: req.companyId } });
  if (!dept) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  const count = await prisma.person.count({ where: { department_id: req.params.id } });
  if (count > 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'HAS_PEOPLE', message: `Cannot delete: ${count} person(s) assigned to this department. Reassign them first.` },
    });
  }
  try {
    await prisma.subDepartment.deleteMany({ where: { department_id: req.params.id } });
    await prisma.department.delete({ where: { id: req.params.id } });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    throw e;
  }
  res.json({ success: true });
});

router.get('/:id/sub-departments', async (req, res) => {
  const dept = await prisma.department.findFirst({ where: { id: req.params.id, company_id: req.companyId } });
  if (!dept) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  const subs = await prisma.subDepartment.findMany({
    where: { department_id: req.params.id },
  });
  res.json({ success: true, data: subs });
});

router.post('/:id/sub-departments', async (req, res) => {
  const dept = await prisma.department.findFirst({ where: { id: req.params.id, company_id: req.companyId } });
  if (!dept) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
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

router.patch('/:deptId/sub-departments/:subId', async (req, res) => {
  const dept = await prisma.department.findFirst({ where: { id: req.params.deptId, company_id: req.companyId } });
  if (!dept) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  try {
    const sub = await prisma.subDepartment.update({
      where: { id: req.params.subId, department_id: req.params.deptId },
      data: req.body,
    });
    res.json({ success: true, data: sub });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    throw e;
  }
});

router.delete('/:deptId/sub-departments/:subId', async (req, res) => {
  const dept = await prisma.department.findFirst({ where: { id: req.params.deptId, company_id: req.companyId } });
  if (!dept) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  const count = await prisma.person.count({ where: { sub_department_id: req.params.subId } });
  if (count > 0) {
    return res.status(400).json({
      success: false,
      error: { code: 'HAS_PEOPLE', message: `Cannot delete: ${count} person(s) assigned to this sub-department. Reassign them first.` },
    });
  }
  try {
    await prisma.subDepartment.delete({
      where: { id: req.params.subId, department_id: req.params.deptId },
    });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    throw e;
  }
  res.json({ success: true });
});

export { router as departmentsRouter };
