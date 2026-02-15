/** Get effective company_id for the request. Company users use their company; super admin can pass ?company_id= for impersonation. */
export function getCompanyId(req) {
  if (req.user?.is_super_admin && req.query?.company_id) {
    return req.query.company_id;
  }
  return req.user?.company_id || null;
}

/** Require company context - 403 if user has no company (e.g. super admin without company_id param). */
export function requireCompany(req, res, next) {
  const companyId = getCompanyId(req);
  if (!companyId) {
    return res.status(403).json({
      success: false,
      error: { code: 'NO_COMPANY', message: 'Company context required' },
    });
  }
  req.companyId = companyId;
  next();
}
