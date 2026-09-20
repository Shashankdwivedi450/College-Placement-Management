import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { memoryDb } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_college_placement_jwt_key_2025';

// --------------------------------------------------------------------
// 1. POST /api/auth/register/student
// --------------------------------------------------------------------
router.post('/register/student', async (req: Request, res: Response) => {
  try {
    const {
      name,
      email,
      phone,
      password,
      department_id,
      graduation_year,
      cgpa,
      tenth_percentage,
      twelfth_percentage,
      backlogs,
      resume
    } = req.body;

    if (!name || !email || !password || !department_id || !graduation_year || cgpa === undefined) {
      return res.status(400).json({ message: 'Missing required student registration fields.' });
    }

    if (cgpa < 0 || cgpa > 10) {
      return res.status(400).json({ message: 'CGPA must be between 0.00 and 10.00.' });
    }

    if (tenth_percentage < 0 || tenth_percentage > 100 || twelfth_percentage < 0 || twelfth_percentage > 100) {
      return res.status(400).json({ message: '10th and 12th percentages must be between 0 and 100.' });
    }

    if (backlogs < 0) {
      return res.status(400).json({ message: 'Backlogs cannot be negative.' });
    }

    // Check duplicate email
    const existing = memoryDb.students.find(s => s.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: 'A student account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newId = memoryDb.students.length > 0
      ? Math.max(...memoryDb.students.map(s => s.student_id)) + 1
      : 1;

    const newStudent = {
      student_id: newId,
      name: name.trim(),
      email: email.trim().toLowerCase(),
      phone: phone || '+91 9999999999',
      password_hash: hashedPassword,
      department_id: Number(department_id),
      graduation_year: Number(graduation_year),
      cgpa: parseFloat(Number(cgpa).toFixed(2)),
      tenth_percentage: parseFloat(Number(tenth_percentage || 80).toFixed(2)),
      twelfth_percentage: parseFloat(Number(twelfth_percentage || 80).toFixed(2)),
      backlogs: Number(backlogs || 0),
      resume: resume || '',
      created_at: new Date().toISOString()
    };

    memoryDb.students.push(newStudent);

    const token = jwt.sign(
      {
        id: newStudent.student_id,
        student_id: newStudent.student_id,
        email: newStudent.email,
        role: 'Student',
        name: newStudent.name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'Student registered successfully',
      token,
      user: {
        id: newStudent.student_id,
        student_id: newStudent.student_id,
        name: newStudent.name,
        email: newStudent.email,
        role: 'Student'
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// --------------------------------------------------------------------
// 2. POST /api/auth/register/company
// --------------------------------------------------------------------
router.post('/register/company', async (req: Request, res: Response) => {
  try {
    const { company_name, industry, location, website, email, password } = req.body;

    if (!company_name || !industry || !location || !email || !password) {
      return res.status(400).json({ message: 'Missing required recruiter registration fields.' });
    }

    const existing = memoryDb.companies.find(c => c.email.toLowerCase() === email.toLowerCase());
    if (existing) {
      return res.status(409).json({ message: 'A company account with this email already exists.' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const newId = memoryDb.companies.length > 0
      ? Math.max(...memoryDb.companies.map(c => c.company_id)) + 1
      : 1;

    const newCompany = {
      company_id: newId,
      company_name: company_name.trim(),
      industry: industry.trim(),
      location: location.trim(),
      website: website || '',
      email: email.trim().toLowerCase(),
      password_hash: hashedPassword,
      approved: false, // Must be approved by placement admin
      created_at: new Date().toISOString()
    };

    memoryDb.companies.push(newCompany);

    const token = jwt.sign(
      {
        id: newCompany.company_id,
        company_id: newCompany.company_id,
        email: newCompany.email,
        role: 'Recruiter',
        name: newCompany.company_name
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    return res.status(201).json({
      message: 'Company registered successfully. Note: Job postings require admin approval.',
      token,
      user: {
        id: newCompany.company_id,
        company_id: newCompany.company_id,
        name: newCompany.company_name,
        email: newCompany.email,
        role: 'Recruiter',
        approved: newCompany.approved
      }
    });
  } catch (error: any) {
    return res.status(500).json({ message: 'Registration failed', error: error.message });
  }
});

// --------------------------------------------------------------------
// 3. POST /api/auth/login
// --------------------------------------------------------------------
router.post('/login', async (req: Request, res: Response) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: 'Please provide both email and password.' });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check Admin
    const admin = memoryDb.admins.find(a => a.email.toLowerCase() === cleanEmail);
    if (admin && (!role || role === 'Admin')) {
      const match = await bcrypt.compare(password, admin.password_hash);
      if (match) {
        const token = jwt.sign(
          { id: admin.admin_id, admin_id: admin.admin_id, email: admin.email, role: 'Admin', name: admin.name },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          token,
          user: { id: admin.admin_id, admin_id: admin.admin_id, email: admin.email, role: 'Admin', name: admin.name }
        });
      }
    }

    // Check Student
    const student = memoryDb.students.find(s => s.email.toLowerCase() === cleanEmail);
    if (student && (!role || role === 'Student')) {
      const match = await bcrypt.compare(password, student.password_hash);
      if (match) {
        const token = jwt.sign(
          { id: student.student_id, student_id: student.student_id, email: student.email, role: 'Student', name: student.name },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          token,
          user: {
            id: student.student_id,
            student_id: student.student_id,
            email: student.email,
            role: 'Student',
            name: student.name,
            cgpa: student.cgpa,
            graduation_year: student.graduation_year,
            department_id: student.department_id
          }
        });
      }
    }

    // Check Recruiter
    const company = memoryDb.companies.find(c => c.email.toLowerCase() === cleanEmail);
    if (company && (!role || role === 'Recruiter')) {
      const match = await bcrypt.compare(password, company.password_hash);
      if (match) {
        const token = jwt.sign(
          { id: company.company_id, company_id: company.company_id, email: company.email, role: 'Recruiter', name: company.company_name },
          JWT_SECRET,
          { expiresIn: '24h' }
        );
        return res.json({
          token,
          user: {
            id: company.company_id,
            company_id: company.company_id,
            email: company.email,
            role: 'Recruiter',
            name: company.company_name,
            approved: company.approved
          }
        });
      }
    }

    return res.status(401).json({ message: 'Invalid credentials. Please verify your email and password.' });
  } catch (error: any) {
    return res.status(500).json({ message: 'Authentication error', error: error.message });
  }
});

// --------------------------------------------------------------------
// 4. GET /api/auth/me
// --------------------------------------------------------------------
router.get('/me', authenticateToken, (req: AuthRequest, res: Response) => {
  if (!req.user) return res.status(401).json({ message: 'Not authenticated' });

  if (req.user.role === 'Student') {
    const student = memoryDb.students.find(s => s.student_id === req.user?.id);
    const dept = student ? memoryDb.departments.find(d => d.department_id === student.department_id) : null;
    return res.json({
      user: {
        ...req.user,
        ...student,
        department_name: dept?.department_name
      }
    });
  }

  if (req.user.role === 'Recruiter') {
    const company = memoryDb.companies.find(c => c.company_id === req.user?.id);
    return res.json({
      user: {
        ...req.user,
        ...company
      }
    });
  }

  return res.json({ user: req.user });
});

export default router;
