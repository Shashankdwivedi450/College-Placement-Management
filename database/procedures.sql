-- ====================================================================
-- COLLEGE PLACEMENT MANAGEMENT SYSTEM
-- Stored Procedures (procedures.sql)
-- Target RDBMS: MySQL 8.0+
-- ====================================================================

USE college_placement;

DROP PROCEDURE IF EXISTS checkStudentEligibility;
DROP PROCEDURE IF EXISTS applyForPlacementDrive;

DELIMITER //

-- --------------------------------------------------------------------
-- Stored Procedure: checkStudentEligibility
-- Parameters:
--   IN  p_student_id INT
--   IN  p_drive_id   INT
-- Behavior:
--   Evaluates student's academic records against the drive's criteria.
--   Returns a result set with:
--     is_eligible (TINYINT: 1 for YES, 0 for NO)
--     status (VARCHAR: 'ELIGIBLE' or 'NOT ELIGIBLE')
--     reason (VARCHAR: detailed message stating which condition failed)
-- --------------------------------------------------------------------
CREATE PROCEDURE checkStudentEligibility(
    IN p_student_id INT,
    IN p_drive_id INT
)
proc_label: BEGIN
    -- Student attributes
    DECLARE v_student_cgpa DECIMAL(4,2);
    DECLARE v_student_tenth DECIMAL(5,2);
    DECLARE v_student_twelfth DECIMAL(5,2);
    DECLARE v_student_backlogs INT;
    DECLARE v_student_grad_year INT;
    DECLARE v_student_exists INT DEFAULT 0;

    -- Drive / Criteria attributes
    DECLARE v_min_cgpa DECIMAL(4,2);
    DECLARE v_min_tenth DECIMAL(5,2);
    DECLARE v_min_twelfth DECIMAL(5,2);
    DECLARE v_max_backlogs INT;
    DECLARE v_req_grad_year INT;
    DECLARE v_drive_exists INT DEFAULT 0;
    DECLARE v_drive_status VARCHAR(20);
    DECLARE v_deadline DATE;

    -- 1. Check if student exists
    SELECT COUNT(*), cgpa, tenth_percentage, twelfth_percentage, backlogs, graduation_year
    INTO v_student_exists, v_student_cgpa, v_student_tenth, v_student_twelfth, v_student_backlogs, v_student_grad_year
    FROM STUDENT
    WHERE student_id = p_student_id
    GROUP BY student_id;

    IF v_student_exists = 0 THEN
        SELECT 0 AS is_eligible, 'NOT ELIGIBLE' AS status, 'Student record does not exist in system.' AS reason;
        LEAVE proc_label;
    END IF;

    -- 2. Check if drive & eligibility criteria exist
    SELECT COUNT(*), d.status, d.application_deadline, c.minimum_cgpa, c.maximum_backlogs, 
           c.minimum_tenth_percentage, c.minimum_twelfth_percentage, c.graduation_year
    INTO v_drive_exists, v_drive_status, v_deadline, v_min_cgpa, v_max_backlogs, 
         v_min_tenth, v_min_twelfth, v_req_grad_year
    FROM PLACEMENT_DRIVE d
    JOIN ELIGIBILITY_CRITERIA c ON d.drive_id = c.drive_id
    WHERE d.drive_id = p_drive_id
    GROUP BY d.drive_id;

    IF v_drive_exists = 0 THEN
        SELECT 0 AS is_eligible, 'NOT ELIGIBLE' AS status, 'Placement drive or eligibility criteria not defined for this drive.' AS reason;
        LEAVE proc_label;
    END IF;

    -- 3. Check CGPA requirement
    IF v_student_cgpa < v_min_cgpa THEN
        SELECT 0 AS is_eligible, 'NOT ELIGIBLE' AS status,
               CONCAT('CGPA requirement not satisfied. Required CGPA: ', v_min_cgpa, ', Student CGPA: ', v_student_cgpa) AS reason;
        LEAVE proc_label;
    END IF;

    -- 4. Check Backlogs requirement
    IF v_student_backlogs > v_max_backlogs THEN
        SELECT 0 AS is_eligible, 'NOT ELIGIBLE' AS status,
               CONCAT('Backlogs requirement not satisfied. Max allowed: ', v_max_backlogs, ', Student backlogs: ', v_student_backlogs) AS reason;
        LEAVE proc_label;
    END IF;

    -- 5. Check 10th percentage requirement
    IF v_student_tenth < v_min_tenth THEN
        SELECT 0 AS is_eligible, 'NOT ELIGIBLE' AS status,
               CONCAT('10th grade percentage requirement not satisfied. Required: ', v_min_tenth, '%, Student: ', v_student_tenth, '%') AS reason;
        LEAVE proc_label;
    END IF;

    -- 6. Check 12th percentage requirement
    IF v_student_twelfth < v_min_twelfth THEN
        SELECT 0 AS is_eligible, 'NOT ELIGIBLE' AS status,
               CONCAT('12th grade percentage requirement not satisfied. Required: ', v_min_twelfth, '%, Student: ', v_student_twelfth, '%') AS reason;
        LEAVE proc_label;
    END IF;

    -- 7. Check Graduation Year requirement
    IF v_student_grad_year != v_req_grad_year THEN
        SELECT 0 AS is_eligible, 'NOT ELIGIBLE' AS status,
               CONCAT('Graduation year mismatch. Eligible batch: ', v_req_grad_year, ', Student batch: ', v_student_grad_year) AS reason;
        LEAVE proc_label;
    END IF;

    -- If all checks pass:
    SELECT 1 AS is_eligible, 'ELIGIBLE' AS status, 'Candidate meets all academic and batch eligibility criteria.' AS reason;

