import { Router, Response } from 'express';
import { memoryDb } from '../db';
import { authenticateToken, AuthRequest, authorizeRoles } from '../middleware/auth';

const router = Router();

// GET /api/jobs - List all jobs
router.get('/', (req, res) => {
  const companyId = req.query.company_id ? Number(req.query.company_id) : null;
  let list = memoryDb.jobs;
  if (companyId) {
    list = list.filter(j => j.company_id === companyId);
  }

  const enhanced = list.map(j => {
    const company = memoryDb.companies.find(c => c.company_id === j.company_id);
    const drive = memoryDb.drives.find(d => d.job_id === j.job_id);
    return {
      ...j,
      company_name: company?.company_name || 'N/A',
      company_industry: company?.industry || 'N/A',
      company_location: company?.location || 'N/A',
      company_approved: company?.approved || false,
      has_drive: !!drive,
      drive_id: drive?.drive_id,
      drive_status: drive?.status
    };
  });

  return res.json(enhanced);
});

// GET /api/jobs/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const job = memoryDb.jobs.find(j => j.job_id === id);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  const company = memoryDb.companies.find(c => c.company_id === job.company_id);
  const drives = memoryDb.drives.filter(d => d.job_id === id);

  return res.json({
    ...job,
    company,
    drives
  });
});

// POST /api/jobs - Create new job (Trigger enforcement: company must be approved)
router.post('/', authenticateToken, authorizeRoles('Recruiter', 'Admin'), (req: AuthRequest, res: Response) => {
  const { company_id, job_title, job_description, package: pkg, job_location, vacancies } = req.body;

  const targetCompanyId = req.user?.role === 'Recruiter' ? req.user.id : Number(company_id);
  if (!targetCompanyId) {
    return res.status(400).json({ message: 'Company ID is required' });
  }

  const company = memoryDb.companies.find(c => c.company_id === targetCompanyId);
  if (!company) {
    return res.status(404).json({ message: 'Company not found' });
  }

  // Enforce DB Trigger: trg_before_job_insert
  if (!company.approved) {
    return res.status(403).json({
      message: 'Trigger Error (trg_before_job_insert): Jobs can only be posted by verified and approved companies. Your profile is currently awaiting administrator review.'
    });
  }

  if (!job_title || !job_description || pkg === undefined || !job_location || vacancies === undefined) {
    return res.status(400).json({ message: 'Please fill in all mandatory job fields.' });
  }

  const numericPackage = Number(pkg);
  const numericVacancies = Number(vacancies);

  if (numericPackage < 0) {
    return res.status(400).json({ message: 'Validation Error: Package cannot be negative.' });
  }

  if (numericVacancies <= 0) {
    return res.status(400).json({ message: 'Validation Error: Vacancies must be greater than zero.' });
  }

  const newId = memoryDb.jobs.length > 0 ? Math.max(...memoryDb.jobs.map(j => j.job_id)) + 1 : 1;
  const newJob = {
    job_id: newId,
    company_id: targetCompanyId,
    job_title: job_title.trim(),
    job_description: job_description.trim(),
    package: parseFloat(numericPackage.toFixed(2)),
    job_location: job_location.trim(),
    vacancies: Math.floor(numericVacancies),
    created_at: new Date().toISOString()
  };

  memoryDb.jobs.push(newJob);
  return res.status(201).json({ message: 'Job created successfully', job: newJob });
});

// PUT /api/jobs/:id
router.put('/:id', authenticateToken, authorizeRoles('Recruiter', 'Admin'), (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const job = memoryDb.jobs.find(j => j.job_id === id);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  if (req.user?.role === 'Recruiter' && job.company_id !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden: You cannot modify jobs for another company.' });
  }

  const { job_title, job_description, package: pkg, job_location, vacancies } = req.body;

  if (job_title) job.job_title = job_title.trim();
  if (job_description) job.job_description = job_description.trim();
  if (job_location) job.job_location = job_location.trim();

  if (pkg !== undefined) {
    const p = Number(pkg);
    if (p < 0) return res.status(400).json({ message: 'Package cannot be negative' });
    job.package = parseFloat(p.toFixed(2));
  }

  if (vacancies !== undefined) {
    const v = Number(vacancies);
    if (v <= 0) return res.status(400).json({ message: 'Vacancies must be greater than zero' });
    job.vacancies = Math.floor(v);
  }

  return res.json({ message: 'Job updated successfully', job });
});

// DELETE /api/jobs/:id
router.delete('/:id', authenticateToken, authorizeRoles('Recruiter', 'Admin'), (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const job = memoryDb.jobs.find(j => j.job_id === id);
  if (!job) {
    return res.status(404).json({ message: 'Job not found' });
  }

  if (req.user?.role === 'Recruiter' && job.company_id !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden: You cannot delete jobs for another company.' });
  }

  // Cascading removal of drives, criteria, applications
  const associatedDrives = memoryDb.drives.filter(d => d.job_id === id).map(d => d.drive_id);
  memoryDb.applications = memoryDb.applications.filter(a => !associatedDrives.includes(a.drive_id));
  memoryDb.criteria = memoryDb.criteria.filter(c => !associatedDrives.includes(c.drive_id));
  memoryDb.drives = memoryDb.drives.filter(d => d.job_id !== id);
  memoryDb.jobs = memoryDb.jobs.filter(j => j.job_id !== id);

  return res.json({ message: 'Job and all associated placement drives deleted successfully.' });
});

export default router;
