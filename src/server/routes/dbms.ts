import { Router, Request, Response } from 'express';
import { memoryDb } from '../db';

const router = Router();

// Catalog of the 10 key DBMS demonstration queries
const DBMS_QUERIES = [
  {
    id: 'query_1',
    title: '1. Basic Filter Query: High Achiever Students (CGPA > 8.0)',
    category: 'Filtering & Projection',
    sql: `SELECT student_id, name, email, cgpa, graduation_year, backlogs
FROM STUDENT
WHERE cgpa > 8.00 AND backlogs = 0
ORDER BY cgpa DESC;`,
    description: 'Retrieves students who maintain a distinction CGPA above 8.0 without any historical active backlogs.'
  },
  {
    id: 'query_2',
    title: '2. Multi-Table JOIN: Students with Departments and Skills',
    category: 'Relational JOINs (1:N & M:N)',
    sql: `SELECT s.student_id, s.name AS student_name, d.department_name,
       sk.skill_name, ss.proficiency
FROM STUDENT s
JOIN DEPARTMENT d ON s.department_id = d.department_id
JOIN STUDENT_SKILL ss ON s.student_id = ss.student_id
JOIN SKILL sk ON ss.skill_id = sk.skill_id
WHERE ss.proficiency = 'Advanced'
ORDER BY s.student_id LIMIT 25;`,
    description: 'Combines STUDENT, DEPARTMENT, STUDENT_SKILL, and SKILL to identify advanced skill competencies across academic departments.'
  },
  {
    id: 'query_3',
    title: '3. Aggregation & Grouping: Department-Wise CGPA Analytics',
    category: 'GROUP BY & Aggregation',
    sql: `SELECT d.department_id, d.department_name,
       COUNT(s.student_id) AS total_enrolled,
       ROUND(AVG(s.cgpa), 2) AS average_cgpa,
       MAX(s.cgpa) AS highest_cgpa,
       MIN(s.cgpa) AS lowest_cgpa
FROM DEPARTMENT d
LEFT JOIN STUDENT s ON d.department_id = s.department_id
GROUP BY d.department_id, d.department_name
ORDER BY average_cgpa DESC;`,
    description: 'Computes descriptive statistical aggregates per department using COUNT, AVG, MAX, and MIN.'
  },
  {
    id: 'query_4',
    title: '4. Correlated Subquery: Students Exceeding Department Average',
    category: 'Subqueries & Nested Filtering',
    sql: `SELECT s.student_id, s.name, s.cgpa, d.department_name
FROM STUDENT s
JOIN DEPARTMENT d ON s.department_id = d.department_id
WHERE s.cgpa > (
    SELECT AVG(sub.cgpa)
    FROM STUDENT sub
    WHERE sub.department_id = s.department_id
)
ORDER BY s.cgpa DESC;`,
    description: 'Identifies standout students whose academic performance exceeds the mean average of their own respective department.'
  },
  {
    id: 'query_5',
    title: '5. Corporate Portfolio: Companies, Job Openings & Package Spans',
    category: 'Complex Joins & Aggregates',
    sql: `SELECT c.company_id, c.company_name, c.industry, c.location,
       COUNT(j.job_id) AS total_job_postings,
       COALESCE(MAX(j.package), 0) AS max_package_lpa,
       COALESCE(SUM(j.vacancies), 0) AS total_vacancies
FROM COMPANY c
LEFT JOIN JOB j ON c.company_id = j.company_id
WHERE c.approved = TRUE
GROUP BY c.company_id, c.company_name, c.industry, c.location
ORDER BY max_package_lpa DESC;`,
    description: 'Compiles recruitment capacity per verified corporate partner with aggregated vacancy ceilings.'
  },
  {
    id: 'query_6',
    title: '6. Placement Drive Funnel: Applicant Volume & Selection Ratio',
    category: 'Application Lifecycle Analytics',
    sql: `SELECT pd.drive_id, j.job_title, c.company_name, pd.status AS drive_status,
       COUNT(a.application_id) AS total_applications,
       SUM(CASE WHEN a.status = 'Shortlisted' THEN 1 ELSE 0 END) AS shortlisted_count,
       SUM(CASE WHEN a.status = 'Rejected' THEN 1 ELSE 0 END) AS rejected_count
FROM PLACEMENT_DRIVE pd
JOIN JOB j ON pd.job_id = j.job_id
JOIN COMPANY c ON j.company_id = c.company_id
LEFT JOIN APPLICATION a ON pd.drive_id = a.drive_id
GROUP BY pd.drive_id, j.job_title, c.company_name, pd.status
ORDER BY total_applications DESC;`,
    description: 'Analyzes applicant progression and conversion rates across active campus drives.'
  },
  {
    id: 'query_7',
    title: '7. Relational VIEW: Eligible Candidates for Open Drives',
    category: 'Database Views',
    sql: `SELECT * FROM eligible_students_view
WHERE drive_status = 'Open'
ORDER BY package_lpa DESC, cgpa DESC
LIMIT 25;`,
    description: 'Queries the pre-compiled MySQL view eligible_students_view, eliminating redundant procedural execution.'
  },
  {
    id: 'query_8',
    title: '8. Stored Procedure: Academic Cutoff Validation Engine',
    category: 'Stored Procedures',
    sql: `CALL checkStudentEligibility(1, 1, @is_eligible, @reason);
SELECT @is_eligible AS is_eligible, @reason AS eligibility_verdict;`,
    description: 'Direct execution of checkStudentEligibility ensuring business logic is isolated within the database engine.'
  },
  {
    id: 'query_9',
    title: '9. Skills Matrix: High Demand Technical Competencies',
    category: 'Many-to-Many Aggregation',
    sql: `SELECT sk.skill_name,
       COUNT(ss.student_id) AS student_count,
       SUM(CASE WHEN ss.proficiency = 'Advanced' THEN 1 ELSE 0 END) AS advanced_experts
FROM SKILL sk
JOIN STUDENT_SKILL ss ON sk.skill_id = ss.skill_id
GROUP BY sk.skill_id, sk.skill_name
ORDER BY student_count DESC;`,
    description: 'Ranks the most prevalent and advanced technical proficiencies among registered candidates.'
  },
  {
    id: 'query_10',
    title: '10. Database Schema Catalog & Normalization State',
    category: 'Metadata & DBMS Integrity',
    sql: `SELECT table_name, table_rows, engine
FROM information_schema.tables
WHERE table_schema = 'college_placement';`,
    description: 'Inspects relational tables, row counts, and structural completeness conforming to 3NF architecture.'
  }
];

