import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db.js';
import { hashPassword, bootstrapNewCompany } from '../db.js';
import { requireSuperAdmin } from '../middleware/superAdmin.js';

const router = Router();

router.use(requireSuperAdmin);

router.get('/companies', async (req, res) => {
  const companies = await prisma.company.findMany({
    orderBy: { name: 'asc' },
    include: {
      _count: {
        select: { users: true, people: true },
      },
    },
  });
  const data = companies.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    status: c.status,
    created_at: c.created_at,
    user_count: c._count.users,
    people_count: c._count.people,
  }));
  res.json({ success: true, data });
});

router.post('/companies', async (req, res) => {
  const { name, slug } = req.body;
  if (!name?.trim()) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Company name required' } });
  }
  const s = (slug || name).trim().toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') || 'company-' + Date.now();
  const existing = await prisma.company.findFirst({ where: { slug: s } });
  if (existing) {
    return res.status(400).json({ success: false, error: { code: 'EXISTS', message: 'Company slug already exists' } });
  }
  const company = await prisma.company.create({
    data: { id: uuid(), name: name.trim(), slug: s, status: 'ACTIVE', created_at: new Date().toISOString() },
  });
  try {
    await bootstrapNewCompany(company.id);
  } catch (err) {
    console.error('Bootstrap new company:', err);
  }
  res.status(201).json({ success: true, data: company });
});

router.patch('/companies/:id', async (req, res) => {
  const { status, name } = req.body;
  const data = {};
  if (status !== undefined) data.status = status;
  if (name?.trim()) data.name = name.trim();
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No updates provided' } });
  }
  try {
    const company = await prisma.company.update({ where: { id: req.params.id }, data });
    res.json({ success: true, data: company });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    throw e;
  }
});

router.get('/users', async (req, res) => {
  const { company_id } = req.query;
  const where = { is_super_admin: false };
  if (company_id) where.company_id = company_id;
  const users = await prisma.user.findMany({
    where,
    include: { company: true },
    orderBy: { full_name: 'asc' },
  });
  const data = users.map((u) => ({
    id: u.id,
    username: u.username,
    full_name: u.full_name,
    email: u.email,
    status: u.status,
    company_id: u.company_id,
    company_name: u.company?.name,
  }));
  res.json({ success: true, data });
});

router.post('/users', async (req, res) => {
  const { company_id, username, full_name, email, password } = req.body;
  if (!company_id || !username?.trim() || !full_name?.trim() || !password) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Company, username, full name, and password required' } });
  }
  const company = await prisma.company.findUnique({ where: { id: company_id } });
  if (!company || company.status !== 'ACTIVE') {
    return res.status(400).json({ success: false, error: { code: 'INVALID_COMPANY', message: 'Company not found or inactive' } });
  }
  const exists = await prisma.user.findFirst({ where: { company_id, username: username.trim() } });
  if (exists) {
    return res.status(400).json({ success: false, error: { code: 'EXISTS', message: 'Username already exists in this company' } });
  }
  const hash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      id: uuid(),
      username: username.trim(),
      full_name: full_name.trim(),
      email: email?.trim() || null,
      password_hash: hash,
      status: 'ACTIVE',
      roleIds: '["r5"]',
      company_id,
    },
  });
  res.status(201).json({ success: true, data: { id: user.id } });
});

router.patch('/users/:id', async (req, res) => {
  const { status, password } = req.body;
  const data = {};
  if (status !== undefined) data.status = status;
  if (password) data.password_hash = await hashPassword(password);
  if (Object.keys(data).length === 0) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No updates provided' } });
  }
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  if (user.is_super_admin) {
    return res.status(403).json({ success: false, error: { code: 'FORBIDDEN', message: 'Cannot modify super admin' } });
  }
  await prisma.user.update({ where: { id: req.params.id }, data });
  res.json({ success: true });
});

export { router as adminRouter };
