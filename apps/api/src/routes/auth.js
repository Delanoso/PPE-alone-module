import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db.js';
import { hashPassword, verifyPassword, bootstrapNewCompany } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ppe-dev-secret-change-in-production';

router.post('/login', async (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Username/email and password required' },
    });
  }

  const loginId = username.trim().toLowerCase();

  let user = await prisma.user.findFirst({
    where: { is_super_admin: true },
  });
  if (user && user.email?.toLowerCase() !== loginId) user = null;

  if (!user) {
    const allUsers = await prisma.user.findMany({
      where: { is_super_admin: false },
      include: { company: true },
    });
    user = allUsers.find(
      (u) =>
        u.username?.toLowerCase() === loginId ||
        u.email?.toLowerCase() === loginId
    ) || null;
    if (user && user.company?.status === 'BLOCKED') {
      return res.status(403).json({
        success: false,
        error: { code: 'COMPANY_BLOCKED', message: 'Your company has been suspended.' },
      });
    }
  }

  if (!user || user.status === 'BLOCKED') {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' },
    });
  }

  const valid = await verifyPassword(password, user.password_hash);
  if (!valid) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' },
    });
  }

  let roleIds = [];
  try {
    roleIds = user.roleIds ? JSON.parse(user.roleIds) : [];
  } catch {}
  const roles = user.is_super_admin
    ? [{ id: 'sa', code: 'SUPER_ADMIN', name: 'Super Admin' }]
    : await prisma.role.findMany({ where: { id: { in: roleIds } } });

  const token = jwt.sign(
    {
      sub: user.id,
      username: user.username,
      email: user.email,
      roles: roles.map((r) => r.code),
      company_id: user.company_id,
      is_super_admin: user.is_super_admin || false,
    },
    JWT_SECRET,
    { expiresIn: '24h' }
  );

  res.json({
    success: true,
    data: {
      access_token: token,
      token_type: 'Bearer',
      expires_in: 86400,
      user: {
        id: user.id,
        username: user.username,
        full_name: user.full_name,
        email: user.email,
        company_id: user.company_id,
        company_name: user.company?.name,
        is_super_admin: user.is_super_admin || false,
        roles: roles.map((r) => ({ id: r.id, code: r.code, name: r.name })),
      },
    },
  });
});

router.post('/register', async (req, res) => {
  const { company_name, admin_name, admin_email, admin_password } = req.body;
  if (!company_name?.trim() || !admin_name?.trim() || !admin_email?.trim() || !admin_password) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Company name, admin name, email, and password required' },
    });
  }

  const slug = company_name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '') || 'company-' + Date.now();

  const existing = await prisma.company.findFirst({ where: { slug } });
  if (existing) {
    return res.status(400).json({
      success: false,
      error: { code: 'COMPANY_EXISTS', message: 'A company with this name already exists' },
    });
  }

  const emailLower = admin_email.trim().toLowerCase();
  const emailTaken = await prisma.user.findMany().then((users) =>
    users.some((u) => u.email?.toLowerCase() === emailLower)
  );
  if (emailTaken) {
    return res.status(400).json({
      success: false,
      error: { code: 'EMAIL_EXISTS', message: 'This email is already registered' },
    });
  }

  const passwordHash = await hashPassword(admin_password);
  const company = await prisma.company.create({
    data: {
      id: uuid(),
      name: company_name.trim(),
      slug,
      status: 'ACTIVE',
      created_at: new Date().toISOString(),
    },
  });

  const username = admin_email.replace(/[^a-z0-9]/gi, '').toLowerCase().slice(0, 30) || 'admin' + Date.now();
  const adminUser = await prisma.user.create({
    data: {
      id: uuid(),
      username,
      full_name: admin_name.trim(),
      email: admin_email.trim().toLowerCase(),
      password_hash: passwordHash,
      status: 'ACTIVE',
      roleIds: '["r1"]',
      company_id: company.id,
    },
  });

  try {
    await bootstrapNewCompany(company.id);
  } catch (err) {
    console.error('Bootstrap new company:', err);
  }

  res.status(201).json({
    success: true,
    data: {
      company_id: company.id,
      user_id: adminUser.id,
      message: 'Company registered. You can now log in.',
    },
  });
});

router.post('/forgot-password', (req, res) => {
  res.json({ success: true, data: { message: 'If an account exists, a reset link has been sent' } });
});

router.post('/logout', (req, res) => {
  res.json({ success: true });
});

export { router as authRouter };
