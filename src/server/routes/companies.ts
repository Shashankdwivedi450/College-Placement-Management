import { Router, Response } from 'express';
import { memoryDb } from '../db';
import { authenticateToken, AuthRequest, authorizeRoles } from '../middleware/auth';

const router = Router();

// GET /api/companies - Get all companies (with job and drive counts)
router.get('/', (req, res) => {
  const approvedOnly = req.query.approved === 'true';
  let list = memoryDb.companies;
  if (approvedOnly) {
    list = list.filter(c => c.approved);
  }

  const enhanced = list.map(c => {
    const jobsCount = memoryDb.jobs.filter(j => j.company_id === c.company_id).length;
    const { password_hash, ...safeCompany } = c;
    return {
      ...safeCompany,
      jobs_count: jobsCount
    };
  });

  return res.json(enhanced);
});

// GET /api/companies/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const company = memoryDb.companies.find(c => c.company_id === id);
  if (!company) {
    return res.status(404).json({ message: 'Company not found' });
  }

  const jobs = memoryDb.jobs.filter(j => j.company_id === id);
  const { password_hash, ...safeCompany } = company;

  return res.json({
    ...safeCompany,
    jobs
  });
});

// PUT /api/companies/:id - Update company profile
router.put('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (req.user?.role === 'Recruiter' && req.user.id !== id) {
    return res.status(403).json({ message: 'Forbidden: Cannot edit another company profile.' });
  }

  const company = memoryDb.companies.find(c => c.company_id === id);
  if (!company) {
    return res.status(404).json({ message: 'Company not found' });
  }

  const { company_name, industry, location, website } = req.body;
  if (company_name) company.company_name = company_name.trim();
  if (industry) company.industry = industry.trim();
  if (location) company.location = location.trim();
  if (website !== undefined) company.website = website.trim();

  const { password_hash, ...safeCompany } = company;
  return res.json({ message: 'Company profile updated successfully', company: safeCompany });
});

export default router;
