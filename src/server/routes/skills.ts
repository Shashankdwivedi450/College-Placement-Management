import { Router } from 'express';
import { memoryDb } from '../db';
import { authenticateToken, authorizeRoles } from '../middleware/auth';

const router = Router();

// GET /api/skills - Return all skills in the master catalog
router.get('/', (req, res) => {
  return res.json(memoryDb.skills);
});

// POST /api/skills - Add a new master skill
router.post('/', authenticateToken, authorizeRoles('Admin', 'Recruiter'), (req, res) => {
  const { skill_name } = req.body;
  if (!skill_name || !skill_name.trim()) {
    return res.status(400).json({ message: 'Skill name is required' });
  }

  const cleanName = skill_name.trim();
  const existing = memoryDb.skills.find(s => s.skill_name.toLowerCase() === cleanName.toLowerCase());
  if (existing) {
    return res.json(existing);
  }

  const newId = memoryDb.skills.length > 0 ? Math.max(...memoryDb.skills.map(s => s.skill_id)) + 1 : 1;
  const newSkill = { skill_id: newId, skill_name: cleanName };
  memoryDb.skills.push(newSkill);

  return res.status(201).json(newSkill);
});

export default router;
