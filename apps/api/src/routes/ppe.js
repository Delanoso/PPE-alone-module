import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db.js';
import { requireCompany } from '../middleware/companyScope.js';

const router = Router();
router.use(requireCompany);

router.get('/categories', async (req, res) => {
  const data = await prisma.ppeCategory.findMany({ where: { company_id: req.companyId } });
  res.json({ success: true, data });
});

router.post('/categories', async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Name required' } });
  const cat = await prisma.ppeCategory.create({
    data: { id: uuid(), name, description: description || null, company_id: req.companyId },
  });
  res.status(201).json({ success: true, data: { id: cat.id } });
});

router.get('/items', async (req, res) => {
  const items = await prisma.ppeItem.findMany({
    where: { company_id: req.companyId, is_active: true },
    include: { category: true },
  });
  const data = items.map((i) => ({ ...i, category_name: i.category?.name || i.category_name }));
  res.json({ success: true, data });
});

router.get('/items/:id', async (req, res) => {
  const item = await prisma.ppeItem.findFirst({
    where: { id: req.params.id, company_id: req.companyId },
    include: { category: true },
  });
  if (!item) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  res.json({ success: true, data: { ...item, category_name: item.category?.name } });
});

router.post('/items', async (req, res) => {
  const { sku, name, category_id, size_required, min_stock_threshold, reorder_level } = req.body;
  if (!sku || !name || !category_id) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'SKU, name, and category required' } });
  }
  const cat = await prisma.ppeCategory.findFirst({ where: { id: category_id, company_id: req.companyId } });
  if (!cat) return res.status(400).json({ success: false, error: { code: 'INVALID_CATEGORY', message: 'Category not found' } });
  const item = await prisma.ppeItem.create({
    data: {
      id: uuid(),
      category_id,
      sku,
      name,
      company_id: req.companyId,
      size_required: size_required ?? false,
      min_stock_threshold: min_stock_threshold ?? 0,
      reorder_level: reorder_level ?? 0,
      is_active: true,
    },
  });
  res.status(201).json({ success: true, data: { id: item.id } });
});

router.patch('/items/:id', async (req, res) => {
  try {
    const item = await prisma.ppeItem.update({
      where: { id: req.params.id, company_id: req.companyId },
      data: req.body,
    });
    res.json({ success: true, data: item });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    throw e;
  }
});

router.delete('/items/:id', async (req, res) => {
  try {
    await prisma.ppeItem.update({
      where: { id: req.params.id, company_id: req.companyId },
      data: { is_active: false },
    });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    throw e;
  }
  res.json({ success: true });
});

export { router as ppeRouter };
