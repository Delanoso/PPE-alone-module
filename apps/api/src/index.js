import app from './app.js';
import { seedDb, ensureMultiTenant, ensureDepartments, ensurePpeCatalog, ensureDepartmentPpeConfig } from './db.js';

const PORT = process.env.PORT || 3001;

seedDb()
  .then(() => ensureMultiTenant())
  .then(() => ensureDepartments())
  .then(() => ensurePpeCatalog())
  .then(() => ensureDepartmentPpeConfig())
  .then(() => {
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`PPE API running at http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Failed to seed database:', err);
    process.exit(1);
  });
