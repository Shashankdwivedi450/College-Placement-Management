import { Router, Response } from 'express';
import { memoryDb } from '../db';
import { authenticateToken, AuthRequest, authorizeRoles } from '../middleware/auth';

const router = Router();

// POST /api/applications - Apply to drive through 8-step workflow
router.post('/', authenticateToken, authorizeRoles('Student', 'Admin'), (req: AuthRequest, res: Response) => {
  const { drive_id, student_id } = req.body;
  const targetStudentId = req.user?.role === 'Student' ? req.user.id : Number(student_id);

  if (!targetStudentId || !drive_id) {
    return res.status(400).json({ message: 'Both student_id and drive_id are required to apply.' });
  }

  const result = memoryDb.submitApplication(targetStudentId, Number(drive_id));

  if (!result.success) {
    return res.status(result.error_code || 400).json({
      message: result.message,
      reason: result.message
    });
  }

  return res.status(201).json({
    message: result.message,
    application_id: result.application_id,
    status: 'Applied'
  });
});

// GET /api/students/:id/applications - Get all applications for a student
router.get('/student/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const studentId = Number(req.params.id);

  if (req.user?.role === 'Student' && req.user.id !== studentId) {
    return res.status(403).json({ message: 'Forbidden: Cannot access other student application history.' });
  }

  const apps = memoryDb.applications.filter(a => a.student_id === studentId);
  const detailed = apps.map(a => {
    const drive = memoryDb.drives.find(d => d.drive_id === a.drive_id);
    const job = drive ? memoryDb.jobs.find(j => j.job_id === drive.job_id) : null;
    const company = job ? memoryDb.companies.find(c => c.company_id === job.company_id) : null;

    return {
      ...a,
      drive_date: drive?.drive_date || 'N/A',
      drive_status: drive?.status || 'N/A',
      application_deadline: drive?.application_deadline || 'N/A',
      job_title: job?.job_title || 'N/A',
      job_location: job?.job_location || 'N/A',
      package_lpa: job?.package || 0,
      company_name: company?.company_name || 'N/A',
      company_location: company?.location || 'N/A'
    };
  });

  return res.json(detailed);
});

// GET /api/drives/:id/applications - Get applicants for a drive
router.get('/drive/:id', authenticateToken, authorizeRoles('Recruiter', 'Admin'), (req: AuthRequest, res: Response) => {
  const driveId = Number(req.params.id);
  const drive = memoryDb.drives.find(d => d.drive_id === driveId);
  if (!drive) {
    return res.status(404).json({ message: 'Drive not found' });
  }

  const job = memoryDb.jobs.find(j => j.job_id === drive.job_id);
  if (req.user?.role === 'Recruiter' && job?.company_id !== req.user.id) {
    return res.status(403).json({ message: 'Forbidden: Cannot view applicants for other companies.' });
  }

  const apps = memoryDb.applications.filter(a => a.drive_id === driveId);
  const detailed = apps.map(a => {
    const s = memoryDb.students.find(st => st.student_id === a.student_id);
    const dept = s ? memoryDb.departments.find(d => d.department_id === s.department_id) : null;
    const skills = s ? memoryDb.studentSkills.filter(ss => ss.student_id === s.student_id).map(ss => {
      const sk = memoryDb.skills.find(k => k.skill_id === ss.skill_id);
      return `${sk?.skill_name} (${ss.proficiency})`;
    }) : [];

    return {
      application_id: a.application_id,
      student_id: a.student_id,
      student_name: s?.name || 'N/A',
      student_email: s?.email || 'N/A',
      student_phone: s?.phone || 'N/A',
      department_name: dept?.department_name || 'N/A',
      cgpa: s?.cgpa || 0,
      backlogs: s?.backlogs || 0,
      graduation_year: s?.graduation_year || 0,
      resume: s?.resume || '',
      skills,
      application_date: a.application_date,
      status: a.status
    };
  });

  return res.json(detailed);
});

// PUT /api/applications/:id/status - Recruiter/Admin updates candidate status
router.put('/:id/status', authenticateToken, authorizeRoles('Recruiter', 'Admin'), (req: AuthRequest, res: Response) => {
  const appId = Number(req.params.id);
  const { status } = req.body;

  const validStatuses = ['Applied', 'Eligible', 'Shortlisted', 'Rejected', 'Withdrawn'];
  if (!status || !validStatuses.includes(status)) {
    return res.status(400).json({
      message: `Invalid status. Must be one of: [${validStatuses.join(', ')}]`
    });
  }

  const app = memoryDb.applications.find(a => a.application_id === appId);
  if (!app) {
    return res.status(404).json({ message: 'Application record not found' });
  }

  app.status = status;
  return res.json({ message: `Application status updated to "${status}"`, application: app });
});

export default router;
