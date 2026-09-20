-- ====================================================================
-- COLLEGE PLACEMENT MANAGEMENT SYSTEM
-- Comprehensive Realistic Academic Sample Data (sample_data.sql)
-- Target RDBMS: MySQL 8.0+
-- ====================================================================

USE college_placement;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE APPLICATION;
TRUNCATE TABLE ELIGIBILITY_CRITERIA;
TRUNCATE TABLE PLACEMENT_DRIVE;
TRUNCATE TABLE JOB;
TRUNCATE TABLE STUDENT_SKILL;
TRUNCATE TABLE SKILL;
TRUNCATE TABLE STUDENT;
TRUNCATE TABLE COMPANY;
TRUNCATE TABLE DEPARTMENT;
TRUNCATE TABLE ADMIN;

-- --------------------------------------------------------------------
-- 1. DEPARTMENTS (5 Departments)
-- --------------------------------------------------------------------
INSERT INTO DEPARTMENT (department_id, department_name) VALUES
(1, 'Computer Science & Engineering'),
(2, 'Information Technology'),
(3, 'Electronics & Communication Engineering'),
(4, 'Electrical & Electronics Engineering'),
(5, 'Mechanical Engineering');

-- --------------------------------------------------------------------
-- 2. SKILLS (20 Skills)
-- --------------------------------------------------------------------
INSERT INTO SKILL (skill_id, skill_name) VALUES
(1, 'Python'),
(2, 'Java'),
(3, 'C++'),
(4, 'JavaScript'),
(5, 'TypeScript'),
(6, 'React.js'),
(7, 'Node.js'),
(8, 'Express.js'),
(9, 'MySQL'),
(10, 'PostgreSQL'),
(11, 'MongoDB'),
(12, 'Docker'),
(13, 'Kubernetes'),
(14, 'AWS Cloud'),
(15, 'Machine Learning'),
(16, 'Deep Learning'),
(17, 'Git & GitHub'),
(18, 'Spring Boot'),
(19, 'Data Structures & Algorithms'),
(20, 'System Design');

-- --------------------------------------------------------------------
-- 3. ADMINS
-- Passwords hashed using bcrypt (Default: Admin@123)
-- --------------------------------------------------------------------
INSERT INTO ADMIN (admin_id, name, email, password_hash) VALUES
(1, 'Prof. Arvind Sharma', 'admin@college.com', '$2b$10$03m.13oODkabnJTUP7erI.k/T1ImDZMqUZXIlh4P2W9J4O4a3MUaK'),
(2, 'Dr. Meenakshi Sundaram', 'placement.head@college.com', '$2b$10$03m.13oODkabnJTUP7erI.k/T1ImDZMqUZXIlh4P2W9J4O4a3MUaK');

-- --------------------------------------------------------------------
-- 4. COMPANIES (10 Companies: 8 Approved, 2 Pending Approval)
-- Passwords hashed using bcrypt (Default: Recruiter@123)
-- --------------------------------------------------------------------
INSERT INTO COMPANY (company_id, company_name, industry, location, website, email, password_hash, approved) VALUES
(1, 'Google India', 'Technology & Cloud', 'Bengaluru, Karnataka', 'https://careers.google.com', 'recruiter@example.com', '$2b$10$YYw.F/laOHLNg8KowbFxW.Ky38/Kz6QSdNcIfFf9Gg1sXiSPE3r5i', TRUE),
(2, 'Microsoft IDC', 'Software & AI', 'Hyderabad, Telangana', 'https://careers.microsoft.com', 'microsoft@example.com', '$2b$10$YYw.F/laOHLNg8KowbFxW.Ky38/Kz6QSdNcIfFf9Gg1sXiSPE3r5i', TRUE),
(3, 'Amazon Dev Centre', 'E-Commerce & Cloud', 'Bengaluru, Karnataka', 'https://amazon.jobs', 'amazon@example.com', '$2b$10$YYw.F/laOHLNg8KowbFxW.Ky38/Kz6QSdNcIfFf9Gg1sXiSPE3r5i', TRUE),
(4, 'Infosys Limited', 'IT Services & Consulting', 'Pune, Maharashtra', 'https://www.infosys.com/careers', 'infosys@example.com', '$2b$10$YYw.F/laOHLNg8KowbFxW.Ky38/Kz6QSdNcIfFf9Gg1sXiSPE3r5i', TRUE),
(5, 'Tata Consultancy Services', 'IT & Digital Solutions', 'Mumbai, Maharashtra', 'https://www.tcs.com/careers', 'tcs@example.com', '$2b$10$YYw.F/laOHLNg8KowbFxW.Ky38/Kz6QSdNcIfFf9Gg1sXiSPE3r5i', TRUE),
(6, 'Wipro Technologies', 'IT Infrastructure', 'Bengaluru, Karnataka', 'https://careers.wipro.com', 'wipro@example.com', '$2b$10$YYw.F/laOHLNg8KowbFxW.Ky38/Kz6QSdNcIfFf9Gg1sXiSPE3r5i', TRUE),
(7, 'Oracle India', 'Database & Enterprise Apps', 'Bengaluru, Karnataka', 'https://www.oracle.com/corporate/careers', 'oracle@example.com', '$2b$10$YYw.F/laOHLNg8KowbFxW.Ky38/Kz6QSdNcIfFf9Gg1sXiSPE3r5i', TRUE),
(8, 'Cisco Systems', 'Networking & Security', 'Bengaluru, Karnataka', 'https://jobs.cisco.com', 'cisco@example.com', '$2b$10$YYw.F/laOHLNg8KowbFxW.Ky38/Kz6QSdNcIfFf9Gg1sXiSPE3r5i', TRUE),
(9, 'Deloitte USI', 'Management & Tech Consulting', 'Hyderabad, Telangana', 'https://careers.deloitte.com', 'deloitte@example.com', '$2b$10$YYw.F/laOHLNg8KowbFxW.Ky38/Kz6QSdNcIfFf9Gg1sXiSPE3r5i', FALSE),
(10, 'Tata Elxsi', 'Embedded & Automotive Software', 'Thiruvananthapuram, Kerala', 'https://www.tataelxsi.com/careers', 'tataelxsi@example.com', '$2b$10$YYw.F/laOHLNg8KowbFxW.Ky38/Kz6QSdNcIfFf9Gg1sXiSPE3r5i', FALSE);

