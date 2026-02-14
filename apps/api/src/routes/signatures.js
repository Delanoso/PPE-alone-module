import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db.js';

const router = Router();
const signPublicRouter = Router();

router.get('/requests', async (req, res) => {
  const requests = await prisma.signatureRequest.findMany({
    include: { issue: true },
  });
  const persons = await prisma.person.findMany({ where: { id: { in: requests.map((r) => r.person_id) } } });
  const personMap = Object.fromEntries(persons.map((p) => [p.id, p]));
  const data = requests.map((r) => ({
    ...r,
    person_name: personMap[r.person_id]?.full_name,
    issue_number: r.issue?.issue_number,
  }));
  res.json({ success: true, data });
});

router.get('/requests/:id', async (req, res) => {
  const reqObj = await prisma.signatureRequest.findUnique({
    where: { id: req.params.id },
    include: { issue: true },
  });
  if (!reqObj) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  const person = await prisma.person.findUnique({ where: { id: reqObj.person_id } });
  res.json({
    success: true,
    data: { ...reqObj, person_name: person?.full_name, issue_number: reqObj.issue?.issue_number },
  });
});

signPublicRouter.get('/public/:token', async (req, res) => {
  const token = req.params.token;
  const reqObj = await prisma.signatureRequest.findFirst({
    where: { token_hash: token },
    include: { issue: { include: { ppeIssueItems: { include: { ppeItem: true } } } } },
  });
  if (!reqObj) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invalid or expired link' } });
  }
  if (new Date(reqObj.expires_at) < new Date()) {
    return res.status(410).json({ success: false, error: { code: 'EXPIRED', message: 'Link has expired' } });
  }
  const person = await prisma.person.findUnique({ where: { id: reqObj.person_id } });
  const allItems = reqObj.issue?.ppeIssueItems || [];
  const signedIds = await prisma.issueItemSignature.findMany({
    where: { issue_item_id: { in: allItems.map((it) => it.id) } },
    select: { issue_item_id: true },
  });
  const signedSet = new Set(signedIds.map((s) => s.issue_item_id));
  const items = allItems
    .filter((it) => !signedSet.has(it.id))
    .map((it) => ({
      id: it.id,
      issue_item_id: it.id,
      ppe_item_id: it.ppe_item_id,
      ppe_item_name: it.ppeItem?.name,
      size_label: it.size_label,
      quantity: it.quantity,
    }));
  if (items.length === 0) {
    return res.json({
      success: true,
      data: {
        request_id: reqObj.id,
        token,
        issue_number: reqObj.issue?.issue_number,
        person_name: person?.full_name,
        items: [],
        status: 'SIGNED',
      },
    });
  }
  res.json({
    success: true,
    data: {
      request_id: reqObj.id,
      token,
      issue_number: reqObj.issue?.issue_number,
      issue_date: reqObj.issue?.issue_date,
      person_name: person?.full_name,
      items,
      status: reqObj.status,
    },
  });
});

signPublicRouter.post('/public/:token', async (req, res) => {
  const token = req.params.token;
  const { item_signatures, signed_name } = req.body;
  const reqObj = await prisma.signatureRequest.findFirst({ where: { token_hash: token } });
  if (!reqObj) {
    return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invalid or expired link' } });
  }
  if (new Date(reqObj.expires_at) < new Date()) {
    return res.status(410).json({ success: false, error: { code: 'EXPIRED', message: 'Link has expired' } });
  }
  if (reqObj.status === 'SIGNED') {
    return res.json({ success: true, data: { message: 'Already signed' } });
  }
  const allIssueItems = await prisma.ppeIssueItem.findMany({ where: { issue_id: reqObj.issue_id } });
  const signedIds = await prisma.issueItemSignature.findMany({
    where: { issue_item_id: { in: allIssueItems.map((it) => it.id) } },
    select: { issue_item_id: true },
  });
  const signedSet = new Set(signedIds.map((s) => s.issue_item_id));
  const pendingItems = allIssueItems.filter((it) => !signedSet.has(it.id));
  if (!item_signatures?.length || item_signatures.length !== pendingItems.length) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: `Please sign for all ${pendingItems.length} items` },
    });
  }
  const name = (signed_name || '').trim() || 'Employee';
  for (const sig of item_signatures) {
    await prisma.issueItemSignature.create({
      data: {
        issue_item_id: sig.issue_item_id,
        signed_name: name,
        signed_at: new Date().toISOString(),
        signature_data: sig.signature_data || null,
      },
    });
  }
  const allSigned = pendingItems.length === allIssueItems.length;
  await prisma.signatureRequest.update({
    where: { id: reqObj.id },
    data: { status: 'SIGNED', signed_at: new Date().toISOString(), signed_name: name },
  });
  if (allSigned) {
    await prisma.ppeIssue.update({
      where: { id: reqObj.issue_id },
      data: { status: 'SIGNED' },
    });
  }
  res.json({
    success: true,
    data: {
      message: 'All signatures recorded successfully',
      signed_name: name,
    },
  });
});

export { router as signaturesRouter, signPublicRouter };
