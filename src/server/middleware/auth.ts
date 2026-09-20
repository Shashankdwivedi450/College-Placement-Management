import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'supersecret_college_placement_jwt_key_2025';

export interface AuthenticatedUser {
  id: number;
  email: string;
  role: 'Student' | 'Recruiter' | 'Admin';
  name: string;
  company_id?: number;
  student_id?: number;
  admin_id?: number;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

export function authenticateToken(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Access token required. Please sign in.' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET) as AuthenticatedUser;
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({ message: 'Invalid or expired session token.' });
  }
}

export function authorizeRoles(...allowedRoles: Array<'Student' | 'Recruiter' | 'Admin'>) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Forbidden: Access requires one of the following roles: [${allowedRoles.join(', ')}]. Your role is: ${req.user.role}`
      });
    }

    next();
  };
}
