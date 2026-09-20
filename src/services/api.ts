import {
  User,
  StudentProfile,
  Company,
  Job,
  PlacementDrive,
  Application,
  EligibilityResult,
  AdminStats,
  Department,
  DbmsQueryItem
} from '../types';

const BASE_URL = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('cpms_auth_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const headers = {
    'Content-Type': 'application/json',
    ...getAuthHeader(),
    ...(options.headers || {})
  };

  const response = await fetch(`${BASE_URL}${endpoint}`, {
    ...options,
    headers
  });

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message || data.reason || `Request failed with status ${response.status}`);
  }

  return data as T;
}

export const api = {
  // Auth
  login: (credentials: { email: string; password: string; role?: string }) =>
    request<{ token: string; user: User }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials)
    }),

  registerStudent: (data: any) =>
    request<{ token: string; user: User }>('/auth/register/student', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  registerCompany: (data: any) =>
    request<{ token: string; user: User }>('/auth/register/company', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  getCurrentUser: () => request<{ user: User }>('/auth/me'),

  // Students
  getStudents: (params?: { department_id?: number; min_cgpa?: number }) => {
    const query = new URLSearchParams();
    if (params?.department_id) query.append('department_id', params.department_id.toString());
    if (params?.min_cgpa) query.append('min_cgpa', params.min_cgpa.toString());
    return request<StudentProfile[]>(`/students?${query.toString()}`);
  },

  getStudentById: (id: number) => request<StudentProfile>(`/students/${id}`),

  updateStudentProfile: (id: number, data: Partial<StudentProfile>) =>
    request<{ message: string; student: StudentProfile }>(`/students/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  getStudentSkills: (id: number) => request<any[]>(`/students/${id}/skills`),

  addStudentSkill: (studentId: number, data: { skill_id?: number; skill_name?: string; proficiency: string }) =>
    request<{ message: string; record: any }>(`/students/${studentId}/skills`, {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  deleteStudentSkill: (studentId: number, skillId: number) =>
    request<{ message: string }>(`/students/${studentId}/skills/${skillId}`, {
      method: 'DELETE'
    }),

  // Skills master
  getSkills: () => request<Array<{ skill_id: number; skill_name: string }>>('/skills'),

  // Companies
  getCompanies: (approvedOnly = false) =>
    request<Company[]>(`/companies?approved=${approvedOnly}`),

  getCompanyById: (id: number) => request<Company>(`/companies/${id}`),

  updateCompany: (id: number, data: Partial<Company>) =>
    request<{ message: string; company: Company }>(`/companies/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  // Jobs
  getJobs: (companyId?: number) => {
    const query = companyId ? `?company_id=${companyId}` : '';
    return request<Job[]>(`/jobs${query}`);
  },

  getJobById: (id: number) => request<Job>(`/jobs/${id}`),

  createJob: (data: {
    company_id?: number;
    job_title: string;
    job_description: string;
    package: number;
    job_location: string;
    vacancies: number;
  }) =>
    request<{ message: string; job: Job }>('/jobs', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  deleteJob: (id: number) =>
    request<{ message: string }>(`/jobs/${id}`, {
      method: 'DELETE'
    }),

  // Drives
  getDrives: (status?: string, companyId?: number) => {
    const query = new URLSearchParams();
    if (status) query.append('status', status);
    if (companyId) query.append('company_id', companyId.toString());
    return request<PlacementDrive[]>(`/drives?${query.toString()}`);
  },

  getDriveById: (id: number) => request<PlacementDrive>(`/drives/${id}`),

  createDrive: (data: {
    job_id: number;
    drive_date: string;
    application_deadline: string;
    status: string;
    minimum_cgpa: number;
    maximum_backlogs: number;
    minimum_tenth_percentage: number;
    minimum_twelfth_percentage: number;
    graduation_year: number;
  }) =>
    request<{ message: string; drive: PlacementDrive; criteria: any }>('/drives', {
      method: 'POST',
      body: JSON.stringify(data)
    }),

  updateDrive: (id: number, data: any) =>
    request<{ message: string; drive: PlacementDrive }>(`/drives/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    }),

  deleteDrive: (id: number) =>
    request<{ message: string }>(`/drives/${id}`, {
      method: 'DELETE'
    }),

  // Eligibility (Stored Procedure)
  checkEligibility: (studentId: number, driveId: number) =>
    request<EligibilityResult>(`/eligibility/student/${studentId}/drive/${driveId}`),

  getEligibleView: (driveId?: number) => {
    const query = driveId ? `?drive_id=${driveId}` : '';
    return request<{ view_name: string; total_eligible_candidates: number; data: any[] }>(
      `/eligibility/view${query}`
    );
  },

  // Applications
  applyToDrive: (driveId: number, studentId?: number) =>
    request<{ message: string; application_id: number; status: string }>('/applications', {
      method: 'POST',
      body: JSON.stringify({ drive_id: driveId, student_id: studentId })
    }),

  getStudentApplications: (studentId: number) =>
    request<Application[]>(`/applications/student/${studentId}`),

  getDriveApplications: (driveId: number) =>
    request<Application[]>(`/applications/drive/${driveId}`),

  updateApplicationStatus: (applicationId: number, status: string) =>
    request<{ message: string; application: Application }>(`/applications/${applicationId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status })
    }),

  // Admin
  getAdminStats: () => request<AdminStats>('/admin/stats'),

  getAdminStudents: () => request<any[]>('/admin/students'),

  getAdminCompanies: () => request<Company[]>('/admin/companies'),

  approveCompany: (companyId: number, approved: boolean) =>
    request<{ message: string; company: Company }>(`/admin/companies/${companyId}/approve`, {
      method: 'PUT',
      body: JSON.stringify({ approved })
    }),

  getDepartments: () => request<Department[]>('/admin/departments'),

  createDepartment: (name: string) =>
    request<{ message: string; department: Department }>('/admin/departments', {
      method: 'POST',
      body: JSON.stringify({ department_name: name })
    }),

  deleteDepartment: (id: number) =>
    request<{ message: string }>(`/admin/departments/${id}`, {
      method: 'DELETE'
    }),

  // DBMS Laboratory
  getDbmsQueries: () => request<DbmsQueryItem[]>('/dbms/queries'),

  executeDbmsQuery: (queryId: string) =>
    request<{
      query_id: string;
      columns: string[];
      rows: any[];
      row_count: number;
      execution_time_ms: number;
      message: string;
    }>('/dbms/execute', {
      method: 'POST',
      body: JSON.stringify({ query_id: queryId })
    }),

  getDbmsTables: () =>
    request<{ database: string; status: string; tables: Array<{ name: string; count: number }> }>(
      '/dbms/tables'
    )
};
