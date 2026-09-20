export type UserRole = 'Student' | 'Recruiter' | 'Admin';

export interface User {
  id: number;
  email: string;
  role: UserRole;
  name: string;
  student_id?: number;
  company_id?: number;
  admin_id?: number;
  cgpa?: number;
  backlogs?: number;
  graduation_year?: number;
  department_id?: number;
  department_name?: string;
  approved?: boolean;
}

export interface Department {
  department_id: number;
  department_name: string;
  students_count?: number;
}

export interface StudentSkill {
  student_id?: number;
  skill_id: number;
  skill_name: string;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface StudentProfile {
  student_id: number;
  name: string;
  email: string;
  phone: string;
  department_id: number;
  department_name?: string;
  graduation_year: number;
  cgpa: number;
  tenth_percentage: number;
  twelfth_percentage: number;
  backlogs: number;
  resume: string;
  skills?: StudentSkill[];
  applications_count?: number;
}

export interface Company {
  company_id: number;
  company_name: string;
  industry: string;
  location: string;
  website: string;
  email: string;
  approved: boolean;
  created_at: string;
  jobs_count?: number;
}

export interface Job {
  job_id: number;
  company_id: number;
  company_name?: string;
  company_industry?: string;
  company_location?: string;
  company_approved?: boolean;
  job_title: string;
  job_description: string;
  package: number;
  job_location: string;
  vacancies: number;
  created_at: string;
  has_drive?: boolean;
  drive_id?: number;
}

export interface EligibilityCriteria {
  criteria_id: number;
  drive_id: number;
  minimum_cgpa: number;
  maximum_backlogs: number;
  minimum_tenth_percentage: number;
  minimum_twelfth_percentage: number;
  graduation_year: number;
}

export interface PlacementDrive {
  drive_id: number;
  job_id: number;
  job_title?: string;
  package_lpa?: number;
  job_location?: string;
  vacancies?: number;
  company_id?: number;
  company_name?: string;
  company_industry?: string;
  company_location?: string;
  company_approved?: boolean;
  drive_date: string;
  application_deadline: string;
  status: 'Upcoming' | 'Open' | 'Closed' | 'Cancelled';
  created_at: string;
  criteria?: EligibilityCriteria | null;
  total_applicants?: number;
}

export interface Application {
  application_id: number;
  student_id: number;
  student_name?: string;
  student_email?: string;
  student_phone?: string;
  department_name?: string;
  cgpa?: number;
  backlogs?: number;
  graduation_year?: number;
  resume?: string;
  skills?: string[];
  drive_id: number;
  drive_date?: string;
  drive_status?: string;
  application_deadline?: string;
  job_title?: string;
  job_location?: string;
  package_lpa?: number;
  company_name?: string;
  company_location?: string;
  application_date: string;
  status: 'Applied' | 'Eligible' | 'Shortlisted' | 'Rejected' | 'Withdrawn';
}

export interface EligibilityResult {
  is_eligible: boolean;
  status: 'ELIGIBLE' | 'NOT ELIGIBLE';
  reason: string;
  details?: {
    student_cgpa: number;
    min_cgpa: number;
    student_backlogs: number;
    max_backlogs: number;
    student_tenth: number;
    min_tenth: number;
    student_twelfth: number;
    min_twelfth: number;
    student_year: number;
    req_year: number;
  };
}

export interface AdminStats {
  total_students: number;
  total_companies: number;
  approved_companies: number;
  pending_companies: number;
  total_jobs: number;
  total_drives: number;
  open_drives: number;
  total_applications: number;
  shortlisted_count: number;
  average_cgpa: number;
  department_distribution: Array<{
    department_id: number;
    department_name: string;
    student_count: number;
  }>;
}

export interface DbmsQueryItem {
  id: string;
  title: string;
  category: string;
  sql: string;
  description: string;
}
