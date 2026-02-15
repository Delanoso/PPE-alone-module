import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import { prisma } from '../db.js';
import { requireCompany } from '../middleware/companyScope.js';

const router = Router();
router.use(requireCompany);
const PUBLIC_URL = process.env.PUBLIC_URL || 'http://localhost:5173';

const DEFAULT_PPE_KEYS = ['coverall_size', 'shoe_size', 'reflective_vest_size', 'clothing_size'];

function hasNoSizes(sizes, ppeItems) {
  if (!sizes) return true;
  const keysToCheck = (ppeItems && ppeItems.length > 0)
    ? ppeItems.filter((i) => i.size_key).map((i) => i.size_key)
    : DEFAULT_PPE_KEYS;
  for (const key of keysToCheck) {
    const v = sizes[key];
    if (!v || String(v).trim() === '') return true;
  }
  return false;
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

async function ensureToken(personId, companyId) {
  let rec = await prisma.sizeRequestRecipient.findFirst({
    where: { person_id: personId },
  });
  if (rec && rec.responded_at) return null;
  if (!rec) {
    const srName = companyId ? `PPE Size Reminders - ${companyId}` : 'PPE Size Reminders';
    let sr = await prisma.sizeRequest.findFirst({ where: { name: srName } });
    if (!sr) {
      sr = await prisma.sizeRequest.create({
        data: {
          name: srName,
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
    where: { company_id: req.companyId, status: 'ACTIVE' },
    include: {
      personSizes: true,
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
  const driversWithoutSizes = [];
  for (const p of people) {
    const ppeItems = (p.department?.departmentPpeItems || []).map((dpi) => dpi.ppeItem).filter(Boolean);
    if (!hasNoSizes(p.personSizes, ppeItems)) continue;
    const token = await ensureToken(p.id, req.companyId);
    if (!token) continue;
    const phones = parsePhoneNumbers(p.mobile_number);
    const whatsappNumbers = phones.map(toWhatsAppNumber).filter(Boolean);
    const ppe_item_names = ppeItems.length > 0 ? ppeItems.map((i) => i.name) : ['overall pants', 'safety boot', 'reflector vest', 'shirt'];
    driversWithoutSizes.push({
      id: p.id,
      employee_number: p.employee_number,
      full_name: p.full_name,
      mobile_number: p.mobile_number,
      phones: whatsappNumbers,
      link: `${PUBLIC_URL}/sizes/${token}`,
      token,
      ppe_item_names,
    });
  }

  res.json({
    success: true,
    data: driversWithoutSizes,
    meta: { total: driversWithoutSizes.length },
  });
});

export { router as remindersRouter };