-- --------------------------------------------------------------------
-- 5. STUDENTS (50 Students across departments, batches, CGPAs)
-- Default Password for all: Student@123
-- Hash: $2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6
-- --------------------------------------------------------------------
INSERT INTO STUDENT (student_id, name, email, phone, password_hash, department_id, graduation_year, cgpa, tenth_percentage, twelfth_percentage, backlogs, resume) VALUES
(1, 'Aarav Sharma', 'student@example.com', '+91 9876543201', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 1, 2026, 8.85, 92.50, 89.00, 0, 'https://drive.google.com/aarav_sharma_resume.pdf'),
(2, 'Diya Patel', 'diya.patel@student.college.edu', '+91 9876543202', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 1, 2026, 9.40, 95.00, 93.50, 0, 'https://drive.google.com/diya_patel_resume.pdf'),
(3, 'Rohan Verma', 'rohan.verma@student.college.edu', '+91 9876543203', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 2, 2026, 7.30, 82.00, 78.00, 1, 'https://drive.google.com/rohan_verma_resume.pdf'),
(4, 'Ananya Iyer', 'ananya.iyer@student.college.edu', '+91 9876543204', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 1, 2026, 8.90, 91.00, 90.00, 0, 'https://drive.google.com/ananya_iyer_resume.pdf'),
(5, 'Kabir Mehta', 'kabir.mehta@student.college.edu', '+91 9876543205', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 3, 2026, 7.90, 86.00, 82.00, 0, 'https://drive.google.com/kabir_mehta_resume.pdf'),
(6, 'Pooja Nair', 'pooja.nair@student.college.edu', '+91 9876543206', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 1, 2025, 8.50, 88.00, 85.00, 0, 'https://drive.google.com/pooja_nair_resume.pdf'),
(7, 'Siddharth Rao', 'siddharth.rao@student.college.edu', '+91 9876543207', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 2, 2026, 6.70, 75.00, 71.00, 2, 'https://drive.google.com/siddharth_rao_resume.pdf'),
(8, 'Tanvi Kulkarni', 'tanvi.k@student.college.edu', '+91 9876543208', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 1, 2026, 9.15, 94.00, 91.00, 0, 'https://drive.google.com/tanvi_k_resume.pdf'),
(9, 'Aditya Joshi', 'aditya.joshi@student.college.edu', '+91 9876543209', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 3, 2026, 8.20, 85.50, 83.00, 0, 'https://drive.google.com/aditya_joshi_resume.pdf'),
(10, 'Ishita Gupta', 'ishita.gupta@student.college.edu', '+91 9876543210', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 4, 2026, 7.60, 80.00, 79.00, 0, 'https://drive.google.com/ishita_gupta_resume.pdf'),
(11, 'Manish Reddy', 'manish.reddy@student.college.edu', '+91 9876543211', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 1, 2026, 8.45, 87.00, 86.00, 0, 'https://drive.google.com/manish_reddy_resume.pdf'),
(12, 'Sneha Sen', 'sneha.sen@student.college.edu', '+91 9876543212', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 2, 2026, 8.70, 89.00, 87.50, 0, 'https://drive.google.com/sneha_sen_resume.pdf'),
(13, 'Vikram Singhania', 'vikram.s@student.college.edu', '+91 9876543213', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 5, 2026, 7.20, 78.00, 74.00, 1, 'https://drive.google.com/vikram_s_resume.pdf'),
(14, 'Rhea Deshmukh', 'rhea.d@student.college.edu', '+91 9876543214', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 1, 2026, 9.60, 97.00, 95.00, 0, 'https://drive.google.com/rhea_d_resume.pdf'),
(15, 'Gaurav Bhatia', 'gaurav.b@student.college.edu', '+91 9876543215', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 2, 2026, 7.85, 84.00, 81.00, 0, 'https://drive.google.com/gaurav_b_resume.pdf'),
(16, 'Meera Menon', 'meera.menon@student.college.edu', '+91 9876543216', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 3, 2026, 8.10, 86.00, 84.00, 0, 'https://drive.google.com/meera_menon_resume.pdf'),
(17, 'Nikhil Choudhary', 'nikhil.c@student.college.edu', '+91 9876543217', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 4, 2026, 6.90, 76.00, 72.00, 1, 'https://drive.google.com/nikhil_c_resume.pdf'),
(18, 'Kavya Pillai', 'kavya.pillai@student.college.edu', '+91 9876543218', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 1, 2026, 9.05, 93.00, 92.00, 0, 'https://drive.google.com/kavya_pillai_resume.pdf'),
(19, 'Pranav Nambiar', 'pranav.n@student.college.edu', '+91 9876543219', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 5, 2026, 8.00, 83.00, 80.00, 0, 'https://drive.google.com/pranav_n_resume.pdf'),
(20, 'Shreya Das', 'shreya.das@student.college.edu', '+91 9876543220', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 2, 2026, 8.35, 87.50, 85.00, 0, 'https://drive.google.com/shreya_das_resume.pdf'),
(21, 'Arjun Kapoor', 'arjun.k@student.college.edu', '+91 9876543221', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 1, 2027, 8.60, 90.00, 88.00, 0, 'https://drive.google.com/arjun_k_resume.pdf'),
(22, 'Bhavna Bose', 'bhavna.bose@student.college.edu', '+91 9876543222', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 2, 2027, 7.50, 81.00, 77.00, 0, 'https://drive.google.com/bhavna_bose_resume.pdf'),
(23, 'Chirag Sethi', 'chirag.sethi@student.college.edu', '+91 9876543223', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 3, 2026, 8.75, 91.00, 89.00, 0, 'https://drive.google.com/chirag_sethi_resume.pdf'),
(24, 'Deepika Mathur', 'deepika.m@student.college.edu', '+91 9876543224', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 1, 2026, 9.20, 94.50, 92.50, 0, 'https://drive.google.com/deepika_m_resume.pdf'),
(25, 'Eshaan Roy', 'eshaan.roy@student.college.edu', '+91 9876543225', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 5, 2026, 6.50, 72.00, 70.00, 3, 'https://drive.google.com/eshaan_roy_resume.pdf'),
(26, 'Farhan Khan', 'farhan.khan@student.college.edu', '+91 9876543226', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 2, 2026, 8.55, 89.00, 86.50, 0, 'https://drive.google.com/farhan_khan_resume.pdf'),
(27, 'Gayatri Somani', 'gayatri.s@student.college.edu', '+91 9876543227', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 1, 2026, 8.95, 93.00, 90.00, 0, 'https://drive.google.com/gayatri_s_resume.pdf'),
(28, 'Harsh Vardhan', 'harsh.v@student.college.edu', '+91 9876543228', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 3, 2026, 7.10, 79.00, 76.00, 1, 'https://drive.google.com/harsh_v_resume.pdf'),
(29, 'Ira Trivedi', 'ira.trivedi@student.college.edu', '+91 9876543229', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 1, 2026, 9.35, 96.00, 94.00, 0, 'https://drive.google.com/ira_trivedi_resume.pdf'),
(30, 'Jatin Saxena', 'jatin.saxena@student.college.edu', '+91 9876543230', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 4, 2026, 8.30, 86.00, 83.50, 0, 'https://drive.google.com/jatin_saxena_resume.pdf'),
(31, 'Kritika Roy', 'kritika.roy@student.college.edu', '+91 9876543231', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 2, 2026, 7.95, 83.00, 81.50, 0, 'https://drive.google.com/kritika_roy_resume.pdf'),
(32, 'Lokesh Agarwal', 'lokesh.a@student.college.edu', '+91 9876543232', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 1, 2026, 8.15, 85.00, 82.00, 0, 'https://drive.google.com/lokesh_a_resume.pdf'),
(33, 'Mallika Sen', 'mallika.sen@student.college.edu', '+91 9876543233', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 5, 2026, 7.70, 82.50, 79.00, 0, 'https://drive.google.com/mallika_sen_resume.pdf'),
(34, 'Naveen Kumar', 'naveen.k@student.college.edu', '+91 9876543234', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 1, 2026, 8.80, 91.50, 88.00, 0, 'https://drive.google.com/naveen_k_resume.pdf'),
(35, 'Ojasvi Singhal', 'ojasvi.s@student.college.edu', '+91 9876543235', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 3, 2026, 8.40, 87.00, 85.00, 0, 'https://drive.google.com/ojasvi_s_resume.pdf'),
(36, 'Prashant Mishra', 'prashant.m@student.college.edu', '+91 9876543236', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 4, 2026, 7.45, 80.50, 77.00, 1, 'https://drive.google.com/prashant_m_resume.pdf'),
(37, 'Quasar Ali', 'quasar.ali@student.college.edu', '+91 9876543237', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 1, 2026, 8.65, 88.50, 86.00, 0, 'https://drive.google.com/quasar_ali_resume.pdf'),
(38, 'Rashi Khandelwal', 'rashi.k@student.college.edu', '+91 9876543238', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 2, 2026, 9.10, 93.50, 91.00, 0, 'https://drive.google.com/rashi_k_resume.pdf'),
(39, 'Sankalp Jain', 'sankalp.j@student.college.edu', '+91 9876543239', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 3, 2026, 7.80, 83.00, 80.00, 0, 'https://drive.google.com/sankalp_j_resume.pdf'),
(40, 'Tarun Teja', 'tarun.teja@student.college.edu', '+91 9876543240', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 1, 2026, 9.50, 96.50, 94.00, 0, 'https://drive.google.com/tarun_teja_resume.pdf'),
(41, 'Upasana Ghosh', 'upasana.g@student.college.edu', '+91 9876543241', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 2, 2026, 8.25, 86.00, 83.00, 0, 'https://drive.google.com/upasana_g_resume.pdf'),
(42, 'Varun Chopra', 'varun.chopra@student.college.edu', '+91 9876543242', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 5, 2026, 6.80, 74.00, 71.00, 2, 'https://drive.google.com/varun_chopra_resume.pdf'),
(43, 'Waseem Akram', 'waseem.a@student.college.edu', '+91 9876543243', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 1, 2026, 8.70, 89.00, 87.00, 0, 'https://drive.google.com/waseem_a_resume.pdf'),
(44, 'Xavier Fernandes', 'xavier.f@student.college.edu', '+91 9876543244', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 4, 2026, 7.35, 81.00, 78.00, 0, 'https://drive.google.com/xavier_f_resume.pdf'),
(45, 'Yamini Rathore', 'yamini.r@student.college.edu', '+91 9876543245', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 2, 2026, 9.00, 92.00, 90.00, 0, 'https://drive.google.com/yamini_r_resume.pdf'),
(46, 'Zaid Mansoori', 'zaid.m@student.college.edu', '+91 9876543246', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 3, 2026, 8.05, 85.00, 82.50, 0, 'https://drive.google.com/zaid_m_resume.pdf'),
(47, 'Abhinav Shukla', 'abhinav.s@student.college.edu', '+91 9876543247', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 1, 2026, 8.50, 88.00, 85.00, 0, 'https://drive.google.com/abhinav_s_resume.pdf'),
(48, 'Bhavika Som', 'bhavika.s@student.college.edu', '+91 9876543248', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 2, 2026, 8.30, 87.00, 84.00, 0, 'https://drive.google.com/bhavika_s_resume.pdf'),
(49, 'Chetan Bhagat', 'chetan.b@student.college.edu', '+91 9876543249', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 5, 2026, 7.15, 78.00, 75.00, 1, 'https://drive.google.com/chetan_b_resume.pdf'),
(50, 'Divyansh Mittal', 'divyansh.m@student.college.edu', '+91 9876543250', '$2b$10$nFB/pGBXNmmRRsiYVbn8OO3h9YHgPhyJxFrBcUnEwAlNRNALn7/J6', 1, 2026, 9.75, 98.00, 96.00, 0, 'https://drive.google.com/divyansh_m_resume.pdf');

