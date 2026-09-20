-- ====================================================================
-- COLLEGE PLACEMENT MANAGEMENT SYSTEM
-- DBMS Practical SQL Queries (queries.sql)
-- Demonstrating DML, Joins, Aggregations, GROUP BY, HAVING, Subqueries
-- ====================================================================

USE college_placement;

-- ====================================================================
-- SECTION 1: BASIC DML OPERATIONS (SELECT, INSERT, UPDATE, DELETE)
-- ====================================================================

-- 1.1 SELECT: Fetch all active Open placement drives
SELECT drive_id, job_id, drive_date, application_deadline, status
FROM PLACEMENT_DRIVE
WHERE status = 'Open'
ORDER BY application_deadline ASC;

-- 1.2 INSERT: Register a new skill into the catalog
INSERT INTO SKILL (skill_name)
VALUES ('Kubernetes')
ON DUPLICATE KEY UPDATE skill_name = skill_name;

-- 1.3 UPDATE: Update a student's resume link and backlogs count
UPDATE STUDENT
SET backlogs = 0, resume = 'https://drive.google.com/file/d/sample_resume_updated/view'
WHERE student_id = 1;

-- 1.4 DELETE: Withdraw or delete an application in 'Applied' status
DELETE FROM APPLICATION
WHERE student_id = 1 AND drive_id = 99;


-- ====================================================================
-- SECTION 2: REQUIRED 10 ACADEMIC DBMS DEMONSTRATION QUERIES
-- ====================================================================

-- Query 1: Students with CGPA above 8.0
SELECT 
    s.student_id,
    s.name,
    s.email,
    d.department_name,
    s.cgpa,
    s.backlogs,
    s.graduation_year
FROM STUDENT s
JOIN DEPARTMENT d ON s.department_id = d.department_id
WHERE s.cgpa > 8.00
ORDER BY s.cgpa DESC;

-- Query 2: Students from a particular department (e.g. 'Computer Science & Engineering')
SELECT 
    s.student_id,
    s.name,
    s.email,
    s.phone,
    s.cgpa,
    s.graduation_year
FROM STUDENT s
JOIN DEPARTMENT d ON s.department_id = d.department_id
WHERE d.department_name = 'Computer Science & Engineering'
ORDER BY s.name ASC;

-- Query 3: Companies offering packages above 10 LPA (Lakhs Per Annum)
SELECT DISTINCT 
    c.company_id,
    c.company_name,
    c.industry,
    c.location,
    j.job_title,
    j.package AS package_lpa
FROM COMPANY c
JOIN JOB j ON c.company_id = j.company_id
WHERE j.package >= 10.00
ORDER BY j.package DESC;

-- Query 4: Number of students in each department (GROUP BY with COUNT)
SELECT 
    d.department_id,
    d.department_name,
    COUNT(s.student_id) AS total_students
FROM DEPARTMENT d
LEFT JOIN STUDENT s ON d.department_id = s.department_id
GROUP BY d.department_id, d.department_name
ORDER BY total_students DESC;

-- Query 5: Number of applications for each placement drive (LEFT JOIN with Aggregation)
SELECT 
    pd.drive_id,
    c.company_name,
    j.job_title,
    pd.drive_date,
    pd.status AS drive_status,
    COUNT(app.application_id) AS total_applications
FROM PLACEMENT_DRIVE pd
JOIN JOB j ON pd.job_id = j.job_id
JOIN COMPANY c ON j.company_id = c.company_id
LEFT JOIN APPLICATION app ON pd.drive_id = app.drive_id
GROUP BY pd.drive_id, c.company_name, j.job_title, pd.drive_date, pd.status
ORDER BY total_applications DESC;

-- Query 6: Students who applied to more than 3 drives (GROUP BY with HAVING filter)
SELECT 
    s.student_id,
    s.name,
    s.email,
    d.department_name,
    COUNT(a.application_id) AS drive_applications_count
