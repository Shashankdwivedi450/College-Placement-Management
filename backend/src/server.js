const express = require('express');
const cors = require('cors');
require('dotenv').config();

const pool = require('./config/db');
const authenticateToken = require('./middleware/auth');
const authorizeRoles = require('./middleware/roleMiddleware');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_college_placement_jwt_key_2025';

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req, res) => {
  res.json({ status: 'online', timestamp: new Date().toISOString() });
});

// ==========================================
// 1. AUTHENTICATION CONTROLLERS & ROUTES
// ==========================================

// POST /api/auth/register/student
app.post('/api/auth/register/student', async (req, res) => {
  try {
    const {
      name, email, phone, password, department_id,
      graduation_year, cgpa, tenth_percentage, twelfth_percentage,
      backlogs, resume
    } = req.body;

    if (!name || !email || !password || !department_id || !graduation_year || cgpa === undefined) {
      return res.status(400).json({ message: 'Missing required student fields.' });
    }

    const [existing] = await pool.query('SELECT student_id FROM STUDENT WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'A student account with this email already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO STUDENT (name, email, phone, password_hash, department_id, graduation_year, cgpa, tenth_percentage, twelfth_percentage, backlogs, resume)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [name, email, phone || null, hash, department_id, graduation_year, cgpa, tenth_percentage || 80, twelfth_percentage || 80, backlogs || 0, resume || null]
    );

    const studentId = result.insertId;
    const token = jwt.sign({ id: studentId, student_id: studentId, email, role: 'Student', name }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ message: 'Student registered successfully', token, user: { id: studentId, name, email, role: 'Student' } });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// POST /api/auth/register/company
app.post('/api/auth/register/company', async (req, res) => {
  try {
    const { company_name, industry, location, website, email, password } = req.body;
    if (!company_name || !industry || !location || !email || !password) {
      return res.status(400).json({ message: 'Missing required company fields.' });
    }

    const [existing] = await pool.query('SELECT company_id FROM COMPANY WHERE email = ?', [email]);
    if (existing.length > 0) {
      return res.status(409).json({ message: 'A company account with this email already exists.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO COMPANY (company_name, industry, location, website, email, password_hash, approved)
       VALUES (?, ?, ?, ?, ?, ?, FALSE)`,
      [company_name, industry, location, website || null, email, hash]
    );

    const companyId = result.insertId;
    const token = jwt.sign({ id: companyId, company_id: companyId, email, role: 'Recruiter', name: company_name }, JWT_SECRET, { expiresIn: '24h' });

    res.status(201).json({ message: 'Company registered. Awaiting admin approval.', token, user: { id: companyId, name: company_name, email, role: 'Recruiter', approved: false } });
  } catch (err) {
    res.status(500).json({ message: 'Registration failed', error: err.message });
  }
});

// POST /api/auth/login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, role } = req.body;
    if (!email || !password) return res.status(400).json({ message: 'Email and password required' });

    // Try Admin
    if (!role || role === 'Admin') {
      const [admins] = await pool.query('SELECT * FROM ADMIN WHERE email = ?', [email]);
      if (admins.length > 0) {
        const match = await bcrypt.compare(password, admins[0].password_hash);
        if (match) {
          const token = jwt.sign({ id: admins[0].admin_id, admin_id: admins[0].admin_id, email: admins[0].email, role: 'Admin', name: admins[0].name }, JWT_SECRET, { expiresIn: '24h' });
          return res.json({ token, user: { id: admins[0].admin_id, email: admins[0].email, role: 'Admin', name: admins[0].name } });
        }
      }
    }

    // Try Student
    if (!role || role === 'Student') {
      const [students] = await pool.query('SELECT * FROM STUDENT WHERE email = ?', [email]);
      if (students.length > 0) {
        const match = await bcrypt.compare(password, students[0].password_hash);
        if (match) {
          const token = jwt.sign({ id: students[0].student_id, student_id: students[0].student_id, email: students[0].email, role: 'Student', name: students[0].name }, JWT_SECRET, { expiresIn: '24h' });
          return res.json({ token, user: { id: students[0].student_id, email: students[0].email, role: 'Student', name: students[0].name, cgpa: students[0].cgpa } });
        }
      }
    }

    // Try Recruiter
    if (!role || role === 'Recruiter') {
      const [companies] = await pool.query('SELECT * FROM COMPANY WHERE email = ?', [email]);
      if (companies.length > 0) {
        const match = await bcrypt.compare(password, companies[0].password_hash);
        if (match) {
          const token = jwt.sign({ id: companies[0].company_id, company_id: companies[0].company_id, email: companies[0].email, role: 'Recruiter', name: companies[0].company_name }, JWT_SECRET, { expiresIn: '24h' });
          return res.json({ token, user: { id: companies[0].company_id, email: companies[0].email, role: 'Recruiter', name: companies[0].company_name, approved: companies[0].approved } });
        }
      }
    }

    res.status(401).json({ message: 'Invalid credentials. Please verify your email and password.' });
  } catch (err) {
    res.status(500).json({ message: 'Authentication error', error: err.message });
  }
});

// ==========================================
// 2. STORED PROCEDURE & APPLICATION WORKFLOW
// ==========================================

// GET /api/eligibility/student/:studentId/drive/:driveId
app.get('/api/eligibility/student/:studentId/drive/:driveId', async (req, res) => {
  try {
    const { studentId, driveId } = req.params;
    await pool.query('CALL checkStudentEligibility(?, ?, @is_eligible, @reason)', [studentId, driveId]);
    const [[result]] = await pool.query('SELECT @is_eligible AS is_eligible, @reason AS reason');
    res.json({
      is_eligible: Boolean(result.is_eligible),
      status: result.is_eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE',
      reason: result.reason
    });
  } catch (err) {
    res.status(500).json({ message: 'Eligibility verification procedure error', error: err.message });
  }
});

// POST /api/applications - Uses procedure applyForPlacementDrive or transactional flow
app.post('/api/applications', authenticateToken, authorizeRoles('Student', 'Admin'), async (req, res) => {
  try {
    const { drive_id, student_id } = req.body;
    const targetStudentId = req.user.role === 'Student' ? req.user.id : student_id;

    await pool.query('CALL applyForPlacementDrive(?, ?, @app_id, @status_msg)', [targetStudentId, drive_id]);
    const [[output]] = await pool.query('SELECT @app_id AS app_id, @status_msg AS status_msg');

    if (!output.app_id) {
      return res.status(400).json({ message: output.status_msg });
    }

    res.status(201).json({ message: output.status_msg, application_id: output.app_id });
  } catch (err) {
    res.status(500).json({ message: 'Application processing error', error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Backend] College Placement Management System API running on port ${PORT}`);
});
