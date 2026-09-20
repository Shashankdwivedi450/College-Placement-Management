-- ====================================================================
-- COLLEGE PLACEMENT MANAGEMENT SYSTEM (DBMS ACADEMIC PROJECT)
-- Database Definition & Schema (schema.sql)
-- Target RDBMS: MySQL 8.0+
-- ====================================================================

DROP DATABASE IF EXISTS college_placement;
CREATE DATABASE college_placement CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE college_placement;

-- Disable foreign key checks during schema construction
SET FOREIGN_KEY_CHECKS = 0;

-- --------------------------------------------------------------------
-- 1. Table: DEPARTMENT
-- Description: Stores academic departments offering degree programs
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS DEPARTMENT;
CREATE TABLE DEPARTMENT (
    department_id INT AUTO_INCREMENT PRIMARY KEY,
    department_name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 2. Table: STUDENT
-- Description: Stores registered student academic and personal profiles
-- Normalization: 3NF compliant; department details abstracted via FK
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS STUDENT;
CREATE TABLE STUDENT (
    student_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    phone VARCHAR(20) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    department_id INT NOT NULL,
    graduation_year INT NOT NULL,
    cgpa DECIMAL(4,2) NOT NULL,
    tenth_percentage DECIMAL(5,2) NOT NULL,
    twelfth_percentage DECIMAL(5,2) NOT NULL,
    backlogs INT NOT NULL DEFAULT 0,
    resume VARCHAR(255) NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_student_cgpa CHECK (cgpa >= 0.00 AND cgpa <= 10.00),
    CONSTRAINT chk_student_tenth CHECK (tenth_percentage >= 0.00 AND tenth_percentage <= 100.00),
    CONSTRAINT chk_student_twelfth CHECK (twelfth_percentage >= 0.00 AND twelfth_percentage <= 100.00),
    CONSTRAINT chk_student_backlogs CHECK (backlogs >= 0),
    CONSTRAINT fk_student_department FOREIGN KEY (department_id) 
        REFERENCES DEPARTMENT(department_id) 
        ON DELETE RESTRICT 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- Indexes for performance on frequently searched candidate criteria
CREATE INDEX idx_student_dept ON STUDENT(department_id);
CREATE INDEX idx_student_cgpa ON STUDENT(cgpa);
CREATE INDEX idx_student_grad_year ON STUDENT(graduation_year);

-- --------------------------------------------------------------------
-- 3. Table: SKILL
-- Description: Master catalog of technical and soft skills
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS SKILL;
CREATE TABLE SKILL (
    skill_id INT AUTO_INCREMENT PRIMARY KEY,
    skill_name VARCHAR(100) NOT NULL UNIQUE
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 4. Table: STUDENT_SKILL
-- Description: Junction table modeling Many-to-Many between Students & Skills
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS STUDENT_SKILL;
CREATE TABLE STUDENT_SKILL (
    student_id INT NOT NULL,
    skill_id INT NOT NULL,
    proficiency ENUM('Beginner', 'Intermediate', 'Advanced') NOT NULL DEFAULT 'Intermediate',
    PRIMARY KEY (student_id, skill_id),
    CONSTRAINT fk_studentskill_student FOREIGN KEY (student_id) 
        REFERENCES STUDENT(student_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_studentskill_skill FOREIGN KEY (skill_id) 
        REFERENCES SKILL(skill_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 5. Table: COMPANY
-- Description: Recruiting partners participating in placement drives
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS COMPANY;
CREATE TABLE COMPANY (
    company_id INT AUTO_INCREMENT PRIMARY KEY,
    company_name VARCHAR(150) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    website VARCHAR(200) NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    approved BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

CREATE INDEX idx_company_approved ON COMPANY(approved);

-- --------------------------------------------------------------------
-- 6. Table: JOB
-- Description: Job openings posted by participating companies
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS JOB;
CREATE TABLE JOB (
    job_id INT AUTO_INCREMENT PRIMARY KEY,
    company_id INT NOT NULL,
    job_title VARCHAR(150) NOT NULL,
    job_description TEXT NOT NULL,
    package DECIMAL(10,2) NOT NULL, -- Annual package in LPA (Lakhs Per Annum)
    job_location VARCHAR(100) NOT NULL,
    vacancies INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_job_package CHECK (package >= 0.00),
    CONSTRAINT chk_job_vacancies CHECK (vacancies > 0),
    CONSTRAINT fk_job_company FOREIGN KEY (company_id) 
        REFERENCES COMPANY(company_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_job_company ON JOB(company_id);

-- --------------------------------------------------------------------
-- 7. Table: PLACEMENT_DRIVE
-- Description: Campus hiring events scheduled for a particular job opening
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS PLACEMENT_DRIVE;
CREATE TABLE PLACEMENT_DRIVE (
    drive_id INT AUTO_INCREMENT PRIMARY KEY,
    job_id INT NOT NULL,
    drive_date DATE NOT NULL,
    application_deadline DATE NOT NULL,
    status ENUM('Upcoming', 'Open', 'Closed', 'Cancelled') NOT NULL DEFAULT 'Upcoming',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,

    -- Constraints
    CONSTRAINT chk_drive_deadline CHECK (application_deadline <= drive_date),
    CONSTRAINT fk_drive_job FOREIGN KEY (job_id) 
        REFERENCES JOB(job_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_drive_status ON PLACEMENT_DRIVE(status);
CREATE INDEX idx_drive_date ON PLACEMENT_DRIVE(drive_date);

-- --------------------------------------------------------------------
-- 8. Table: ELIGIBILITY_CRITERIA
-- Description: Minimum requirements for each placement drive (1-to-1)
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS ELIGIBILITY_CRITERIA;
CREATE TABLE ELIGIBILITY_CRITERIA (
    criteria_id INT AUTO_INCREMENT PRIMARY KEY,
    drive_id INT NOT NULL UNIQUE, -- Strictly enforces 1-to-1 relationship with PLACEMENT_DRIVE
    minimum_cgpa DECIMAL(4,2) NOT NULL DEFAULT 0.00,
    maximum_backlogs INT NOT NULL DEFAULT 0,
    minimum_tenth_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    minimum_twelfth_percentage DECIMAL(5,2) NOT NULL DEFAULT 0.00,
    graduation_year INT NOT NULL,

    -- Constraints
    CONSTRAINT chk_criteria_cgpa CHECK (minimum_cgpa >= 0.00 AND minimum_cgpa <= 10.00),
    CONSTRAINT chk_criteria_tenth CHECK (minimum_tenth_percentage >= 0.00 AND minimum_tenth_percentage <= 100.00),
    CONSTRAINT chk_criteria_twelfth CHECK (minimum_twelfth_percentage >= 0.00 AND minimum_twelfth_percentage <= 100.00),
    CONSTRAINT chk_criteria_backlogs CHECK (maximum_backlogs >= 0),
    CONSTRAINT fk_criteria_drive FOREIGN KEY (drive_id) 
        REFERENCES PLACEMENT_DRIVE(drive_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

-- --------------------------------------------------------------------
-- 9. Table: APPLICATION
-- Description: Student job application for a specific placement drive
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS APPLICATION;
CREATE TABLE APPLICATION (
    application_id INT AUTO_INCREMENT PRIMARY KEY,
    student_id INT NOT NULL,
    drive_id INT NOT NULL,
    application_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    status ENUM('Applied', 'Eligible', 'Shortlisted', 'Rejected', 'Withdrawn') NOT NULL DEFAULT 'Applied',

    -- Prevent duplicate applications from the same student for the same drive
    CONSTRAINT uq_student_drive UNIQUE (student_id, drive_id),
    CONSTRAINT fk_application_student FOREIGN KEY (student_id) 
        REFERENCES STUDENT(student_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE,
    CONSTRAINT fk_application_drive FOREIGN KEY (drive_id) 
        REFERENCES PLACEMENT_DRIVE(drive_id) 
        ON DELETE CASCADE 
        ON UPDATE CASCADE
) ENGINE=InnoDB;

CREATE INDEX idx_app_student ON APPLICATION(student_id);
CREATE INDEX idx_app_drive ON APPLICATION(drive_id);
CREATE INDEX idx_app_status ON APPLICATION(status);

-- --------------------------------------------------------------------
-- 10. Table: ADMIN
-- Description: System administrators managing college placement portal
-- --------------------------------------------------------------------
DROP TABLE IF EXISTS ADMIN;
CREATE TABLE ADMIN (
    admin_id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL
) ENGINE=InnoDB;

-- Re-enable foreign key checks
SET FOREIGN_KEY_CHECKS = 1;
