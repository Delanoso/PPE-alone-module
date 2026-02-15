import express from 'express';
import cors from 'cors';
import { seedDb, ensureMultiTenant, ensureDepartments } from './db.js';
import { authRouter } from './routes/auth.js';
import { usersRouter } from './routes/users.js';
import { departmentsRouter } from './routes/departments.js';
import { peopleRouter } from './routes/people.js';
import { ppeRouter } from './routes/ppe.js';
import { stockRouter } from './routes/stock.js';
import { issuesRouter } from './routes/issues.js';
import { signaturesRouter, signPublicRouter } from './routes/signatures.js';
import { sizeRequestsRouter, sizesPublicRouter } from './routes/size-requests.js';
import { remindersRouter } from './routes/reminders.js';
import { reportsRouter } from './routes/reports.js';
import { auditRouter } from './routes/audit.js';
import { adminRouter } from './routes/admin.js';
import { authMiddleware } from './middleware/auth.js';

const app = express();

// Ensure DB is seeded once (for Vercel serverless cold start)
let initPromise = null;
app.use(async (_req, _res, next) => {
  try {
    if (!initPromise) {
      initPromise = seedDb().then(() => ensureMultiTenant()).then(() => ensureDepartments());
    }
    await initPromise;
    next();
  } catch (err) {
    next(err);
  }
});

// Vercel: rewrite sends /api?path=v1/health — restore path so Express routes match
app.use((req, _res, next) => {
  if (process.env.VERCEL && req.url.startsWith('/api') && typeof req.query?.path === 'string') {
    req.url = '/api/' + req.query.path;
  }
  next();
});

app.use(cors({ origin: true, credentials: true }));
app.use(express.json());

app.get('/api/v1/health', (_, res) => {
  res.json({ success: true, data: { status: 'ok', version: '1.0.0' } });
});

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', authMiddleware, usersRouter);
app.use('/api/v1/departments', authMiddleware, departmentsRouter);
app.use('/api/v1/people', authMiddleware, peopleRouter);
app.use('/api/v1/ppe', authMiddleware, ppeRouter);
app.use('/api/v1/stock', authMiddleware, stockRouter);
app.use('/api/v1/issues', authMiddleware, issuesRouter);
app.use('/api/v1/signatures', authMiddleware, signaturesRouter);
app.use('/api/v1/size-requests', authMiddleware, sizeRequestsRouter);
app.use('/api/v1/reminders', authMiddleware, remindersRouter);
app.use('/api/v1/sizes', sizesPublicRouter);
app.use('/api/v1/reports', authMiddleware, reportsRouter);
app.use('/api/v1/audit', authMiddleware, auditRouter);
app.use('/api/v1/admin', authMiddleware, adminRouter);
app.use('/api/v1/sign', signPublicRouter);

// Central error handler (Vercel: avoid swallowed errors affecting function state)
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(500).json({ success: false, error: { message: err.message || 'Internal server error' } });
});

export default app;