-- --------------------------------------------------------------------
-- 6. STUDENT_SKILLS (Mapping students to diverse skills)
-- --------------------------------------------------------------------
INSERT INTO STUDENT_SKILL (student_id, skill_id, proficiency) VALUES
-- Student 1 (Aarav)
(1, 1, 'Advanced'), (1, 4, 'Advanced'), (1, 6, 'Advanced'), (1, 7, 'Intermediate'), (1, 9, 'Advanced'),
-- Student 2 (Diya)
(2, 2, 'Advanced'), (2, 3, 'Advanced'), (2, 19, 'Advanced'), (2, 20, 'Advanced'), (2, 10, 'Intermediate'),
-- Student 3 (Rohan)
(3, 1, 'Intermediate'), (3, 4, 'Beginner'), (3, 9, 'Intermediate'),
-- Student 4 (Ananya)
(4, 1, 'Advanced'), (4, 15, 'Advanced'), (4, 16, 'Intermediate'), (4, 9, 'Advanced'),
-- Student 5 (Kabir)
(5, 3, 'Advanced'), (5, 1, 'Intermediate'), (5, 12, 'Beginner'),
-- Student 8 (Tanvi)
(8, 2, 'Advanced'), (8, 18, 'Advanced'), (8, 10, 'Advanced'), (8, 19, 'Advanced'),
-- Student 14 (Rhea)
(14, 1, 'Advanced'), (14, 4, 'Advanced'), (14, 5, 'Advanced'), (14, 6, 'Advanced'), (14, 7, 'Advanced'), (14, 14, 'Intermediate'),
-- Student 24 (Deepika)
(24, 2, 'Advanced'), (24, 3, 'Advanced'), (24, 19, 'Advanced'), (24, 13, 'Intermediate'),
-- Student 50 (Divyansh)
(50, 1, 'Advanced'), (50, 2, 'Advanced'), (50, 3, 'Advanced'), (50, 19, 'Advanced'), (50, 20, 'Advanced'), (50, 14, 'Advanced');

