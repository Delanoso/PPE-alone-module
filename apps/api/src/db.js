import { v4 as uuid } from 'uuid';
import bcrypt from 'bcrypt';
import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

const SALT_ROUNDS = 10;
const SUPER_ADMIN_EMAIL = 'erichvandenheuvel5@gmail.com';
const SUPER_ADMIN_PASSWORD = 'vandenHeuvel97!';

const DEPARTMENTS_DATA = [
  { name: 'Drivers', sub: ['Refrigerated', 'Flatbed', 'Local Delivery', 'Driver Support'] },
  { name: 'Warehouse', sub: ['General'] },
  { name: 'Office', sub: ['Admin'] },
];

const PPE_CATEGORIES = ['Head Protection', 'Eye Protection', 'Face Protection', 'Hearing Protection', 'Respiratory Protection', 'Hand Protection', 'Body Protection', 'High Visibility Wear', 'Foot Protection', 'Fall Protection', 'Weather Protection', 'Hygiene and Disposable'];

const CLOTHING_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL', '5XL', '6XL', '7XL'];
const TROUSER_SIZES = Array.from({ length: 29 }, (_, i) => String(28 + i));
const SHOE_SIZES = Array.from({ length: 12 }, (_, i) => String(4 + i));
const GLOVE_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];
const HELMET_SIZES = ['S', 'M', 'L', 'XL'];

const PPE_ITEMS = [
  { sku: 'PANTS-001', name: 'Overall pants', category: 'Body Protection', sizeKey: 'coverall_size', sizeRequired: true, sizes: TROUSER_SIZES },
  { sku: 'BOOT-001', name: 'Safety boots', category: 'Foot Protection', sizeKey: 'shoe_size', sizeRequired: true, sizes: SHOE_SIZES },
  { sku: 'VEST-001', name: 'Reflector vest', category: 'High Visibility Wear', sizeKey: 'reflective_vest_size', sizeRequired: true, sizes: CLOTHING_SIZES },
  { sku: 'SHIRT-001', name: 'Shirt', category: 'Body Protection', sizeKey: 'clothing_size', sizeRequired: true, sizes: CLOTHING_SIZES },
  { sku: 'JACKET-001', name: 'Jacket', category: 'Body Protection', sizeKey: 'jacket_size', sizeRequired: true, sizes: CLOTHING_SIZES },
  { sku: 'TROUSERS-001', name: 'Trousers', category: 'Body Protection', sizeKey: 'trouser_size', sizeRequired: true, sizes: TROUSER_SIZES },
  { sku: 'GLOVES-001', name: 'Safety gloves', category: 'Hand Protection', sizeKey: 'glove_size', sizeRequired: true, sizes: GLOVE_SIZES },
  { sku: 'HELMET-001', name: 'Safety helmet', category: 'Head Protection', sizeKey: 'helmet_size', sizeRequired: true, sizes: HELMET_SIZES },
  { sku: 'RAIN-001', name: 'Rain suit', category: 'Weather Protection', sizeKey: 'rain_suit_size', sizeRequired: true, sizes: CLOTHING_SIZES },
  { sku: 'COVERALL-001', name: 'Coveralls', category: 'Body Protection', sizeKey: 'coverall_size', sizeRequired: true, sizes: CLOTHING_SIZES },
  { sku: 'GOGGLES-001', name: 'Safety goggles', category: 'Eye Protection', sizeKey: null, sizeRequired: false, sizes: [null] },
  { sku: 'EAR-001', name: 'Ear defenders', category: 'Hearing Protection', sizeKey: null, sizeRequired: false, sizes: [null] },
  { sku: 'SHIELD-001', name: 'Face shield', category: 'Face Protection', sizeKey: null, sizeRequired: false, sizes: [null] },
  { sku: 'HIJACKET-001', name: 'High-vis jacket', category: 'High Visibility Wear', sizeKey: 'reflective_vest_size', sizeRequired: true, sizes: CLOTHING_SIZES },
  { sku: 'BOOT2-001', name: 'Waterproof boots', category: 'Foot Protection', sizeKey: 'shoe_size', sizeRequired: true, sizes: SHOE_SIZES },
];

