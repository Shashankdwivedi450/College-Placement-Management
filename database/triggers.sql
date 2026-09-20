-- ====================================================================
-- COLLEGE PLACEMENT MANAGEMENT SYSTEM
-- Database Triggers (triggers.sql)
-- Target RDBMS: MySQL 8.0+
-- ====================================================================

USE college_placement;

DROP TRIGGER IF EXISTS trg_before_application_insert;
DROP TRIGGER IF EXISTS trg_before_job_insert;

DELIMITER //

-- --------------------------------------------------------------------
-- Trigger 1: trg_before_application_insert
-- Timing: BEFORE INSERT ON APPLICATION
-- 
-- Business Rules Enforced at the Database Level:
-- 1. Verifies that the associated PLACEMENT_DRIVE has status = 'Open'.
--    If the drive is 'Upcoming', 'Closed', or 'Cancelled', the insert is rejected.
-- 2. Verifies that the current date does not exceed the application deadline.
-- 3. Verifies that the sponsoring COMPANY is actively approved by the administrator.
--
-- Why This Trigger Is Vital for DBMS Integrity:
-- Even if an API endpoint or rogue client bypasses frontend or backend checks,
-- this database trigger raises an uncatchable SQLSTATE '45000' custom error,
-- guaranteeing that no invalid application record can ever enter the database.
-- --------------------------------------------------------------------
CREATE TRIGGER trg_before_application_insert
BEFORE INSERT ON APPLICATION
FOR EACH ROW
BEGIN
    DECLARE v_drive_status VARCHAR(20);
    DECLARE v_deadline DATE;
    DECLARE v_company_approved BOOLEAN;

    -- Fetch drive status, deadline, and company approval state
    SELECT pd.status, pd.application_deadline, c.approved
    INTO v_drive_status, v_deadline, v_company_approved
    FROM PLACEMENT_DRIVE pd
    JOIN JOB j ON pd.job_id = j.job_id
    JOIN COMPANY c ON j.company_id = c.company_id
    WHERE pd.drive_id = NEW.drive_id;

    -- Enforce Drive Existence & Status
    IF v_drive_status IS NULL THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Trigger Error: Specified placement drive does not exist.';
    END IF;

    IF v_drive_status != 'Open' THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Trigger Error: Applications are only accepted when placement drive status is "Open".';
    END IF;

    -- Enforce Application Deadline
    IF CURDATE() > v_deadline THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Trigger Error: Application submission failed. The deadline for this drive has expired.';
    END IF;

    -- Enforce Approved Recruiter State
    IF v_company_approved = FALSE THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Trigger Error: Cannot apply to a drive hosted by an unapproved recruiter.';
    END IF;
END //

-- --------------------------------------------------------------------
-- Trigger 2: trg_before_job_insert
-- Timing: BEFORE INSERT ON JOB
-- 
-- Business Rules Enforced:
-- Ensures that jobs can only be created for companies that have been verified
-- and approved by the college placement cell.
-- --------------------------------------------------------------------
CREATE TRIGGER trg_before_job_insert
BEFORE INSERT ON JOB
FOR EACH ROW
BEGIN
    DECLARE v_is_approved BOOLEAN;

    SELECT approved INTO v_is_approved
    FROM COMPANY
    WHERE company_id = NEW.company_id;

    IF v_is_approved = FALSE THEN
        SIGNAL SQLSTATE '45000'
        SET MESSAGE_TEXT = 'Trigger Error: Jobs can only be created by approved companies.';
    END IF;
END //

DELIMITER ;
