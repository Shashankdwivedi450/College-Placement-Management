import { Router, Response } from 'express';
import { memoryDb } from '../db';
import { authenticateToken, AuthRequest, authorizeRoles } from '../middleware/auth';

const router = Router();

// Require Admin authorization for all admin routes
router.use(authenticateToken, authorizeRoles('Admin'));

// GET /api/admin/stats - Overview metrics
router.get('/stats', (req: AuthRequest, res: Response) => {
  const totalStudents = memoryDb.students.length;
  const totalCompanies = memoryDb.companies.length;
  const approvedCompanies = memoryDb.companies.filter(c => c.approved).length;
  const pendingCompanies = totalCompanies - approvedCompanies;
  const totalJobs = memoryDb.jobs.length;
  const totalDrives = memoryDb.drives.length;
  const openDrives = memoryDb.drives.filter(d => d.status === 'Open').length;
  const totalApplications = memoryDb.applications.length;
  const shortlistedCount = memoryDb.applications.filter(a => a.status === 'Shortlisted').length;

  // Department distribution
  const deptDistribution = memoryDb.departments.map(d => ({
    department_id: d.department_id,
    department_name: d.department_name,
    student_count: memoryDb.students.filter(s => s.department_id === d.department_id).length
  }));

  // Average CGPA
  const avgCgpa = totalStudents > 0
    ? (memoryDb.students.reduce((sum, s) => sum + s.cgpa, 0) / totalStudents).toFixed(2)
    : 0;

  return res.json({
    total_students: totalStudents,
    total_companies: totalCompanies,
    approved_companies: approvedCompanies,
    pending_companies: pendingCompanies,
    total_jobs: totalJobs,
    total_drives: totalDrives,
    open_drives: openDrives,
    total_applications: totalApplications,
    shortlisted_count: shortlistedCount,
    average_cgpa: Number(avgCgpa),
    department_distribution: deptDistribution
  });
});

// GET /api/admin/students - Full student list with enriched analytics
router.get('/students', (req: AuthRequest, res: Response) => {
  const list = memoryDb.students.map(s => {
    const dept = memoryDb.departments.find(d => d.department_id === s.department_id);
    const skills = memoryDb.studentSkills
      .filter(ss => ss.student_id === s.student_id)
      .map(ss => {
        const sk = memoryDb.skills.find(k => k.skill_id === ss.skill_id);
        return `${sk?.skill_name} (${ss.proficiency})`;
      });
    const appsCount = memoryDb.applications.filter(a => a.student_id === s.student_id).length;
    const { password_hash, ...safe } = s;

    return {
      ...safe,
      department_name: dept?.department_name || 'N/A',
      skills,
      applications_count: appsCount
    };
  });

  return res.json(list);
});

// GET /api/admin/companies - Company list with approval states
router.get('/companies', (req: AuthRequest, res: Response) => {
  const list = memoryDb.companies.map(c => {
    const jobsCount = memoryDb.jobs.filter(j => j.company_id === c.company_id).length;
    const { password_hash, ...safe } = c;
    return {
      ...safe,
      jobs_count: jobsCount
    };
  });

  return res.json(list);
});

// PUT /api/admin/companies/:id/approve - Toggle company approval
router.put('/companies/:id/approve', (req: AuthRequest, res: Response) => {
  const companyId = Number(req.params.id);
  const company = memoryDb.companies.find(c => c.company_id === companyId);
  if (!company) {
    return res.status(404).json({ message: 'Company not found' });
  }

  const { approved } = req.body;
  company.approved = approved !== undefined ? Boolean(approved) : true;

  return res.json({
    message: `Company "${company.company_name}" approval set to ${company.approved}`,
    company
  });
});

// GET /api/admin/jobs
router.get('/jobs', (req: AuthRequest, res: Response) => {
  const list = memoryDb.jobs.map(j => {
    const c = memoryDb.companies.find(co => co.company_id === j.company_id);
    return {
      ...j,
      company_name: c?.company_name || 'N/A',
      company_approved: c?.approved || false
    };
  });
  return res.json(list);
});

// GET /api/admin/drives
router.get('/drives', (req: AuthRequest, res: Response) => {
  const list = memoryDb.drives.map(d => {
    const job = memoryDb.jobs.find(j => j.job_id === d.job_id);
    const company = job ? memoryDb.companies.find(c => c.company_id === job.company_id) : null;
    const crit = memoryDb.criteria.find(c => c.drive_id === d.drive_id);
    const count = memoryDb.applications.filter(a => a.drive_id === d.drive_id).length;

    return {
      ...d,
      job_title: job?.job_title || 'N/A',
      company_name: company?.company_name || 'N/A',
      criteria: crit,
      total_applicants: count
    };
  });
  return res.json(list);
});

// GET /api/admin/applications
router.get('/applications', (req: AuthRequest, res: Response) => {
  const list = memoryDb.applications.map(a => {
    const student = memoryDb.students.find(s => s.student_id === a.student_id);
    const drive = memoryDb.drives.find(d => d.drive_id === a.drive_id);
    const job = drive ? memoryDb.jobs.find(j => j.job_id === drive.job_id) : null;
    const company = job ? memoryDb.companies.find(c => c.company_id === job.company_id) : null;

    return {
      ...a,
      student_name: student?.name || 'N/A',
      student_email: student?.email || 'N/A',
      job_title: job?.job_title || 'N/A',
      company_name: company?.company_name || 'N/A',
      drive_date: drive?.drive_date || 'N/A'
    };
  });
  return res.json(list);
});

// GET /api/admin/departments
router.get('/departments', (req: AuthRequest, res: Response) => {
  const list = memoryDb.departments.map(d => ({
    ...d,
    students_count: memoryDb.students.filter(s => s.department_id === d.department_id).length
  }));
  return res.json(list);
});

// POST /api/admin/departments
router.post('/departments', (req: AuthRequest, res: Response) => {
  const { department_name } = req.body;
  if (!department_name || !department_name.trim()) {
    return res.status(400).json({ message: 'Department name is required' });
  }

  const clean = department_name.trim();
  const existing = memoryDb.departments.find(d => d.department_name.toLowerCase() === clean.toLowerCase());
  if (existing) {
    return res.status(409).json({ message: 'Department already exists' });
  }

  const nextId = memoryDb.departments.length > 0 ? Math.max(...memoryDb.departments.map(d => d.department_id)) + 1 : 1;
  const newDept = { department_id: nextId, department_name: clean };
  memoryDb.departments.push(newDept);

  return res.status(201).json({ message: 'Department created successfully', department: newDept });
});

// DELETE /api/admin/departments/:id
router.delete('/departments/:id', (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  // Check foreign key constraint: ON DELETE RESTRICT
  const enrolledStudents = memoryDb.students.filter(s => s.department_id === id);
  if (enrolledStudents.length > 0) {
    return res.status(400).json({
      message: `Cannot delete department: ${enrolledStudents.length} student(s) currently enrolled. (Foreign Key Constraint fk_student_department)`
    });
  }

  memoryDb.departments = memoryDb.departments.filter(d => d.department_id !== id);
  return res.json({ message: 'Department deleted successfully' });
});

export default router;
