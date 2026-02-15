import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db.js';
import { requireCompany } from '../middleware/companyScope.js';

const router = Router();
router.use(requireCompany);

router.get('/', async (req, res) => {
  const issues = await prisma.ppeIssue.findMany({
    where: { person: { company_id: req.companyId } },
    include: { person: true },
  });
  const data = issues.map((i) => ({ ...i, person_name: i.person?.full_name || i.person_name }));
  res.json({ success: true, data });
});

router.get('/signed', async (req, res) => {
  const issues = await prisma.ppeIssue.findMany({
    where: { status: 'SIGNED', person: { company_id: req.companyId } },
    include: {
      person: { include: { department: true } },
      ppeIssueItems: { include: { ppeItem: true } },
    },
  });
  const itemIds = issues.flatMap((i) => i.ppeIssueItems.map((it) => it.id));
  const signatures = await prisma.issueItemSignature.findMany({
    where: { issue_item_id: { in: itemIds } },
  });
  const sigMap = {};
  signatures.forEach((s) => {
    if (!sigMap[s.issue_item_id]) sigMap[s.issue_item_id] = [];
    sigMap[s.issue_item_id].push(s);
  });
  const data = issues.map((issue) => ({
    ...issue,
    person_name: issue.person?.full_name || issue.person_name,
    person: issue.person,
    items: issue.ppeIssueItems.map((it) => ({
      ...it,
      ppe_item_name: it.ppeItem?.name,
      signatures: sigMap[it.id] || [],
    })),
  }));
  res.json({ success: true, data });
});

router.get('/issuable-items', async (req, res) => {
  const items = await prisma.ppeItem.findMany({
    where: { company_id: req.companyId, is_active: true },
  });
  res.json({ success: true, data: items });
});

router.get('/:id', async (req, res) => {
  const issue = await prisma.ppeIssue.findFirst({
    where: { id: req.params.id, person: { company_id: req.companyId } },
    include: { person: { include: { department: true } }, ppeIssueItems: { include: { ppeItem: true } } },
  });
  if (!issue) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  const itemIds = issue.ppeIssueItems.map((it) => it.id);
  const signatures = await prisma.issueItemSignature.findMany({
    where: { issue_item_id: { in: itemIds } },
  });
  const sigMap = {};
  signatures.forEach((s) => {
    if (!sigMap[s.issue_item_id]) sigMap[s.issue_item_id] = [];
    sigMap[s.issue_item_id].push(s);
  });
  const items = issue.ppeIssueItems.map((it) => ({
    ...it,
    ppe_item_name: it.ppeItem?.name,
    signatures: sigMap[it.id] || [],
  }));
  res.json({
    success: true,
    data: {
      ...issue,
      person_name: issue.person?.full_name || issue.person_name,
      person: issue.person,
      items,
    },
  });
});

router.post('/', async (req, res) => {
  const { person_id, issued_from_location_id, issue_reason, notes, items } = req.body;
  if (!person_id || !items?.length) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Person and items required' } });
  }
  const count = await prisma.ppeIssue.count();
  const today = new Date();
  const issueNumber = `ISS-${today.getFullYear()}${String(today.getMonth() + 1).padStart(2, '0')}-${String(count + 101)}`;
  const person = await prisma.person.findFirst({ where: { id: person_id, company_id: req.companyId } });
  if (!person) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Person not found' } });

  const issue = await prisma.ppeIssue.create({
    data: {
      issue_number: issueNumber,
      person_id,
      issued_from_location_id: issued_from_location_id || null,
      issue_date: new Date().toISOString(),
      issue_reason: issue_reason || 'Routine Replacement',
      status: 'PENDING_SIGNATURE',
      notes: notes || null,
      created_by: req.user?.sub,
      person_name: person.full_name,
    },
  });

  for (const line of items) {
    await prisma.ppeIssueItem.create({
      data: {
        issue_id: issue.id,
        ppe_item_id: line.ppe_item_id,
        size_label: line.size_label || null,
        quantity: line.quantity || 1,
        unit: 'EA',
      },
    });
  }

  const signToken = `sig-${uuid().replace(/-/g, '')}`;
  await prisma.signatureRequest.create({
    data: {
      issue_id: issue.id,
      person_id,
      token_hash: signToken,
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PENDING',
      created_by: req.user?.sub,
    },
  });

  const baseUrl = process.env.PUBLIC_URL || 'http://localhost:5173';
  const signUrl = `${baseUrl}/sign/${signToken}`;
  res.status(201).json({
    success: true,
    data: {
      id: issue.id,
      issue_number: issueNumber,
      sign_token: signToken,
      sign_url: signUrl,
      person_name: person.full_name,
      person_mobile: person.mobile_number,
    },
  });
});

router.get('/:id/sign-link', async (req, res) => {
  const issue = await prisma.ppeIssue.findFirst({
    where: { id: req.params.id, person: { company_id: req.companyId } },
    include: { person: true },
  });
  if (!issue) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  const sr = await prisma.signatureRequest.findFirst({
    where: { issue_id: issue.id },
  });
  if (!sr) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'No signature request for this issue' } });
  const baseUrl = process.env.PUBLIC_URL || 'http://localhost:5173';
  const signUrl = `${baseUrl}/sign/${sr.token_hash}`;
  res.json({
    success: true,
    data: { sign_url: signUrl, person_mobile: issue.person?.mobile_number, person_name: issue.person?.full_name },
  });
});

router.post('/:id/add-item', async (req, res) => {
  const { ppe_item_id, size_label, quantity } = req.body;
  if (!ppe_item_id) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'ppe_item_id required' } });
  }
  const issue = await prisma.ppeIssue.findFirst({
    where: { id: req.params.id, person: { company_id: req.companyId } },
    include: { person: true },
  });
  if (!issue) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  const ppeItem = await prisma.ppeItem.findFirst({ where: { id: ppe_item_id, company_id: req.companyId } });
  if (!ppeItem) return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'PPE item not found' } });

  const newItem = await prisma.ppeIssueItem.create({
    data: {
      issue_id: issue.id,
      ppe_item_id,
      size_label: size_label || null,
      quantity: quantity || 1,
      unit: 'EA',
    },
  });

  const signToken = `sig-${uuid().replace(/-/g, '')}`;
  await prisma.signatureRequest.create({
    data: {
      issue_id: issue.id,
      person_id: issue.person_id,
      token_hash: signToken,
      expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
      status: 'PENDING',
      created_by: req.user?.sub,
    },
  });

  const baseUrl = process.env.PUBLIC_URL || 'http://localhost:5173';
  const signUrl = `${baseUrl}/sign/${signToken}`;
  res.status(201).json({
    success: true,
    data: {
      item: { ...newItem, ppe_item_name: ppeItem.name },
      sign_url: signUrl,
      sign_token: signToken,
      person_name: issue.person?.full_name,
      person_mobile: issue.person?.mobile_number,
      issue_number: issue.issue_number,
    },
  });
});

router.post('/:id/cancel', async (req, res) => {
  const issue = await prisma.ppeIssue.findFirst({
    where: { id: req.params.id, person: { company_id: req.companyId } },
  });
  if (!issue) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  try {
    await prisma.ppeIssue.update({
      where: { id: req.params.id },
      data: { status: 'CANCELLED' },
    });
  } catch (e) {
    if (e.code === 'P2025') return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
    throw e;
  }
  res.json({ success: true });
});

export { router as issuesRouter };