export async function hashPassword(plain) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain, hash) {
  return bcrypt.compare(plain, hash);
}

export async function seedDb() {
  const deptCount = await prisma.department.count();
  if (deptCount > 0) return;

  const company = await ensureHfrCompany();

  for (let i = 0; i < DEPARTMENTS_DATA.length; i++) {
    const d = DEPARTMENTS_DATA[i];
    const dept = await prisma.department.create({
      data: {
        name: d.name,
        code: `DEPT-${i + 1}`,
        is_active: true,
        created_at: new Date().toISOString(),
        company_id: company.id,
      },
    });
    for (let j = 0; j < d.sub.length; j++) {
      await prisma.subDepartment.create({
        data: {
          department_id: dept.id,
          name: d.sub[j],
          code: `SUB-${j + 1}`,
          is_active: true,
        },
      });
    }
  }

  for (const name of PPE_CATEGORIES) {
    await prisma.ppeCategory.create({
      data: { name, description: `${name} equipment`, company_id: company.id },
    });
  }

  const categories = await prisma.ppeCategory.findMany({ where: { company_id: company.id } });
  const catMap = {};
  categories.forEach((c) => { catMap[c.name] = c.id; });

  for (const item of PPE_ITEMS) {
    const catId = catMap[item.category] || categories[0]?.id;
    if (!catId) continue;
    const ppeItem = await prisma.ppeItem.create({
      data: {
        category_id: catId,
        sku: item.sku,
        name: item.name,
        category_name: item.category,
        size_required: item.sizeRequired,
        size_key: item.sizeKey,
        min_stock_threshold: 10,
        reorder_level: 20,
        is_active: true,
        company_id: company.id,
      },
    });

    let loc = await prisma.stockLocation.findFirst({ where: { company_id: company.id } });
    if (!loc) {
      loc = await prisma.stockLocation.create({
        data: { code: 'MAIN-PPE', name: 'Main PPE Store', is_active: true, company_id: company.id },
      });
    }

    const sizes = item.sizeRequired ? item.sizes : [null];
    for (const s of sizes) {
      await prisma.stockBalance.create({
        data: {
          location_id: loc.id,
          ppe_item_id: ppeItem.id,
          size_label: s,
          on_hand_qty: 50 + Math.floor(Math.random() * 50),
          ppe_item_name: ppeItem.name,
        },
      });
    }
  }

  const roleCount = await prisma.role.count();
  if (roleCount === 0) {
    await prisma.role.createMany({
      data: [
        { id: 'r1', code: 'SUPER_ADMIN', name: 'Super Admin', description: 'Full system access' },
        { id: 'r2', code: 'HS_MANAGER', name: 'Health & Safety Manager', description: 'H&S oversight' },
        { id: 'r3', code: 'STORES_CTRL', name: 'Stores Controller', description: 'Stock and issuing' },
        { id: 'r4', code: 'DEPT_SUPER', name: 'Department Supervisor', description: 'Department scope' },
        { id: 'r5', code: 'ISSUING_OFF', name: 'Issuing Officer', description: 'Issue PPE only' },
      ],
    });
  }

  const [h1, h2, h3] = await Promise.all([
    hashPassword('admin123'),
    hashPassword('manager123'),
    hashPassword('stores123'),
  ]);
  await prisma.user.createMany({
    data: [
      { id: 'u1', username: 'admin', full_name: 'HFR Admin', email: 'admin@hfr.co.za', password_hash: h1, status: 'ACTIVE', roleIds: '["r1"]', company_id: company.id },
      { id: 'u2', username: 'manager', full_name: 'John Safety', email: 'manager@hfr.co.za', password_hash: h2, status: 'ACTIVE', roleIds: '["r2"]', company_id: company.id },
      { id: 'u3', username: 'stores', full_name: 'Mary Stores', email: 'stores@hfr.co.za', password_hash: h3, status: 'ACTIVE', roleIds: '["r3"]', company_id: company.id },
    ],
    skipDuplicates: true,
  });
}

