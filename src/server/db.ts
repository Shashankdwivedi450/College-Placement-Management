import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

// Configuration from environment variables
const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_PORT = parseInt(process.env.DB_PORT || '3306', 10);
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'college_placement';

let mysqlPool: mysql.Pool | null = null;
let isUsingMySQL = false;

// Pre-hashed passwords for demo users
// Student@123 -> $2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6
// Recruiter@123 -> $2b$10$YYw.F/laOHLNg8KowbFxW.Ky38/Kz6QSdNcIfFf9Gg1sXiSPE3r5i
// Admin@123 -> $2b$10$03m.13oODkabnJTUP7erI.k/T1ImDZMqUZXIlh4P2W9J4O4a3MUaK
const STUDENT_HASH = '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6';
const RECRUITER_HASH = '$2b$10$YYw.F/laOHLNg8KowbFxW.Ky38/Kz6QSdNcIfFf9Gg1sXiSPE3r5i';
const ADMIN_HASH = '$2b$10$03m.13oODkabnJTUP7erI.k/T1ImDZMqUZXIlh4P2W9J4O4a3MUaK';

// Relational In-Memory Store mirroring MySQL schema for preview resilience
export interface Department {
  department_id: number;
  department_name: string;
}

export interface Student {
  student_id: number;
  name: string;
  email: string;
  phone: string;
  password_hash: string;
  department_id: number;
  graduation_year: number;
  cgpa: number;
  tenth_percentage: number;
  twelfth_percentage: number;
  backlogs: number;
  resume: string;
  created_at: string;
}

export interface Skill {
  skill_id: number;
  skill_name: string;
}

export interface StudentSkill {
  student_id: number;
  skill_id: number;
  proficiency: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface Company {
  company_id: number;
  company_name: string;
  industry: string;
  location: string;
  website: string;
  email: string;
  password_hash: string;
  approved: boolean;
  created_at: string;
}

export interface Job {
  job_id: number;
  company_id: number;
  job_title: string;
  job_description: string;
  package: number;
  job_location: string;
  vacancies: number;
  created_at: string;
}

export interface PlacementDrive {
  drive_id: number;
  job_id: number;
  drive_date: string;
  application_deadline: string;
  status: 'Upcoming' | 'Open' | 'Closed' | 'Cancelled';
  created_at: string;
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

export interface Application {
  application_id: number;
  student_id: number;
  drive_id: number;
  application_date: string;
  status: 'Applied' | 'Eligible' | 'Shortlisted' | 'Rejected' | 'Withdrawn';
}

export interface Admin {
  admin_id: number;
  name: string;
  email: string;
  password_hash: string;
}

class RelationalDatabaseStore {
  departments: Department[] = [
    { department_id: 1, department_name: 'Computer Science & Engineering' },
    { department_id: 2, department_name: 'Information Technology' },
    { department_id: 3, department_name: 'Electronics & Communication Engineering' },
    { department_id: 4, department_name: 'Electrical & Electronics Engineering' },
    { department_id: 5, department_name: 'Mechanical Engineering' }
  ];

  skills: Skill[] = [
    { skill_id: 1, skill_name: 'Python' },
    { skill_id: 2, skill_name: 'Java' },
    { skill_id: 3, skill_name: 'C++' },
    { skill_id: 4, skill_name: 'JavaScript' },
    { skill_id: 5, skill_name: 'TypeScript' },
    { skill_id: 6, skill_name: 'React.js' },
    { skill_id: 7, skill_name: 'Node.js' },
    { skill_id: 8, skill_name: 'Express.js' },
    { skill_id: 9, skill_name: 'MySQL' },
    { skill_id: 10, skill_name: 'PostgreSQL' },
    { skill_id: 11, skill_name: 'MongoDB' },
    { skill_id: 12, skill_name: 'Docker' },
    { skill_id: 13, skill_name: 'Kubernetes' },
    { skill_id: 14, skill_name: 'AWS Cloud' },
    { skill_id: 15, skill_name: 'Machine Learning' },
    { skill_id: 16, skill_name: 'Deep Learning' },
    { skill_id: 17, skill_name: 'Git & GitHub' },
    { skill_id: 18, skill_name: 'Spring Boot' },
    { skill_id: 19, skill_name: 'Data Structures & Algorithms' },
    { skill_id: 20, skill_name: 'System Design' }
  ];

  admins: Admin[] = [
    { admin_id: 1, name: 'Prof. Arvind Sharma', email: 'admin@college.com', password_hash: ADMIN_HASH },
    { admin_id: 2, name: 'Dr. Meenakshi Sundaram', email: 'placement.head@college.com', password_hash: ADMIN_HASH }
  ];

