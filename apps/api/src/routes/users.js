import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

router.get('/', async (req, res) => {
  const users = await prisma.user.findMany();
  const roleIds = new Set();
  users.forEach((u) => {
    if (!u.roleIds) return;
    try {
      const arr = JSON.parse(u.roleIds);
      if (Array.isArray(arr)) arr.forEach((r) => roleIds.add(String(r)));
      else u.roleIds.split(',').forEach((r) => roleIds.add(r.trim()));
    } catch {
      u.roleIds.split(',').forEach((r) => roleIds.add(r.trim()));
    }
  });
  const roles = await prisma.role.findMany({ where: { id: { in: [...roleIds] } } });
  const roleMap = Object.fromEntries(roles.map((r) => [r.id, r]));
  const parseRoleIds = (s) => {
    if (!s) return [];
    try {
      const arr = JSON.parse(s);
      return Array.isArray(arr) ? arr.map(String) : s.split(',').map((r) => r.trim()).filter(Boolean);
    } catch {
      return s.split(',').map((r) => r.trim()).filter(Boolean);
    }
  };
  const data = users.map((u) => ({
    id: u.id,
    username: u.username,
    full_name: u.full_name,
    email: u.email,
    status: u.status,
    roles: parseRoleIds(u.roleIds).map((rid) => roleMap[rid]).filter(Boolean),
  }));
  res.json({ success: true, data });
});

router.get('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user)
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
  const parseRoleIds = (s) => {
    if (!s) return [];
    try {
      const arr = JSON.parse(s);
      return Array.isArray(arr) ? arr.map(String) : s.split(',').map((r) => r.trim()).filter(Boolean);
    } catch {
      return s.split(',').map((r) => r.trim()).filter(Boolean);
    }
  };
  const roles = await prisma.role.findMany({ where: { id: { in: parseRoleIds(user.roleIds) } } });
  res.json({
    success: true,
    data: { ...user, roles },
  });
});

router.post('/', async (req, res) => {
  const { username, full_name, email, password, roleIds } = req.body;
  if (!username || !full_name || !password) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Username, full name, and password required' },
    });
  }
  const roleIdsStr = Array.isArray(roleIds) ? JSON.stringify(roleIds) : roleIds ? (typeof roleIds === 'string' ? roleIds : String(roleIds)) : JSON.stringify(['r5']);
  const user = await prisma.user.create({
    data: {
      username,
      full_name,
      email: email || null,
      password_hash: password,
      status: 'ACTIVE',
      roleIds: roleIdsStr,
    },
  });
  res.status(201).json({ success: true, data: { id: user.id } });
});

router.patch('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user)
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
  const { username, full_name, email, status, password, roleIds } = req.body;
  const data = {};
  if (username !== undefined) data.username = username;
  if (full_name !== undefined) data.full_name = full_name;
  if (email !== undefined) data.email = email;
  if (status !== undefined) data.status = status;
  if (password) data.password_hash = password;
  if (roleIds !== undefined) data.roleIds = Array.isArray(roleIds) ? JSON.stringify(roleIds) : String(roleIds);
  if (Object.keys(data).length === 0) return res.json({ success: true, data: user });
  const updated = await prisma.user.update({ where: { id: req.params.id }, data });
  res.json({ success: true, data: updated });
});

router.delete('/:id', async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.params.id } });
  if (!user)
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'User not found' } });
  await prisma.user.delete({ where: { id: req.params.id } });
  res.json({ success: true });
});

export { router as usersRouter };