-- Insert skills for other students systematically
INSERT INTO STUDENT_SKILL (student_id, skill_id, proficiency)
SELECT s.student_id, ((s.student_id % 18) + 1), 'Intermediate'
FROM STUDENT s
WHERE s.student_id NOT IN (1, 2, 3, 4, 5, 8, 14, 24, 50);

INSERT INTO STUDENT_SKILL (student_id, skill_id, proficiency)
SELECT s.student_id, (((s.student_id + 5) % 18) + 1), 'Advanced'
FROM STUDENT s
WHERE s.student_id NOT IN (1, 2, 3, 4, 5, 8, 14, 24, 50) AND s.cgpa >= 8.0;

-- --------------------------------------------------------------------
-- 7. JOBS (15 Jobs across 8 Approved Companies)
-- --------------------------------------------------------------------
INSERT INTO JOB (job_id, company_id, job_title, job_description, package, job_location, vacancies) VALUES
(1, 1, 'Software Engineer (L3)', 'Work on large-scale distributed systems, web architectures, and cloud microservices.', 32.50, 'Bengaluru', 8),
(2, 1, 'Associate Cloud Consultant', 'Design scalable cloud migration strategies and architectures on Google Cloud Platform.', 24.00, 'Hyderabad', 5),
(3, 2, 'Software Development Engineer I', 'Develop cutting-edge features for Azure Cloud, Microsoft 365, and AI Copilot services.', 28.00, 'Hyderabad', 12),
(4, 2, 'Support Engineering Lead', 'Enterprise tier-3 diagnostic and architectural engineering for cloud workloads.', 16.50, 'Bengaluru', 6),
(5, 3, 'SDE-1 (Full Stack & Systems)', 'Drive low-latency transaction engines, e-commerce catalog pipelines, and AWS SDKs.', 26.50, 'Bengaluru', 15),
(6, 3, 'Data Analyst / BI Engineer', 'Synthesize high-volume consumer behavioral pipelines using SQL, Redshift, and Python.', 18.00, 'Chennai', 8),
(7, 4, 'Specialist Programmer (Power Programmer)', 'High-end algorithmic engineering, system programming, and modern full-stack development.', 9.50, 'Pune', 25),
(8, 4, 'Digital Specialist Engineer', 'Full-stack enterprise application engineering using React, Node.js, and Cloud services.', 6.50, 'Bengaluru', 50),
(9, 5, 'Ninja Software Engineer', 'Advanced cognitive systems development, machine learning automation, and web platforms.', 7.00, 'Mumbai', 40),
(10, 5, 'Digital Innovator Engineer', 'Architecture research, blockchain, enterprise ERP, and cloud computing solutions.', 11.50, 'Pune', 15),
(11, 6, 'Project Engineer (Elite)', 'Develop and maintain enterprise software, QA automation pipelines, and core microservices.', 6.50, 'Bengaluru', 30),
(12, 7, 'Server Technology Associate', 'Build core relational database engines, high-availability clusters, and Java backend services.', 19.50, 'Bengaluru', 10),
(13, 7, 'Cloud Infrastructure Engineer', 'Automation, Linux kernel tuning, and network virtualization on Oracle Cloud Infrastructure.', 17.00, 'Hyderabad', 8),
(14, 8, 'Software Engineer (Networking & Security)', 'Next-generation networking software, router OS kernels, cybersecurity, and cloud telemetry.', 22.00, 'Bengaluru', 10),
(15, 8, 'Consulting Systems Engineer', 'Technical consulting, system design, and customer solution deployment for enterprise clients.', 15.00, 'Bengaluru', 5);