FROM STUDENT s
JOIN DEPARTMENT d ON s.department_id = d.department_id
JOIN APPLICATION a ON s.student_id = a.student_id
GROUP BY s.student_id, s.name, s.email, d.department_name
HAVING COUNT(a.application_id) > 3
ORDER BY drive_applications_count DESC;

-- Query 7: Students who have NEVER applied to any placement drive (Subquery / Anti-Join)
SELECT 
    s.student_id,
    s.name,
    s.email,
    d.department_name,
    s.cgpa,
    s.graduation_year
FROM STUDENT s
JOIN DEPARTMENT d ON s.department_id = d.department_id
LEFT JOIN APPLICATION a ON s.student_id = a.student_id
WHERE a.application_id IS NULL
ORDER BY s.cgpa DESC;

-- Query 8: Average CGPA by Department (AVG, MIN, MAX, standard metrics)
SELECT 
    d.department_name,
    COUNT(s.student_id) AS student_count,
    ROUND(AVG(s.cgpa), 2) AS average_cgpa,
    MIN(s.cgpa) AS lowest_cgpa,
    MAX(s.cgpa) AS highest_cgpa
FROM DEPARTMENT d
JOIN STUDENT s ON d.department_id = s.department_id
GROUP BY d.department_id, d.department_name
ORDER BY average_cgpa DESC;

-- Query 9: Highest package offered among all campus jobs
SELECT 
    j.job_id,
    j.job_title,
    j.package AS highest_package_lpa,
    c.company_name,
    c.industry,
    j.job_location,
    j.vacancies
FROM JOB j
JOIN COMPANY c ON j.company_id = c.company_id
WHERE j.package = (SELECT MAX(package) FROM JOB);

-- Query 10: Eligible students for a specific placement drive (e.g. Drive ID = 1)
SELECT 
    s.student_id,
    s.name AS student_name,
    s.email,
    d.department_name,
    s.cgpa,
    s.backlogs,
    s.tenth_percentage,
    s.twelfth_percentage,
    s.graduation_year,
    ec.minimum_cgpa AS req_cgpa,
    ec.maximum_backlogs AS max_backlogs_allowed
FROM STUDENT s
JOIN DEPARTMENT d ON s.department_id = d.department_id
CROSS JOIN ELIGIBILITY_CRITERIA ec
WHERE ec.drive_id = 1
  AND s.cgpa >= ec.minimum_cgpa
  AND s.backlogs <= ec.maximum_backlogs
  AND s.tenth_percentage >= ec.minimum_tenth_percentage
  AND s.twelfth_percentage >= ec.minimum_twelfth_percentage
  AND s.graduation_year = ec.graduation_year
ORDER BY s.cgpa DESC;


-- ====================================================================
-- SECTION 3: ADVANCED DBMS DEMONSTRATION QUERIES
-- ====================================================================

-- 3.1 Many-to-Many Skill Match Query:
-- Identify students possessing 'Python' and 'Machine Learning' with 'Advanced' proficiency
SELECT 
    s.student_id,
    s.name,
    s.email,
    d.department_name,
    GROUP_CONCAT(CONCAT(sk.skill_name, ' (', ss.proficiency, ')') SEPARATOR ', ') AS skills_profile
FROM STUDENT s
JOIN DEPARTMENT d ON s.department_id = d.department_id
JOIN STUDENT_SKILL ss ON s.student_id = ss.student_id
JOIN SKILL sk ON ss.skill_id = sk.skill_id
GROUP BY s.student_id, s.name, s.email, d.department_name
ORDER BY s.name ASC;

-- 3.2 Recruiter Pipeline Performance:
-- Status distribution of applicants per company
SELECT 
    c.company_name,
    j.job_title,
    a.status AS candidate_status,
    COUNT(a.application_id) AS count_in_status
FROM COMPANY c
JOIN JOB j ON c.company_id = j.company_id
JOIN PLACEMENT_DRIVE pd ON j.job_id = pd.job_id
JOIN APPLICATION a ON pd.drive_id = a.drive_id
GROUP BY c.company_name, j.job_title, a.status
ORDER BY c.company_name, a.status;
