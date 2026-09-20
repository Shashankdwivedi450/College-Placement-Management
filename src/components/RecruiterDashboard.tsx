import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { Job, PlacementDrive, Application } from '../types';
import {
  Building2,
  Briefcase,
  Calendar,
  Users,
  Plus,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Filter,
  Check,
  Clock,
  Award
} from 'lucide-react';

export const RecruiterDashboard: React.FC = () => {
  const { user } = useAuth();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [selectedDriveId, setSelectedDriveId] = useState<number | null>(null);
  const [applicants, setApplicants] = useState<Application[]>([]);
  const [eligibleViewData, setEligibleViewData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSubTab, setActiveSubTab] = useState<'applicants' | 'jobs' | 'schedule' | 'eligible_view'>('applicants');

  // New Job Modal state
  const [showNewJobModal, setShowNewJobModal] = useState(false);
  const [newJobData, setNewJobData] = useState({
    job_title: '',
    job_description: '',
    package: 18.0,
    job_location: 'Bengaluru, Karnataka',
    vacancies: 5
  });

  // Schedule Drive Modal state
  const [showScheduleDriveModal, setShowScheduleDriveModal] = useState(false);
  const [newDriveData, setNewDriveData] = useState({
    job_id: 0,
    drive_date: '2026-11-20',
    application_deadline: '2026-11-10',
    status: 'Open',
    minimum_cgpa: 7.5,
    maximum_backlogs: 0,
    minimum_tenth_percentage: 75.0,
    minimum_twelfth_percentage: 75.0,
    graduation_year: 2026
  });

  const [notification, setNotification] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const loadRecruiterData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const companyId = user.company_id || user.id;
      const [jobsData, drivesData, eligibleView] = await Promise.all([
        api.getJobs(companyId),
        api.getDrives(undefined, companyId),
        api.getEligibleView()
      ]);

      setJobs(jobsData);
      setDrives(drivesData);
      setEligibleViewData(eligibleView.data || []);

      if (drivesData.length > 0) {
        const initialDriveId = selectedDriveId || drivesData[0].drive_id;
        setSelectedDriveId(initialDriveId);
        const apps = await api.getDriveApplications(initialDriveId);
        setApplicants(apps);
      }
    } catch (err: any) {
      console.error('Recruiter data load error:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecruiterData();
  }, [user?.id]);

  const handleSelectDrive = async (driveId: number) => {
    setSelectedDriveId(driveId);
    try {
      const apps = await api.getDriveApplications(driveId);
      setApplicants(apps);
    } catch (err: any) {
      console.error('Failed to load drive applicants:', err);
    }
  };

  const handleUpdateStatus = async (appId: number, newStatus: string) => {
    try {
      await api.updateApplicationStatus(appId, newStatus);
      setNotification({ type: 'success', text: `Candidate status updated to "${newStatus}"` });
      if (selectedDriveId) {
        const apps = await api.getDriveApplications(selectedDriveId);
        setApplicants(apps);
      }
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Status update failed' });
    }
  };

  const handleCreateJob = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    try {
      const companyId = user?.company_id || user?.id;
      const res = await api.createJob({
        ...newJobData,
        company_id: companyId
      });
      setShowNewJobModal(false);
      setNotification({ type: 'success', text: res.message });
      await loadRecruiterData();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Job creation failed' });
    }
  };

  const handleScheduleDrive = async (e: React.FormEvent) => {
    e.preventDefault();
    setNotification(null);
    try {
      const res = await api.createDrive(newDriveData);
      setShowScheduleDriveModal(false);
      setNotification({ type: 'success', text: res.message });
      await loadRecruiterData();
    } catch (err: any) {
      setNotification({ type: 'error', text: err.message || 'Drive scheduling failed' });
    }
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-purple-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm text-slate-500 font-medium">Loading Recruiter Management Console...</p>
      </div>
    );
  }

  const activeDrive = drives.find(d => d.drive_id === selectedDriveId);

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

      {/* Recruiter Header */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-purple-600 flex items-center justify-center text-white text-2xl font-bold shadow-md ring-4 ring-purple-50">
            <Building2 className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{user?.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1">
                <Check className="w-3 h-3" />
                Verified Corporate Partner
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Official Corporate Recruiter Console • Placement Drives & Candidate Pipeline
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowNewJobModal(true)}
            className="px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <Plus className="w-4 h-4" />
            <span>Post New Job</span>
          </button>
          <button
            onClick={() => {
              if (jobs.length > 0) {
                setNewDriveData(prev => ({ ...prev, job_id: jobs[0].job_id }));
              }
              setShowScheduleDriveModal(true);
            }}
            className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold shadow-xs transition flex items-center gap-1.5"
          >
            <Calendar className="w-4 h-4" />
            <span>Schedule Campus Drive</span>
          </button>
        </div>
      </div>

      {/* Recruiter Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveSubTab('applicants')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
            activeSubTab === 'applicants'
              ? 'bg-purple-50 text-purple-700 border border-purple-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Applicants Review Portal ({applicants.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('jobs')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
            activeSubTab === 'jobs'
              ? 'bg-purple-50 text-purple-700 border border-purple-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Briefcase className="w-4 h-4" />
          <span>Job Openings ({jobs.length})</span>
        </button>

        <button
          onClick={() => setActiveSubTab('eligible_view')}
          className={`px-4 py-2 rounded-xl text-sm font-semibold transition flex items-center gap-2 ${
            activeSubTab === 'eligible_view'
              ? 'bg-purple-50 text-purple-700 border border-purple-200'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Eligible Candidates View (MySQL View)</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1. APPLICANTS REVIEW TAB */}
      {/* ------------------------------------------------------------------ */}
      {activeSubTab === 'applicants' && (
        <div className="space-y-6">
          {/* Drive selector pills */}
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200 flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider mr-2">Select Drive:</span>
            {drives.map((d) => (
              <button
                key={d.drive_id}
                onClick={() => handleSelectDrive(d.drive_id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition ${
                  selectedDriveId === d.drive_id
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-100'
                }`}
              >
                {d.job_title} ({d.total_applicants} applicants)
              </button>
            ))}
          </div>

          {/* Drive info card */}
          {activeDrive && (
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex flex-wrap items-center justify-between gap-4 text-xs">
              <div className="flex items-center gap-4">
                <div>
                  <span className="text-slate-400">Position:</span>{' '}
                  <strong className="text-slate-800">{activeDrive.job_title}</strong>
                </div>
                <div>
                  <span className="text-slate-400">Compensation:</span>{' '}
                  <strong className="text-emerald-700">₹{activeDrive.package_lpa} LPA</strong>
                </div>
                <div>
                  <span className="text-slate-400">Drive Date:</span>{' '}
                  <strong className="text-slate-800">{activeDrive.drive_date}</strong>
                </div>
              </div>
              <div className="text-slate-500 font-mono">
                Criteria: CGPA &ge; {activeDrive.criteria?.minimum_cgpa} | Backlogs &le; {activeDrive.criteria?.maximum_backlogs}
              </div>
            </div>
          )}

          {/* Applicants Table */}
          {applicants.length === 0 ? (
            <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center">
              <Users className="w-12 h-12 text-slate-300 mx-auto mb-2" />
              <h3 className="text-sm font-bold text-slate-700">No applicants yet for this drive</h3>
              <p className="text-xs text-slate-400 mt-1">Eligible candidates can apply from the student portal.</p>
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-slate-600">
                  <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                    <tr>
                      <th className="px-6 py-3.5">Candidate</th>
                      <th className="px-6 py-3.5">Department</th>
                      <th className="px-6 py-3.5">CGPA / Backlogs</th>
                      <th className="px-6 py-3.5">Technical Skills</th>
                      <th className="px-6 py-3.5">Current Status</th>
                      <th className="px-6 py-3.5 text-right">Review Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-normal">
                    {applicants.map((app) => (
                      <tr key={app.application_id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{app.student_name}</div>
                          <div className="text-xs text-slate-400 font-mono">{app.student_email}</div>
                          {app.resume && (
                            <a
                              href={app.resume}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[11px] text-blue-600 hover:underline flex items-center gap-1 mt-0.5"
                            >
                              <ExternalLink className="w-3 h-3" />
                              View Resume
                            </a>
                          )}
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-slate-700">
                          {app.department_name}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-mono font-bold text-slate-900">{app.cgpa?.toFixed(2)}</div>
                          <div className="text-[11px] text-slate-400">
                            {app.backlogs === 0 ? '0 Backlogs' : `${app.backlogs} Backlog(s)`}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex flex-wrap gap-1 max-w-xs">
                            {app.skills?.slice(0, 3).map((sk, idx) => (
                              <span key={idx} className="px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-medium">
                                {sk}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span
                            className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold border ${
                              app.status === 'Shortlisted'
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : app.status === 'Eligible'
                                ? 'bg-blue-50 text-blue-700 border-blue-200'
                                : app.status === 'Rejected'
                                ? 'bg-rose-50 text-rose-700 border-rose-200'
                                : 'bg-amber-50 text-amber-700 border-amber-200'
                            }`}
                          >
                            {app.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-1">
                          <button
                            onClick={() => handleUpdateStatus(app.application_id, 'Shortlisted')}
                            className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition"
                          >
                            Shortlist
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.application_id, 'Eligible')}
                            className="px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition"
                          >
                            Eligible
                          </button>
                          <button
                            onClick={() => handleUpdateStatus(app.application_id, 'Rejected')}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 border border-rose-200 hover:bg-rose-100 text-rose-700 text-xs font-semibold transition"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. JOB OPENINGS TAB */}
      {/* ------------------------------------------------------------------ */}
      {activeSubTab === 'jobs' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {jobs.map((j) => (
            <div key={j.job_id} className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-bold text-slate-900 text-base">{j.job_title}</h3>
                  <p className="text-xs text-slate-500">{j.job_location}</p>
                </div>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-800 text-xs font-bold">
                  ₹{j.package} LPA
                </span>
              </div>

              <p className="text-xs text-slate-600 line-clamp-3">{j.job_description}</p>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                <span>Vacancies: <strong>{j.vacancies}</strong></span>
                <span className="font-mono">JOB-#{j.job_id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3. ELIGIBLE STUDENTS VIEW TAB (From MySQL View) */}
      {/* ------------------------------------------------------------------ */}
      {activeSubTab === 'eligible_view' && (
        <div className="space-y-4">
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 text-xs text-blue-900">
            <strong>Relational View: eligible_students_view</strong>
            <p className="mt-1">
              This data is queried in real-time from the database view. It matches student academic profiles against drive cutoffs without procedural overhead.
            </p>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500">
                  <tr>
                    <th className="px-6 py-3.5">Candidate Name</th>
                    <th className="px-6 py-3.5">Department</th>
                    <th className="px-6 py-3.5">CGPA</th>
                    <th className="px-6 py-3.5">Drive Role</th>
                    <th className="px-6 py-3.5">Min CGPA Required</th>
                    <th className="px-6 py-3.5">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {eligibleViewData.slice(0, 15).map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-50 transition">
                      <td className="px-6 py-3.5 font-semibold text-slate-900">{row.student_name}</td>
                      <td className="px-6 py-3.5 text-xs">{row.department_name}</td>
                      <td className="px-6 py-3.5 font-mono font-bold text-emerald-600">{row.cgpa}</td>
                      <td className="px-6 py-3.5 text-xs text-slate-800">{row.job_title}</td>
                      <td className="px-6 py-3.5 font-mono text-xs">{row.minimum_cgpa}</td>
                      <td className="px-6 py-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[11px] font-semibold">
                          Qualified View
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* New Job Modal */}
      {showNewJobModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Post New Job Opening</h3>
              <button onClick={() => setShowNewJobModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleCreateJob} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  value={newJobData.job_title}
                  onChange={(e) => setNewJobData({ ...newJobData, job_title: e.target.value })}
                  placeholder="e.g., Cloud Systems Architect"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Package (LPA)</label>
                  <input
                    type="number"
                    step="0.1"
                    min="0"
                    required
                    value={newJobData.package}
                    onChange={(e) => setNewJobData({ ...newJobData, package: parseFloat(e.target.value) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Vacancies</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newJobData.vacancies}
                    onChange={(e) => setNewJobData({ ...newJobData, vacancies: parseInt(e.target.value, 10) })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Location</label>
                <input
                  type="text"
                  required
                  value={newJobData.job_location}
                  onChange={(e) => setNewJobData({ ...newJobData, job_location: e.target.value })}
                  placeholder="Bengaluru, Karnataka"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Job Description</label>
                <textarea
                  rows={3}
                  required
                  value={newJobData.job_description}
                  onChange={(e) => setNewJobData({ ...newJobData, job_description: e.target.value })}
                  placeholder="Key responsibilities and skills required..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white font-semibold text-xs rounded-lg shadow-xs mt-2"
              >
                Publish Job Opening
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Schedule Drive Modal */}
      {showScheduleDriveModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-lg w-full p-6 space-y-4 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Schedule Campus Placement Drive</h3>
              <button onClick={() => setShowScheduleDriveModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleScheduleDrive} className="space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Job</label>
                <select
                  value={newDriveData.job_id}
                  onChange={(e) => setNewDriveData({ ...newDriveData, job_id: Number(e.target.value) })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                >
                  {jobs.map(j => (
                    <option key={j.job_id} value={j.job_id}>
                      {j.job_title} (₹{j.package} LPA)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Drive Date</label>
                  <input
                    type="date"
                    required
                    value={newDriveData.drive_date}
                    onChange={(e) => setNewDriveData({ ...newDriveData, drive_date: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Application Deadline</label>
                  <input
                    type="date"
                    required
                    value={newDriveData.application_deadline}
                    onChange={(e) => setNewDriveData({ ...newDriveData, application_deadline: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div className="pt-3 border-t border-slate-200">
                <span className="font-bold text-slate-900 block mb-2">1-to-1 Eligibility Criteria Definition</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Minimum CGPA</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="10"
                      value={newDriveData.minimum_cgpa}
                      onChange={(e) => setNewDriveData({ ...newDriveData, minimum_cgpa: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Max Allowed Backlogs</label>
                    <input
                      type="number"
                      min="0"
                      value={newDriveData.maximum_backlogs}
                      onChange={(e) => setNewDriveData({ ...newDriveData, maximum_backlogs: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Min 10th Grade %</label>
                    <input
                      type="number"
                      step="0.1"
                      value={newDriveData.minimum_tenth_percentage}
                      onChange={(e) => setNewDriveData({ ...newDriveData, minimum_tenth_percentage: parseFloat(e.target.value) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-slate-700 mb-1">Target Graduation Batch</label>
                    <input
                      type="number"
                      value={newDriveData.graduation_year}
                      onChange={(e) => setNewDriveData({ ...newDriveData, graduation_year: parseInt(e.target.value, 10) })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg shadow-xs mt-3"
              >
                Commit Drive & Eligibility Criteria (Transaction)
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
