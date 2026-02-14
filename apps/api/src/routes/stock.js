import { Router } from 'express';
import { prisma } from '../db.js';

const router = Router();

router.get('/balances', async (req, res) => {
  const { location_id } = req.query;
  const where = {};
  if (location_id) where.location_id = location_id;
  const balances = await prisma.stockBalance.findMany({
    where,
    include: { ppeItem: true, location: true },
  });
  const data = balances.map((b) => ({
    ...b,
    ppe_item_name: b.ppeItem?.name || b.ppe_item_name,
    location_name: b.location?.name,
  }));
  res.json({ success: true, data });
});

router.post('/receive', async (req, res) => {
  const { location_id, ppe_item_id, size_label, quantity, reason_code } = req.body;
  if (!location_id || !ppe_item_id || !quantity || quantity <= 0) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid receive data' } });
  }
  const qty = Number(quantity);
  let balance = await prisma.stockBalance.findFirst({
    where: {
      location_id,
      ppe_item_id,
      size_label: size_label || null,
    },
  });
  if (!balance) {
    const item = await prisma.ppeItem.findUnique({ where: { id: ppe_item_id } });
    balance = await prisma.stockBalance.create({
      data: {
        location_id,
        ppe_item_id,
        size_label: size_label || null,
        on_hand_qty: 0,
        ppe_item_name: item?.name,
      },
    });
  }
  await prisma.stockBalance.update({
    where: { id: balance.id },
    data: { on_hand_qty: balance.on_hand_qty + qty },
  });
  await prisma.stockMovement.create({
    data: {
      movement_type: 'RECEIPT',
      location_id,
      ppe_item_id,
      size_label: size_label || null,
      quantity: qty,
      reason_code: reason_code || 'Goods Received',
      created_at: new Date().toISOString(),
    },
  });
  const updated = await prisma.stockBalance.findUnique({ where: { id: balance.id }, include: { ppeItem: true } });
  res.status(201).json({ success: true, data: { balance: updated } });
});

router.post('/adjust', async (req, res) => {
  const { location_id, ppe_item_id, size_label, quantity, reason_code } = req.body;
  if (!location_id || !ppe_item_id || quantity === undefined) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid adjust data' } });
  }
  let balance = await prisma.stockBalance.findFirst({
    where: {
      location_id,
      ppe_item_id,
      size_label: size_label || null,
    },
  });
  if (!balance) {
    balance = await prisma.stockBalance.create({
      data: {
        location_id,
        ppe_item_id,
        size_label: size_label || null,
        on_hand_qty: 0,
      },
    });
  }
  const newQty = Math.max(0, balance.on_hand_qty + Number(quantity));
  await prisma.stockBalance.update({
    where: { id: balance.id },
    data: { on_hand_qty: newQty },
  });
  await prisma.stockMovement.create({
    data: {
      movement_type: 'ADJUSTMENT',
      location_id,
      ppe_item_id,
      size_label: size_label || null,
      quantity: Math.abs(Number(quantity)),
      reason_code: reason_code || 'Cycle Count Correction',
      created_at: new Date().toISOString(),
    },
  });
  const updated = await prisma.stockBalance.findUnique({ where: { id: balance.id } });
  res.json({ success: true, data: { balance: updated } });
});

router.post('/transfer', async (req, res) => {
  const { from_location_id, to_location_id, ppe_item_id, size_label, quantity } = req.body;
  if (!from_location_id || !to_location_id || !ppe_item_id || !quantity || quantity <= 0) {
    return res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid transfer data' } });
  }
  const qty = Number(quantity);
  const fromBal = await prisma.stockBalance.findFirst({
    where: {
      location_id: from_location_id,
      ppe_item_id,
      size_label: size_label || null,
    },
  });
  if (!fromBal || fromBal.on_hand_qty < qty) {
    return res.status(400).json({ success: false, error: { code: 'INSUFFICIENT_STOCK', message: 'Insufficient stock' } });
  }
  await prisma.stockBalance.update({
    where: { id: fromBal.id },
    data: { on_hand_qty: fromBal.on_hand_qty - qty },
  });
  let toBal = await prisma.stockBalance.findFirst({
    where: {
      location_id: to_location_id,
      ppe_item_id,
      size_label: size_label || null,
    },
  });
  if (!toBal) {
    const item = await prisma.ppeItem.findUnique({ where: { id: ppe_item_id } });
    toBal = await prisma.stockBalance.create({
      data: {
        location_id: to_location_id,
        ppe_item_id,
        size_label: size_label || null,
        on_hand_qty: 0,
        ppe_item_name: item?.name,
      },
    });
  }
  await prisma.stockBalance.update({
    where: { id: toBal.id },
    data: { on_hand_qty: toBal.on_hand_qty + qty },
  });
  res.json({ success: true });
});

router.get('/movements', async (req, res) => {
  const movements = await prisma.stockMovement.findMany({
    orderBy: { id: 'desc' },
    take: 50,
  });
  const itemIds = [...new Set(movements.map((m) => m.ppe_item_id))];
  const items = await prisma.ppeItem.findMany({ where: { id: { in: itemIds } } });
  const itemMap = Object.fromEntries(items.map((i) => [i.id, i.name]));
  const data = movements.map((m) => ({ ...m, ppe_item_name: itemMap[m.ppe_item_id] }));
  res.json({ success: true, data });
});

export { router as stockRouter };