  companies: Company[] = [
    { company_id: 1, company_name: 'Google India', industry: 'Technology & Cloud', location: 'Bengaluru, Karnataka', website: 'https://careers.google.com', email: 'recruiter@example.com', password_hash: RECRUITER_HASH, approved: true, created_at: '2026-08-01 10:00:00' },
    { company_id: 2, company_name: 'Microsoft IDC', industry: 'Software & AI', location: 'Hyderabad, Telangana', website: 'https://careers.microsoft.com', email: 'microsoft@example.com', password_hash: RECRUITER_HASH, approved: true, created_at: '2026-08-02 10:00:00' },
    { company_id: 3, company_name: 'Amazon Dev Centre', industry: 'E-Commerce & Cloud', location: 'Bengaluru, Karnataka', website: 'https://amazon.jobs', email: 'amazon@example.com', password_hash: RECRUITER_HASH, approved: true, created_at: '2026-08-03 10:00:00' },
    { company_id: 4, company_name: 'Infosys Limited', industry: 'IT Services & Consulting', location: 'Pune, Maharashtra', website: 'https://www.infosys.com/careers', email: 'infosys@example.com', password_hash: RECRUITER_HASH, approved: true, created_at: '2026-08-04 10:00:00' },
    { company_id: 5, company_name: 'Tata Consultancy Services', industry: 'IT & Digital Solutions', location: 'Mumbai, Maharashtra', website: 'https://www.tcs.com/careers', email: 'tcs@example.com', password_hash: RECRUITER_HASH, approved: true, created_at: '2026-08-05 10:00:00' },
    { company_id: 6, company_name: 'Wipro Technologies', industry: 'IT Infrastructure', location: 'Bengaluru, Karnataka', website: 'https://careers.wipro.com', email: 'wipro@example.com', password_hash: RECRUITER_HASH, approved: true, created_at: '2026-08-06 10:00:00' },
    { company_id: 7, company_name: 'Oracle India', industry: 'Database & Enterprise Apps', location: 'Bengaluru, Karnataka', website: 'https://www.oracle.com/corporate/careers', email: 'oracle@example.com', password_hash: RECRUITER_HASH, approved: true, created_at: '2026-08-07 10:00:00' },
    { company_id: 8, company_name: 'Cisco Systems', industry: 'Networking & Security', location: 'Bengaluru, Karnataka', website: 'https://jobs.cisco.com', email: 'cisco@example.com', password_hash: RECRUITER_HASH, approved: true, created_at: '2026-08-08 10:00:00' },
    { company_id: 9, company_name: 'Deloitte USI', industry: 'Management & Tech Consulting', location: 'Hyderabad, Telangana', website: 'https://careers.deloitte.com', email: 'deloitte@example.com', password_hash: RECRUITER_HASH, approved: false, created_at: '2026-08-09 10:00:00' },
    { company_id: 10, company_name: 'Tata Elxsi', industry: 'Embedded & Automotive Software', location: 'Thiruvananthapuram, Kerala', website: 'https://www.tataelxsi.com/careers', email: 'tataelxsi@example.com', password_hash: RECRUITER_HASH, approved: false, created_at: '2026-08-10 10:00:00' }
  ];

  students: Student[] = [];
  studentSkills: StudentSkill[] = [];
  jobs: Job[] = [];
  drives: PlacementDrive[] = [];
  criteria: EligibilityCriteria[] = [];
  applications: Application[] = [];

  constructor() {
    this.seedStudents();
    this.seedJobsAndDrives();
    this.seedApplications();
  }

