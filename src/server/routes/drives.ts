import { Router, Response } from 'express';
import { memoryDb } from '../db';
import { authenticateToken, AuthRequest, authorizeRoles } from '../middleware/auth';

const router = Router();

// GET /api/drives - List placement drives with criteria, company, job info
router.get('/', (req, res) => {
  const status = req.query.status as string;
  const companyId = req.query.company_id ? Number(req.query.company_id) : null;

  let list = memoryDb.drives;
  if (status) {
    list = list.filter(d => d.status.toLowerCase() === status.toLowerCase());
  }

  const enhanced = list.map(d => {
    const job = memoryDb.jobs.find(j => j.job_id === d.job_id);
    const company = job ? memoryDb.companies.find(c => c.company_id === job.company_id) : null;
    const criteria = memoryDb.criteria.find(c => c.drive_id === d.drive_id);
    const applicantsCount = memoryDb.applications.filter(a => a.drive_id === d.drive_id).length;

    return {
      ...d,
      job_title: job?.job_title || 'N/A',
      job_description: job?.job_description || '',
      package_lpa: job?.package || 0,
      job_location: job?.job_location || 'N/A',
      vacancies: job?.vacancies || 0,
      company_id: company?.company_id,
      company_name: company?.company_name || 'N/A',
      company_industry: company?.industry || 'N/A',
      company_location: company?.location || 'N/A',
      company_approved: company?.approved || false,
      criteria: criteria || null,
      total_applicants: applicantsCount
    };
  });

  if (companyId) {
    return res.json(enhanced.filter(d => d.company_id === companyId));
  }

  return res.json(enhanced);
});

// GET /api/drives/:id - Drive details
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const drive = memoryDb.drives.find(d => d.drive_id === id);
  if (!drive) {
    return res.status(404).json({ message: 'Placement drive not found' });
  }

  const job = memoryDb.jobs.find(j => j.job_id === drive.job_id);
  const company = job ? memoryDb.companies.find(c => c.company_id === job.company_id) : null;
  const criteria = memoryDb.criteria.find(c => c.drive_id === drive.drive_id);
  const applications = memoryDb.applications
    .filter(a => a.drive_id === id)
    .map(a => {
      const student = memoryDb.students.find(s => s.student_id === a.student_id);
      const dept = student ? memoryDb.departments.find(d => d.department_id === student.department_id) : null;
      return {
        ...a,
        student_name: student?.name || 'N/A',
        student_email: student?.email || 'N/A',
        student_phone: student?.phone || 'N/A',
        department_name: dept?.department_name || 'N/A',
        cgpa: student?.cgpa || 0,
        backlogs: student?.backlogs || 0,
        graduation_year: student?.graduation_year || 0,
        resume: student?.resume || ''
      };
    });

  return res.json({
    ...drive,
    job,
    company,
    criteria,
    applications
  });
});

