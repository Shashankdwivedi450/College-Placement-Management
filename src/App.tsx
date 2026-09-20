import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { StudentDashboard } from './components/StudentDashboard';
import { RecruiterDashboard } from './components/RecruiterDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { DbmsLaboratory } from './components/DbmsLaboratory';
import { AuthModal } from './components/AuthModal';
import { Database } from 'lucide-react';

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

      {/* Footer */}
      <footer className="mt-16 bg-white border-t border-slate-200 py-8 px-4 sm:px-6 lg:px-8 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-lg bg-blue-600 flex items-center justify-center text-white">
              <Database className="w-3.5 h-3.5" />
            </div>
            <div>
              <span className="font-bold text-slate-900">College Placement Management System</span>
            </div>
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