  private seedStudents() {
    const rawStudents = [
      { id: 1, name: 'Aarav Sharma', email: 'student@example.com', phone: '+91 9876543201', dept: 1, year: 2026, cgpa: 8.85, t: 92.5, tw: 89.0, b: 0, r: 'https://drive.google.com/aarav_sharma_resume.pdf' },
      { id: 2, name: 'Diya Patel', email: 'diya.patel@student.college.edu', phone: '+91 9876543202', dept: 1, year: 2026, cgpa: 9.40, t: 95.0, tw: 93.5, b: 0, r: 'https://drive.google.com/diya_patel_resume.pdf' },
      { id: 3, name: 'Rohan Verma', email: 'rohan.verma@student.college.edu', phone: '+91 9876543203', dept: 2, year: 2026, cgpa: 7.30, t: 82.0, tw: 78.0, b: 1, r: 'https://drive.google.com/rohan_verma_resume.pdf' },
      { id: 4, name: 'Ananya Iyer', email: 'ananya.iyer@student.college.edu', phone: '+91 9876543204', dept: 1, year: 2026, cgpa: 8.90, t: 91.0, tw: 90.0, b: 0, r: 'https://drive.google.com/ananya_iyer_resume.pdf' },
      { id: 5, name: 'Kabir Mehta', email: 'kabir.mehta@student.college.edu', phone: '+91 9876543205', dept: 3, year: 2026, cgpa: 7.90, t: 86.0, tw: 82.0, b: 0, r: 'https://drive.google.com/kabir_mehta_resume.pdf' },
      { id: 6, name: 'Pooja Nair', email: 'pooja.nair@student.college.edu', phone: '+91 9876543206', dept: 1, year: 2025, cgpa: 8.50, t: 88.0, tw: 85.0, b: 0, r: 'https://drive.google.com/pooja_nair_resume.pdf' },
      { id: 7, name: 'Siddharth Rao', email: 'siddharth.rao@student.college.edu', phone: '+91 9876543207', dept: 2, year: 2026, cgpa: 6.70, t: 75.0, tw: 71.0, b: 2, r: 'https://drive.google.com/siddharth_rao_resume.pdf' },
      { id: 8, name: 'Tanvi Kulkarni', email: 'tanvi.k@student.college.edu', phone: '+91 9876543208', dept: 1, year: 2026, cgpa: 9.15, t: 94.0, tw: 91.0, b: 0, r: 'https://drive.google.com/tanvi_k_resume.pdf' },
      { id: 9, name: 'Aditya Joshi', email: 'aditya.joshi@student.college.edu', phone: '+91 9876543209', dept: 3, year: 2026, cgpa: 8.20, t: 85.5, tw: 83.0, b: 0, r: 'https://drive.google.com/aditya_joshi_resume.pdf' },
      { id: 10, name: 'Ishita Gupta', email: 'ishita.gupta@student.college.edu', phone: '+91 9876543210', dept: 4, year: 2026, cgpa: 7.60, t: 80.0, tw: 79.0, b: 0, r: 'https://drive.google.com/ishita_gupta_resume.pdf' },
      { id: 11, name: 'Manish Reddy', email: 'manish.reddy@student.college.edu', phone: '+91 9876543211', dept: 1, year: 2026, cgpa: 8.45, t: 87.0, tw: 86.0, b: 0, r: 'https://drive.google.com/manish_reddy_resume.pdf' },
      { id: 12, name: 'Sneha Sen', email: 'sneha.sen@student.college.edu', phone: '+91 9876543212', dept: 2, year: 2026, cgpa: 8.70, t: 89.0, tw: 87.5, b: 0, r: 'https://drive.google.com/sneha_sen_resume.pdf' },
      { id: 13, name: 'Vikram Singhania', email: 'vikram.s@student.college.edu', phone: '+91 9876543213', dept: 5, year: 2026, cgpa: 7.20, t: 78.0, tw: 74.0, b: 1, r: 'https://drive.google.com/vikram_s_resume.pdf' },
      { id: 14, name: 'Rhea Deshmukh', email: 'rhea.d@student.college.edu', phone: '+91 9876543214', dept: 1, year: 2026, cgpa: 9.60, t: 97.0, tw: 95.0, b: 0, r: 'https://drive.google.com/rhea_d_resume.pdf' },
      { id: 15, name: 'Gaurav Bhatia', email: 'gaurav.b@student.college.edu', phone: '+91 9876543215', dept: 2, year: 2026, cgpa: 7.85, t: 84.0, tw: 81.0, b: 0, r: 'https://drive.google.com/gaurav_b_resume.pdf' },
      { id: 16, name: 'Meera Menon', email: 'meera.menon@student.college.edu', phone: '+91 9876543216', dept: 3, year: 2026, cgpa: 8.10, t: 86.0, tw: 84.0, b: 0, r: 'https://drive.google.com/meera_menon_resume.pdf' },
      { id: 17, name: 'Nikhil Choudhary', email: 'nikhil.c@student.college.edu', phone: '+91 9876543217', dept: 4, year: 2026, cgpa: 6.90, t: 76.0, tw: 72.0, b: 1, r: 'https://drive.google.com/nikhil_c_resume.pdf' },
      { id: 18, name: 'Kavya Pillai', email: 'kavya.pillai@student.college.edu', phone: '+91 9876543218', dept: 1, year: 2026, cgpa: 9.05, t: 93.0, tw: 92.0, b: 0, r: 'https://drive.google.com/kavya_pillai_resume.pdf' },
      { id: 19, name: 'Pranav Nambiar', email: 'pranav.n@student.college.edu', phone: '+91 9876543219', dept: 5, year: 2026, cgpa: 8.00, t: 83.0, tw: 80.0, b: 0, r: 'https://drive.google.com/pranav_n_resume.pdf' },
      { id: 20, name: 'Shreya Das', email: 'shreya.das@student.college.edu', phone: '+91 9876543220', dept: 2, year: 2026, cgpa: 8.35, t: 87.5, tw: 85.0, b: 0, r: 'https://drive.google.com/shreya_das_resume.pdf' },
      { id: 21, name: 'Arjun Kapoor', email: 'arjun.k@student.college.edu', phone: '+91 9876543221', dept: 1, year: 2027, cgpa: 8.60, t: 90.0, tw: 88.0, b: 0, r: 'https://drive.google.com/arjun_k_resume.pdf' },
      { id: 22, name: 'Bhavna Bose', email: 'bhavna.bose@student.college.edu', phone: '+91 9876543222', dept: 2, year: 2027, cgpa: 7.50, t: 81.0, tw: 77.0, b: 0, r: 'https://drive.google.com/bhavna_bose_resume.pdf' },
      { id: 23, name: 'Chirag Sethi', email: 'chirag.sethi@student.college.edu', phone: '+91 9876543223', dept: 3, year: 2026, cgpa: 8.75, t: 91.0, tw: 89.0, b: 0, r: 'https://drive.google.com/chirag_sethi_resume.pdf' },
      { id: 24, name: 'Deepika Mathur', email: 'deepika.m@student.college.edu', phone: '+91 9876543224', dept: 1, year: 2026, cgpa: 9.20, t: 94.5, tw: 92.5, b: 0, r: 'https://drive.google.com/deepika_m_resume.pdf' },
      { id: 25, name: 'Eshaan Roy', email: 'eshaan.roy@student.college.edu', phone: '+91 9876543225', dept: 5, year: 2026, cgpa: 6.50, t: 72.0, tw: 70.0, b: 3, r: 'https://drive.google.com/eshaan_roy_resume.pdf' },
      { id: 26, name: 'Farhan Khan', email: 'farhan.khan@student.college.edu', phone: '+91 9876543226', dept: 2, year: 2026, cgpa: 8.55, t: 89.0, tw: 86.5, b: 0, r: 'https://drive.google.com/farhan_khan_resume.pdf' },
      { id: 27, name: 'Gayatri Somani', email: 'gayatri.s@student.college.edu', phone: '+91 9876543227', dept: 1, year: 2026, cgpa: 8.95, t: 93.0, tw: 90.0, b: 0, r: 'https://drive.google.com/gayatri_s_resume.pdf' },
      { id: 28, name: 'Harsh Vardhan', email: 'harsh.v@student.college.edu', phone: '+91 9876543228', dept: 3, year: 2026, cgpa: 7.10, t: 79.0, tw: 76.0, b: 1, r: 'https://drive.google.com/harsh_v_resume.pdf' },
      { id: 29, name: 'Ira Trivedi', email: 'ira.trivedi@student.college.edu', phone: '+91 9876543229', dept: 1, year: 2026, cgpa: 9.35, t: 96.0, tw: 94.0, b: 0, r: 'https://drive.google.com/ira_trivedi_resume.pdf' },
      { id: 30, name: 'Jatin Saxena', email: 'jatin.saxena@student.college.edu', phone: '+91 9876543230', dept: 4, year: 2026, cgpa: 8.30, t: 86.0, tw: 83.5, b: 0, r: 'https://drive.google.com/jatin_saxena_resume.pdf' },
      { id: 31, name: 'Kritika Roy', email: 'kritika.roy@student.college.edu', phone: '+91 9876543231', dept: 2, year: 2026, cgpa: 7.95, t: 83.0, tw: 81.5, b: 0, r: 'https://drive.google.com/kritika_roy_resume.pdf' },
      { id: 32, name: 'Lokesh Agarwal', email: 'lokesh.a@student.college.edu', phone: '+91 9876543232', dept: 1, year: 2026, cgpa: 8.15, t: 85.0, tw: 82.0, b: 0, r: 'https://drive.google.com/lokesh_a_resume.pdf' },
      { id: 33, name: 'Mallika Sen', email: 'mallika.sen@student.college.edu', phone: '+91 9876543233', dept: 5, year: 2026, cgpa: 7.70, t: 82.5, tw: 79.0, b: 0, r: 'https://drive.google.com/mallika_sen_resume.pdf' },
      { id: 34, name: 'Naveen Kumar', email: 'naveen.k@student.college.edu', phone: '+91 9876543234', dept: 1, year: 2026, cgpa: 8.80, t: 91.5, tw: 88.0, b: 0, r: 'https://drive.google.com/naveen_k_resume.pdf' },
      { id: 35, name: 'Ojasvi Singhal', email: 'ojasvi.s@student.college.edu', phone: '+91 9876543235', dept: 3, year: 2026, cgpa: 8.40, t: 87.0, tw: 85.0, b: 0, r: 'https://drive.google.com/ojasvi_s_resume.pdf' },
      { id: 36, name: 'Prashant Mishra', email: 'prashant.m@student.college.edu', phone: '+91 9876543236', dept: 4, year: 2026, cgpa: 7.45, t: 80.5, tw: 77.0, b: 1, r: 'https://drive.google.com/prashant_m_resume.pdf' },
      { id: 37, name: 'Quasar Ali', email: 'quasar.ali@student.college.edu', phone: '+91 9876543237', dept: 1, year: 2026, cgpa: 8.65, t: 88.5, tw: 86.0, b: 0, r: 'https://drive.google.com/quasar_ali_resume.pdf' },
      { id: 38, name: 'Rashi Khandelwal', email: 'rashi.k@student.college.edu', phone: '+91 9876543238', dept: 2, year: 2026, cgpa: 9.10, t: 93.5, tw: 91.0, b: 0, r: 'https://drive.google.com/rashi_k_resume.pdf' },
      { id: 39, name: 'Sankalp Jain', email: 'sankalp.j@student.college.edu', phone: '+91 9876543239', dept: 3, year: 2026, cgpa: 7.80, t: 83.0, tw: 80.0, b: 0, r: 'https://drive.google.com/sankalp_j_resume.pdf' },
      { id: 40, name: 'Tarun Teja', email: 'tarun.teja@student.college.edu', phone: '+91 9876543240', dept: 1, year: 2026, cgpa: 9.50, t: 96.5, tw: 94.0, b: 0, r: 'https://drive.google.com/tarun_teja_resume.pdf' },
      { id: 41, name: 'Upasana Ghosh', email: 'upasana.g@student.college.edu', phone: '+91 9876543241', dept: 2, year: 2026, cgpa: 8.25, t: 86.0, tw: 83.0, b: 0, r: 'https://drive.google.com/upasana_g_resume.pdf' },
      { id: 42, name: 'Varun Chopra', email: 'varun.chopra@student.college.edu', phone: '+91 9876543242', dept: 5, year: 2026, cgpa: 6.80, t: 74.0, tw: 71.0, b: 2, r: 'https://drive.google.com/varun_chopra_resume.pdf' },
      { id: 43, name: 'Waseem Akram', email: 'waseem.a@student.college.edu', phone: '+91 9876543243', dept: 1, year: 2026, cgpa: 8.70, t: 89.0, tw: 87.0, b: 0, r: 'https://drive.google.com/waseem_a_resume.pdf' },
      { id: 44, name: 'Xavier Fernandes', email: 'xavier.f@student.college.edu', phone: '+91 9876543244', dept: 4, year: 2026, cgpa: 7.35, t: 81.0, tw: 78.0, b: 0, r: 'https://drive.google.com/xavier_f_resume.pdf' },
      { id: 45, name: 'Yamini Rathore', email: 'yamini.r@student.college.edu', phone: '+91 9876543245', dept: 2, year: 2026, cgpa: 9.00, t: 92.0, tw: 90.0, b: 0, r: 'https://drive.google.com/yamini_r_resume.pdf' },
      { id: 46, name: 'Zaid Mansoori', email: 'zaid.m@student.college.edu', phone: '+91 9876543246', dept: 3, year: 2026, cgpa: 8.05, t: 85.0, tw: 82.5, b: 0, r: 'https://drive.google.com/zaid_m_resume.pdf' },
      { id: 47, name: 'Abhinav Shukla', email: 'abhinav.s@student.college.edu', phone: '+91 9876543247', dept: 1, year: 2026, cgpa: 8.50, t: 88.0, tw: 85.0, b: 0, r: 'https://drive.google.com/abhinav_s_resume.pdf' },
      { id: 48, name: 'Bhavika Som', email: 'bhavika.s@student.college.edu', phone: '+91 9876543248', dept: 2, year: 2026, cgpa: 8.30, t: 87.0, tw: 84.0, b: 0, r: 'https://drive.google.com/bhavika_s_resume.pdf' },
      { id: 49, name: 'Chetan Bhagat', email: 'chetan.b@student.college.edu', phone: '+91 9876543249', dept: 5, year: 2026, cgpa: 7.15, t: 78.0, tw: 75.0, b: 1, r: 'https://drive.google.com/chetan_b_resume.pdf' },
      { id: 50, name: 'Divyansh Mittal', email: 'divyansh.m@student.college.edu', phone: '+91 9876543250', dept: 1, year: 2026, cgpa: 9.75, t: 98.0, tw: 96.0, b: 0, r: 'https://drive.google.com/divyansh_m_resume.pdf' }
    ];

    this.students = rawStudents.map(s => ({
      student_id: s.id,
      name: s.name,
      email: s.email,
      phone: s.phone,
      password_hash: STUDENT_HASH,
      department_id: s.dept,
      graduation_year: s.year,
      cgpa: s.cgpa,
      tenth_percentage: s.t,
      twelfth_percentage: s.tw,
      backlogs: s.b,
      resume: s.r,
      created_at: '2026-08-15 09:00:00'
    }));

    // Seed student skills
    this.studentSkills = [
      { student_id: 1, skill_id: 1, proficiency: 'Advanced' },
      { student_id: 1, skill_id: 4, proficiency: 'Advanced' },
      { student_id: 1, skill_id: 6, proficiency: 'Advanced' },
      { student_id: 1, skill_id: 7, proficiency: 'Intermediate' },
      { student_id: 1, skill_id: 9, proficiency: 'Advanced' },
      { student_id: 2, skill_id: 2, proficiency: 'Advanced' },
      { student_id: 2, skill_id: 3, proficiency: 'Advanced' },
      { student_id: 2, skill_id: 19, proficiency: 'Advanced' },
      { student_id: 2, skill_id: 20, proficiency: 'Advanced' },
      { student_id: 2, skill_id: 10, proficiency: 'Intermediate' }
    ];

    for (let sid = 3; sid <= 50; sid++) {
      const sk1 = ((sid % 18) + 1);
      const sk2 = (((sid + 5) % 18) + 1);
      this.studentSkills.push({ student_id: sid, skill_id: sk1, proficiency: 'Intermediate' });
      if (sk1 !== sk2) {
        this.studentSkills.push({ student_id: sid, skill_id: sk2, proficiency: 'Advanced' });
      }
    }
  }