-- --------------------------------------------------------------------
-- 8. PLACEMENT DRIVES (15 Drives)
-- --------------------------------------------------------------------
INSERT INTO PLACEMENT_DRIVE (drive_id, job_id, drive_date, application_deadline, status) VALUES
(1, 1, '2026-10-15', '2026-10-05', 'Open'),
(2, 2, '2026-10-20', '2026-10-10', 'Open'),
(3, 3, '2026-10-25', '2026-10-12', 'Open'),
(4, 4, '2026-11-01', '2026-10-20', 'Upcoming'),
(5, 5, '2026-10-18', '2026-10-08', 'Open'),
(6, 6, '2026-11-05', '2026-10-22', 'Upcoming'),
(7, 7, '2026-10-12', '2026-10-02', 'Open'),
(8, 8, '2026-10-14', '2026-10-04', 'Open'),
(9, 9, '2026-10-16', '2026-10-06', 'Open'),
(10, 10, '2026-11-10', '2026-10-25', 'Upcoming'),
(11, 11, '2026-09-01', '2026-08-20', 'Closed'),
(12, 12, '2026-10-28', '2026-10-15', 'Open'),
(13, 13, '2026-11-15', '2026-10-30', 'Upcoming'),
(14, 14, '2026-10-30', '2026-10-18', 'Open'),
(15, 15, '2026-08-15', '2026-08-01', 'Closed');

