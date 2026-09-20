import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { createServer as createViteServer } from 'vite';
import { initializeDatabase } from './src/server/db';

import authRouter from './src/server/routes/auth';
import studentsRouter from './src/server/routes/students';
import skillsRouter from './src/server/routes/skills';
import companiesRouter from './src/server/routes/companies';
import jobsRouter from './src/server/routes/jobs';
import drivesRouter from './src/server/routes/drives';
import eligibilityRouter from './src/server/routes/eligibility';
import applicationsRouter from './src/server/routes/applications';
import adminRouter from './src/server/routes/admin';
import dbmsRouter from './src/server/routes/dbms';

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(cors());
  app.use(express.json());

  // Attempt database connection (if configured)
  await initializeDatabase();

  // ------------------------------------------------------------------
  // REST API Routes
  // ------------------------------------------------------------------
  app.get('/api/health', (req, res) => {
    res.json({
      status: 'online',
      service: 'College Placement Management System API',
      timestamp: new Date().toISOString()
    });
  });

  app.use('/api/auth', authRouter);
  app.use('/api/students', studentsRouter);
  app.use('/api/skills', skillsRouter);
  app.use('/api/companies', companiesRouter);
  app.use('/api/jobs', jobsRouter);
  app.use('/api/drives', drivesRouter);
  app.use('/api/eligibility', eligibilityRouter);
  app.use('/api/applications', applicationsRouter);
  app.use('/api/admin', adminRouter);
  app.use('/api/dbms', dbmsRouter);

  // ------------------------------------------------------------------
  // Frontend Vite Middleware (Dev vs Prod)
  // ------------------------------------------------------------------
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`[Server] College Placement Management System running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error('[Server] Fatal startup failure:', err);
});