  private seedJobsAndDrives() {
    const rawJobs = [
      { id: 1, c: 1, title: 'Software Engineer (L3)', desc: 'Work on large-scale distributed systems, web architectures, and cloud microservices.', pkg: 32.5, loc: 'Bengaluru', vac: 8 },
      { id: 2, c: 1, title: 'Associate Cloud Consultant', desc: 'Design scalable cloud migration strategies and architectures on Google Cloud Platform.', pkg: 24.0, loc: 'Hyderabad', vac: 5 },
      { id: 3, c: 2, title: 'Software Development Engineer I', desc: 'Develop cutting-edge features for Azure Cloud, Microsoft 365, and AI Copilot services.', pkg: 28.0, loc: 'Hyderabad', vac: 12 },
      { id: 4, c: 2, title: 'Support Engineering Lead', desc: 'Enterprise tier-3 diagnostic and architectural engineering for cloud workloads.', pkg: 16.5, loc: 'Bengaluru', vac: 6 },
      { id: 5, c: 3, title: 'SDE-1 (Full Stack & Systems)', desc: 'Drive low-latency transaction engines, e-commerce catalog pipelines, and AWS SDKs.', pkg: 26.5, loc: 'Bengaluru', vac: 15 },
      { id: 6, c: 3, title: 'Data Analyst / BI Engineer', desc: 'Synthesize high-volume consumer behavioral pipelines using SQL, Redshift, and Python.', pkg: 18.0, loc: 'Chennai', vac: 8 },
      { id: 7, c: 4, title: 'Specialist Programmer (Power Programmer)', desc: 'High-end algorithmic engineering, system programming, and modern full-stack development.', pkg: 9.5, loc: 'Pune', vac: 25 },
      { id: 8, c: 4, title: 'Digital Specialist Engineer', desc: 'Full-stack enterprise application engineering using React, Node.js, and Cloud services.', pkg: 6.5, loc: 'Bengaluru', vac: 50 },
      { id: 9, c: 5, title: 'Ninja Software Engineer', desc: 'Advanced cognitive systems development, machine learning automation, and web platforms.', pkg: 7.0, loc: 'Mumbai', vac: 40 },
      { id: 10, c: 5, title: 'Digital Innovator Engineer', desc: 'Architecture research, blockchain, enterprise ERP, and cloud computing solutions.', pkg: 11.5, loc: 'Pune', vac: 15 },
      { id: 11, c: 6, title: 'Project Engineer (Elite)', desc: 'Develop and maintain enterprise software, QA automation pipelines, and core microservices.', pkg: 6.5, loc: 'Bengaluru', vac: 30 },
      { id: 12, c: 7, title: 'Server Technology Associate', desc: 'Build core relational database engines, high-availability clusters, and Java backend services.', pkg: 19.5, loc: 'Bengaluru', vac: 10 },
      { id: 13, c: 7, title: 'Cloud Infrastructure Engineer', desc: 'Automation, Linux kernel tuning, and network virtualization on Oracle Cloud Infrastructure.', pkg: 17.0, loc: 'Hyderabad', vac: 8 },
      { id: 14, c: 8, title: 'Software Engineer (Networking & Security)', desc: 'Next-generation networking software, router OS kernels, cybersecurity, and cloud telemetry.', pkg: 22.0, loc: 'Bengaluru', vac: 10 },
      { id: 15, c: 8, title: 'Consulting Systems Engineer', desc: 'Technical consulting, system design, and customer solution deployment for enterprise clients.', pkg: 15.0, loc: 'Bengaluru', vac: 5 }
    ];

    this.jobs = rawJobs.map(j => ({
      job_id: j.id,
      company_id: j.c,
      job_title: j.title,
      job_description: j.desc,
      package: j.pkg,
      job_location: j.loc,
      vacancies: j.vac,
      created_at: '2026-08-20 10:00:00'
    }));

    const rawDrives = [
      { id: 1, j: 1, date: '2026-10-15', dl: '2026-10-05', st: 'Open' as const },
      { id: 2, j: 2, date: '2026-10-20', dl: '2026-10-10', st: 'Open' as const },
      { id: 3, j: 3, date: '2026-10-25', dl: '2026-10-12', st: 'Open' as const },
      { id: 4, j: 4, date: '2026-11-01', dl: '2026-10-20', st: 'Upcoming' as const },
      { id: 5, j: 5, date: '2026-10-18', dl: '2026-10-08', st: 'Open' as const },
      { id: 6, j: 6, date: '2026-11-05', dl: '2026-10-22', st: 'Upcoming' as const },
      { id: 7, j: 7, date: '2026-10-12', dl: '2026-10-02', st: 'Open' as const },
      { id: 8, j: 8, date: '2026-10-14', dl: '2026-10-04', st: 'Open' as const },
      { id: 9, j: 9, date: '2026-10-16', dl: '2026-10-06', st: 'Open' as const },
      { id: 10, j: 10, date: '2026-11-10', dl: '2026-10-25', st: 'Upcoming' as const },
      { id: 11, j: 11, date: '2026-09-01', dl: '2026-08-20', st: 'Closed' as const },
      { id: 12, j: 12, date: '2026-10-28', dl: '2026-10-15', st: 'Open' as const },
      { id: 13, j: 13, date: '2026-11-15', dl: '2026-10-30', st: 'Upcoming' as const },
      { id: 14, j: 14, date: '2026-10-30', dl: '2026-10-18', st: 'Open' as const },
      { id: 15, j: 15, date: '2026-08-15', dl: '2026-08-01', st: 'Closed' as const }
    ];

    this.drives = rawDrives.map(d => ({
      drive_id: d.id,
      job_id: d.j,
      drive_date: d.date,
      application_deadline: d.dl,
      status: d.st,
      created_at: '2026-08-25 10:00:00'
    }));

    const rawCriteria = [
      { id: 1, d: 1, cgpa: 8.50, b: 0, t: 85.0, tw: 85.0, y: 2026 },
      { id: 2, d: 2, cgpa: 8.00, b: 0, t: 80.0, tw: 80.0, y: 2026 },
      { id: 3, d: 3, cgpa: 8.50, b: 0, t: 85.0, tw: 85.0, y: 2026 },
      { id: 4, d: 4, cgpa: 7.50, b: 1, t: 75.0, tw: 75.0, y: 2026 },
      { id: 5, d: 5, cgpa: 8.00, b: 0, t: 80.0, tw: 80.0, y: 2026 },
      { id: 6, d: 6, cgpa: 7.50, b: 0, t: 75.0, tw: 75.0, y: 2026 },
      { id: 7, d: 7, cgpa: 7.50, b: 0, t: 75.0, tw: 75.0, y: 2026 },
      { id: 8, d: 8, cgpa: 6.50, b: 1, t: 65.0, tw: 65.0, y: 2026 },
      { id: 9, d: 9, cgpa: 6.50, b: 1, t: 60.0, tw: 60.0, y: 2026 },
      { id: 10, d: 10, cgpa: 8.00, b: 0, t: 80.0, tw: 80.0, y: 2026 },
      { id: 11, d: 11, cgpa: 6.50, b: 2, t: 60.0, tw: 60.0, y: 2026 },
      { id: 12, d: 12, cgpa: 8.00, b: 0, t: 80.0, tw: 80.0, y: 2026 },
      { id: 13, d: 13, cgpa: 7.80, b: 0, t: 75.0, tw: 75.0, y: 2026 },
      { id: 14, d: 14, cgpa: 8.00, b: 0, t: 80.0, tw: 80.0, y: 2026 },
      { id: 15, d: 15, cgpa: 7.00, b: 1, t: 70.0, tw: 70.0, y: 2025 }
    ];

    this.criteria = rawCriteria.map(c => ({
      criteria_id: c.id,
      drive_id: c.d,
      minimum_cgpa: c.cgpa,
      maximum_backlogs: c.b,
      minimum_tenth_percentage: c.t,
      minimum_twelfth_percentage: c.tw,
      graduation_year: c.y
    }));
  }

