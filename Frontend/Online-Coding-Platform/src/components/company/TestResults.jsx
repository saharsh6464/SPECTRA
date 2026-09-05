import React, { useState, useEffect, useMemo } from 'react';
import { FaSearch, FaCheckCircle, FaTimesCircle, FaShieldAlt } from 'react-icons/fa';
import { getTestAttempts } from '../../api/testAttempt';

const TestResults = () => {
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchResults = async () => {
      try {
        setLoading(true);
        const data = await getTestAttempts();
        setAttempts(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error("Error fetching test results:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, []);

  const filteredAttempts = useMemo(() => {
    return attempts.filter(a => {
      const candidateName = a.user?.username || '';
      const testName = a.test?.testName || '';
      return (
        candidateName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        testName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [attempts, searchTerm]);

  return (
    <div>
      <header className="flex flex-col md:flex-row items-start md:items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white">Test Results</h1>
          <p className="text-slate-400">Review detailed results for every test attempt mapped to backend models.</p>
        </div>
      </header>

      {/* Search Bar */}
      <div className="mb-6">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search by candidate or test..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 px-4 pl-10 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-700 overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading results...</div>
        ) : (
          <div className="min-w-full divide-y divide-slate-700/50">
            {/* Table Header */}
            <div className="p-4 hidden md:grid grid-cols-5 gap-4 font-semibold text-slate-400 text-sm bg-slate-800/80">
              <h3 className="col-span-2">Candidate</h3>
              <h3>Test Taken</h3>
              <h3 className="text-center">Score</h3>
              <h3 className="text-center">Security Risk</h3>
            </div>

            {filteredAttempts.map(attempt => {
              const score = attempt.totalScore ?? 0;
              const risk = attempt.totalRisk ?? 0;

              return (
                <div
                  key={attempt.id}
                  className="p-4 grid grid-cols-2 md:grid-cols-5 gap-4 items-center hover:bg-slate-800 transition-colors duration-200"
                >
                  <div className="col-span-2 space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-indigo-400">#{attempt.id}</span>
                      <div className="font-semibold text-white">{attempt.user?.username || 'Unknown User'}</div>
                    </div>
                  </div>

                  <div className="text-sm text-slate-300">{attempt.test?.testName || 'Test Evaluation'}</div>

                  <div className="text-center font-bold text-white">
                    {score}
                  </div>

                  <div className="flex items-center justify-center gap-1.5 text-sm">
                    <FaShieldAlt className={risk > 0 ? "text-amber-400 text-xs" : "text-emerald-400 text-xs"} />
                    <span className={risk > 0 ? "text-amber-400 font-semibold" : "text-emerald-400"}>
                      {risk}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {!loading && filteredAttempts.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            No test results found.
          </div>
        )}
      </div>
    </div>
  );
};

export default TestResults;