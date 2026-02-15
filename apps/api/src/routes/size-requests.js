import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db.js';
import { requireCompany } from '../middleware/companyScope.js';

const router = Router();
const sizesPublicRouter = Router();
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:5173';

router.use(requireCompany);

function token() {
  return `sz-${uuid().replace(/-/g, '').slice(0, 20)}`;
}

router.get('/', async (req, res) => {
  const ourPersonIds = (await prisma.person.findMany({ where: { company_id: req.companyId }, select: { id: true } })).map((p) => p.id);
  const recs = await prisma.sizeRequestRecipient.findMany({
    where: { person_id: { in: ourPersonIds } },
    select: { size_request_id: true },
  });
  const srIds = [...new Set(recs.map((r) => r.size_request_id))];
  const list = srIds.length
    ? await prisma.sizeRequest.findMany({
        where: { id: { in: srIds } },
        include: { recipients: { where: { person_id: { in: ourPersonIds } } } },
      })
    : [];
  const data = list.map((sr) => {
    const recipients = sr.recipients;
    const total = recipients.length;
    const responded = recipients.filter((r) => r.responded_at).length;
    const sent = recipients.filter((r) => r.sent_at).length;
    return {
      ...sr,
      total,
      sent,
      responded,
      pending: sent - responded,
    };
  });
  res.json({ success: true, data });
});

function parseNamesInput(input) {
  if (!input || typeof input !== 'string') return [];
  return input
    .split(/[\n,;]+/)
    .map((s) => s.trim())
    .filter(Boolean);
}

function matchPeopleByNames(people, names) {
  if (!names.length) return people;
  const lowerNames = names.map((n) => n.toLowerCase());
  return people.filter((p) => {
    const full = (p.full_name || '').toLowerCase();
    const last = (p.last_name || '').toLowerCase();
    return lowerNames.some((n) => full.includes(n) || last.includes(n) || full === n);
  });
}

router.post('/', async (req, res) => {
  const { name, person_names, job_title_filter, department_id, person_ids } = req.body;
  let people = await prisma.person.findMany({
    where: { company_id: req.companyId, status: 'ACTIVE', mobile_number: { not: null } },
  });

  const namesList = Array.isArray(person_names) ? person_names : parseNamesInput(person_names || '');
  if (namesList.length) {
    people = matchPeopleByNames(people, namesList);
  } else if (job_title_filter) {
    const q = String(job_title_filter).toLowerCase();
    people = people.filter((p) => (p.job_title || '').toLowerCase().includes(q));
  }
  if (department_id) people = people.filter((p) => p.department_id === department_id);
  if (person_ids?.length) people = people.filter((p) => person_ids.includes(p.id));

  const sr = await prisma.sizeRequest.create({
    data: {
      name: name || `Size request ${new Date().toISOString().slice(0, 10)}`,
      created_at: new Date().toISOString(),
      created_by: req.user?.sub,
      person_names: namesList.length ? JSON.stringify(namesList) : null,
      job_title_filter: job_title_filter || null,
      department_id: department_id || null,
    },
  });

  for (const p of people) {
    await prisma.sizeRequestRecipient.create({
      data: {
        size_request_id: sr.id,
        person_id: p.id,
        token: token(),
        sent_at: null,
        responded_at: null,
        reminder_count: 0,
      },
    });
  }

  res.status(201).json({
    success: true,
    data: {
      id: sr.id,
      recipient_count: people.length,
      message: `${people.length} driver(s) will receive the size request`,
    },
  });
});

router.get('/:id', async (req, res) => {
  const ourPersonIds = (await prisma.person.findMany({ where: { company_id: req.companyId }, select: { id: true } })).map((p) => p.id);
  const sr = await prisma.sizeRequest.findFirst({
    where: {
      id: req.params.id,
      recipients: { some: { person_id: { in: ourPersonIds } } },
    },
    include: { recipients: true },
  });
  if (!sr) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  const persons = await prisma.person.findMany({
    where: { id: { in: sr.recipients.map((r) => r.person_id) } },
  });
  const personMap = Object.fromEntries(persons.map((p) => [p.id, p]));
  const recipients = sr.recipients.map((r) => ({
    ...r,
    person_name: personMap[r.person_id]?.full_name,
    mobile_number: personMap[r.person_id]?.mobile_number,
  }));
  res.json({ success: true, data: { ...sr, recipients } });
});

