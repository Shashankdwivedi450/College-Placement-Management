import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { RecruiterDashboard } from './components/RecruiterDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { DbmsLaboratory } from './components/DbmsLaboratory';
import { AuthModal } from './components/AuthModal';
import { Database, ShieldCheck, Cpu } from 'lucide-react';

const AppContent: React.FC = () => {
  const { user } = useAuth();
  const [currentTab, setCurrentTab] = useState<string>('dashboard');
  const [authModalOpen, setAuthModalOpen] = useState(false);

  return (
    <div className="min-h-screen bg-slate-100/60 text-slate-800 flex flex-col font-sans selection:bg-blue-100 selection:text-blue-900">
      {/* Navigation Bar */}
      <Navbar
        currentTab={currentTab}
        setCurrentTab={setCurrentTab}
        onOpenAuth={() => setAuthModalOpen(true)}
      />

      {/* Main Dynamic View Area */}
      <main className="flex-1">
        {currentTab === 'dbms_lab' ? (
          <DbmsLaboratory />
        ) : currentTab === 'applications' ? (
          <StudentDashboard viewMode="applications" />
        ) : user?.role === 'Admin' ? (
          <AdminDashboard />
        ) : user?.role === 'Recruiter' ? (
          <RecruiterDashboard />
        ) : (
          <StudentDashboard viewMode="dashboard" />
        )}
      </main>

      {/* Institutional Academic Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Database className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-slate-900">College Placement Management System</span>
              <span className="ml-2 text-slate-400">| DBMS Academic Project (MySQL 8.0 • 3NF)</span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[11px] text-slate-500">
            <span className="flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              Role-Based JWT Authorization
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5 text-purple-600" />
              Atomic Transactions &amp; Triggers
            </span>
          </div>
        </div>
      </footer>

      {/* Authentication / Registration Modal */}
      <AuthModal isOpen={authModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