async function ensureHfrCompany() {
  let company = await prisma.company.findFirst({ where: { slug: 'hfr' } });
  if (!company) {
    company = await prisma.company.create({
      data: {
        id: uuid(),
        name: 'HFR',
        slug: 'hfr',
        status: 'ACTIVE',
        created_at: new Date().toISOString(),
      },
    });
  }
  return company;
}

/** Multi-tenant: create HFR company, migrate existing data, create super admin. */
export async function ensureMultiTenant() {
  const company = await ensureHfrCompany();

  const userIds = ['u1', 'u2', 'u3'];
  const hfrAdmin = await prisma.user.findFirst({ where: { id: 'u1' } });
  if (hfrAdmin && hfrAdmin.company_id !== company.id) {
    await prisma.user.updateMany({ where: { id: { in: userIds } }, data: { company_id: company.id } });
  }

  const needsHash = await prisma.user.findFirst({
    where: {
      password_hash: { in: ['admin123', 'manager123', 'stores123'] },
    },
  });
  if (needsHash) {
    const updates = [
      { id: 'u1', hash: await hashPassword('admin123') },
      { id: 'u2', hash: await hashPassword('manager123') },
      { id: 'u3', hash: await hashPassword('stores123') },
    ];
    for (const u of updates) {
      const uu = await prisma.user.findUnique({ where: { id: u.id } });
      if (uu?.password_hash === 'admin123' || uu?.password_hash === 'manager123' || uu?.password_hash === 'stores123') {
        await prisma.user.update({ where: { id: u.id }, data: { password_hash: u.hash, company_id: company.id } });
      }
    }
  }

  const usersWithoutCompany = await prisma.user.findMany({ where: { company_id: null, is_super_admin: false } });
  if (usersWithoutCompany.length > 0) {
    await prisma.user.updateMany({
      where: { id: { in: usersWithoutCompany.map((u) => u.id) } },
      data: { company_id: company.id },
    });
  }

  const deptsWithoutCompany = await prisma.department.findMany({ where: { company_id: null } });
  if (deptsWithoutCompany.length > 0) {
    await prisma.department.updateMany({ where: { company_id: null }, data: { company_id: company.id } });
  }

  const peopleWithoutCompany = await prisma.person.findMany({ where: { company_id: null } });
  if (peopleWithoutCompany.length > 0) {
    await prisma.person.updateMany({ where: { company_id: null }, data: { company_id: company.id } });
  }

  const catsWithoutCompany = await prisma.ppeCategory.findMany({ where: { company_id: null } });
  if (catsWithoutCompany.length > 0) {
    await prisma.ppeCategory.updateMany({ where: { company_id: null }, data: { company_id: company.id } });
  }

  const itemsWithoutCompany = await prisma.ppeItem.findMany({ where: { company_id: null } });
  if (itemsWithoutCompany.length > 0) {
    await prisma.ppeItem.updateMany({ where: { company_id: null }, data: { company_id: company.id } });
  }

  const locsWithoutCompany = await prisma.stockLocation.findMany({ where: { company_id: null } });
  if (locsWithoutCompany.length > 0) {
    await prisma.stockLocation.updateMany({ where: { company_id: null }, data: { company_id: company.id } });
  }

  let superAdmin = await prisma.user.findFirst({ where: { email: SUPER_ADMIN_EMAIL, is_super_admin: true } });
  if (!superAdmin) {
    const hash = await hashPassword(SUPER_ADMIN_PASSWORD);
    superAdmin = await prisma.user.create({
      data: {
        id: uuid(),
        username: 'superadmin',
        full_name: 'Super Admin',
        email: SUPER_ADMIN_EMAIL,
        password_hash: hash,
        status: 'ACTIVE',
        roleIds: null,
        company_id: null,
        is_super_admin: true,
      },
    });
  }
}