-- --------------------------------------------------------------------
-- 9. ELIGIBILITY CRITERIA (1-to-1 with PLACEMENT_DRIVE)
-- --------------------------------------------------------------------
INSERT INTO ELIGIBILITY_CRITERIA (criteria_id, drive_id, minimum_cgpa, maximum_backlogs, minimum_tenth_percentage, minimum_twelfth_percentage, graduation_year) VALUES
-- Drive 1: Google SDE
(1, 1, 8.50, 0, 85.00, 85.00, 2026),
-- Drive 2: Google Cloud
(2, 2, 8.00, 0, 80.00, 80.00, 2026),
-- Drive 3: Microsoft SDE
(3, 3, 8.50, 0, 85.00, 85.00, 2026),
-- Drive 4: Microsoft Support
(4, 4, 7.50, 1, 75.00, 75.00, 2026),
-- Drive 5: Amazon SDE
(5, 5, 8.00, 0, 80.00, 80.00, 2026),
-- Drive 6: Amazon Data Analyst
(6, 6, 7.50, 0, 75.00, 75.00, 2026),
-- Drive 7: Infosys Specialist Programmer
(7, 7, 7.50, 0, 75.00, 75.00, 2026),
-- Drive 8: Infosys Digital Specialist
(8, 8, 6.50, 1, 65.00, 65.00, 2026),
-- Drive 9: TCS Ninja
(9, 9, 6.50, 1, 60.00, 60.00, 2026),
-- Drive 10: TCS Digital Innovator
(10, 10, 8.00, 0, 80.00, 80.00, 2026),
-- Drive 11: Wipro Project Engineer (Closed)
(11, 11, 6.50, 2, 60.00, 60.00, 2026),
-- Drive 12: Oracle Server Technology
(12, 12, 8.00, 0, 80.00, 80.00, 2026),
-- Drive 13: Oracle Cloud Infrastructure
(13, 13, 7.80, 0, 75.00, 75.00, 2026),
-- Drive 14: Cisco Systems
(14, 14, 8.00, 0, 80.00, 80.00, 2026),
-- Drive 15: Cisco Systems Consulting (Closed)
(15, 15, 7.00, 1, 70.00, 70.00, 2025);