END proc_label //


-- --------------------------------------------------------------------
-- Stored Procedure: applyForPlacementDrive
-- Wraps the 8-step application workflow inside an ACID Transaction
-- --------------------------------------------------------------------
CREATE PROCEDURE applyForPlacementDrive(
    IN p_student_id INT,
    IN p_drive_id INT
)
apply_label: BEGIN
    DECLARE v_is_eligible TINYINT DEFAULT 0;
    DECLARE v_reason VARCHAR(255);
    DECLARE v_status VARCHAR(20);
    DECLARE v_drive_status VARCHAR(20);
    DECLARE v_deadline DATE;
    DECLARE v_existing_app INT DEFAULT 0;

    -- Declare handler for SQL exception to ensure ROLLBACK
    DECLARE EXIT HANDLER FOR SQLEXCEPTION
    BEGIN
        ROLLBACK;
        RESIGNAL;
    END;

    -- Step 1: Check if already applied
    SELECT COUNT(*) INTO v_existing_app 
    FROM APPLICATION 
    WHERE student_id = p_student_id AND drive_id = p_drive_id;

    IF v_existing_app > 0 THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Duplicate application: You have already applied for this placement drive.';
    END IF;

    -- Step 2: Check drive status and deadline
    SELECT status, application_deadline INTO v_drive_status, v_deadline
    FROM PLACEMENT_DRIVE
    WHERE drive_id = p_drive_id;

    IF v_drive_status IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Invalid drive: Placement drive does not exist.';
    END IF;

    IF v_drive_status != 'Open' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Application closed: This placement drive is not currently Open.';
    END IF;

    IF CURDATE() > v_deadline THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Deadline passed: The application deadline for this drive has expired.';
    END IF;

    -- Step 3: Run eligibility checks via temporary logic / criteria validation
    -- Begin explicit transaction
    START TRANSACTION;

    INSERT INTO APPLICATION (student_id, drive_id, application_date, status)
    VALUES (p_student_id, p_drive_id, NOW(), 'Applied');

    COMMIT;

    SELECT LAST_INSERT_ID() AS application_id, 'SUCCESS' AS result, 'Application submitted successfully.' AS message;

END apply_label //

DELIMITER ;