/** Bootstrap a new company with default departments and PPE. */
export async function bootstrapNewCompany(companyId) {
  const company = await prisma.company.findUnique({ where: { id: companyId } });
  if (!company) return;

  for (let i = 0; i < DEPARTMENTS_DATA.length; i++) {
    const d = DEPARTMENTS_DATA[i];
    const dept = await prisma.department.create({
      data: {
        id: uuid(),
        name: d.name,
        code: `DEPT-${i + 1}`,
        is_active: true,
        created_at: new Date().toISOString(),
        company_id: companyId,
      },
    });
    for (let j = 0; j < d.sub.length; j++) {
      await prisma.subDepartment.create({
        data: {
          id: uuid(),
          department_id: dept.id,
          name: d.sub[j],
          code: `SUB-${j + 1}`,
          is_active: true,
        },
      });
    }
  }

  for (const name of PPE_CATEGORIES) {
    await prisma.ppeCategory.create({
      data: { id: uuid(), name, description: `${name} equipment`, company_id: companyId },
    });
  }

  const categories = await prisma.ppeCategory.findMany({ where: { company_id: companyId } });
  const catMap = {};
  categories.forEach((c) => { catMap[c.name] = c.id; });

  for (const item of PPE_ITEMS) {
    const catId = catMap[item.category] || categories[0]?.id;
    if (!catId) continue;
    await prisma.ppeItem.create({
      data: {
        id: uuid(),
        category_id: catId,
        sku: item.sku,
        name: item.name,
        category_name: item.category,
        size_required: item.sizeRequired,
        size_key: item.sizeKey,
        min_stock_threshold: 10,
        reorder_level: 20,
        is_active: true,
        company_id: companyId,
      },
    });
  }

  await prisma.stockLocation.create({
    data: { id: uuid(), code: 'MAIN-PPE', name: 'Main PPE Store', is_active: true, company_id: companyId },
  });
}

/** Ensure existing departments have PPE config. If a department has no DepartmentPpeItem, add default 4 items. */
export async function ensureDepartmentPpeConfig() {
  const companies = await prisma.company.findMany({ where: { status: 'ACTIVE' } });
  const defaultNames = ['Overall pants', 'Safety boots', 'Reflector vest', 'Shirt'];
  for (const company of companies) {
    const depts = await prisma.department.findMany({ where: { company_id: company.id } });
    for (const dept of depts) {
      const count = await prisma.departmentPpeItem.count({ where: { department_id: dept.id } });
      if (count > 0) continue;
      const items = await prisma.ppeItem.findMany({
        where: { company_id: company.id, name: { in: defaultNames } },
        orderBy: { name: 'asc' },
      });
      for (let i = 0; i < items.length; i++) {
        await prisma.departmentPpeItem.create({
          data: {
            id: uuid(),
            department_id: dept.id,
            ppe_item_id: items[i].id,
            display_order: i,
          },
        }).catch(() => {});
      }
    }
  }
}

/** Add Drivers/Warehouse/Office if missing (per company). */
export async function ensureDepartments() {
  const companies = await prisma.company.findMany({ where: { status: 'ACTIVE' } });
  for (const company of companies) {
    for (const d of DEPARTMENTS_DATA) {
      const existing = await prisma.department.findFirst({ where: { name: d.name, company_id: company.id } });
      if (existing) continue;
      const dept = await prisma.department.create({
        data: {
          id: uuid(),
          name: d.name,
          code: `DEPT-${d.name.toUpperCase().slice(0, 3)}`,
          is_active: true,
          created_at: new Date().toISOString(),
          company_id: company.id,
        },
      });
      for (let j = 0; j < d.sub.length; j++) {
        await prisma.subDepartment.create({
          data: {
            id: uuid(),
            department_id: dept.id,
            name: d.sub[j],
            code: `SUB-${j + 1}`,
            is_active: true,
          },
        });
      }
    }
  }
}