router.post('/:id/send', async (req, res) => {
  const ourPersonIds = (await prisma.person.findMany({ where: { company_id: req.companyId }, select: { id: true } })).map((p) => p.id);
  const sr = await prisma.sizeRequest.findFirst({
    where: { id: req.params.id, recipients: { some: { person_id: { in: ourPersonIds } } } },
  });
  if (!sr) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  const recipients = await prisma.sizeRequestRecipient.findMany({
    where: { size_request_id: sr.id, sent_at: null },
  });
  for (const r of recipients) {
    await prisma.sizeRequestRecipient.update({
      where: { id: r.id },
      data: { sent_at: new Date().toISOString() },
    });
  }
  res.json({
    success: true,
    data: {
      message: `Sent to ${recipients.length} recipient(s)`,
      sent_count: recipients.length,
      message_template: 'Please submit your PPE sizes at {{link}}',
    },
  });
});

router.post('/:id/send-reminder', async (req, res) => {
  const ourPersonIds = (await prisma.person.findMany({ where: { company_id: req.companyId }, select: { id: true } })).map((p) => p.id);
  const sr = await prisma.sizeRequest.findFirst({
    where: { id: req.params.id, recipients: { some: { person_id: { in: ourPersonIds } } } },
  });
  if (!sr) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  const recipients = await prisma.sizeRequestRecipient.findMany({
    where: { size_request_id: sr.id, sent_at: { not: null }, responded_at: null },
  });
  for (const r of recipients) {
    await prisma.sizeRequestRecipient.update({
      where: { id: r.id },
      data: { reminder_count: (r.reminder_count || 0) + 1 },
    });
  }
  res.json({
    success: true,
    data: {
      message: `Reminder sent to ${recipients.length} recipient(s) who have not yet responded`,
      reminder_count: recipients.length,
    },
  });
});

sizesPublicRouter.get('/public/:token', async (req, res) => {
  const r = await prisma.sizeRequestRecipient.findFirst({
    where: { token: req.params.token },
  });
  if (!r) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invalid or expired link' } });
  const person = await prisma.person.findUnique({
    where: { id: r.person_id },
    include: {
      department: {
        include: {
          departmentPpeItems: {
            orderBy: { display_order: 'asc' },
            include: { ppeItem: true },
          },
        },
      },
    },
  });
  if (!person) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  if (r.responded_at) {
    return res.json({ success: true, data: { already_submitted: true, person_name: person.full_name } });
  }
  const sizes = await prisma.personSizes.findUnique({ where: { person_id: r.person_id } });
  const ppe_items = (person.department?.departmentPpeItems || []).map((dpi) => dpi.ppeItem).filter(Boolean);
  res.json({
    success: true,
    data: {
      token: r.token,
      person_name: person.full_name,
      current_sizes: sizes || {},
      already_submitted: false,
      ppe_items,
    },
  });
});

const SIZE_KEYS = ['coverall_size', 'shoe_size', 'reflective_vest_size', 'clothing_size', 'jacket_size', 'trouser_size', 'glove_size', 'helmet_size', 'rain_suit_size'];

sizesPublicRouter.post('/public/:token', async (req, res) => {
  const r = await prisma.sizeRequestRecipient.findFirst({
    where: { token: req.params.token },
  });
  if (!r) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND', message: 'Invalid or expired link' } });
  if (r.responded_at) {
    return res.json({ success: true, data: { message: 'Already submitted', already_submitted: true } });
  }
  const sizeData = {};
  SIZE_KEYS.forEach((k) => {
    if (req.body[k] !== undefined && req.body[k] !== null && req.body[k] !== '') sizeData[k] = req.body[k];
  });
  if (req.body.coverall_size !== undefined && req.body.coverall_size !== '' && !sizeData.trouser_size) sizeData.trouser_size = req.body.coverall_size;
  await prisma.personSizes.upsert({
    where: { person_id: r.person_id },
    create: { person_id: r.person_id, ...sizeData },
    update: sizeData,
  });
  await prisma.sizeRequestRecipient.update({
    where: { id: r.id },
    data: { responded_at: new Date().toISOString() },
  });
  res.json({
    success: true,
    data: {
      message: 'Thank you! Your sizes have been recorded. You will not receive any follow-up messages.',
    },
  });
});

export { router as sizeRequestsRouter, sizesPublicRouter };
