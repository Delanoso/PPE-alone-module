// Vercel serverless: export the Express app so Vercel runs it as a single function.
// DB seeding runs once via middleware in app.js (cold start).
import app from '../apps/api/src/app.js';

export default app;
