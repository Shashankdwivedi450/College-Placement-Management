import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import {
  PlacementDrive,
  StudentProfile,
  Application,
  StudentSkill,
  EligibilityResult
} from '../types';
import {
  GraduationCap,
  Award,
  BookOpen,
  Calendar,
  Briefcase,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Plus,
  Trash2,
  ExternalLink,
  Edit3,
  Search,
  Filter,
  Check,
  Building2,
  Clock,
  Sparkles
} from 'lucide-react';

interface StudentDashboardProps {
  viewMode?: 'dashboard' | 'applications';
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({ viewMode = 'dashboard' }) => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<StudentProfile | null>(null);
  const [drives, setDrives] = useState<PlacementDrive[]>([]);
  const [myApplications, setMyApplications] = useState<Application[]>([]);
  const [loading, setLoading] = useState(true);

  // Search & Filter
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // Eligibility modal state
  const [activeDriveForEligibility, setActiveDriveForEligibility] = useState<PlacementDrive | null>(null);
  const [eligibilityResult, setEligibilityResult] = useState<EligibilityResult | null>(null);
  const [checkingEligibility, setCheckingEligibility] = useState(false);

  // Apply state
  const [applyingDriveId, setApplyingDriveId] = useState<number | null>(null);
  const [feedbackMessage, setFeedbackMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Add Skill modal state
  const [showAddSkillModal, setShowAddSkillModal] = useState(false);
  const [allSkills, setAllSkills] = useState<Array<{ skill_id: number; skill_name: string }>>([]);
  const [selectedSkillName, setSelectedSkillName] = useState('Docker');
  const [selectedProficiency, setSelectedProficiency] = useState<'Beginner' | 'Intermediate' | 'Advanced'>('Intermediate');

  // Edit Profile modal state
  const [showEditProfile, setShowEditProfile] = useState(false);
  const [editPhone, setEditPhone] = useState('');
  const [editResume, setEditResume] = useState('');

  const loadStudentData = async () => {
    if (!user?.id) return;
    setLoading(true);
    try {
      const studentId = user.id;
      const [profileData, drivesData, appsData, masterSkills] = await Promise.all([
        api.getStudentById(studentId),
        api.getDrives(),
        api.getStudentApplications(studentId),
        api.getSkills()
      ]);

      setProfile(profileData);
      setDrives(drivesData);
      setMyApplications(appsData);
      setAllSkills(masterSkills);
      setEditPhone(profileData.phone || '');
      setEditResume(profileData.resume || '');
    } catch (err: any) {
      console.error('Failed to load student dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStudentData();
  }, [user?.id]);

  // Handle checking eligibility via Stored Procedure
  const handleCheckEligibility = async (drive: PlacementDrive) => {
    if (!user?.id) return;
    setActiveDriveForEligibility(drive);
    setCheckingEligibility(true);
    setEligibilityResult(null);

    try {
      const result = await api.checkEligibility(user.id, drive.drive_id);
      setEligibilityResult(result);
    } catch (err: any) {
      setEligibilityResult({
        is_eligible: false,
        status: 'NOT ELIGIBLE',
        reason: err.message || 'Failed to execute eligibility procedure.'
      });
    } finally {
      setCheckingEligibility(false);
    }
  };

  // Handle applying to drive (calls workflow with transaction and triggers)
  const handleApply = async (driveId: number) => {
    setApplyingDriveId(driveId);
    setFeedbackMessage(null);

    try {
      const res = await api.applyToDrive(driveId, user?.id);
      setFeedbackMessage({ type: 'success', text: res.message });
      // Refresh applications and drives list
      await loadStudentData();
    } catch (err: any) {
      setFeedbackMessage({ type: 'error', text: err.message });
    } finally {
      setApplyingDriveId(null);
    }
  };

  // Handle adding skill
  const handleAddSkill = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id || !selectedSkillName) return;

    try {
      await api.addStudentSkill(user.id, {
        skill_name: selectedSkillName,
        proficiency: selectedProficiency
      });
      setShowAddSkillModal(false);
      await loadStudentData();
    } catch (err: any) {
      alert(err.message || 'Failed to add skill');
    }
  };

