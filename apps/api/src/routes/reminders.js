import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db.js';

const router = Router();
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:5173';

function hasNoSizes(sizes) {
  if (!sizes) return true;
  const hasAny =
    (sizes.coverall_size && sizes.coverall_size.trim()) ||
    (sizes.shoe_size && sizes.shoe_size.toString()) ||
    (sizes.reflective_vest_size && sizes.reflective_vest_size.trim()) ||
    (sizes.clothing_size && sizes.clothing_size.trim());
  return !hasAny;
}

function parsePhoneNumbers(mobileNumber) {
  if (!mobileNumber || typeof mobileNumber !== 'string') return [];
  return mobileNumber
    .split(/[/,;]+/)
    .map((n) => n.trim().replace(/\s/g, ''))
    .filter((n) => n.length >= 9);
}

function toWhatsAppNumber(phone) {
  if (!phone) return null;
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.startsWith('27')) return cleaned;
  if (cleaned.startsWith('0')) return '27' + cleaned.slice(1);
  return '27' + cleaned;
}

async function ensureToken(personId) {
  let rec = await prisma.sizeRequestRecipient.findFirst({
    where: { person_id: personId },
  });
  if (rec && rec.responded_at) return null;
  if (!rec) {
    let sr = await prisma.sizeRequest.findFirst({ where: { name: 'PPE Size Reminders' } });
    if (!sr) {
      sr = await prisma.sizeRequest.create({
        data: {
          name: 'PPE Size Reminders',
          created_at: new Date().toISOString(),
          created_by: null,
        },
      });
    }
    rec = await prisma.sizeRequestRecipient.create({
      data: {
        size_request_id: sr.id,
        person_id: personId,
        token: `sz-${uuid().replace(/-/g, '').slice(0, 20)}`,
        sent_at: null,
        responded_at: null,
        reminder_count: 0,
      },
    });
  }
  return rec.token;
}

router.get('/', async (req, res) => {
  const people = await prisma.person.findMany({
    where: { status: 'ACTIVE' },
    include: { personSizes: true },
  });
  const driversWithoutSizes = [];
  for (const p of people) {
    if (!hasNoSizes(p.personSizes)) continue;
    const token = await ensureToken(p.id);
    if (!token) continue;
    const phones = parsePhoneNumbers(p.mobile_number);
    const whatsappNumbers = phones.map(toWhatsAppNumber).filter(Boolean);
    driversWithoutSizes.push({
      id: p.id,
      employee_number: p.employee_number,
      full_name: p.full_name,
      mobile_number: p.mobile_number,
      phones: whatsappNumbers,
      link: `${PUBLIC_URL}/sizes/${token}`,
      token,
    });
  }

  res.json({
    success: true,
    data: driversWithoutSizes,
    meta: { total: driversWithoutSizes.length },
  });
});

export { router as remindersRouter };