  private seedApplications() {
    let appCount = 1;
    // Drive 1: Google SDE
    const d1Students = [1, 2, 4, 8, 14, 18, 24, 27, 29, 34, 37, 38, 40, 43, 45, 50];
    d1Students.forEach(sid => {
      const status = [2, 8, 14, 24, 40, 50].includes(sid) ? 'Shortlisted' : 'Eligible';
      this.applications.push({
        application_id: appCount++,
        student_id: sid,
        drive_id: 1,
        application_date: '2026-09-15 10:30:00',
        status
      });
    });

    // Drive 2: Google Cloud
    const d2Students = [1, 9, 11, 12, 16, 19, 20, 23, 26, 30, 32, 35, 41, 46, 47, 48];
    d2Students.forEach(sid => {
      const status = [12, 20].includes(sid) ? 'Shortlisted' : 'Eligible';
      this.applications.push({
        application_id: appCount++,
        student_id: sid,
        drive_id: 2,
        application_date: '2026-09-16 12:00:00',
        status
      });
    });

    // Drive 3: Microsoft SDE
    const d3Students = [1, 2, 4, 8, 14, 18, 24, 27, 29, 34, 38, 40, 43, 45, 50];
    d3Students.forEach(sid => {
      const status = [2, 8, 14, 24, 29, 40, 50].includes(sid) ? 'Shortlisted' : 'Applied';
      this.applications.push({
        application_id: appCount++,
        student_id: sid,
        drive_id: 3,
        application_date: '2026-09-17 10:00:00',
        status
      });
    });

    // Drive 5: Amazon SDE
    const d5Students = [1, 2, 5, 8, 9, 11, 12, 14, 16, 19, 20, 23, 24, 26, 27, 30, 32, 34, 35, 37, 38, 40, 41, 46, 47, 50];
    d5Students.forEach(sid => {
      const status = sid === 5 ? 'Rejected' : [2, 14, 24, 40, 50].includes(sid) ? 'Shortlisted' : 'Eligible';
      this.applications.push({
        application_id: appCount++,
        student_id: sid,
        drive_id: 5,
        application_date: '2026-09-18 11:00:00',
        status
      });
    });

    // Drive 7: Infosys Specialist Programmer
    const d7Students = [3, 5, 10, 15, 31, 33, 39];
    d7Students.forEach(sid => {
      this.applications.push({
        application_id: appCount++,
        student_id: sid,
        drive_id: 7,
        application_date: '2026-09-18 10:00:00',
        status: sid === 3 ? 'Rejected' : 'Eligible'
      });
    });

    // Drive 8: Infosys Digital Specialist
    const d8Students = [3, 7, 13, 17, 28, 36, 42, 44, 49];
    d8Students.forEach(sid => {
      this.applications.push({
        application_id: appCount++,
        student_id: sid,
        drive_id: 8,
        application_date: '2026-09-19 11:00:00',
        status: [7, 42].includes(sid) ? 'Rejected' : 'Eligible'
      });
    });

    // Drive 9: TCS Ninja
    const d9Students = [3, 7, 10, 13, 15, 17, 25, 28, 36, 42, 49];
    d9Students.forEach(sid => {
      this.applications.push({
        application_id: appCount++,
        student_id: sid,
        drive_id: 9,
        application_date: '2026-09-20 11:00:00',
        status: [7, 25, 42].includes(sid) ? 'Rejected' : 'Applied'
      });
    });

    // Drive 12: Oracle Server Technology
    const d12Students = [1, 2, 8, 14, 50];
    d12Students.forEach(sid => {
      this.applications.push({
        application_id: appCount++,
        student_id: sid,
        drive_id: 12,
        application_date: '2026-09-22 10:00:00',
        status: [2, 14, 50].includes(sid) ? 'Shortlisted' : 'Applied'
      });
    });
  }

