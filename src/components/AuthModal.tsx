import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { X, Lock, Mail, User, Phone, Briefcase, GraduationCap, Building2 } from 'lucide-react';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({ isOpen, onClose }) => {
  const { login, registerStudent, registerCompany, quickDemoLogin } = useAuth();
  const [activeTab, setActiveTab] = useState<'login' | 'register_student' | 'register_company'>('login');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Login form state
  const [loginEmail, setLoginEmail] = useState('student@example.com');
  const [loginPassword, setLoginPassword] = useState('Student@123');

  // Student registration state
  const [studentData, setStudentData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    department_id: 1,
    graduation_year: 2026,
    cgpa: 8.5,
    tenth_percentage: 88.0,
    twelfth_percentage: 86.0,
    backlogs: 0,
    resume: ''
  });

  // Company registration state
  const [companyData, setCompanyData] = useState({
    company_name: '',
    industry: 'Software Engineering',
    location: 'Bengaluru, Karnataka',
    website: 'https://company.example.com',
    email: '',
    password: ''
  });

  if (!isOpen) return null;

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(loginEmail, loginPassword);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleStudentRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerStudent(studentData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  const handleCompanyRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await registerCompany(companyData);
      onClose();
    } catch (err: any) {
      setError(err.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-2xl border border-slate-100 max-w-lg w-full overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 bg-slate-50 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Placement Portal Access</h3>
            <p className="text-xs text-slate-500">Sign in with credentials or select a preloaded DBMS demo</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Selection */}
        <div className="grid grid-cols-3 bg-slate-100/80 p-1 m-6 mb-4 rounded-xl border border-slate-200/60 text-xs font-semibold text-slate-600">
          <button
            type="button"
            onClick={() => { setActiveTab('login'); setError(null); }}
            className={`py-2 rounded-lg transition ${activeTab === 'login' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register_student'); setError(null); }}
            className={`py-2 rounded-lg transition ${activeTab === 'register_student' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Student Sign Up
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab('register_company'); setError(null); }}
            className={`py-2 rounded-lg transition ${activeTab === 'register_company' ? 'bg-white text-slate-900 shadow-xs' : 'hover:text-slate-900'}`}
          >
            Recruiter Sign Up
          </button>
        </div>

        {error && (
          <div className="mx-6 mb-4 p-3 rounded-lg bg-rose-50 border border-rose-200 text-rose-700 text-xs">
            {error}
          </div>
        )}

        {/* Quick Demo Pre-fill Bar */}
        {activeTab === 'login' && (
          <div className="mx-6 mb-4 p-3 bg-blue-50/70 border border-blue-100 rounded-xl">
            <span className="block text-[11px] font-bold text-blue-900 uppercase tracking-wider mb-2">
              ⚡ Quick Fill Academic Demo Credentials
            </span>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('student@example.com');
                  setLoginPassword('Student@123');
                }}
                className="px-2 py-1.5 bg-white border border-blue-200 rounded-lg text-xs text-slate-800 hover:bg-blue-50 font-medium text-center truncate shadow-2xs"
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('recruiter@example.com');
                  setLoginPassword('Recruiter@123');
                }}
                className="px-2 py-1.5 bg-white border border-purple-200 rounded-lg text-xs text-slate-800 hover:bg-purple-50 font-medium text-center truncate shadow-2xs"
              >
                🏢 Recruiter
              </button>
              <button
                type="button"
                onClick={() => {
                  setLoginEmail('admin@college.com');
                  setLoginPassword('Admin@123');
                }}
                className="px-2 py-1.5 bg-white border border-amber-200 rounded-lg text-xs text-slate-800 hover:bg-amber-50 font-medium text-center truncate shadow-2xs"
              >
                🛡️ Admin
              </button>
            </div>
          </div>
        )}

        {/* 1. Login Form */}
        {activeTab === 'login' && (
          <form onSubmit={handleLoginSubmit} className="px-6 pb-6 space-y-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="email"
                  required
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="name@example.com"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  type="password"
                  required
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
                  placeholder="••••••••"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50 mt-2"
            >
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>
        )}

        {/* 2. Student Registration Form */}
        {activeTab === 'register_student' && (
          <form onSubmit={handleStudentRegisterSubmit} className="px-6 pb-6 space-y-3 max-h-[65vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Full Name</label>
              <input
                type="text"
                required
                value={studentData.name}
                onChange={(e) => setStudentData({ ...studentData, name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Priya Nair"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={studentData.email}
                  onChange={(e) => setStudentData({ ...studentData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="priya@college.edu"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Phone</label>
                <input
                  type="text"
                  required
                  value={studentData.phone}
                  onChange={(e) => setStudentData({ ...studentData, phone: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="+91 9876543210"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={studentData.password}
                onChange={(e) => setStudentData({ ...studentData, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Student@123"
              />
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Department</label>
                <select
                  value={studentData.department_id}
                  onChange={(e) => setStudentData({ ...studentData, department_id: Number(e.target.value) })}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                >
                  <option value={1}>CSE</option>
                  <option value={2}>IT</option>
                  <option value={3}>ECE</option>
                  <option value={4}>EEE</option>
                  <option value={5}>ME</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">CGPA (0-10)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  max="10"
                  required
                  value={studentData.cgpa}
                  onChange={(e) => setStudentData({ ...studentData, cgpa: parseFloat(e.target.value) })}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Backlogs</label>
                <input
                  type="number"
                  min="0"
                  required
                  value={studentData.backlogs}
                  onChange={(e) => setStudentData({ ...studentData, backlogs: parseInt(e.target.value, 10) })}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">10th Grade %</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={studentData.tenth_percentage}
                  onChange={(e) => setStudentData({ ...studentData, tenth_percentage: parseFloat(e.target.value) })}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">12th Grade %</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  max="100"
                  required
                  value={studentData.twelfth_percentage}
                  onChange={(e) => setStudentData({ ...studentData, twelfth_percentage: parseFloat(e.target.value) })}
                  className="w-full px-2 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Resume Link (URL)</label>
              <input
                type="url"
                value={studentData.resume}
                onChange={(e) => setStudentData({ ...studentData, resume: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="https://drive.google.com/your-resume.pdf"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50 mt-3"
            >
              {loading ? 'Creating Account...' : 'Complete Student Registration'}
            </button>
          </form>
        )}

        {/* 3. Company Registration Form */}
        {activeTab === 'register_company' && (
          <form onSubmit={handleCompanyRegisterSubmit} className="px-6 pb-6 space-y-3 max-h-[65vh] overflow-y-auto">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Company / Organization Name</label>
              <input
                type="text"
                required
                value={companyData.company_name}
                onChange={(e) => setCompanyData({ ...companyData, company_name: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="Acme Innovations Ltd."
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Industry Vertical</label>
              <input
                type="text"
                required
                value={companyData.industry}
                onChange={(e) => setCompanyData({ ...companyData, industry: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="Cloud Computing & AI"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Official Recruiter Email</label>
                <input
                  type="email"
                  required
                  value={companyData.email}
                  onChange={(e) => setCompanyData({ ...companyData, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="careers@acme.com"
                />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Headquarters Location</label>
                <input
                  type="text"
                  required
                  value={companyData.location}
                  onChange={(e) => setCompanyData({ ...companyData, location: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                  placeholder="Bengaluru, Karnataka"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Careers Website</label>
              <input
                type="url"
                value={companyData.website}
                onChange={(e) => setCompanyData({ ...companyData, website: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="https://acme.com/careers"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
              <input
                type="password"
                required
                value={companyData.password}
                onChange={(e) => setCompanyData({ ...companyData, password: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm"
                placeholder="Recruiter@123"
              />
            </div>

            <p className="text-[11px] text-amber-700 bg-amber-50 p-2.5 rounded-lg border border-amber-200">
              Note: As per Placement Cell policy (enforced via database trigger), new recruiters must be verified by the admin before job drives can be published.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-2.5 bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold rounded-lg shadow-sm transition disabled:opacity-50 mt-3"
            >
              {loading ? 'Submitting Application...' : 'Register Recruiting Organization'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};