// GET /api/dbms/queries - Return query definitions
router.get('/queries', (req: Request, res: Response) => {
  return res.json(DBMS_QUERIES);
});

// POST /api/dbms/execute - Execute a designated query
router.post('/execute', (req: Request, res: Response) => {
  const { query_id } = req.body;
  const startTime = Date.now();

  let rows: any[] = [];
  let columns: string[] = [];
  let message = 'Executed successfully';

  switch (query_id) {
    case 'query_1': {
      // Students with CGPA > 8.0 and backlogs = 0
      rows = memoryDb.students
        .filter(s => s.cgpa > 8.0 && s.backlogs === 0)
        .sort((a, b) => b.cgpa - a.cgpa)
        .map(s => ({
          student_id: s.student_id,
          name: s.name,
          email: s.email,
          cgpa: s.cgpa,
          graduation_year: s.graduation_year,
          backlogs: s.backlogs
        }));
      columns = ['student_id', 'name', 'email', 'cgpa', 'graduation_year', 'backlogs'];
      break;
    }

    case 'query_2': {
      // Students with department and advanced skills
      const joined: any[] = [];
      memoryDb.students.forEach(s => {
        const dept = memoryDb.departments.find(d => d.department_id === s.department_id);
        const advSkills = memoryDb.studentSkills.filter(ss => ss.student_id === s.student_id && ss.proficiency === 'Advanced');
        advSkills.forEach(ss => {
          const sk = memoryDb.skills.find(k => k.skill_id === ss.skill_id);
          joined.push({
            student_id: s.student_id,
            student_name: s.name,
            department_name: dept?.department_name || 'N/A',
            skill_name: sk?.skill_name || 'N/A',
            proficiency: ss.proficiency
          });
        });
      });
      rows = joined.slice(0, 25);
      columns = ['student_id', 'student_name', 'department_name', 'skill_name', 'proficiency'];
      break;
    }

    case 'query_3': {
      // Department-wise stats
      rows = memoryDb.departments.map(d => {
        const dStudents = memoryDb.students.filter(s => s.department_id === d.department_id);
        const total = dStudents.length;
        const avg = total > 0 ? (dStudents.reduce((sum, s) => sum + s.cgpa, 0) / total).toFixed(2) : '0.00';
        const max = total > 0 ? Math.max(...dStudents.map(s => s.cgpa)).toFixed(2) : '0.00';
        const min = total > 0 ? Math.min(...dStudents.map(s => s.cgpa)).toFixed(2) : '0.00';
        return {
          department_id: d.department_id,
          department_name: d.department_name,
          total_enrolled: total,
          average_cgpa: Number(avg),
          highest_cgpa: Number(max),
          lowest_cgpa: Number(min)
        };
      }).sort((a, b) => b.average_cgpa - a.average_cgpa);
      columns = ['department_id', 'department_name', 'total_enrolled', 'average_cgpa', 'highest_cgpa', 'lowest_cgpa'];
      break;
    }

    case 'query_4': {
      // Correlated subquery: Students with CGPA > dept average
      const deptAverages: Record<number, number> = {};
      memoryDb.departments.forEach(d => {
        const dStudents = memoryDb.students.filter(s => s.department_id === d.department_id);
        deptAverages[d.department_id] = dStudents.length > 0
          ? dStudents.reduce((sum, s) => sum + s.cgpa, 0) / dStudents.length
          : 0;
      });

      rows = memoryDb.students
        .filter(s => s.cgpa > (deptAverages[s.department_id] || 0))
        .map(s => {
          const dept = memoryDb.departments.find(d => d.department_id === s.department_id);
          return {
            student_id: s.student_id,
            name: s.name,
            cgpa: s.cgpa,
            department_name: dept?.department_name || 'N/A',
            department_average: parseFloat(deptAverages[s.department_id].toFixed(2))
          };
        })
        .sort((a, b) => b.cgpa - a.cgpa);
      columns = ['student_id', 'name', 'cgpa', 'department_name', 'department_average'];
      break;
    }

    case 'query_5': {
      // Companies with job counts and vacancies
      rows = memoryDb.companies
        .filter(c => c.approved)
        .map(c => {
          const cJobs = memoryDb.jobs.filter(j => j.company_id === c.company_id);
          const maxPkg = cJobs.length > 0 ? Math.max(...cJobs.map(j => j.package)) : 0;
          const totalVac = cJobs.reduce((sum, j) => sum + j.vacancies, 0);
          return {
            company_id: c.company_id,
            company_name: c.company_name,
            industry: c.industry,
            location: c.location,
            total_job_postings: cJobs.length,
            max_package_lpa: maxPkg,
            total_vacancies: totalVac
          };
        })
        .sort((a, b) => b.max_package_lpa - a.max_package_lpa);
      columns = ['company_id', 'company_name', 'industry', 'location', 'total_job_postings', 'max_package_lpa', 'total_vacancies'];
      break;
    }

    case 'query_6': {
      // Drive funnel
      rows = memoryDb.drives.map(d => {
        const job = memoryDb.jobs.find(j => j.job_id === d.job_id);
        const company = job ? memoryDb.companies.find(c => c.company_id === job.company_id) : null;
        const apps = memoryDb.applications.filter(a => a.drive_id === d.drive_id);
        const shortlisted = apps.filter(a => a.status === 'Shortlisted').length;
        const rejected = apps.filter(a => a.status === 'Rejected').length;

        return {
          drive_id: d.drive_id,
          job_title: job?.job_title || 'N/A',
          company_name: company?.company_name || 'N/A',
          drive_status: d.status,
          total_applications: apps.length,
          shortlisted_count: shortlisted,
          rejected_count: rejected
        };
      }).sort((a, b) => b.total_applications - a.total_applications);
      columns = ['drive_id', 'job_title', 'company_name', 'drive_status', 'total_applications', 'shortlisted_count', 'rejected_count'];
      break;
    }

    case 'query_7': {
      // Eligible students view
      const viewData = memoryDb.getEligibleStudentsView();
      rows = viewData.slice(0, 25).map(r => ({
        student_name: r.student_name,
        department_name: r.department_name,
        cgpa: r.cgpa,
        company_name: r.company_name,
        job_title: r.job_title,
        package_lpa: r.package_lpa,
        drive_status: r.drive_status
      }));
      columns = ['student_name', 'department_name', 'cgpa', 'company_name', 'job_title', 'package_lpa', 'drive_status'];
      break;
    }

    case 'query_8': {
      // Stored Procedure test
      const testCheck = memoryDb.checkStudentEligibility(1, 1);
      rows = [{
        student_id: 1,
        student_name: 'Aarav Sharma',
        target_drive: 'Google India - Software Engineer (L3)',
        verdict: testCheck.status,
        is_eligible: testCheck.is_eligible ? 'TRUE' : 'FALSE',
        validation_message: testCheck.reason
      }];
      columns = ['student_id', 'student_name', 'target_drive', 'verdict', 'is_eligible', 'validation_message'];
      break;
    }

    case 'query_9': {
      // Skills matrix
      rows = memoryDb.skills.map(k => {
        const mappings = memoryDb.studentSkills.filter(ss => ss.skill_id === k.skill_id);
        const adv = mappings.filter(ss => ss.proficiency === 'Advanced').length;
        return {
          skill_name: k.skill_name,
          student_count: mappings.length,
          advanced_experts: adv
        };
      }).sort((a, b) => b.student_count - a.student_count);
      columns = ['skill_name', 'student_count', 'advanced_experts'];
      break;
    }

    case 'query_10': {
      // Database schema catalog
      rows = [
        { table_name: 'DEPARTMENT', primary_key: 'department_id', records_count: memoryDb.departments.length, normalization: '3NF (Factored)' },
        { table_name: 'STUDENT', primary_key: 'student_id', records_count: memoryDb.students.length, normalization: '3NF' },
        { table_name: 'SKILL', primary_key: 'skill_id', records_count: memoryDb.skills.length, normalization: '3NF (Catalog)' },
        { table_name: 'STUDENT_SKILL', primary_key: '(student_id, skill_id)', records_count: memoryDb.studentSkills.length, normalization: '3NF (Bridge table)' },
        { table_name: 'COMPANY', primary_key: 'company_id', records_count: memoryDb.companies.length, normalization: '3NF' },
        { table_name: 'JOB', primary_key: 'job_id', records_count: memoryDb.jobs.length, normalization: '3NF' },
        { table_name: 'PLACEMENT_DRIVE', primary_key: 'drive_id', records_count: memoryDb.drives.length, normalization: '3NF' },
        { table_name: 'ELIGIBILITY_CRITERIA', primary_key: 'criteria_id', records_count: memoryDb.criteria.length, normalization: '3NF (1:1 with drive)' },
        { table_name: 'APPLICATION', primary_key: 'application_id', records_count: memoryDb.applications.length, normalization: '3NF (Unique student, drive)' },
        { table_name: 'ADMIN', primary_key: 'admin_id', records_count: memoryDb.admins.length, normalization: '3NF' }
      ];
      columns = ['table_name', 'primary_key', 'records_count', 'normalization'];
      break;
    }

    default:
      return res.status(400).json({ message: 'Unknown query_id' });
  }

  const durationMs = Date.now() - startTime;

  return res.json({
    query_id,
    columns,
    rows,
    row_count: rows.length,
    execution_time_ms: durationMs,
    message
  });
});

// GET /api/dbms/tables - Row counts and statistics for all 10 tables
router.get('/tables', (req: Request, res: Response) => {
  return res.json({
    database: 'college_placement',
    status: 'online',
    tables: [
      { name: 'DEPARTMENT', count: memoryDb.departments.length },
      { name: 'STUDENT', count: memoryDb.students.length },
      { name: 'SKILL', count: memoryDb.skills.length },
      { name: 'STUDENT_SKILL', count: memoryDb.studentSkills.length },
      { name: 'COMPANY', count: memoryDb.companies.length },
      { name: 'JOB', count: memoryDb.jobs.length },
      { name: 'PLACEMENT_DRIVE', count: memoryDb.drives.length },
      { name: 'ELIGIBILITY_CRITERIA', count: memoryDb.criteria.length },
      { name: 'APPLICATION', count: memoryDb.applications.length },
      { name: 'ADMIN', count: memoryDb.admins.length }
    ]
  });
});

export default router;
