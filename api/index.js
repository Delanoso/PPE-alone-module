// Vercel serverless entry: runs Express API and seeds DB once per cold start.
let initPromise;

async function getApp() {
  if (!initPromise) {
    initPromise = (async () => {
      const { seedDb } = await import('../apps/api/src/db.js');
      await seedDb();
      const { default: app } = await import('../apps/api/src/app.js');
      return app;
    })();
  }
  return initPromise;
}

export default async function handler(req, res) {
  const app = await getApp();
  app(req, res);
}
