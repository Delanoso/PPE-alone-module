import { Router } from 'express';
import { v4 as uuid } from 'uuid';
import multer from 'multer';
import * as XLSX from 'xlsx';
import { prisma } from '../db.js';
import { requireCompany } from '../middleware/companyScope.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage() });
router.use(requireCompany);

function enrichPerson(p) {
  const dept = p.department;
  const sub = p.sub_department;
  const sizes = p.personSizes;
  return {
    ...p,
    department_name: dept?.name,
    sub_department_name: sub?.name,
    size_profile: sizes ? { ...sizes, person_id: sizes.person_id } : null,
  };
}

function mapExcelRowToPerson(row) {
  const employeeNumber = String(row['D NO'] ?? row['D NO.'] ?? '').trim();
  const firstName = String(row['NAME'] ?? '').trim();
  const lastName = String(row['SURNAME'] ?? '').trim();
  let mobileNumber = String(row['CONTACT NUMBER'] ?? '').trim();
  if (!mobileNumber) mobileNumber = 'Not provided';

  const coverallSize = row['OVERALL PANTS SIZE'];
  const shoeSize = row['SAFETYBOOT SIZE'];
  const reflectiveVestSize = row['REFLECTOR VEST SIZE'];
  const shirtSize = row['SHIRT SIZE'];

  return {
    employee_number: employeeNumber || `IMPORT-${Date.now()}`,
    first_name: firstName || 'Unknown',
    last_name: lastName || 'Unknown',
    mobile_number: mobileNumber,
    sizes: {
      coverall_size: coverallSize != null ? String(coverallSize) : undefined,
      shoe_size: shoeSize != null ? String(shoeSize) : undefined,
      reflective_vest_size: reflectiveVestSize != null ? String(reflectiveVestSize).trim() : undefined,
      clothing_size: shirtSize != null ? String(shirtSize).trim() : undefined,
    },
  };
}

router.post('/import', upload.single('file'), async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'No file uploaded. Use form field "file".' } });
  }
  const dept = await prisma.department.findFirst({
    where: { company_id: req.companyId, name: 'Drivers' },
  }) || await prisma.department.findFirst({ where: { company_id: req.companyId } });
  const subDept = await prisma.subDepartment.findFirst({ where: { department_id: dept?.id } });
  if (!dept || !subDept) {
    return res.status(500).json({ success: false, error: { code: 'NO_DEPARTMENT', message: 'No department configured. Run seed first.' } });
  }

  let rows;
  try {
    const wb = XLSX.read(req.file.buffer, { type: 'buffer' });
    const ws = wb.Sheets[wb.SheetNames[0]];
    rows = XLSX.utils.sheet_to_json(ws);
  } catch (err) {
    return res.status(400).json({ success: false, error: { code: 'PARSE_ERROR', message: err.message } });
  }

  const created = [];
  const skipped = [];
  for (let i = 0; i < rows.length; i++) {
    const row = rows[i];
    const mapped = mapExcelRowToPerson(row);
    if (!mapped.first_name?.trim() && !mapped.last_name?.trim()) continue;
    if (!mapped.employee_number || mapped.employee_number.startsWith('IMPORT-')) {
      mapped.employee_number = `IMPORT-${i + 1}-${Date.now()}`;
    }
    const existing = await prisma.person.findFirst({ where: { company_id: req.companyId, employee_number: mapped.employee_number } });
    if (existing) {
      skipped.push({ employee_number: mapped.employee_number, reason: 'Already exists' });
      continue;
    }

    const full_name = `${mapped.first_name} ${mapped.last_name}`;
    const person = await prisma.person.create({
      data: {
        employee_number: mapped.employee_number,
        first_name: mapped.first_name,
        last_name: mapped.last_name,
        full_name,
        mobile_number: mapped.mobile_number,
        email: null,
        department_id: dept.id,
        sub_department_id: subDept.id,
        company_id: req.companyId,
        job_title: 'Driver',
        status: 'ACTIVE',
        employment_type: 'EMPLOYEE',
      },
    });

    const sizeData = {};
    if (mapped.sizes.coverall_size) sizeData.coverall_size = mapped.sizes.coverall_size;
    if (mapped.sizes.shoe_size) sizeData.shoe_size = mapped.sizes.shoe_size;
    if (mapped.sizes.reflective_vest_size) sizeData.reflective_vest_size = mapped.sizes.reflective_vest_size;
    if (mapped.sizes.clothing_size) sizeData.clothing_size = mapped.sizes.clothing_size;
    if (Object.keys(sizeData).length > 0) {
      await prisma.personSizes.create({
        data: { person_id: person.id, ...sizeData },
      });
    }
    created.push({ id: person.id, employee_number: mapped.employee_number, name: full_name });
  }

  res.json({
    success: true,
    data: { created: created.length, skipped: skipped.length, total: rows.length },
    created,
    skipped,
  });
});

