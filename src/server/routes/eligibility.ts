import { Router, Request, Response } from 'express';
import { memoryDb } from '../db';

const router = Router();

// --------------------------------------------------------------------
// GET /api/eligibility/student/:studentId/drive/:driveId
// Direct invocation of the Stored Procedure checkStudentEligibility
// --------------------------------------------------------------------
router.get('/student/:studentId/drive/:driveId', (req: Request, res: Response) => {
  const studentId = Number(req.params.studentId);
  const driveId = Number(req.params.driveId);

  if (!studentId || !driveId) {
    return res.status(400).json({ message: 'Both studentId and driveId URL parameters are required.' });
  }

  const result = memoryDb.checkStudentEligibility(studentId, driveId);
  return res.json(result);
});

// --------------------------------------------------------------------
// GET /api/eligibility/view
// Represents MySQL eligible_students_view
// --------------------------------------------------------------------
router.get('/view', (req: Request, res: Response) => {
  const driveId = req.query.drive_id ? Number(req.query.drive_id) : undefined;
  const viewData = memoryDb.getEligibleStudentsView(driveId);
  return res.json({
    view_name: 'eligible_students_view',
    total_eligible_candidates: viewData.length,
    data: viewData
  });
});

export default router;