  // Handle removing skill
  const handleDeleteSkill = async (skillId: number) => {
    if (!user?.id) return;
    try {
      await api.deleteStudentSkill(user.id, skillId);
      await loadStudentData();
    } catch (err: any) {
      alert(err.message || 'Failed to delete skill');
    }
  };

  // Handle updating profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.id) return;

    try {
      await api.updateStudentProfile(user.id, {
        phone: editPhone,
        resume: editResume
      });
      setShowEditProfile(false);
      await loadStudentData();
    } catch (err: any) {
      alert(err.message || 'Failed to update profile');
    }
  };

  // Filter drives
  const filteredDrives = drives.filter(d => {
    const matchesSearch =
      (d.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (d.job_title?.toLowerCase().includes(searchTerm.toLowerCase()) || false) ||
      (d.job_location?.toLowerCase().includes(searchTerm.toLowerCase()) || false);

    const matchesStatus = statusFilter === 'All' || d.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesStatus;
  });

  const appliedDriveIds = new Set(myApplications.map(a => a.drive_id));

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm text-slate-500 font-medium">Loading Student Placement Portal & Database Records...</p>
      </div>
    );
  }

  // ------------------------------------------------------------------
  // VIEW: My Applications History
  // ------------------------------------------------------------------
  if (viewMode === 'applications') {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">My Placement Applications</h1>
            <p className="text-sm text-slate-500">Live submission records queried from APPLICATION table</p>
          </div>
          <div className="px-3.5 py-1.5 rounded-xl bg-blue-50 border border-blue-200 text-blue-800 text-xs font-semibold">
            Total Applications: {myApplications.length}
          </div>
        </div>

        {myApplications.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-slate-200 shadow-xs">
            <Briefcase className="w-12 h-12 text-slate-300 mx-auto mb-3" />
            <h3 className="text-base font-bold text-slate-800">No applications submitted yet</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
              Explore open placement drives on the portal, run stored procedure eligibility checks, and submit your application.
            </p>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 border-b border-slate-200 text-xs uppercase font-semibold text-slate-500 tracking-wider">
                  <tr>
                    <th className="px-6 py-3.5">Application ID</th>
                    <th className="px-6 py-3.5">Company & Role</th>
                    <th className="px-6 py-3.5">Package</th>
                    <th className="px-6 py-3.5">Date Applied</th>
                    <th className="px-6 py-3.5">Drive Status</th>
                    <th className="px-6 py-3.5">Current Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-normal">
                  {myApplications.map((app) => {
                    const statusColor =
                      app.status === 'Shortlisted'
                        ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                        : app.status === 'Eligible'
                        ? 'bg-blue-50 text-blue-700 border-blue-200'
                        : app.status === 'Rejected'
                        ? 'bg-rose-50 text-rose-700 border-rose-200'
                        : 'bg-amber-50 text-amber-700 border-amber-200';

                    return (
                      <tr key={app.application_id} className="hover:bg-slate-50/80 transition">
                        <td className="px-6 py-4 font-mono text-xs text-slate-500">
                          APP-#{app.application_id}
                        </td>
                        <td className="px-6 py-4">
                          <div className="font-semibold text-slate-900">{app.company_name}</div>
                          <div className="text-xs text-slate-500">{app.job_title}</div>
                        </td>
                        <td className="px-6 py-4 font-semibold text-slate-900">
                          ₹{app.package_lpa} LPA
                        </td>
                        <td className="px-6 py-4 text-xs text-slate-600 font-mono">
                          {app.application_date}
                        </td>
                        <td className="px-6 py-4 text-xs">
                          <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 font-medium">
                            {app.drive_status}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold border ${statusColor}`}>
                            {app.status === 'Shortlisted' && <Check className="w-3.5 h-3.5" />}
                            {app.status === 'Rejected' && <XCircle className="w-3.5 h-3.5" />}
                            {app.status}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    );
  }

  // ------------------------------------------------------------------
  // VIEW: Main Student Dashboard (Profile, Skills, Placement Drives)
  // ------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Toast Feedback Notification */}
      {feedbackMessage && (
        <div
          className={`p-4 rounded-xl text-sm font-medium flex items-center justify-between border shadow-sm ${
            feedbackMessage.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
              : 'bg-rose-50 border-rose-200 text-rose-800'
          }`}
        >
          <div className="flex items-center gap-2">
            {feedbackMessage.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
            ) : (
              <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
            )}
            <span>{feedbackMessage.text}</span>
          </div>
          <button
            onClick={() => setFeedbackMessage(null)}
            className="text-xs font-semibold underline ml-4 hover:opacity-80"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Top Academic Profile Card */}
      {profile && (
        <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-slate-100">
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-2xl bg-linear-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white text-2xl font-bold shadow-md ring-4 ring-blue-50">
                {profile.name.charAt(0)}
              </div>
              <div>
                <div className="flex flex-wrap items-center gap-2">
                  <h1 className="text-2xl font-bold text-slate-900 tracking-tight">{profile.name}</h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                    Graduation Batch {profile.graduation_year}
                  </span>
                </div>
                <p className="text-sm text-slate-500 mt-0.5 flex items-center gap-2">
                  <span>{profile.department_name}</span>
                  <span>•</span>
                  <span>{profile.email}</span>
                  <span>•</span>
                  <span>{profile.phone}</span>
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {profile.resume && (
                <a
                  href={profile.resume}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3.5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-semibold transition flex items-center gap-1.5 shadow-2xs"
                >
                  <ExternalLink className="w-3.5 h-3.5 text-slate-500" />
                  <span>View Resume</span>
                </a>
              )}
              <button
                onClick={() => setShowEditProfile(true)}
                className="px-3.5 py-2 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition flex items-center gap-1.5 shadow-xs"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit Contact</span>
              </button>
            </div>
          </div>

          {/* Academic Metrics Grid (Normalized Attributes from STUDENT) */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6">
            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Cumulative CGPA</div>
              <div className="text-2xl font-black text-slate-900 mt-1 flex items-baseline gap-1">
                <span>{profile.cgpa.toFixed(2)}</span>
                <span className="text-xs text-slate-400 font-normal">/ 10.0</span>
              </div>
              <div className="text-[11px] text-emerald-600 font-medium mt-0.5">Verified Academic Record</div>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Backlogs</div>
              <div className={`text-2xl font-black mt-1 ${profile.backlogs === 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                {profile.backlogs}
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">
                {profile.backlogs === 0 ? 'Zero Standing Backlogs' : 'Clearing Required'}
              </div>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">10th Grade Score</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {profile.tenth_percentage}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Secondary School Board</div>
            </div>

            <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-100">
              <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">12th Grade Score</div>
              <div className="text-2xl font-black text-slate-900 mt-1">
                {profile.twelfth_percentage}%
              </div>
              <div className="text-[11px] text-slate-500 mt-0.5">Higher Secondary Board</div>
            </div>
          </div>
        </div>
      )}

      {/* Technical Skills Section (STUDENT_SKILL Junction Table) */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-5 h-5 text-blue-600" />
              <span>Technical Skills Portfolio</span>
            </h3>
            <p className="text-xs text-slate-500">
              Decomposed into STUDENT_SKILL junction table with proficiency ratings (3NF compliance)
            </p>
          </div>
          <button
            onClick={() => setShowAddSkillModal(true)}
            className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-semibold transition flex items-center gap-1 border border-blue-200"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Skill</span>
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {profile?.skills && profile.skills.length > 0 ? (
            profile.skills.map((skill) => {
              const badgeColor =
                skill.proficiency === 'Advanced'
                  ? 'bg-purple-50 text-purple-700 border-purple-200'
                  : skill.proficiency === 'Intermediate'
                  ? 'bg-blue-50 text-blue-700 border-blue-200'
                  : 'bg-slate-100 text-slate-700 border-slate-200';

              return (
                <div
                  key={skill.skill_id}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium ${badgeColor}`}
                >
                  <span className="font-semibold">{skill.skill_name}</span>
                  <span className="text-[10px] opacity-75">({skill.proficiency})</span>
                  <button
                    onClick={() => handleDeleteSkill(skill.skill_id)}
                    className="ml-1 text-slate-400 hover:text-rose-600 transition"
                    title="Remove skill"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              );
            })
          ) : (
            <p className="text-xs text-slate-400 italic">No skills registered yet. Click &apos;Add Skill&apos; to append competencies.</p>
          )}
        </div>
      </div>

      {/* Placement Drives Explorer */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 tracking-tight">Active Placement Drives</h2>
            <p className="text-xs text-slate-500">
              Campus drives filtered from PLACEMENT_DRIVE and ELIGIBILITY_CRITERIA
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search company or role..."
                className="pl-9 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 w-48 sm:w-64"
              />
            </div>

            {/* Status Filter */}
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-1.5 bg-white border border-slate-200 rounded-lg text-xs font-medium text-slate-700"
            >
              <option value="All">All Statuses</option>
              <option value="Open">Open Only</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Closed">Closed</option>
            </select>
          </div>
        </div>

        {/* Drives List */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredDrives.map((drive) => {
            const hasApplied = appliedDriveIds.has(drive.drive_id);
            const isDeadlinePassed = new Date().toISOString().split('T')[0] > drive.application_deadline;
            const isOpen = drive.status === 'Open';

            return (
              <div
                key={drive.drive_id}
                className="bg-white rounded-2xl border border-slate-200/90 shadow-xs hover:shadow-md transition flex flex-col justify-between overflow-hidden"
              >
                <div className="p-5 space-y-4">
                  {/* Top Company & Status */}
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">
                        {drive.company_industry}
                      </span>
                      <h3 className="text-lg font-bold text-slate-900 mt-0.5">{drive.company_name}</h3>
                      <p className="text-xs text-slate-500">{drive.job_location}</p>
                    </div>

                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                        drive.status === 'Open'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : drive.status === 'Upcoming'
                          ? 'bg-sky-50 text-sky-700 border-sky-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {drive.status}
                    </span>
                  </div>

                  {/* Job Title & Package */}
                  <div className="bg-slate-50/70 p-3 rounded-xl border border-slate-100">
                    <div className="text-xs text-slate-500 font-medium">Position Offered</div>
                    <div className="text-sm font-bold text-slate-900">{drive.job_title}</div>
                    <div className="text-base font-black text-blue-600 mt-1">
                      ₹{drive.package_lpa} LPA
                      <span className="text-xs text-slate-400 font-normal ml-1">({drive.vacancies} vacancies)</span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-1.5 text-xs text-slate-600">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Drive Date:</span>
                      <span className="font-semibold text-slate-800">{drive.drive_date}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400">Deadline:</span>
                      <span className={`font-semibold ${isDeadlinePassed ? 'text-rose-600' : 'text-slate-800'}`}>
                        {drive.application_deadline}
                      </span>
                    </div>
                  </div>

                  {/* Eligibility Cutoffs Preview */}
                  {drive.criteria && (
                    <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500 flex flex-wrap gap-x-3 gap-y-1">
                      <span>Min CGPA: <strong className="text-slate-700">{drive.criteria.minimum_cgpa.toFixed(2)}</strong></span>
                      <span>Max Backlogs: <strong className="text-slate-700">{drive.criteria.maximum_backlogs}</strong></span>
                      <span>Batch: <strong className="text-slate-700">{drive.criteria.graduation_year}</strong></span>
                    </div>
                  )}
                </div>

                {/* Card Action Footer */}
                <div className="p-4 bg-slate-50/70 border-t border-slate-100 flex items-center gap-2">
                  <button
                    onClick={() => handleCheckEligibility(drive)}
                    className="flex-1 py-2 px-3 rounded-xl bg-white border border-slate-200 text-slate-700 hover:bg-slate-100 text-xs font-semibold transition flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                    <span>Check Eligibility</span>
                  </button>

                  {hasApplied ? (
                    <span className="px-3 py-2 rounded-xl bg-emerald-100 text-emerald-800 text-xs font-bold flex items-center gap-1">
                      <Check className="w-3.5 h-3.5" />
                      Applied
                    </span>
                  ) : (
                    <button
                      onClick={() => handleApply(drive.drive_id)}
                      disabled={!isOpen || isDeadlinePassed || applyingDriveId === drive.drive_id}
                      className="py-2 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold transition shadow-xs disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      {applyingDriveId === drive.drive_id
                        ? 'Applying...'
                        : isDeadlinePassed
                        ? 'Closed'
                        : 'Apply Now'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================================================================= */}
      {/* ELIGIBILITY RESULT MODAL (Stored Procedure checkStudentEligibility) */}
      {/* ================================================================= */}
      {activeDriveForEligibility && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden">
            <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
              <div>
                <span className="text-[11px] font-mono uppercase tracking-wider text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200 font-bold">
                  Stored Procedure: checkStudentEligibility
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {activeDriveForEligibility.company_name} — {activeDriveForEligibility.job_title}
                </h3>
              </div>
              <button
                onClick={() => setActiveDriveForEligibility(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-4">
              {checkingEligibility ? (
                <div className="text-center py-6">
                  <div className="inline-block w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                  <p className="text-xs text-slate-500 mt-2 font-medium">Executing MySQL Stored Procedure...</p>
                </div>
              ) : eligibilityResult ? (
                <>
                  {/* Verdict Banner */}
                  <div
                    className={`p-4 rounded-xl border flex items-center gap-3 ${
                      eligibilityResult.is_eligible
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
                        : 'bg-rose-50 border-rose-200 text-rose-900'
                    }`}
                  >
                    {eligibilityResult.is_eligible ? (
                      <CheckCircle2 className="w-8 h-8 text-emerald-600 shrink-0" />
                    ) : (
                      <XCircle className="w-8 h-8 text-rose-600 shrink-0" />
                    )}
                    <div>
                      <div className="text-sm font-bold uppercase tracking-wider">
                        Verdict: {eligibilityResult.status}
                      </div>
                      <div className="text-xs mt-0.5 opacity-90">{eligibilityResult.reason}</div>
                    </div>
                  </div>

                  {/* Cutoff Checklist */}
                  {eligibilityResult.details && (
                    <div className="space-y-2 border border-slate-200 rounded-xl p-4 bg-slate-50/50">
                      <div className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">
                        Academic Validation Checklist
                      </div>

                      {/* CGPA */}
                      <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                        <span className="text-slate-600">CGPA Requirement</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">
                            {eligibilityResult.details.student_cgpa.toFixed(2)} / min {eligibilityResult.details.min_cgpa.toFixed(2)}
                          </span>
                          {eligibilityResult.details.student_cgpa >= eligibilityResult.details.min_cgpa ? (
                            <span className="text-emerald-600 font-bold">✓ PASS</span>
                          ) : (
                            <span className="text-rose-600 font-bold">✕ FAIL</span>
                          )}
                        </div>
                      </div>

                      {/* Backlogs */}
                      <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                        <span className="text-slate-600">Backlog Restriction</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">
                            {eligibilityResult.details.student_backlogs} / max {eligibilityResult.details.max_backlogs}
                          </span>
                          {eligibilityResult.details.student_backlogs <= eligibilityResult.details.max_backlogs ? (
                            <span className="text-emerald-600 font-bold">✓ PASS</span>
                          ) : (
                            <span className="text-rose-600 font-bold">✕ FAIL</span>
                          )}
                        </div>
                      </div>

                      {/* 10th */}
                      <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                        <span className="text-slate-600">10th Grade Percentage</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">
                            {eligibilityResult.details.student_tenth}% / min {eligibilityResult.details.min_tenth}%
                          </span>
                          {eligibilityResult.details.student_tenth >= eligibilityResult.details.min_tenth ? (
                            <span className="text-emerald-600 font-bold">✓ PASS</span>
                          ) : (
                            <span className="text-rose-600 font-bold">✕ FAIL</span>
                          )}
                        </div>
                      </div>

                      {/* 12th */}
                      <div className="flex items-center justify-between text-xs py-1 border-b border-slate-100">
                        <span className="text-slate-600">12th Grade Percentage</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">
                            {eligibilityResult.details.student_twelfth}% / min {eligibilityResult.details.min_twelfth}%
                          </span>
                          {eligibilityResult.details.student_twelfth >= eligibilityResult.details.min_twelfth ? (
                            <span className="text-emerald-600 font-bold">✓ PASS</span>
                          ) : (
                            <span className="text-rose-600 font-bold">✕ FAIL</span>
                          )}
                        </div>
                      </div>

                      {/* Year */}
                      <div className="flex items-center justify-between text-xs py-1">
                        <span className="text-slate-600">Graduation Year</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-medium">
                            {eligibilityResult.details.student_year} (Target: {eligibilityResult.details.req_year})
                          </span>
                          {eligibilityResult.details.student_year === eligibilityResult.details.req_year ? (
                            <span className="text-emerald-600 font-bold">✓ PASS</span>
                          ) : (
                            <span className="text-rose-600 font-bold">✕ FAIL</span>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Apply Action if eligible */}
                  <div className="flex items-center justify-end gap-2 pt-2">
                    <button
                      onClick={() => setActiveDriveForEligibility(null)}
                      className="px-4 py-2 rounded-lg border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                    >
                      Close
                    </button>
                    {eligibilityResult.is_eligible && (
                      <button
                        onClick={() => {
                          const dId = activeDriveForEligibility.drive_id;
                          setActiveDriveForEligibility(null);
                          handleApply(dId);
                        }}
                        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs"
                      >
                        Proceed to Apply
                      </button>
                    )}
                  </div>
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}

      {/* Add Skill Modal */}
      {showAddSkillModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Add Technical Skill</h3>
              <button onClick={() => setShowAddSkillModal(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleAddSkill} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Select Skill</label>
                <input
                  type="text"
                  list="skills-list"
                  required
                  value={selectedSkillName}
                  onChange={(e) => setSelectedSkillName(e.target.value)}
                  placeholder="e.g., Docker, Kubernetes, React"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
                <datalist id="skills-list">
                  {allSkills.map(k => (
                    <option key={k.skill_id} value={k.skill_name} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Proficiency Level</label>
                <select
                  value={selectedProficiency}
                  onChange={(e) => setSelectedProficiency(e.target.value as any)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs mt-2"
              >
                Save Skill to Profile
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Edit Profile Modal */}
      {showEditProfile && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-100 max-w-sm w-full p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-slate-900">Update Contact & Resume</h3>
              <button onClick={() => setShowEditProfile(false)} className="text-slate-400 hover:text-slate-600">✕</button>
            </div>

            <form onSubmit={handleSaveProfile} className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  value={editPhone}
                  onChange={(e) => setEditPhone(e.target.value)}
                  placeholder="+91 9876543201"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Resume Link (URL)</label>
                <input
                  type="url"
                  value={editResume}
                  onChange={(e) => setEditResume(e.target.value)}
                  placeholder="https://drive.google.com/..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-lg shadow-xs mt-2"
              >
                Save Changes
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
