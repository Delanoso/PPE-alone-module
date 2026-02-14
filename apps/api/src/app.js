import express from 'express';
import cors from 'cors';
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
import { authMiddleware } from './middleware/auth.js';

const app = express();

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
app.use('/api/v1/sign', signPublicRouter);

export default app;
