import { Router, Response } from 'express';
import { memoryDb } from '../db';
import { authenticateToken, AuthRequest } from '../middleware/auth';

const router = Router();

// GET /api/students - List all students (with department names)
router.get('/', (req, res) => {
  const departmentId = req.query.department_id ? Number(req.query.department_id) : null;
  const minCgpa = req.query.min_cgpa ? Number(req.query.min_cgpa) : null;

  let list = memoryDb.students;
  if (departmentId) {
    list = list.filter(s => s.department_id === departmentId);
  }
  if (minCgpa !== null) {
    list = list.filter(s => s.cgpa >= minCgpa);
  }

  const enhanced = list.map(s => {
    const dept = memoryDb.departments.find(d => d.department_id === s.department_id);
    const skillsCount = memoryDb.studentSkills.filter(ss => ss.student_id === s.student_id).length;
    const appsCount = memoryDb.applications.filter(a => a.student_id === s.student_id).length;
    const { password_hash, ...safeStudent } = s;
    return {
      ...safeStudent,
      department_name: dept?.department_name || 'N/A',
      skills_count: skillsCount,
      applications_count: appsCount
    };
  });

  return res.json(enhanced);
});

// GET /api/students/:id
router.get('/:id', (req, res) => {
  const id = Number(req.params.id);
  const student = memoryDb.students.find(s => s.student_id === id);
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const dept = memoryDb.departments.find(d => d.department_id === student.department_id);
  const skills = memoryDb.studentSkills
    .filter(ss => ss.student_id === id)
    .map(ss => {
      const sk = memoryDb.skills.find(k => k.skill_id === ss.skill_id);
      return {
        skill_id: ss.skill_id,
        skill_name: sk?.skill_name || 'Unknown',
        proficiency: ss.proficiency
      };
    });

  const { password_hash, ...safeStudent } = student;
  return res.json({
    ...safeStudent,
    department_name: dept?.department_name || 'N/A',
    skills
  });
});

// PUT /api/students/:id - Update profile info (phone, resume, etc.)
// Security: student can update own profile, or Admin
router.put('/:id', authenticateToken, (req: AuthRequest, res: Response) => {
  const id = Number(req.params.id);
  if (req.user?.role === 'Student' && req.user.id !== id) {
    return res.status(403).json({ message: 'Forbidden: You can only edit your own profile.' });
  }

  const student = memoryDb.students.find(s => s.student_id === id);
  if (!student) {
    return res.status(404).json({ message: 'Student not found' });
  }

  const { phone, resume, cgpa, backlogs, tenth_percentage, twelfth_percentage } = req.body;

  if (phone) student.phone = phone.trim();
  if (resume !== undefined) student.resume = resume.trim();

  // If Admin is updating academic records
  if (req.user?.role === 'Admin') {
    if (cgpa !== undefined) student.cgpa = parseFloat(Number(cgpa).toFixed(2));
    if (backlogs !== undefined) student.backlogs = Number(backlogs);
    if (tenth_percentage !== undefined) student.tenth_percentage = parseFloat(Number(tenth_percentage).toFixed(2));
    if (twelfth_percentage !== undefined) student.twelfth_percentage = parseFloat(Number(twelfth_percentage).toFixed(2));
  }

  const { password_hash, ...safeStudent } = student;
  return res.json({ message: 'Profile updated successfully', student: safeStudent });
});

// --------------------------------------------------------------------
// Student Skills Endpoints
// --------------------------------------------------------------------

// GET /api/students/:id/skills
router.get('/:id/skills', (req, res) => {
  const id = Number(req.params.id);
  const records = memoryDb.studentSkills
    .filter(ss => ss.student_id === id)
    .map(ss => {
      const sk = memoryDb.skills.find(k => k.skill_id === ss.skill_id);
      return {
        student_id: ss.student_id,
        skill_id: ss.skill_id,
        skill_name: sk?.skill_name || 'Unknown',
        proficiency: ss.proficiency
      };
    });

  return res.json(records);
});

// POST /api/students/:id/skills - Add skill with proficiency
router.post('/:id/skills', authenticateToken, (req: AuthRequest, res: Response) => {
  const studentId = Number(req.params.id);
  if (req.user?.role === 'Student' && req.user.id !== studentId) {
    return res.status(403).json({ message: 'Forbidden: Cannot edit another student skills.' });
  }

  const { skill_id, skill_name, proficiency } = req.body;
  let targetSkillId = skill_id ? Number(skill_id) : null;

  // If skill_name provided instead of ID, find or create
  if (!targetSkillId && skill_name) {
    let sk = memoryDb.skills.find(k => k.skill_name.toLowerCase() === skill_name.trim().toLowerCase());
    if (!sk) {
      const nextId = memoryDb.skills.length > 0 ? Math.max(...memoryDb.skills.map(k => k.skill_id)) + 1 : 1;
      sk = { skill_id: nextId, skill_name: skill_name.trim() };
      memoryDb.skills.push(sk);
    }
    targetSkillId = sk.skill_id;
  }

  if (!targetSkillId) {
    return res.status(400).json({ message: 'Please provide a valid skill_id or skill_name.' });
  }

  const validProficiency = ['Beginner', 'Intermediate', 'Advanced'].includes(proficiency)
    ? proficiency
    : 'Intermediate';

  // Check if student already has this skill
  const existing = memoryDb.studentSkills.find(ss => ss.student_id === studentId && ss.skill_id === targetSkillId);
  if (existing) {
    existing.proficiency = validProficiency;
    return res.json({ message: 'Skill proficiency updated successfully', record: existing });
  }

  const newRecord = {
    student_id: studentId,
    skill_id: targetSkillId,
    proficiency: validProficiency as 'Beginner' | 'Intermediate' | 'Advanced'
  };

  memoryDb.studentSkills.push(newRecord);
  return res.status(201).json({ message: 'Skill added to student profile', record: newRecord });
});

// DELETE /api/students/:id/skills/:skillId - Remove skill from profile
router.delete('/:id/skills/:skillId', authenticateToken, (req: AuthRequest, res: Response) => {
  const studentId = Number(req.params.id);
  const skillId = Number(req.params.skillId);

  if (req.user?.role === 'Student' && req.user.id !== studentId) {
    return res.status(403).json({ message: 'Forbidden: Cannot delete skills for another student.' });
  }

  const initialLen = memoryDb.studentSkills.length;
  memoryDb.studentSkills = memoryDb.studentSkills.filter(ss => !(ss.student_id === studentId && ss.skill_id === skillId));

  if (memoryDb.studentSkills.length === initialLen) {
    return res.status(404).json({ message: 'Skill not associated with student.' });
  }

  return res.json({ message: 'Skill removed from student profile successfully.' });
});

export default router;
