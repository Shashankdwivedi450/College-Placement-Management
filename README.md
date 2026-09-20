# College Placement Management System (CPMS)
### Full-Stack Database Management System (DBMS) Academic Project

A production-grade, full-stack **College Placement Management System** architected in **MySQL 8.0 (3NF Relational Schema)**, **Node.js/Express.js REST API**, and a modern **React.js Frontend**.

This project is built from the ground up to showcase rigorous DBMS principles: Third Normal Form (3NF) decomposition, stored procedures with input/output parameters, ACID-compliant transactions, integrity triggers, pre-computed views, and composite primary key junction tables.

---

## 1. Technology Stack

* **Frontend:** React 18, Tailwind CSS, Lucide Icons, Fetch/Axios HTTP client
* **Backend:** Node.js, Express.js (Modular Router Architecture)
* **Database:** MySQL 8.0 (InnoDB Engine with Foreign Key constraints) + Resilient In-Memory Hybrid Layer
* **Authentication:** JWT (JSON Web Tokens) with role-based access control (RBAC)
* **Security:** `bcrypt` password hashing (salt rounds: 10)
* **Architecture:** Client-Server decoupled REST API

---

## 2. Relational Database Architecture & 3NF Normalization

The database adheres strictly to **Third Normal Form (3NF)**:

| Table | Primary Key | Foreign Keys | Normalization & Role |
| :--- | :--- | :--- | :--- |
| `DEPARTMENT` | `department_id` | *None* | 3NF: Isolates academic department entities. Prevents update anomalies. |
| `USER` | `user_id` | *None* | 3NF: Stores core login credentials (`email`, `password_hash`, `role`). |
| `STUDENT` | `student_id` | `user_id`, `department_id` | 3NF: Eliminates transitive dependencies between student details and department names. |
| `SKILL` | `skill_id` | *None* | 3NF: Standardizes technical competencies (e.g. Java, Python, React). |
| `STUDENT_SKILL` | `(student_id, skill_id)` | `student_id`, `skill_id` | **1NF/BCNF**: Decomposes multi-valued skill attributes into a junction table with proficiency ratings. |
| `COMPANY` | `company_id` | `user_id` | 3NF: Stores recruiting organization attributes and administrative approval flag. |
| `JOB` | `job_id` | `company_id` | 3NF: Job postings with compensation (`package`), vacancies, and requirements. |
| `PLACEMENT_DRIVE` | `drive_id` | `job_id` | 3NF: Event scheduling for campus drives, dates, deadlines, and drive statuses. |
| `ELIGIBILITY_CRITERIA` | `criteria_id` | `drive_id` (UNIQUE) | 3NF: Strict 1-to-1 criteria mapping (minimum CGPA, max backlogs, 10th/12th percentages, graduation year). |
| `APPLICATION` | `application_id` | `student_id`, `drive_id` | 3NF: Candidate submissions with a UNIQUE composite constraint `(student_id, drive_id)` preventing duplicate submissions. |

### Normalization Defense Summary
1. **First Normal Form (1NF):** Every column holds atomic (indivisible) values. Multiple skills are decomposed into `STUDENT_SKILL` instead of comma-separated strings.
2. **Second Normal Form (2NF):** All tables are in 1NF and every non-prime attribute is fully functionally dependent on the entire primary key (no partial dependencies on composite keys).
3. **Third Normal Form (3NF):** Every non-prime attribute is non-transitively dependent on the primary key ($X \rightarrow Y$ and $Y \rightarrow Z$ is eliminated by separating departments into `DEPARTMENT`).

---

## 3. Stored Procedures, Views & Triggers

### Stored Procedures
1. **`checkStudentEligibility(IN p_student_id, IN p_drive_id, OUT p_is_eligible, OUT p_reason)`**
   * Atomically queries `STUDENT` and `ELIGIBILITY_CRITERIA`.
   * Evaluates CGPA cutoff, maximum standing backlogs, secondary (10th) and higher secondary (12th) percentages, and graduation batch.
   * Emits an explanatory diagnostic message and boolean outcome.
2. **`schedulePlacementDrive(...)`**
   * Executes within an ACID transaction (`START TRANSACTION`).
   * Validates company approval status before scheduling.
   * Atomically inserts into `PLACEMENT_DRIVE` and `ELIGIBILITY_CRITERIA` and executes `COMMIT` (or `ROLLBACK` on failure).

### Relational Views
* **`eligible_students_view`**: Pre-computes eligible students for every active placement drive using multi-table equi-joins. Provides rapid, indexed candidate discovery for recruiters without procedural overhead.

### Business Triggers
1. **`trg_before_job_insert`** (`BEFORE INSERT ON JOB`): Raises SQLSTATE `'45000'` if an unverified company attempts to post a job vacancy.
2. **`trg_check_application_deadline`** (`BEFORE INSERT ON APPLICATION`): Blocks applications if `CURDATE() > application_deadline` or drive status is not `'Open'`.
3. **`trg_enforce_single_application`** (`BEFORE INSERT ON APPLICATION`): Rejects duplicate applications for the same student and drive.

---

## 4. Default Demo Accounts

The database comes pre-seeded with sample records and bcrypt-hashed credentials:

| Role | Name / Organization | Email | Password | Academic Note |
| :--- | :--- | :--- | :--- | :--- |
| **Student** | Aarav Sharma | `student@example.com` | `Student@123` | CGPA: 8.85, CSE, 0 Backlogs (Eligible for all top tier drives) |
| **Recruiter** | Google India | `recruiter@example.com` | `Recruiter@123` | Verified Partner (Software Engineer & Cloud Architect drives) |
| **Admin** | Placement Cell | `admin@college.com` | `Admin@123` | Placement Director with complete institutional privileges |

---

## 5. Local Setup & Execution Guide (VS Code)

### Prerequisites
* **Node.js** v18.0 or higher
* **MySQL Server** v8.0 or higher (or MySQL Workbench / XAMPP / MariaDB)
* **VS Code** (recommended editor)

### Step 1: Clone or Open Project in VS Code
Open the project directory in VS Code:
```bash
cd college-placement-system
```

### Step 2: Set Up the MySQL Database
Log in to your MySQL terminal or open MySQL Workbench:
```bash
mysql -u root -p
```
Execute the database scripts in order:
```sql
SOURCE database/schema.sql;
SOURCE database/procedures.sql;
SOURCE database/triggers.sql;
SOURCE database/seed.sql;
```
Or execute the all-in-one setup command from your terminal:
```bash
mysql -u root -p < database/schema.sql
mysql -u root -p cpms_db < database/procedures.sql
mysql -u root -p cpms_db < database/triggers.sql
mysql -u root -p cpms_db < database/seed.sql
```

### Step 3: Configure Environment Variables
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
Update your MySQL credentials in `.env`:
```ini
PORT=3000
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=cpms_db
JWT_SECRET=cpms_academic_super_secret_jwt_key_2026
```

### Step 4: Install Dependencies & Run
```bash
npm install
npm run dev
```

The unified full-stack application will boot at **`http://localhost:3000`** with the Express API backend mounted alongside the Vite/React frontend!

---

## 6. REST API Endpoints Reference

### Authentication (`/api/auth`)
* `POST /api/auth/login` — Sign in and obtain JWT Bearer token
* `POST /api/auth/register/student` — Register student and profile
* `POST /api/auth/register/company` — Register recruiting organization
* `GET  /api/auth/me` — Retrieve current authenticated user profile

### Students (`/api/students`)
* `GET  /api/students` — Retrieve filtered student directory
* `GET  /api/students/:id` — Retrieve comprehensive student profile
* `PUT  /api/students/:id` — Update contact information & resume URL
* `GET  /api/students/:id/skills` — Retrieve student skills from junction table
* `POST /api/students/:id/skills` — Add skill with proficiency level
* `DELETE /api/students/:id/skills/:skillId` — Remove skill

### Companies & Jobs (`/api/companies`, `/api/jobs`)
* `GET  /api/companies` — Retrieve recruiting companies (with approval filter)
* `GET  /api/jobs` — Retrieve all job openings
* `POST /api/jobs` — Post job opening (enforces `trg_before_job_insert`)

### Placement Drives & Eligibility (`/api/drives`, `/api/eligibility`)
* `GET  /api/drives` — Retrieve active and upcoming drives
* `POST /api/drives` — Schedule placement drive and criteria (atomic transaction)
* `GET  /api/eligibility/student/:studentId/drive/:driveId` — Execute `checkStudentEligibility` procedure
* `GET  /api/eligibility/view` — Query `eligible_students_view`

### Applications (`/api/applications`)
* `POST /api/applications` — Submit application (enforces deadline & status triggers)
* `GET  /api/applications/student/:studentId` — Retrieve student applications
* `GET  /api/applications/drive/:driveId` — Retrieve applicants for a drive
* `PUT  /api/applications/:id/status` — Update candidate status (Shortlisted, Eligible, Rejected)

### Admin & DBMS Lab (`/api/admin`, `/api/dbms`)
* `GET  /api/admin/stats` — Institutional placement metrics and department distribution
* `PUT  /api/admin/companies/:id/approve` — Approve or revoke company recruiter
* `GET  /api/admin/departments` — List departments and student enrollment counts
* `POST /api/admin/departments` — Create new department
* `DELETE /api/admin/departments/:id` — Delete department (enforces `ON DELETE RESTRICT`)
* `GET  /api/dbms/queries` — Fetch 10 core SQL analytical queries
* `POST /api/dbms/execute` — Execute SQL query live and return tabular results

---

## 7. Viva & Academic Defense Q&A

**Q1: How is the database protected against orphan records?**
> Foreign Keys on `STUDENT.department_id` and `STUDENT.user_id` use `ON DELETE RESTRICT` and `ON DELETE CASCADE` respectively. Deleting an academic department with enrolled students is strictly blocked by the DBMS engine.

**Q2: Why is `STUDENT_SKILL` in BCNF/3NF?**
> A student can possess multiple skills, and a skill can be shared by multiple students ($M:N$ relationship). Placing a comma-separated list of skills inside `STUDENT` would violate First Normal Form (non-atomic attributes). We decomposed this into `SKILL` and `STUDENT_SKILL` with composite key `(student_id, skill_id)`.

**Q3: How does the eligibility check guarantee business logic integrity?**
> Rather than performing loose frontend validations, the core logic is embedded inside the MySQL stored procedure `checkStudentEligibility` and database triggers. Even if a client bypasses the UI, the database rejects invalid submissions.

---

## 8. License
Academic Project developed for Database Management Systems (DBMS) Laboratory Evaluation.
Released under the MIT License.