  // ------------------------------------------------------------------
  // AUTOMATIC ELIGIBILITY ENGINE: checkStudentEligibility(student_id, drive_id)
  // Exact simulation of the MySQL Stored Procedure
  // ------------------------------------------------------------------
  checkStudentEligibility(studentId: number, driveId: number): {
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
  } {
    const student = this.students.find(s => s.student_id === studentId);
    if (!student) {
      return {
        is_eligible: false,
        status: 'NOT ELIGIBLE',
        reason: 'Student record does not exist in system.'
      };
    }

    const drive = this.drives.find(d => d.drive_id === driveId);
    const criteria = this.criteria.find(c => c.drive_id === driveId);

    if (!drive || !criteria) {
      return {
        is_eligible: false,
        status: 'NOT ELIGIBLE',
        reason: 'Placement drive or eligibility criteria not defined for this drive.'
      };
    }

    const details = {
      student_cgpa: student.cgpa,
      min_cgpa: criteria.minimum_cgpa,
      student_backlogs: student.backlogs,
      max_backlogs: criteria.maximum_backlogs,
      student_tenth: student.tenth_percentage,
      min_tenth: criteria.minimum_tenth_percentage,
      student_twelfth: student.twelfth_percentage,
      min_twelfth: criteria.minimum_twelfth_percentage,
      student_year: student.graduation_year,
      req_year: criteria.graduation_year
    };

    // Check CGPA
    if (student.cgpa < criteria.minimum_cgpa) {
      return {
        is_eligible: false,
        status: 'NOT ELIGIBLE',
        reason: `CGPA requirement not satisfied. Required CGPA: ${criteria.minimum_cgpa.toFixed(2)}, Student CGPA: ${student.cgpa.toFixed(2)}`,
        details
      };
    }

    // Check Backlogs
    if (student.backlogs > criteria.maximum_backlogs) {
      return {
        is_eligible: false,
        status: 'NOT ELIGIBLE',
        reason: `Backlogs requirement not satisfied. Max allowed: ${criteria.maximum_backlogs}, Student backlogs: ${student.backlogs}`,
        details
      };
    }

    // Check 10th percentage
    if (student.tenth_percentage < criteria.minimum_tenth_percentage) {
      return {
        is_eligible: false,
        status: 'NOT ELIGIBLE',
        reason: `10th grade percentage requirement not satisfied. Required: ${criteria.minimum_tenth_percentage}%, Student: ${student.tenth_percentage}%`,
        details
      };
    }

    // Check 12th percentage
    if (student.twelfth_percentage < criteria.minimum_twelfth_percentage) {
      return {
        is_eligible: false,
        status: 'NOT ELIGIBLE',
        reason: `12th grade percentage requirement not satisfied. Required: ${criteria.minimum_twelfth_percentage}%, Student: ${student.twelfth_percentage}%`,
        details
      };
    }

    // Check Graduation Year
    if (student.graduation_year !== criteria.graduation_year) {
      return {
        is_eligible: false,
        status: 'NOT ELIGIBLE',
        reason: `Graduation year mismatch. Eligible batch: ${criteria.graduation_year}, Student batch: ${student.graduation_year}`,
        details
      };
    }

    return {
      is_eligible: true,
      status: 'ELIGIBLE',
      reason: 'Candidate satisfies all academic cutoffs, backlog restrictions, and target batch requirements.',
      details
    };
  }

