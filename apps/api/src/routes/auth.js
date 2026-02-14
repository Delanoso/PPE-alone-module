import { Router } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../db.js';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'ppe-dev-secret-change-in-production';

router.post('/login', async (req, res) => {
  const username = typeof req.body?.username === 'string' ? req.body.username.trim() : '';
  const password = typeof req.body?.password === 'string' ? req.body.password : '';
  if (!username || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Username and password required' },
    });
  }
  const users = await prisma.user.findMany();
  const user = users.find(
    (u) => (u.username?.toLowerCase() === username.toLowerCase() || u.email?.toLowerCase() === username.toLowerCase()) && u.password_hash === password
  );
  if (!user) {
    return res.status(401).json({
      success: false,
      error: { code: 'INVALID_CREDENTIALS', message: 'Invalid username or password' },
    });
  }
  let roleIds = [];
  try {
    roleIds = user.roleIds ? JSON.parse(user.roleIds) : [];
  } catch {}
  const roles = await prisma.role.findMany({ where: { id: { in: roleIds } } });
  const token = jwt.sign(
    { sub: user.id, username: user.username, roles: roles.map((r) => r.code) },
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
        roles: roles.map((r) => ({ id: r.id, code: r.code, name: r.name })),
      },
    },
  });
});

router.post('/register', async (req, res) => {
  const { first_name, last_name, email, mobile_number, password } = req.body;
  if (!first_name || !last_name || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'First name, last name, and password required' },
    });
  }
  const username = (email || mobile_number || `u${Date.now()}`).replace(/[^a-z0-9]/gi, '');
  const user = await prisma.user.create({
    data: {
      username,
      full_name: `${first_name} ${last_name}`,
      email: email || null,
      password_hash: password,
      status: 'ACTIVE',
      roleIds: '["r5"]',
    },
  });
  res.status(201).json({ success: true, data: { id: user.id, username: user.username } });
});

router.post('/forgot-password', (req, res) => {
  res.json({ success: true, data: { message: 'If an account exists, a reset link has been sent' } });
});

router.post('/logout', (req, res) => {
  res.json({ success: true });
});

export { router as authRouter };
