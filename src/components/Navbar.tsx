import React from 'react';
import { useAuth } from '../context/AuthContext';
import {
  GraduationCap,
  Building2,
  ShieldCheck,
  Database,
  Briefcase,
  LogOut,
  User as UserIcon,
  ChevronRight,
  Layers
} from 'lucide-react';

interface NavbarProps {
  currentTab: string;
  setCurrentTab: (tab: string) => void;
  onOpenAuth: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ currentTab, setCurrentTab, onOpenAuth }) => {
  const { user, logout, quickDemoLogin } = useAuth();

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
      {/* Top Demo Switcher Strip */}
      <div className="bg-slate-900 text-slate-200 px-4 py-1.5 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-slate-800">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          <button
            id="demo-btn-student"
            onClick={() => quickDemoLogin('Student')}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 font-medium ${
              user?.role === 'Student'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Switch to Student Demo (Aarav Sharma - CGPA 8.85)"
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Student: Aarav</span>
          </button>

          <button
            id="demo-btn-recruiter"
            onClick={() => quickDemoLogin('Recruiter')}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 font-medium ${
              user?.role === 'Recruiter'
                ? 'bg-purple-600 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Switch to Recruiter Demo (Google India)"
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Recruiter: Google</span>
          </button>

          <button
            id="demo-btn-admin"
            onClick={() => quickDemoLogin('Admin')}
            className={`px-2.5 py-1 rounded transition flex items-center gap-1.5 font-medium ${
              user?.role === 'Admin'
                ? 'bg-amber-600 text-white shadow-xs'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
            }`}
            title="Switch to Admin Demo (Prof. Arvind Sharma)"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Admin: Placement Cell</span>
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Brand */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-linear-to-tr from-blue-700 via-indigo-600 to-sky-500 flex items-center justify-center text-white shadow-sm ring-2 ring-blue-100">
            <GraduationCap className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-900 text-lg tracking-tight leading-none">
                PlacePro
              </span>
            </div>
            <p className="text-xs text-slate-500 font-normal">
              College Placement Management System
            </p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-100/80 p-1 rounded-xl border border-slate-200/60">
          <button
            id="nav-tab-dashboard"
            onClick={() => setCurrentTab('dashboard')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              currentTab === 'dashboard'
                ? 'bg-white text-slate-900 shadow-xs font-semibold'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Briefcase className="w-4 h-4" />
            <span>
              {user?.role === 'Student'
                ? 'Student Portal'
                : user?.role === 'Recruiter'
                ? 'Recruiter Portal'
                : 'Admin Central'}
            </span>
          </button>

          {user?.role === 'Student' && (
            <button
              id="nav-tab-applications"
              onClick={() => setCurrentTab('applications')}
              className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
                currentTab === 'applications'
                  ? 'bg-white text-slate-900 shadow-xs font-semibold'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>My Applications</span>
            </button>
          )}

          <button
            id="nav-tab-dbms-lab"
            onClick={() => setCurrentTab('dbms_lab')}
            className={`px-3.5 py-1.5 rounded-lg text-sm font-medium transition flex items-center gap-2 ${
              currentTab === 'dbms_lab'
                ? 'bg-white text-blue-700 shadow-xs font-semibold ring-1 ring-blue-200'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/50'
            }`}
          >
            <Database className="w-4 h-4 text-blue-600" />
            <span>SQL / DBMS Lab</span>
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          </button>
        </nav>

        {/* User Status / Action Button */}
        <div className="flex items-center gap-3">
          {user ? (
            <div className="flex items-center gap-2.5">
              <div className="text-right hidden sm:block">
                <div className="text-sm font-semibold text-slate-900 leading-tight">
                  {user.name}
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-end gap-1 font-medium">
                  <span
                    className={`inline-block w-2 h-2 rounded-full ${
                      user.role === 'Admin'
                        ? 'bg-amber-500'
                        : user.role === 'Recruiter'
                        ? 'bg-purple-500'
                        : 'bg-blue-500'
                    }`}
                  />
                  {user.role}
                </div>
              </div>

              <button
                id="btn-logout"
                onClick={logout}
                title="Sign out of current account"
                className="p-2 rounded-lg border border-slate-200 text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <button
              id="btn-open-auth-modal"
              onClick={onOpenAuth}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold shadow-sm transition flex items-center gap-1.5"
            >
              <UserIcon className="w-4 h-4" />
              <span>Sign In / Register</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