// POST /api/drives - Transactional Drive + Criteria Creation
router.post('/', authenticateToken, authorizeRoles('Recruiter', 'Admin'), (req: AuthRequest, res: Response) => {
  const {
    job_id,
    drive_date,
    application_deadline,
    status = 'Upcoming',
    minimum_cgpa = 0.0,
    maximum_backlogs = 0,
    minimum_tenth_percentage = 0.0,
    minimum_twelfth_percentage = 0.0,
    graduation_year
  } = req.body;

  if (!job_id || !drive_date || !application_deadline || !graduation_year) {
    return res.status(400).json({ message: 'Missing required placement drive or criteria parameters.' });
  }

  const job = memoryDb.jobs.find(j => j.job_id === Number(job_id));
  if (!job) {
    return res.status(404).json({ message: 'Referenced Job not found.' });
  }

  if (req.user?.role === 'Recruiter' && job.company_id !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden: You cannot schedule drives for another company.' });
  }

  // Schema Constraint: application_deadline <= drive_date
  if (application_deadline > drive_date) {
    return res.status(400).json({
      message: 'Validation Error (chk_drive_deadline): Application deadline must be on or before the placement drive date.'
    });
  }

  // Execute in simulated ACID Transaction
  const nextDriveId = memoryDb.drives.length > 0 ? Math.max(...memoryDb.drives.map(d => d.drive_id)) + 1 : 1;
  const nextCritId = memoryDb.criteria.length > 0 ? Math.max(...memoryDb.criteria.map(c => c.criteria_id)) + 1 : 1;

  const newDrive = {
    drive_id: nextDriveId,
    job_id: Number(job_id),
    drive_date,
    application_deadline,
    status: status as 'Upcoming' | 'Open' | 'Closed' | 'Cancelled',
    created_at: new Date().toISOString()
  };

  const newCriteria = {
    criteria_id: nextCritId,
    drive_id: nextDriveId,
    minimum_cgpa: parseFloat(Number(minimum_cgpa).toFixed(2)),
    maximum_backlogs: Number(maximum_backlogs),
    minimum_tenth_percentage: parseFloat(Number(minimum_tenth_percentage).toFixed(2)),
    minimum_twelfth_percentage: parseFloat(Number(minimum_twelfth_percentage).toFixed(2)),
    graduation_year: Number(graduation_year)
  };

  memoryDb.drives.push(newDrive);
  memoryDb.criteria.push(newCriteria);

  return res.status(201).json({
    message: 'Placement drive and 1-to-1 eligibility criteria committed successfully in transaction.',
    drive: newDrive,
    criteria: newCriteria
  });
});

// PUT /api/drives/:id - Update drive status or criteria
router.put('/:id', authenticateToken, authorizeRoles('Recruiter', 'Admin'), (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const drive = memoryDb.drives.find(d => d.drive_id === id);
  if (!drive) {
    return res.status(404).json({ message: 'Placement drive not found' });
  }

  const {
    drive_date,
    application_deadline,
    status,
    minimum_cgpa,
    maximum_backlogs,
    minimum_tenth_percentage,
    minimum_twelfth_percentage,
    graduation_year
  } = req.body;

  if (drive_date) drive.drive_date = drive_date;
  if (application_deadline) drive.application_deadline = application_deadline;
  if (status && ['Upcoming', 'Open', 'Closed', 'Cancelled'].includes(status)) {
    drive.status = status;
  }

  if (drive.application_deadline > drive.drive_date) {
    return res.status(400).json({
      message: 'Validation Error: Application deadline cannot exceed drive date.'
    });
  }

  // Update 1-to-1 criteria
  const crit = memoryDb.criteria.find(c => c.drive_id === id);
  if (crit) {
    if (minimum_cgpa !== undefined) crit.minimum_cgpa = parseFloat(Number(minimum_cgpa).toFixed(2));
    if (maximum_backlogs !== undefined) crit.maximum_backlogs = Number(maximum_backlogs);
    if (minimum_tenth_percentage !== undefined) crit.minimum_tenth_percentage = parseFloat(Number(minimum_tenth_percentage).toFixed(2));
    if (minimum_twelfth_percentage !== undefined) crit.minimum_twelfth_percentage = parseFloat(Number(minimum_twelfth_percentage).toFixed(2));
    if (graduation_year !== undefined) crit.graduation_year = Number(graduation_year);
  }

  return res.json({ message: 'Drive and criteria updated successfully', drive, criteria: crit });
});

// DELETE /api/drives/:id
router.delete('/:id', authenticateToken, authorizeRoles('Recruiter', 'Admin'), (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  const drive = memoryDb.drives.find(d => d.drive_id === id);
  if (!drive) {
    return res.status(404).json({ message: 'Placement drive not found' });
  }

  memoryDb.applications = memoryDb.applications.filter(a => a.drive_id !== id);
  memoryDb.criteria = memoryDb.criteria.filter(c => c.drive_id !== id);
  memoryDb.drives = memoryDb.drives.filter(d => d.drive_id !== id);

  return res.json({ message: 'Placement drive and associated records deleted successfully.' });
});

export default router;
