export function requireSuperAdmin(req, res, next) {
  if (!req.user?.is_super_admin) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'Super admin access required' },
    });
  }
  next();
}
