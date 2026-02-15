import { Router } from 'express';
import { prisma } from '../db.js';
import { requireCompany } from '../middleware/companyScope.js';

const router = Router();
router.use(requireCompany);

router.get('/issues', async (req, res) => {
  const { start_date, end_date, department_id } = req.query;
  const where = { person: { company_id: req.companyId } };
  if (start_date || end_date) {
    where.issue_date = {};
    if (start_date) where.issue_date.gte = start_date;
    if (end_date) where.issue_date.lte = end_date;
  }
  if (department_id) where.person.department_id = String(department_id);
  const issues = await prisma.ppeIssue.findMany({
    where,
    include: { person: true },
  });
  const data = issues.map((i) => ({
    ...i,
    person_name: i.person?.full_name,
    department_id: i.person?.department_id,
  }));
  res.json({ success: true, data });
});

router.get('/stock', async (req, res) => {
  const balances = await prisma.stockBalance.findMany({
    where: { location: { company_id: req.companyId } },
    include: { ppeItem: true },
  });
  const data = balances.map((b) => ({
    ...b,
    ppe_item_name: b.ppeItem?.name,
    low_stock: (b.on_hand_qty || 0) < 10,
  }));
  res.json({ success: true, data });
});

router.get('/signatures', async (req, res) => {
  const requests = await prisma.signatureRequest.findMany({
    where: { issue: { person: { company_id: req.companyId } } },
    include: { issue: { include: { person: true } } },
  });
  const data = requests.map((r) => ({
    ...r,
    issue_number: r.issue?.issue_number,
    person_name: r.issue?.person?.full_name,
  }));
  res.json({ success: true, data });
});

router.get('/people-sizes', async (req, res) => {
  const people = await prisma.person.findMany({
    where: { company_id: req.companyId },
    include: { personSizes: true, department: true },
  });
  const data = people.map((p) => ({
    ...p,
    size_profile: p.personSizes,
    department_name: p.department?.name,
  }));
  res.json({ success: true, data });
});

export { router as reportsRouter };