  // ------------------------------------------------------------------
  // APPLICATION WORKFLOW WITH TRANSACTION & TRIGGER CHECKS
  // ------------------------------------------------------------------
  submitApplication(studentId: number, driveId: number): {
    success: boolean;
    application_id?: number;
    message: string;
    error_code?: number;
  } {
    // 1. Verify student exists
    const student = this.students.find(s => s.student_id === studentId);
    if (!student) {
      return { success: false, message: 'Student record not found', error_code: 404 };
    }

    // 2. Verify placement drive exists
    const drive = this.drives.find(d => d.drive_id === driveId);
    if (!drive) {
      return { success: false, message: 'Placement drive not found', error_code: 404 };
    }

    // 3. Trigger check: Drive status must be Open
    if (drive.status !== 'Open') {
      return {
        success: false,
        message: `Trigger Exception: Applications can only be accepted when placement drive is "Open" (Current status: ${drive.status}).`,
        error_code: 400
      };
    }

    // 4. Trigger check: Deadline has not passed
    const nowStr = new Date().toISOString().split('T')[0];
    if (nowStr > drive.application_deadline) {
      return {
        success: false,
        message: `Trigger Exception: Application deadline (${drive.application_deadline}) has passed.`,
        error_code: 400
      };
    }

    // Trigger check: Sponsoring company must be approved
    const job = this.jobs.find(j => j.job_id === drive.job_id);
    const company = job ? this.companies.find(c => c.company_id === job.company_id) : null;
    if (!company || !company.approved) {
      return {
        success: false,
        message: 'Trigger Exception: Cannot apply to a drive hosted by an unapproved company.',
        error_code: 400
      };
    }

    // 5. Check duplicate application (Schema UNIQUE constraint)
    const existing = this.applications.find(a => a.student_id === studentId && a.drive_id === driveId);
    if (existing) {
      return {
        success: false,
        message: 'Duplicate Application: You have already submitted an application for this drive.',
        error_code: 409
      };
    }

    // 6. Check automatic eligibility via stored procedure
    const eligibility = this.checkStudentEligibility(studentId, driveId);
    if (!eligibility.is_eligible) {
      return {
        success: false,
        message: `Eligibility Validation Failed: ${eligibility.reason}`,
        error_code: 403
      };
    }

    // 7. Transaction: Insert Application
    const newId = this.applications.length > 0
      ? Math.max(...this.applications.map(a => a.application_id)) + 1
      : 1;

    const newApp: Application = {
      application_id: newId,
      student_id: studentId,
      drive_id: driveId,
      application_date: new Date().toISOString().replace('T', ' ').substring(0, 19),
      status: 'Applied'
    };

    this.applications.push(newApp);

    return {
      success: true,
      application_id: newId,
      message: 'Application submitted successfully. Candidate verified and registered.'
    };
  }

