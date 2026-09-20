-- ====================================================================
-- COLLEGE PLACEMENT MANAGEMENT SYSTEM
-- Database Views (views.sql)
-- Target RDBMS: MySQL 8.0+
-- ====================================================================

USE college_placement;

DROP VIEW IF EXISTS eligible_students_view;
DROP VIEW IF EXISTS placement_drive_summary_view;
DROP VIEW IF EXISTS student_applications_view;

-- --------------------------------------------------------------------
-- 1. View: eligible_students_view
-- Description: Real-time projection of all students who satisfy the 
--              eligibility criteria for each active placement drive.
-- --------------------------------------------------------------------
CREATE VIEW eligible_students_view AS
SELECT 
    s.student_id,
    s.name AS student_name,
    s.email AS student_email,
    s.phone AS student_phone,
    d.department_name,
    s.cgpa,
    s.tenth_percentage,
    s.twelfth_percentage,
    s.backlogs,
    s.graduation_year,
    pd.drive_id,
    pd.drive_date,
    pd.application_deadline,
    pd.status AS drive_status,
    j.job_id,
    j.job_title,
    j.package AS package_lpa,
    c.company_name,
    ec.minimum_cgpa,
    ec.maximum_backlogs
FROM STUDENT s
JOIN DEPARTMENT d ON s.department_id = d.department_id
CROSS JOIN PLACEMENT_DRIVE pd
JOIN JOB j ON pd.job_id = j.job_id
JOIN COMPANY c ON j.company_id = c.company_id
JOIN ELIGIBILITY_CRITERIA ec ON pd.drive_id = ec.drive_id
WHERE s.cgpa >= ec.minimum_cgpa
  AND s.backlogs <= ec.maximum_backlogs
  AND s.tenth_percentage >= ec.minimum_tenth_percentage
  AND s.twelfth_percentage >= ec.minimum_twelfth_percentage
  AND s.graduation_year = ec.graduation_year;

-- --------------------------------------------------------------------
-- 2. View: placement_drive_summary_view
-- Description: Comprehensive summary of all campus placement drives,
--              integrating company credentials, package, criteria & applicant counts.
-- --------------------------------------------------------------------
CREATE VIEW placement_drive_summary_view AS
SELECT 
    pd.drive_id,
    pd.drive_date,
    pd.application_deadline,
    pd.status AS drive_status,
    j.job_id,
    j.job_title,
    j.package AS package_lpa,
    j.job_location,
    j.vacancies,
    c.company_id,
    c.company_name,
    c.industry,
    ec.minimum_cgpa,
    ec.maximum_backlogs,
    ec.minimum_tenth_percentage,
    ec.minimum_twelfth_percentage,
    ec.graduation_year AS target_batch,
    COUNT(app.application_id) AS total_applicants
FROM PLACEMENT_DRIVE pd
JOIN JOB j ON pd.job_id = j.job_id
JOIN COMPANY c ON j.company_id = c.company_id
LEFT JOIN ELIGIBILITY_CRITERIA ec ON pd.drive_id = ec.drive_id
LEFT JOIN APPLICATION app ON pd.drive_id = app.drive_id
GROUP BY 
    pd.drive_id, pd.drive_date, pd.application_deadline, pd.status,
    j.job_id, j.job_title, j.package, j.job_location, j.vacancies,
    c.company_id, c.company_name, c.industry,
    ec.minimum_cgpa, ec.maximum_backlogs, ec.minimum_tenth_percentage,
    ec.minimum_twelfth_percentage, ec.graduation_year;

-- --------------------------------------------------------------------
-- 3. View: student_applications_view
-- Description: Provides end-to-end trace of student submissions,
--              including job specifics and live recruitment status.
-- --------------------------------------------------------------------
CREATE VIEW student_applications_view AS
SELECT 
    a.application_id,
    a.student_id,
    s.name AS student_name,
    s.email AS student_email,
    dept.department_name,
    a.drive_id,
    c.company_name,
    j.job_title,
    j.package AS package_lpa,
    pd.drive_date,
    pd.status AS drive_status,
    a.application_date,
    a.status AS application_status
FROM APPLICATION a
JOIN STUDENT s ON a.student_id = s.student_id
JOIN DEPARTMENT dept ON s.department_id = dept.department_id
JOIN PLACEMENT_DRIVE pd ON a.drive_id = pd.drive_id
JOIN JOB j ON pd.job_id = j.job_id
JOIN COMPANY c ON j.company_id = c.company_id;
