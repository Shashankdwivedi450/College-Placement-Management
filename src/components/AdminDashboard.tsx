import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { AdminStats, Company, Department, PlacementDrive } from '../types';
import {
  ShieldCheck,
  Users,
  Building2,
  Briefcase,
  Layers,
  GraduationCap,
  Plus,
  Trash2,
  Check,
  XCircle,
  ExternalLink,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

declare global {
  namespace JSX {
    interface IntrinsicElements {
      [elementName: string]: any;
    }
  }
}

export const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'companies' | 'students' | 'departments' | 'drives'>('overview');

  // Department modal state
  const [newDeptName, setNewDeptName] = useState('');
  const [showAddDeptModal, setShowAddDeptModal] = useState(false);

  // Student filter
  const [studentDeptFilter, setStudentDeptFilter] = useState<number | 'All'>('All');
  const [studentSearch, setStudentSearch] = useState('');

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, companiesData, studentsData, deptData, drivesData] = await Promise.all([
        api.getAdminStats(),
        api.getAdminCompanies(),
        api.getAdminStudents(),
        api.getDepartments(),
        api.getDrives()
      ]);

      setStats(statsData);
      setCompanies(companiesData);
      setStudents(studentsData);
      setDepartments(deptData);
      setDrives(drivesData);
    } catch (err: any) {
      console.error('Admin data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleApproval = async (companyId: number, currentStatus: boolean) => {
    try {
      const res = await api.approveCompany(companyId, !currentStatus);
      setNotification({ type: 'success', text: res.message });
      await loadAdminData();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
    }
  };

  const handleAddDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDeptName.trim()) return;
    try {
      await api.createDepartment(newDeptName.trim());
      setNewDeptName('');
      setShowAddDeptModal(false);
      setNotification({ type: 'success', text: 'Department added successfully' });
      await loadAdminData();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message });
    }
  };

  const handleDeleteDepartment = async (id: number) => {
    try {
      const res = await api.deleteDepartment(id);
      setNotification({ type: 'success', text: res.message });
      await loadAdminData();
    } catch (err: any) {
      // Catches Foreign Key constraint violation
      setNotification({ type: 'error', text: err.message });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm text-slate-500 font-medium">Loading Placement Cell Administrator Console...</p>
      </div>
    );
  }

  const filteredStudents = students.filter(s => {
    const matchesDept = studentDeptFilter === 'All' || s.department_id === Number(studentDeptFilter);
    const matchesSearch =
      s.name.toLowerCase().includes(studentSearch.toLowerCase()) ||
      s.email.toLowerCase().includes(studentSearch.toLowerCase());
    return matchesDept && matchesSearch;
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Notification */}
      {notification && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border shadow-sm ${
            notification.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <span>{notification.text}</span>
          <button onClick={() => setNotification(null)} className="text-xs underline ml-4">
            Dismiss
          </button>
        </div>
      )}

      {/* Admin Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-amber-600 flex items-center justify-center text-white text-2xl font-bold shadow-md ring-4 ring-amber-50">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Placement Cell Administration</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-100 text-amber-900 border border-amber-200">
                Superuser Access
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Comprehensive Institutional Database Control • Company Approvals, Student Records & Integrity Verification
            </p>
          </div>
        </div>

        <button
          onClick={() => setShowAddDeptModal(true)}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5 self-start md:self-auto"
        >
          <Plus className="w-4 h-4" />
          <span>Add Academic Department</span>
        </button>
      </div>

      {/* Primary KPI Metrics Grid */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Students</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total_students}</div>
            <div className="text-[11px] text-emerald-600 font-medium">Enrolled Candidates</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Avg CGPA</div>
            <div className="text-2xl font-black text-blue-600 mt-1">{stats.average_cgpa}</div>
            <div className="text-[11px] text-slate-500">Institutional Mean</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Companies</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total_companies}</div>
            <div className="text-[11px] text-purple-600 font-medium">{stats.approved_companies} Verified / {stats.pending_companies} Pending</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Campus Drives</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total_drives}</div>
            <div className="text-[11px] text-emerald-600 font-medium">{stats.open_drives} Active / Open</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Applications</div>
            <div className="text-2xl font-black text-slate-900 mt-1">{stats.total_applications}</div>
            <div className="text-[11px] text-slate-500">Processed Submissions</div>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-2xs">
            <div className="text-xs text-slate-500 font-semibold uppercase tracking-wider">Shortlisted</div>
            <div className="text-2xl font-black text-emerald-600 mt-1">{stats.shortlisted_count}</div>
            <div className="text-[11px] text-slate-500">Advanced to Interview</div>
          </div>
        </div>
      )}

      {/* Sub Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('overview')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'overview'
              ? 'bg-amber-50 text-amber-900 border border-amber-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Institutional Analytics
        </button>

        <button
          onClick={() => setActiveTab('companies')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'companies'
              ? 'bg-amber-50 text-amber-900 border border-amber-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Company Verification ({companies.filter(c => !c.approved).length} pending)
        </button>

        <button
          onClick={() => setActiveTab('students')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'students'
              ? 'bg-amber-50 text-amber-900 border border-amber-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Student Master Directory ({students.length})
        </button>

        <button
          onClick={() => setActiveTab('departments')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'departments'
              ? 'bg-amber-50 text-amber-900 border border-amber-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Departments & FK Constraints ({departments.length})
        </button>

        <button
          onClick={() => setActiveTab('drives')}
          className={`px-4 py-2 rounded-xl transition ${
            activeTab === 'drives'
              ? 'bg-amber-50 text-amber-900 border border-amber-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Campus Placement Drives ({drives.length})
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1. OVERVIEW & DEPARTMENT DISTRIBUTION */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 mb-4">Department Enrollment Breakdown (1:N Relationship)</h3>
            <div className="space-y-3">
              {stats.department_distribution.map((dept) => {
                const pct = stats.total_students > 0 ? (dept.student_count / stats.total_students) * 100 : 0;
                return (
                  <div key={dept.department_id} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>{dept.department_name}</span>
                      <span>{dept.student_count} students ({pct.toFixed(1)}%)</span>
                    </div>
                    <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-blue-600 rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. COMPANY VERIFICATION TAB */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'companies' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="p-4 bg-slate-50 border-b border-slate-200 text-xs text-slate-600">
            <strong>Database Trigger Enforcement:</strong> Unapproved companies cannot publish jobs or schedule placement drives (trg_before_job_insert). Toggle verification status below:
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Company Name</th>
                  <th className="px-6 py-3.5">Industry</th>
                  <th className="px-6 py-3.5">Location</th>
                  <th className="px-6 py-3.5">Official Email</th>
                  <th className="px-6 py-3.5">Active Jobs</th>
                  <th className="px-6 py-3.5">Verification</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal">
                {companies.map((c) => (
                  <tr key={c.company_id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-bold text-slate-900">{c.company_name}</td>
                    <td className="px-6 py-4 text-xs">{c.industry}</td>
                    <td className="px-6 py-4 text-xs">{c.location}</td>
                    <td className="px-6 py-4 text-xs font-mono">{c.email}</td>
                    <td className="px-6 py-4 text-xs font-bold">{c.jobs_count || 0}</td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                          c.approved
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                            : 'bg-amber-50 text-amber-700 border-amber-200'
                        }`}
                      >
                        {c.approved ? 'Approved ✓' : 'Pending Review'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleToggleApproval(c.company_id, c.approved)}
                        className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                          c.approved
                            ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                        }`}
                      >
                        {c.approved ? 'Revoke Approval' : 'Approve Partner'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3. STUDENT DIRECTORY TAB */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'students' && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs w-64"
                />
              </div>

              <select
                value={studentDeptFilter}
                onChange={(e) => setStudentDeptFilter(e.target.value === 'All' ? 'All' : Number(e.target.value))}
                className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium"
              >
                <option value="All">All Departments</option>
                {departments.map(d => (
                  <option key={d.department_id} value={d.department_id}>{d.department_name}</option>
                ))}
              </select>
            </div>

            <div className="text-xs text-slate-500">
              Showing {filteredStudents.length} of {students.length} students
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Student</th>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">CGPA</th>
                    <th className="px-6 py-3.5">10th / 12th %</th>
                    <th className="px-6 py-3.5">Backlogs</th>
                    <th className="px-6 py-3.5">Skills</th>
                    <th className="px-6 py-3.5">Applications</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal text-xs">
                  {filteredStudents.slice(0, 25).map((s) => (
                    <tr key={s.student_id} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-3.5 font-semibold text-slate-900">
                        <div>{s.name}</div>
                        <div className="text-[11px] text-slate-400 font-mono">{s.email}</div>
                      </td>
                      <td className="px-6 py-3.5">{s.department_name}</td>
                      <td className="px-6 py-3.5 font-mono font-bold text-slate-900">{s.cgpa.toFixed(2)}</td>
                      <td className="px-6 py-3.5 text-slate-500">{s.tenth_percentage}% / {s.twelfth_percentage}%</td>
                      <td className="px-6 py-3.5">
                        <span className={`px-2 py-0.5 rounded font-bold ${s.backlogs === 0 ? 'text-emerald-700 bg-emerald-50' : 'text-rose-700 bg-rose-50'}`}>
                          {s.backlogs}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {s.skills?.slice(0, 2).map((sk: string, idx: number) => (
                            <span key={idx} className="px-1.5 py-0.5 rounded bg-slate-100 text-[10px] text-slate-600">
                              {sk}
                            </span>
                          ))}
                        </div>
                      </td>
                      <td className="px-6 py-3.5 font-bold text-blue-600">{s.applications_count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 4. DEPARTMENTS & FK RESTRICT TAB */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'departments' && (
        <div className="space-y-4">
          <div className="bg-amber-50/80 p-4 rounded-xl border border-amber-200 text-xs text-amber-900">
            <strong>Foreign Key Referential Integrity (ON DELETE RESTRICT):</strong> Attempting to delete a department with active student enrollments triggers an explicit constraint violation error preventing orphan records.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div key={dept.department_id} className="bg-white p-5 rounded-2xl border border-slate-200 flex flex-col justify-between shadow-2xs">
                <div>
                  <span className="text-[11px] font-mono text-slate-400">DEPT-#{dept.department_id}</span>
                  <h4 className="font-bold text-slate-900 text-base mt-1">{dept.department_name}</h4>
                  <p className="text-xs text-slate-500 mt-2">
                    Enrolled Students: <strong className="text-slate-800">{dept.students_count || 0}</strong>
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <span className="text-[11px] text-slate-400">RESTRICT Protection</span>
                  <button
                    onClick={() => handleDeleteDepartment(dept.department_id)}
                    className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition"
                    title="Delete Department"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 5. CAMPUS DRIVES TAB */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'drives' && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-slate-600">
              <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                <tr>
                  <th className="px-6 py-3.5">Drive ID</th>
                  <th className="px-6 py-3.5">Company & Role</th>
                  <th className="px-6 py-3.5">Drive Date</th>
                  <th className="px-6 py-3.5">Deadline</th>
                  <th className="px-6 py-3.5">Cutoffs</th>
                  <th className="px-6 py-3.5">Applicants</th>
                  <th className="px-6 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 font-normal text-xs">
                {drives.map((d) => (
                  <tr key={d.drive_id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 font-mono font-bold text-slate-500">DRIVE-#{d.drive_id}</td>
                    <td className="px-6 py-4">
                      <div className="font-bold text-slate-900">{d.company_name}</div>
                      <div className="text-slate-500">{d.job_title}</div>
                    </td>
                    <td className="px-6 py-4 font-mono">{d.drive_date}</td>
                    <td className="px-6 py-4 font-mono">{d.application_deadline}</td>
                    <td className="px-6 py-4">
                      {d.criteria ? (
                        <span>CGPA &ge; {d.criteria.minimum_cgpa} | Backlogs &le; {d.criteria.maximum_backlogs}</span>
                      ) : 'N/A'}
                    </td>
                    <td className="px-6 py-4 font-bold text-blue-600">{d.total_applicants}</td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 rounded-full bg-slate-100 font-semibold text-slate-700">
                        {d.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add Department Modal */}
      {showAddDeptModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Add Academic Department</h3>
              <button onClick={() => setShowAddDeptModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddDepartment} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department Name</label>
                <input
                  type="text"
                  required
                  value={newDeptName}
                  onChange={(e) => setNewDeptName(e.target.value)}
                  placeholder="e.g., Artificial Intelligence & Data Science"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs mt-2"
              >
                Create Department Record
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
