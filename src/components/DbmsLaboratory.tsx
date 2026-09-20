import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { DbmsQueryItem } from '../types';
import {
  Database,
  Play,
  CheckCircle2,
  Table as TableIcon,
  Code2,
  Layers,
  Sparkles,
  Clock,
  FileText,
  ShieldCheck,
  Terminal,
  Cpu
} from 'lucide-react';

export const DbmsLaboratory: React.FC = () => {
  const [queries, setQueries] = useState<DbmsQueryItem[]>([]);
  const [selectedQueryId, setSelectedQueryId] = useState<string>('query_1');
  const [tablesInfo, setTablesInfo] = useState<Array<{ name: string; count: number }>>([]);
  const [loading, setLoading] = useState(true);

  // Execution state
  const [executing, setExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState<{
    query_id: string;
    columns: string[];
    rows: any[];
    row_count: number;
    execution_time_ms: number;
    message: string;
  } | null>(null);

  const [activeTab, setActiveTab] = useState<'queries' | 'schema' | 'logic'>('queries');

  useEffect(() => {
    const fetchDbmsData = async () => {
      setLoading(true);
      try {
        const [qData, tData] = await Promise.all([
          api.getDbmsQueries(),
          api.getDbmsTables()
        ]);
        setQueries(qData);
        setTablesInfo(tData.tables || []);
        if (qData.length > 0) {
          setSelectedQueryId(qData[0].id);
        }
      } catch (err) {
        console.error('Failed to load DBMS lab data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDbmsData();
  }, []);

  const handleExecuteQuery = async () => {
    if (!selectedQueryId) return;
    setExecuting(true);
    setQueryResult(null);
    try {
      const res = await api.executeDbmsQuery(selectedQueryId);
      setQueryResult(res);
    } catch (err: any) {
      alert(err.message || 'Query execution failed');
    } finally {
      setExecuting(false);
    }
  };

  const currentQuery = queries.find(q => q.id === selectedQueryId);

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <div className="inline-block w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-3 text-sm text-slate-500 font-medium">Bootstrapping DBMS Laboratory & Relational Engine...</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Top Academic Banner */}
      <div className="bg-linear-to-r from-slate-900 via-indigo-950 to-blue-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden border border-slate-800">
        <div className="relative z-10 max-w-3xl space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
            <Database className="w-3.5 h-3.5" />
            <span>Academic DBMS Project Demonstration</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Relational DBMS Engine & SQL Laboratory
          </h1>
          <p className="text-sm text-slate-300 leading-relaxed">
            Directly test the 10 core analytical queries, inspect relational tables normalized to Third Normal Form (3NF), and review stored procedures, triggers, and views.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-4 text-xs font-mono text-slate-400 border-t border-slate-800/80 pt-4">
          <span className="flex items-center gap-1.5">
            <TableIcon className="w-4 h-4 text-blue-400" />
            10 Relational Tables
          </span>
          <span className="flex items-center gap-1.5">
            <Cpu className="w-4 h-4 text-purple-400" />
            Stored Procedures & Triggers
          </span>
          <span className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            FK Referential Integrity (RESTRICT/CASCADE)
          </span>
        </div>
      </div>

      {/* Laboratory Sub Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-2 overflow-x-auto text-xs sm:text-sm font-semibold">
        <button
          onClick={() => setActiveTab('queries')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'queries'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Interactive SQL Query Console (10 Queries)</span>
        </button>

        <button
          onClick={() => setActiveTab('schema')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'schema'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <TableIcon className="w-4 h-4" />
          <span>3NF Database Tables ({tablesInfo.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('logic')}
          className={`px-4 py-2 rounded-xl transition flex items-center gap-2 ${
            activeTab === 'logic'
              ? 'bg-blue-50 text-blue-700 border border-blue-200 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Stored Procedures & Triggers Architecture</span>
        </button>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* 1. INTERACTIVE SQL QUERY CONSOLE */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'queries' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Left: Query List */}
            <div className="space-y-2 lg:col-span-1 bg-white p-4 rounded-2xl border border-slate-200 shadow-xs max-h-150 overflow-y-auto">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
                Core SQL Queries Catalog
              </div>
              {queries.map((q, idx) => (
                <button
                  key={q.id}
                  onClick={() => {
                    setSelectedQueryId(q.id);
                    setQueryResult(null);
                  }}
                  className={`w-full text-left p-3 rounded-xl text-xs transition space-y-1 ${
                    selectedQueryId === q.id
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'hover:bg-slate-50 text-slate-700 border border-slate-100'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-mono font-bold text-[11px] opacity-80">
                      QUERY #{idx + 1}
                    </span>
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-medium ${
                        selectedQueryId === q.id
                          ? 'bg-blue-700 text-white'
                          : 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {q.category}
                    </span>
                  </div>
                  <div className="font-bold line-clamp-1">{q.title}</div>
                </button>
              ))}
            </div>

            {/* Right: Query Code, Description & Execution Area */}
            <div className="lg:col-span-2 space-y-4">
              {currentQuery && (
                <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
                  <div>
                    <span className="text-[11px] font-bold text-blue-600 uppercase tracking-wider">
                      {currentQuery.category}
                    </span>
                    <h2 className="text-lg font-bold text-slate-900 mt-0.5">
                      {currentQuery.title}
                    </h2>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">
                      {currentQuery.description}
                    </p>
                  </div>

                  {/* SQL Code Block */}
                  <div className="bg-slate-900 rounded-xl p-4 overflow-x-auto text-xs font-mono text-emerald-400 border border-slate-800 shadow-inner">
                    <pre className="whitespace-pre-wrap">{currentQuery.sql}</pre>
                  </div>

                  {/* Action Bar */}
                  <div className="flex items-center justify-between pt-2">
                    <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4 text-blue-500" />
                      <span>Executed against live relational database schema</span>
                    </div>

                    <button
                      onClick={handleExecuteQuery}
                      disabled={executing}
                      className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold shadow-xs transition flex items-center gap-2 disabled:opacity-50"
                    >
                      {executing ? (
                        <>
                          <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          <span>Executing...</span>
                        </>
                      ) : (
                        <>
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Execute Live Query</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              )}

              {/* Execution Result Table */}
              {queryResult && (
                <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-2 animate-in fade-in">
                  <div className="bg-slate-50 px-6 py-3 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="font-semibold text-slate-700 flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      <span>{queryResult.message}</span>
                    </div>
                    <div className="flex items-center gap-3 font-mono text-slate-500 text-[11px]">
                      <span>Rows: <strong>{queryResult.row_count}</strong></span>
                      <span>Execution Time: <strong>{queryResult.execution_time_ms} ms</strong></span>
                    </div>
                  </div>

                  <div className="overflow-x-auto max-h-96">
                    <table className="w-full text-left text-xs text-slate-600">
                      <thead className="bg-slate-100/70 border-b border-slate-200 text-[11px] uppercase font-bold text-slate-700 sticky top-0">
                        <tr>
                          {queryResult.columns.map((col, idx) => (
                            <th key={idx} className="px-4 py-3 whitespace-nowrap">{col}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 font-mono">
                        {queryResult.rows.map((row, rIdx) => (
                          <tr key={rIdx} className="hover:bg-slate-50 transition">
                            {queryResult.columns.map((col, cIdx) => {
                              const val = row[col];
                              return (
                                <td key={cIdx} className="px-4 py-2.5 whitespace-nowrap">
                                  {typeof val === 'number'
                                    ? val.toLocaleString()
                                    : val === null || val === undefined
                                    ? '<NULL>'
                                    : String(val)}
                                </td>
                              );
                            })}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 2. 3NF DATABASE TABLES SCHEMA INSPECTOR */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'schema' && (
        <div className="space-y-6">
          <div className="bg-blue-50/70 p-4 rounded-xl border border-blue-200 text-xs text-blue-900 leading-relaxed">
            <strong>3NF Relational Architecture:</strong> Every non-key attribute is fully functionally dependent on the primary key (2NF) and non-transitively dependent (3NF).
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tablesInfo.map((tbl) => (
              <div key={tbl.name} className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-xs font-bold text-blue-600 uppercase">
                      Table
                    </span>
                    <span className="px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                      {tbl.count} records
                    </span>
                  </div>

                  <h3 className="font-bold text-slate-900 text-base mt-1 font-mono">
                    {tbl.name}
                  </h3>

                  <p className="text-xs text-slate-500 mt-2">
                    {tbl.name === 'DEPARTMENT' && 'Academic departments catalog. Primary Key: department_id. Referenced by STUDENT.'}
                    {tbl.name === 'USER' && 'Centralized login credentials, bcrypt password hashes, and UserRole enum (Student, Recruiter, Admin).'}
                    {tbl.name === 'STUDENT' && 'Academic student records. Foreign Key: user_id, department_id. Enforces 0 backlogs & CGPA constraints.'}
                    {tbl.name === 'SKILL' && 'Master skills dictionary (Java, Python, SQL, React, etc.). Normalizes technical competencies.'}
                    {tbl.name === 'STUDENT_SKILL' && 'Junction table (M:N decomposition) mapping student_id to skill_id with proficiency enum.'}
                    {tbl.name === 'COMPANY' && 'Recruiting corporate entities with approval verification flag and contact info.'}
                    {tbl.name === 'JOB' && 'Job openings posted by approved companies. Package in LPA, vacancies, and job location.'}
                    {tbl.name === 'PLACEMENT_DRIVE' && 'Campus drive event scheduling. FK: job_id. Tracks status (Open, Upcoming, Closed).'}
                    {tbl.name === 'ELIGIBILITY_CRITERIA' && '1-to-1 criteria record for drives: min CGPA, max backlogs, 10th/12th cutoffs, and batch.'}
                    {tbl.name === 'APPLICATION' && 'Student applications. Enforces unique composite key (student_id, drive_id) preventing duplicates.'}
                  </p>
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-[11px] font-mono text-slate-400">
                  <span>3NF Normal Form</span>
                  <span className="text-emerald-600 font-semibold">InnoDB • utf8mb4</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* 3. STORED PROCEDURES & TRIGGERS ARCHITECTURE */}
      {/* ------------------------------------------------------------------ */}
      {activeTab === 'logic' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Stored Procedures */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-purple-600" />
                <h3 className="font-bold text-slate-900 text-base">MySQL Stored Procedures</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="font-mono font-bold text-slate-900">
                    checkStudentEligibility(IN p_student_id, IN p_drive_id, OUT p_is_eligible, OUT p_reason)
                  </div>
                  <p className="text-slate-600">
                    Evaluates CGPA, backlogs, 10th %, 12th %, and graduation year in a single atomic routine. Returns boolean eligibility flag and explanatory message.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="font-mono font-bold text-slate-900">
                    schedulePlacementDrive(IN p_job_id, IN p_drive_date, ..., IN p_min_cgpa, ...)
                  </div>
                  <p className="text-slate-600">
                    Executes inside a START TRANSACTION block, verifying company approval, inserting the PLACEMENT_DRIVE record, and creating the ELIGIBILITY_CRITERIA row atomically.
                  </p>
                </div>
              </div>
            </div>

            {/* Triggers */}
            <div className="bg-white rounded-2xl border border-slate-200 p-6 space-y-4 shadow-xs">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-slate-900 text-base">MySQL Business Triggers</h3>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="font-mono font-bold text-slate-900">
                    trg_before_job_insert (BEFORE INSERT ON JOB)
                  </div>
                  <p className="text-slate-600">
                    Signals SQLSTATE &apos;45000&apos; if a recruiter attempts to post a job before admin verification has been approved.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="font-mono font-bold text-slate-900">
                    trg_check_application_deadline (BEFORE INSERT ON APPLICATION)
                  </div>
                  <p className="text-slate-600">
                    Verifies that CURDATE() &le; application_deadline and that the drive status is &apos;Open&apos;.
                  </p>
                </div>

                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 space-y-1">
                  <div className="font-mono font-bold text-slate-900">
                    trg_enforce_single_application (BEFORE INSERT ON APPLICATION)
                  </div>
                  <p className="text-slate-600">
                    Guarantees idempotency by raising a custom DBMS exception if the student has already applied to the drive.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
