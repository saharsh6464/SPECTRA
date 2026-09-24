import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaShieldAlt, FaChevronDown, FaChevronUp } from 'react-icons/fa';
import { getTestAttempts } from '../../api/testAttempt';

const CandidateManagement = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [expandedCandidateId, setExpandedCandidateId] = useState(null);

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
    const grouped = new Map();

    attempts.forEach((att) => {
      const userId = String(att.user?.id ?? att.userId ?? att.username ?? 'unknown');
      const username = att.user?.username || att.username || `User #${userId}`;
      const score = att.totalScore ?? 0;
      const testId = att.test?.testId ?? att.testId ?? att.id;
      const testName = att.test?.testName || `Test #${testId || 'N/A'}`;
      const testResult = {
        id: att.id,
        testId,
        testName,
        score,
        status: score >= 50 ? 'Passed' : 'Failed',
        risk: att.totalRisk ?? 0,
      };

      if (!grouped.has(userId)) {
        grouped.set(userId, { id: userId, username, tests: [] });
      }
      grouped.get(userId).tests.push(testResult);
    });

    const normalizedSearch = searchTerm.toLowerCase();
    return Array.from(grouped.values()).filter((candidate) => {
      const matchesSearch = candidate.username.toLowerCase().includes(normalizedSearch) ||
        candidate.tests.some((test) => test.testName.toLowerCase().includes(normalizedSearch));
      const matchesStatus = statusFilter === 'all' || candidate.tests.some((test) => test.status === statusFilter);
      return matchesSearch && matchesStatus;
    });
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
              <div key={candidate.id} className="border-b border-slate-700/50 last:border-b-0">
                <button
                  type="button"
                  onClick={() => setExpandedCandidateId((current) => current === candidate.id ? null : candidate.id)}
                  className="w-full p-4 grid grid-cols-2 md:grid-cols-5 gap-4 items-center text-left hover:bg-slate-800 transition-colors duration-200"
                >
                  <div className="col-span-2 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-indigo-400">#{candidate.id}</span>
                      <h3 className="font-semibold text-white">{candidate.username}</h3>
                    </div>
                    <span className="text-xs text-slate-400">{candidate.tests.length} test{candidate.tests.length === 1 ? '' : 's'} taken</span>
                  </div>
                  <div className="text-slate-300 text-sm">Click to view tests</div>
                  <div className="text-center font-bold text-white">
                    {candidate.tests.reduce((total, test) => total + Number(test.score || 0), 0)} total
                  </div>
                  <div className="flex items-center justify-center gap-2 text-slate-300">
                    <FaShieldAlt className="text-amber-400 text-xs" />
                    <span>{candidate.tests.reduce((total, test) => total + Number(test.risk || 0), 0)} risk</span>
                    {expandedCandidateId === candidate.id ? <FaChevronUp /> : <FaChevronDown />}
                  </div>
                </button>

                {expandedCandidateId === candidate.id && (
                  <div className="mx-4 mb-4 overflow-x-auto border-2 border-black bg-slate-900/60 p-3">
                    <div className="grid grid-cols-4 gap-3 border-b border-slate-600 pb-2 text-xs font-bold uppercase text-slate-300">
                      <span>Test</span>
                      <span className="text-center">Score</span>
                      <span className="text-center">Status</span>
                      <span className="text-center">Risk</span>
                    </div>
                    {candidate.tests.map((test) => (
                      <div key={test.id} className="grid grid-cols-4 gap-3 py-3 text-sm text-white">
                        <span>{test.testName}</span>
                        <span className="text-center font-bold">{test.score}</span>
                        <span className={`text-center font-semibold ${test.status === 'Passed' ? 'text-green-400' : 'text-red-400'}`}>
                          {test.status}
                        </span>
                        <span className="text-center">{test.risk}</span>
                      </div>
                    ))}
                  </div>
                )}
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
