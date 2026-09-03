import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaCheckCircle, FaTimesCircle, FaShieldAlt } from 'react-icons/fa';
import { getTestAttempts } from '../../api/testAttempt';

const CandidateManagement = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    const fetchAttempts = async () => {
      try {
        setLoading(true);
        const data = await getTestAttempts();
        setAttempts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching candidate attempts:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchAttempts();
  }, []);

  const filteredCandidates = useMemo(() => {
    return attempts
      .map(att => {
        const username = att.user?.username || `User #${att.user?.id || 'Unknown'}`;
        const testName = att.test?.testName || `Test #${att.test?.testId || 'N/A'}`;
        const score = att.totalScore ?? 0;
        const passed = score >= 50;
        const status = passed ? 'Passed' : 'Failed';
        const risk = att.totalRisk ?? 0;

        return {
          id: att.id,
          username,
          testName,
          score,
          status,
          risk,
        };
      })
      .filter(c =>
        c.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.testName.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .filter(c => statusFilter === 'all' || c.status === statusFilter);
  }, [attempts, searchTerm, statusFilter]);

  return (
    <div>
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Candidate Evaluations</h1>
          <p className="text-slate-400">Review assessment attempts mapped strictly to TestAttempt models.</p>
        </div>
      </header>

      {/* Filters and Search */}
      <div className="mb-6 flex flex-col md:flex-row items-center gap-4">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search by username or test..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 px-4 pl-10 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="w-full md:w-auto py-2 px-4 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">All Results</option>
          <option value="Passed">Passed</option>
          <option value="Failed">Failed</option>
        </select>
      </div>

      {/* Candidates List Table */}
      <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-700 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading candidate attempts...</div>
        ) : (
          <div className="min-w-full divide-y divide-slate-700/50">
            {/* Table Header */}
            <div className="p-4 hidden md:grid grid-cols-5 gap-4 font-semibold text-slate-400 text-sm bg-slate-800/80">
              <h3 className="col-span-2">Candidate</h3>
              <h3>Test Taken</h3>
              <h3 className="text-center">Score</h3>
              <h3 className="text-center">Security Risk</h3>
            </div>

            {filteredCandidates.map(candidate => (
              <div
                key={candidate.id}
                className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4 items-center hover:bg-slate-800 transition-colors duration-200"
              >
                {/* Candidate Info */}
                <div className="col-span-2 space-y-0.5">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono text-indigo-400">#{candidate.id}</span>
                    <h3 className="font-semibold text-white">{candidate.username}</h3>
                  </div>
                </div>

                {/* Test Taken */}
                <div className="text-slate-300 text-sm">{candidate.testName}</div>

                {/* Score */}
                <div className="text-center font-bold text-white">
                  {candidate.score}
                </div>

                {/* Risk Score */}
                <div className="flex items-center justify-center gap-1.5 text-sm">
                  <FaShieldAlt className={candidate.risk > 0 ? "text-amber-400 text-xs" : "text-emerald-400 text-xs"} />
                  <span className={candidate.risk > 0 ? "text-amber-400 font-semibold" : "text-emerald-400"}>
                    {candidate.risk}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {!loading && filteredCandidates.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            No candidate attempts found.
          </div>
        )}
      </div>
    </div>
  );
};

export default CandidateManagement;
