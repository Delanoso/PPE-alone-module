import { v4 as uuid } from 'uuid';

const COVERALL_SIZES = Array.from({ length: 29 }, (_, i) => String(28 + i));
const SHOE_SIZES = Array.from({ length: 12 }, (_, i) => String(4 + i));
const VEST_AND_SHIRT_SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL', 'XXXXL', '5XL', '6XL', '7XL'];
const PPE_CATEGORIES = ['Head Protection', 'Eye Protection', 'Face Protection', 'Hearing Protection', 'Respiratory Protection', 'Hand Protection', 'Body Protection', 'High Visibility Wear', 'Foot Protection', 'Fall Protection', 'Weather Protection', 'Hygiene and Disposable'];
const JOB_TITLES = ['Driver - Refrigerated', 'Driver - Tautliner', 'Workshop Technician', 'Stores Clerk', 'Safety Officer', 'Department Supervisor', 'Admin Clerk', 'General Worker'];
const DEPARTMENTS_DATA = [
  { name: 'Refrigerated Trucks', sub: ['Long-haul Operations', 'Local Delivery', 'Driver Support'] },
];
const PPE_ITEMS_ISSUABLE = [
  { sku: 'PANTS-001', name: 'Overall pants', category: 'Body Protection', sizeKey: 'coverall_size', sizeRequired: true, sizes: COVERALL_SIZES },
  { sku: 'BOOT-001', name: 'Safety boots', category: 'Foot Protection', sizeKey: 'shoe_size', sizeRequired: true, sizes: SHOE_SIZES },
  { sku: 'VEST-001', name: 'Reflector vest', category: 'High Visibility Wear', sizeKey: 'reflective_vest_size', sizeRequired: true, sizes: VEST_AND_SHIRT_SIZES },
  { sku: 'SHIRT-001', name: 'Shirt', category: 'Body Protection', sizeKey: 'clothing_size', sizeRequired: true, sizes: VEST_AND_SHIRT_SIZES },
];

const store = {
  roles: [
    { id: 'r1', code: 'SUPER_ADMIN', name: 'Super Admin', description: 'Full system access' },
    { id: 'r2', code: 'HS_MANAGER', name: 'Health & Safety Manager', description: 'H&S oversight' },
    { id: 'r3', code: 'STORES_CTRL', name: 'Stores Controller', description: 'Stock and issuing' },
    { id: 'r4', code: 'DEPT_SUPER', name: 'Department Supervisor', description: 'Department scope' },
    { id: 'r5', code: 'ISSUING_OFF', name: 'Issuing Officer', description: 'Issue PPE only' },
  ],
  users: [
    { id: 'u1', username: 'admin', full_name: 'System Admin', email: 'admin@hfr.co.za', password_hash: 'admin123', status: 'ACTIVE', roleIds: ['r1'] },
    { id: 'u2', username: 'manager', full_name: 'John Safety', email: 'manager@hfr.co.za', password_hash: 'manager123', status: 'ACTIVE', roleIds: ['r2'] },
    { id: 'u3', username: 'stores', full_name: 'Mary Stores', email: 'stores@hfr.co.za', password_hash: 'stores123', status: 'ACTIVE', roleIds: ['r3'] },
  ],
  departments: [],
  subDepartments: [],
  people: [],
  personSizes: [],
  ppeCategories: [],
  ppeItems: [],
  stockLocations: [],
  stockBalances: [],
  stockMovements: [],
  ppeIssues: [],
  ppeIssueItems: [],
  signatureRequests: [],
  issueItemSignatures: [],
  sizeRequests: [],
  sizeRequestRecipients: [],
  auditLogs: [],
};

function initStore() {
  DEPARTMENTS_DATA.forEach((d, i) => {
    const dept = { id: uuid(), name: d.name, code: `DEPT-${i + 1}`, is_active: true, created_at: new Date().toISOString() };
    store.departments.push(dept);
    d.sub.forEach((s, j) => {
      store.subDepartments.push({
        id: uuid(),
        department_id: dept.id,
        name: s,
        code: `SUB-${i + 1}-${j + 1}`,
        is_active: true,
      });
    });
  });

  PPE_CATEGORIES.forEach((name, i) => {
    store.ppeCategories.push({
      id: uuid(),
      name,
      description: `${name} equipment`,
    });
  });

  PPE_ITEMS_ISSUABLE.forEach((item) => {
    const cat = store.ppeCategories.find((c) => c.name === item.category) || store.ppeCategories[0];
    const ppeItem = {
      id: uuid(),
      category_id: cat.id,
      sku: item.sku,
      name: item.name,
      category_name: item.category,
      size_required: item.sizeRequired,
      size_key: item.sizeKey,
      min_stock_threshold: 10,
      reorder_level: 20,
      is_active: true,
    };
    store.ppeItems.push(ppeItem);
    (item.sizeRequired ? item.sizes : [null]).forEach((s) => {
      store.stockBalances.push({
        id: uuid(),
        location_id: 'loc1',
        ppe_item_id: ppeItem.id,
        size_label: s,
        on_hand_qty: 50 + Math.floor(Math.random() * 50),
        ppe_item_name: ppeItem.name,
      });
    });
  });

  store.stockLocations.push({ id: 'loc1', code: 'MAIN-PPE', name: 'Main PPE Store', is_active: true });

  return store;
}

const initialized = initStore();

export { store, initStore, COVERALL_SIZES, SHOE_SIZES, VEST_AND_SHIRT_SIZES, PPE_CATEGORIES, JOB_TITLES };
export default store;