router.get('/export/sizes', async (req, res) => {
  const people = await prisma.person.findMany({
    where: { company_id: req.companyId },
    include: { department: true, sub_department: true, personSizes: true },
  });
  const enriched = people.map(enrichPerson);
  const rows = enriched.map((p) => {
    const s = p.size_profile || {};
    return {
      'D NO': p.employee_number || '',
      'NAME': p.first_name || '',
      'SURNAME': p.last_name || '',
      'CONTACT NUMBER': p.mobile_number || '',
      'OVERALL PANTS SIZE': s.coverall_size || '',
      'SAFETYBOOT SIZE': s.shoe_size || '',
      'REFLECTOR VEST SIZE': s.reflective_vest_size || '',
      'SHIRT SIZE': s.clothing_size || '',
    };
  });
  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(wb, ws, 'PPE Sizes');
  const buf = XLSX.write(wb, { type: 'buffer', bookType: 'xlsx' });
  res.setHeader('Content-Disposition', 'attachment; filename="ppe-sizes.xlsx"');
  res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
  res.send(buf);
});

router.get('/', async (req, res) => {
  const { search, department_id, status } = req.query;
  const where = { company_id: req.companyId };
  if (department_id) where.department_id = department_id;
  if (status) {
    where.status = status;
  } else {
    where.status = { not: 'DELETED' };
  }
  let people = await prisma.person.findMany({
    where,
    include: { department: true, sub_department: true, personSizes: true },
  });
  if (search) {
    const q = search.toLowerCase();
    people = people.filter((p) => p.full_name?.toLowerCase().includes(q) || p.employee_number?.toLowerCase().includes(q));
  }
  const enriched = people.map(enrichPerson);
  res.json({ success: true, data: enriched, meta: { total: enriched.length } });
});

router.get('/:id', async (req, res) => {
  const person = await prisma.person.findFirst({
    where: { id: req.params.id, company_id: req.companyId },
    include: { department: true, sub_department: true, personSizes: true },
  });
  if (!person) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  res.json({ success: true, data: enrichPerson(person) });
});

router.post('/', async (req, res) => {
  const { employee_number, first_name, last_name, mobile_number, email, department_id, sub_department_id, job_title, ...sizes } = req.body;
  if (!employee_number || !first_name || !last_name || !department_id || !sub_department_id || !mobile_number) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Required fields missing' } });
  }
  const full_name = `${first_name} ${last_name}`;
  const person = await prisma.person.create({
    data: {
      employee_number,
      first_name,
      last_name,
      full_name,
      mobile_number,
      email: email || null,
      department_id,
      sub_department_id,
      company_id: req.companyId,
      job_title: job_title || null,
      status: 'ACTIVE',
      employment_type: 'EMPLOYEE',
    },
  });
  if (Object.keys(sizes).length > 0) {
    await prisma.personSizes.create({
      data: { person_id: person.id, ...sizes },
    });
  }
  res.status(201).json({ success: true, data: { id: person.id } });
});

const PERSON_FIELDS = ['employee_number', 'first_name', 'last_name', 'full_name', 'mobile_number', 'email', 'department_id', 'sub_department_id', 'job_title', 'status', 'employment_type'];
const SIZE_KEYS = ['coverall_size', 'shoe_size', 'reflective_vest_size', 'clothing_size'];

router.patch('/:id', async (req, res) => {
  const person = await prisma.person.findFirst({ where: { id: req.params.id, company_id: req.companyId } });
  if (!person) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  const { first_name, last_name, ...rest } = req.body;

  const update = {};
  PERSON_FIELDS.forEach((k) => {
    if (rest[k] !== undefined) {
      if (k === 'department_id' || k === 'sub_department_id') {
        if (rest[k] !== '' && rest[k] != null) update[k] = rest[k];
      } else {
        update[k] = rest[k];
      }
    }
  });
  if (first_name !== undefined) update.first_name = first_name;
  if (last_name !== undefined) update.last_name = last_name;
  if (first_name !== undefined || last_name !== undefined) {
    update.full_name = `${update.first_name ?? person.first_name} ${update.last_name ?? person.last_name}`;
  }

  const sizeUpdates = {};
  SIZE_KEYS.forEach((k) => { if (req.body[k] !== undefined) sizeUpdates[k] = req.body[k] || null; });
  if (Object.keys(sizeUpdates).length) {
    await prisma.personSizes.upsert({
      where: { person_id: req.params.id },
      create: { person_id: req.params.id, ...sizeUpdates },
      update: sizeUpdates,
    });
  }

  const updated = await prisma.person.update({
    where: { id: req.params.id },
    data: Object.keys(update).length ? update : { full_name: person.full_name },
    include: { department: true, sub_department: true, personSizes: true },
  });
  res.json({ success: true, data: enrichPerson(updated) });
});

router.delete('/:id', async (req, res) => {
  const person = await prisma.person.findFirst({ where: { id: req.params.id, company_id: req.companyId } });
  if (!person) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });

  // Remove from reminders (SizeRequestRecipient)
  await prisma.sizeRequestRecipient.deleteMany({ where: { person_id: req.params.id } });

  // Soft delete: set status to DELETED so person no longer shows in drivers list
  // PpeIssue records are kept (with person reference) for signed issues
  await prisma.person.update({
    where: { id: req.params.id },
    data: { status: 'DELETED' },
  });

  res.json({ success: true });
});

router.patch('/:id/sizes', async (req, res) => {
  const person = await prisma.person.findFirst({ where: { id: req.params.id, company_id: req.companyId } });
  if (!person) return res.status(404).json({ success: false, error: { code: 'NOT_FOUND' } });
  const sizeProfile = await prisma.personSizes.upsert({
    where: { person_id: req.params.id },
    create: { person_id: req.params.id, ...req.body },
    update: req.body,
  });
  res.json({ success: true, data: sizeProfile });
});

export { router as peopleRouter };
