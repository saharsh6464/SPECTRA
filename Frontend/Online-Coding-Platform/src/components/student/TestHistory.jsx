import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { FaSearch, FaCheckCircle, FaTimesCircle, FaEye, FaShieldAlt } from 'react-icons/fa';
import { getTestAttempts } from '../../api/testAttempt';

const TestHistory = () => {
  const loggedUser = JSON.parse(localStorage.getItem('user')) || {};
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setLoading(true);
        const data = await getTestAttempts();
        const userAttempts = (Array.isArray(data) ? data : []).filter(
          a => (a.user?.id && a.user.id === loggedUser.id) ||
               (a.user?.username && a.user.username === loggedUser.username)
        );
        setAttempts(userAttempts);
      } catch (err) {
        console.error("Error fetching test history:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [loggedUser.id, loggedUser.username]);

  const filteredHistory = useMemo(() => {
    return attempts.filter(t => {
      const testName = t.test?.testName || '';
      const companyName = t.test?.company?.companyName || '';
      return (
        testName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        companyName.toLowerCase().includes(searchTerm.toLowerCase())
      );
    });
  }, [attempts, searchTerm]);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-bold text-white">Test History & Results</h1>
        <p className="text-slate-400">Review your past test attempts, scores, and security ratings.</p>
      </header>

      <div className="mb-6">
        <div className="relative w-full md:max-w-xs">
          <input
            type="text"
            placeholder="Search by test or company..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full py-2 px-4 pl-10 rounded-lg bg-slate-800 border border-slate-700 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
        </div>
      </div>

      <div className="bg-slate-800/50 rounded-xl shadow-lg border border-slate-700 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-slate-400">Loading test history...</div>
        ) : (
          <div className="divide-y divide-slate-700/50">
            {filteredHistory.map(item => {
              const score = item.totalScore ?? 0;
              const passed = score >= 50;
              const risk = item.totalRisk ?? 0;

              return (
                <Link
                  to={`/student/results/${item.id}`}
                  key={item.id}
                  className="p-5 block hover:bg-slate-800 transition-colors duration-200 group"
                >
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-indigo-400">Attempt #{item.id}</span>
                        <h3 className="font-semibold text-white text-lg group-hover:text-indigo-400 transition-colors">
                          {item.test?.testName || `Assessment #${item.test?.testId || ''}`}
                        </h3>
                      </div>
                      <p className="text-sm text-slate-400">
                        {item.test?.company?.companyName || 'Host Company'}
                      </p>
                    </div>

                    <div className="flex items-center gap-5">
                      <div className="flex items-center gap-1 text-xs">
                        <FaShieldAlt className={risk > 0 ? "text-amber-400" : "text-emerald-400"} />
                        <span className={risk > 0 ? "text-amber-400" : "text-slate-400"}>Risk: {risk}</span>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-medium px-2.5 py-0.5 rounded-full capitalize flex items-center gap-1 ${
                          passed
                            ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                            : 'bg-red-500/10 text-red-400 border border-red-500/20'
                        }`}>
                          {passed ? <FaCheckCircle /> : <FaTimesCircle />}
                          {passed ? 'Passed' : 'Failed'}
                        </span>
                        <div className="text-sm font-bold text-white mt-1">
                          Score: <span className="text-indigo-400 font-mono">{score}</span>
                        </div>
                      </div>

                      <FaEye className="text-slate-500 group-hover:text-indigo-400 transition-colors" />
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}

        {!loading && filteredHistory.length === 0 && (
          <div className="p-8 text-center text-slate-400">
            No completed assessments recorded in your history.
          </div>
        )}
      </div>
    </div>
  );
};

export default TestHistory;