  // ------------------------------------------------------------------
  // ELIGIBLE_STUDENTS_VIEW Real-Time Computation
  // ------------------------------------------------------------------
  getEligibleStudentsView(driveId?: number) {
    const results: any[] = [];
    const targetDrives = driveId ? this.drives.filter(d => d.drive_id === driveId) : this.drives;

    for (const drive of targetDrives) {
      const crit = this.criteria.find(c => c.drive_id === drive.drive_id);
      const job = this.jobs.find(j => j.job_id === drive.job_id);
      const company = job ? this.companies.find(c => c.company_id === job.company_id) : null;

      if (!crit || !job || !company) continue;

      for (const s of this.students) {
        if (
          s.cgpa >= crit.minimum_cgpa &&
          s.backlogs <= crit.maximum_backlogs &&
          s.tenth_percentage >= crit.minimum_tenth_percentage &&
          s.twelfth_percentage >= crit.minimum_twelfth_percentage &&
          s.graduation_year === crit.graduation_year
        ) {
          const dept = this.departments.find(d => d.department_id === s.department_id);
          results.push({
            student_id: s.student_id,
            student_name: s.name,
            student_email: s.email,
            student_phone: s.phone,
            department_name: dept?.department_name || 'N/A',
            cgpa: s.cgpa,
            tenth_percentage: s.tenth_percentage,
            twelfth_percentage: s.twelfth_percentage,
            backlogs: s.backlogs,
            graduation_year: s.graduation_year,
            drive_id: drive.drive_id,
            drive_date: drive.drive_date,
            application_deadline: drive.application_deadline,
            drive_status: drive.status,
            job_id: job.job_id,
            job_title: job.job_title,
            package_lpa: job.package,
            company_name: company.company_name,
            minimum_cgpa: crit.minimum_cgpa,
            maximum_backlogs: crit.maximum_backlogs
          });
        }
      }
    }
    return results;
  }
}

// Singleton in-memory database instance
export const memoryDb = new RelationalDatabaseStore();

// Attempt connection to live MySQL if configured
export async function initializeDatabase() {
  if (process.env.DB_HOST && process.env.DB_USER && process.env.DB_PASSWORD) {
    try {
      mysqlPool = mysql.createPool({
        host: DB_HOST,
        port: DB_PORT,
        user: DB_USER,
        password: DB_PASSWORD,
        database: DB_NAME,
        waitForConnections: true,
        connectionLimit: 10,
        queueLimit: 0
      });

      // Ping to verify connection
      await mysqlPool.query('SELECT 1');
      isUsingMySQL = true;
      console.log(`[DBMS Engine] Successfully connected to MySQL server at ${DB_HOST}:${DB_PORT}/${DB_NAME}`);
    } catch (err: any) {
      console.warn(`[DBMS Engine] MySQL server connection failed (${err.message}). Defaulting to in-memory Relational DBMS engine loaded with sample_data.sql`);
      mysqlPool = null;
      isUsingMySQL = false;
    }
  } else {
    console.log('[DBMS Engine] Live MySQL credentials not provided in .env. Operating on high-performance in-memory relational engine (sample_data.sql active).');
  }
}

export function isLiveMySQLConnected() {
  return isUsingMySQL && mysqlPool !== null;
}

export function getMySQLPool() {
  return mysqlPool;
}