-- --------------------------------------------------------------------
-- 10. APPLICATIONS (100+ Applications with realistic statuses)
-- Statuses: 'Applied', 'Eligible', 'Shortlisted', 'Rejected', 'Withdrawn'
-- --------------------------------------------------------------------
INSERT INTO APPLICATION (application_id, student_id, drive_id, application_date, status) VALUES
-- Drive 1: Google SDE (High eligibility: CGPA >= 8.5, 0 backlogs, Batch 2026)
(1, 1, 1, '2026-09-15 10:30:00', 'Shortlisted'),
(2, 2, 1, '2026-09-15 11:15:00', 'Shortlisted'),
(3, 4, 1, '2026-09-15 12:00:00', 'Eligible'),
(4, 8, 1, '2026-09-16 09:20:00', 'Shortlisted'),
(5, 14, 1, '2026-09-16 10:45:00', 'Shortlisted'),
(6, 18, 1, '2026-09-16 14:10:00', 'Eligible'),
(7, 24, 1, '2026-09-17 11:00:00', 'Shortlisted'),
(8, 27, 1, '2026-09-17 15:30:00', 'Eligible'),
(9, 29, 1, '2026-09-18 09:00:00', 'Eligible'),
(10, 34, 1, '2026-09-18 10:20:00', 'Eligible'),
(11, 37, 1, '2026-09-18 13:40:00', 'Eligible'),
(12, 38, 1, '2026-09-19 11:10:00', 'Eligible'),
(13, 40, 1, '2026-09-19 14:25:00', 'Shortlisted'),
(14, 43, 1, '2026-09-20 10:00:00', 'Eligible'),
(15, 45, 1, '2026-09-20 16:30:00', 'Eligible'),
(16, 50, 1, '2026-09-21 09:15:00', 'Shortlisted'),

-- Drive 2: Google Cloud (CGPA >= 8.0)
(17, 1, 2, '2026-09-16 12:00:00', 'Eligible'),
(18, 9, 2, '2026-09-16 13:30:00', 'Eligible'),
(19, 11, 2, '2026-09-16 15:00:00', 'Eligible'),
(20, 12, 2, '2026-09-17 10:30:00', 'Shortlisted'),
(21, 16, 2, '2026-09-17 14:00:00', 'Eligible'),
(22, 19, 2, '2026-09-18 11:45:00', 'Eligible'),
(23, 20, 2, '2026-09-18 16:15:00', 'Shortlisted'),
(24, 23, 2, '2026-09-19 10:00:00', 'Eligible'),
(25, 26, 2, '2026-09-19 12:20:00', 'Eligible'),
(26, 30, 2, '2026-09-20 09:30:00', 'Eligible'),
(27, 32, 2, '2026-09-20 14:15:00', 'Eligible'),
(28, 35, 2, '2026-09-21 11:00:00', 'Eligible'),
(29, 41, 2, '2026-09-21 15:45:00', 'Eligible'),
(30, 46, 2, '2026-09-22 10:30:00', 'Eligible'),
(31, 47, 2, '2026-09-22 14:00:00', 'Eligible'),
(32, 48, 2, '2026-09-23 09:00:00', 'Eligible'),

-- Drive 3: Microsoft SDE (CGPA >= 8.5)
(33, 1, 3, '2026-09-17 10:00:00', 'Applied'),
(34, 2, 3, '2026-09-17 11:30:00', 'Shortlisted'),
(35, 4, 3, '2026-09-17 14:00:00', 'Applied'),
(36, 8, 3, '2026-09-18 09:45:00', 'Shortlisted'),
(37, 14, 3, '2026-09-18 12:15:00', 'Shortlisted'),
(38, 18, 3, '2026-09-18 15:30:00', 'Applied'),
(39, 24, 3, '2026-09-19 10:15:00', 'Shortlisted'),
(40, 27, 3, '2026-09-19 13:45:00', 'Applied'),
(41, 29, 3, '2026-09-20 11:00:00', 'Shortlisted'),
(42, 34, 3, '2026-09-20 14:30:00', 'Applied'),
(43, 38, 3, '2026-09-21 09:30:00', 'Applied'),
(44, 40, 3, '2026-09-21 12:00:00', 'Shortlisted'),
(45, 43, 3, '2026-09-21 16:00:00', 'Applied'),
(46, 45, 3, '2026-09-22 10:45:00', 'Applied'),
(47, 50, 3, '2026-09-22 14:15:00', 'Shortlisted'),

