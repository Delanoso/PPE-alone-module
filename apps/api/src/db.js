import { PrismaClient } from '@prisma/client';

export const prisma = new PrismaClient();

const DEPARTMENTS_DATA = [
  { name: 'Refrigerated Trucks', sub: ['Long-haul Operations', 'Local Delivery', 'Driver Support'] },
];

const PPE_CATEGORIES = ['Head Protection', 'Eye Protection', 'Face Protection', 'Hearing Protection', 'Respiratory Protection', 'Hand Protection', 'Body Protection', 'High Visibility Wear', 'Foot Protection', 'Fall Protection', 'Weather Protection', 'Hygiene and Disposable'];

const PPE_ITEMS = [
  { sku: 'PANTS-001', name: 'Overall pants', category: 'Body Protection', sizeKey: 'coverall_size', sizeRequired: true, sizes: Array.from({ length: 29 }, (_, i) => String(28 + i)) },
  { sku: 'BOOT-001', name: 'Safety boots', category: 'Foot Protection', sizeKey: 'shoe_size', sizeRequired: true, sizes: Array.from({ length: 12 }, (_, i) => String(4 + i)) },
  { sku: 'VEST-001', name: 'Reflector vest', category: 'High Visibility Wear', sizeKey: 'reflective_vest_size', sizeRequired: true, sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL', '5XL', '6XL', '7XL'] },
  { sku: 'SHIRT-001', name: 'Shirt', category: 'Body Protection', sizeKey: 'clothing_size', sizeRequired: true, sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL', '5XL', '6XL', '7XL'] },
];

export async function seedDb() {
  const deptCount = await prisma.department.count();
  if (deptCount > 0) return;

  for (const d of DEPARTMENTS_DATA) {
    const dept = await prisma.department.create({
      data: {
        name: d.name,
        code: `DEPT-1`,
        is_active: true,
        created_at: new Date().toISOString(),
      },
    });
    for (const s of d.sub) {
      await prisma.subDepartment.create({
        data: {
          department_id: dept.id,
          name: s,
          code: `SUB-1`,
          is_active: true,
        },
      });
    }
  }

  for (const name of PPE_CATEGORIES) {
    await prisma.ppeCategory.create({
      data: { name, description: `${name} equipment` },
    });
  }

  const categories = await prisma.ppeCategory.findMany();
  const catMap = {};
  categories.forEach((c) => { catMap[c.name] = c.id; });

  for (const item of PPE_ITEMS) {
    const catId = catMap[item.category] || categories[0].id;
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
      },
    });

    let loc = await prisma.stockLocation.findFirst();
    if (!loc) {
      loc = await prisma.stockLocation.create({
        data: { code: 'MAIN-PPE', name: 'Main PPE Store', is_active: true },
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

  const userCount = await prisma.user.count();
  if (userCount === 0) {
    await prisma.user.createMany({
      data: [
        { id: 'u1', username: 'admin', full_name: 'System Admin', email: 'admin@hfr.co.za', password_hash: 'admin123', status: 'ACTIVE', roleIds: '["r1"]' },
        { id: 'u2', username: 'manager', full_name: 'John Safety', email: 'manager@hfr.co.za', password_hash: 'manager123', status: 'ACTIVE', roleIds: '["r2"]' },
        { id: 'u3', username: 'stores', full_name: 'Mary Stores', email: 'stores@hfr.co.za', password_hash: 'stores123', status: 'ACTIVE', roleIds: '["r3"]' },
      ],
    });
  }
}