-- Drive 5: Amazon SDE (CGPA >= 8.0)
(48, 1, 5, '2026-09-18 11:00:00', 'Eligible'),
(49, 2, 5, '2026-09-18 12:45:00', 'Shortlisted'),
(50, 5, 5, '2026-09-18 15:15:00', 'Rejected'),
(51, 8, 5, '2026-09-19 09:00:00', 'Eligible'),
(52, 9, 5, '2026-09-19 11:30:00', 'Eligible'),
(53, 11, 5, '2026-09-19 14:00:00', 'Eligible'),
(54, 12, 5, '2026-09-20 10:20:00', 'Eligible'),
(55, 14, 5, '2026-09-20 13:00:00', 'Shortlisted'),
(56, 16, 5, '2026-09-20 16:10:00', 'Eligible'),
(57, 19, 5, '2026-09-21 09:45:00', 'Eligible'),
(58, 20, 5, '2026-09-21 12:15:00', 'Eligible'),
(59, 23, 5, '2026-09-21 15:00:00', 'Eligible'),
(60, 24, 5, '2026-09-22 10:00:00', 'Shortlisted'),
(61, 26, 5, '2026-09-22 12:30:00', 'Eligible'),
(62, 27, 5, '2026-09-22 15:30:00', 'Eligible'),
(63, 30, 5, '2026-09-23 11:15:00', 'Eligible'),
(64, 32, 5, '2026-09-23 14:00:00', 'Eligible'),
(65, 34, 5, '2026-09-24 09:30:00', 'Eligible'),
(66, 35, 5, '2026-09-24 12:00:00', 'Eligible'),
(67, 37, 5, '2026-09-24 15:00:00', 'Eligible'),
(68, 38, 5, '2026-09-25 10:30:00', 'Eligible'),
(69, 40, 5, '2026-09-25 13:45:00', 'Shortlisted'),
(70, 41, 5, '2026-09-25 16:20:00', 'Eligible'),
(71, 46, 5, '2026-09-26 11:00:00', 'Eligible'),
(72, 47, 5, '2026-09-26 14:30:00', 'Eligible'),
(73, 50, 5, '2026-09-27 09:15:00', 'Shortlisted'),

-- Drive 7: Infosys Specialist Programmer (CGPA >= 7.5, 0 backlogs)
(74, 3, 7, '2026-09-18 10:00:00', 'Rejected'),
(75, 5, 7, '2026-09-18 11:30:00', 'Eligible'),
(76, 10, 7, '2026-09-18 14:00:00', 'Eligible'),
(77, 15, 7, '2026-09-19 09:15:00', 'Eligible'),
(78, 31, 7, '2026-09-19 12:00:00', 'Eligible'),
(79, 33, 7, '2026-09-19 15:30:00', 'Eligible'),
(80, 39, 7, '2026-09-20 10:45:00', 'Eligible'),

-- Drive 8: Infosys Digital Specialist (CGPA >= 6.5, max 1 backlog)
(81, 3, 8, '2026-09-19 11:00:00', 'Eligible'),
(82, 7, 8, '2026-09-19 13:30:00', 'Rejected'),
(83, 13, 8, '2026-09-19 16:00:00', 'Eligible'),
(84, 17, 8, '2026-09-20 09:30:00', 'Eligible'),
(85, 28, 8, '2026-09-20 12:15:00', 'Eligible'),
(86, 36, 8, '2026-09-20 14:45:00', 'Eligible'),
(87, 42, 8, '2026-09-21 10:00:00', 'Rejected'),
(88, 44, 8, '2026-09-21 13:00:00', 'Eligible'),
(89, 49, 8, '2026-09-21 15:30:00', 'Eligible'),

-- Drive 9: TCS Ninja (CGPA >= 6.5, max 1 backlog)
(90, 3, 9, '2026-09-20 11:00:00', 'Applied'),
(91, 7, 9, '2026-09-20 13:45:00', 'Rejected'),
(92, 10, 9, '2026-09-21 09:00:00', 'Applied'),
(93, 13, 9, '2026-09-21 11:30:00', 'Applied'),
(94, 15, 9, '2026-09-21 14:15:00', 'Applied'),
(95, 17, 9, '2026-09-22 10:00:00', 'Applied'),
(96, 25, 9, '2026-09-22 12:30:00', 'Rejected'),
(97, 28, 9, '2026-09-22 15:00:00', 'Applied'),
(98, 36, 9, '2026-09-23 09:45:00', 'Applied'),
(99, 42, 9, '2026-09-23 12:15:00', 'Rejected'),
(100, 49, 9, '2026-09-23 14:45:00', 'Applied'),

-- Drive 12: Oracle Server Technology (CGPA >= 8.0)
(101, 1, 12, '2026-09-22 10:00:00', 'Applied'),
(102, 2, 12, '2026-09-22 11:30:00', 'Shortlisted'),
(103, 8, 12, '2026-09-22 14:00:00', 'Applied'),
(104, 14, 12, '2026-09-23 09:15:00', 'Shortlisted'),
(105, 50, 12, '2026-09-23 11:45:00', 'Shortlisted');

SET FOREIGN_KEY_CHECKS = 1;
